# EasyBuy Store Deployment Readiness Plan (Enterprise Level)

Date: 30 April 2026  
Scope: Storefront app, Admin app, API layer, Supabase database/auth, security, operations, performance, support, and governance.  
Target standard: Large-scale e-commerce readiness (Amazon/Takealot-level discipline, adapted to current team and architecture).

## Quick Start: What You Actually Need To Do

This plan moves the system from MVP to enterprise-grade in three phases. Each phase is concrete, implementable, and includes specific tools and code tasks.

**Phase 1 (3-6 weeks):** Get safe to launch.  
**Phase 2 (6-12 weeks):** Scale without breaking.  
**Phase 3 (3-6 months):** Optimize and compete.

Each phase has:

- Specific tech integrations you pick
- Step-by-step implementation tasks
- Clear deliverables you can test
- Go/no-go gates with metrics

---

## Current system baseline (observed in repository)

### Architecture

- Two separate Next.js apps in one repo:
  - Storefront (root app)
  - Admin app (`admin/`)
- Supabase-backed auth + data + RLS policies
- Storefront and admin include separate middleware and API routes

### Notable implementation strengths

- RLS is enabled and used across core commerce tables (products, orders, cart, wishlist, promotions/settings).
- Core data model and migrations already exist for catalog, users, addresses, orders, cart/wishlist, and CMS-like content.
- Admin and storefront both have working build pipelines locally.

### Immediate risks to address before enterprise launch

- No automated tests found (unit/integration/e2e).
- No CI/CD workflow found in repository.
- No container/runtime standardization files found.
- Admin bootstrap endpoint exists (`/api/auth/setup`) and can create/update admin credentials; this must be strictly gated and removed/disabled in production.
- Framework version drift exists between storefront and admin (root uses Next 15.x while admin uses Next 16.x), increasing operational and security maintenance risk.
- Contact/email, payment, anti-fraud, observability, incident response, and compliance controls are not yet enterprise-complete.

---

## Phase 1: Production-Safe Launch Baseline

Timeline suggestion: 3-6 weeks  
Goal: launch safely with strong security, operational control, and release confidence.

### 1) Security hardening (Critical)

**Tasks:**

- [ ] Disable admin bootstrap endpoint:
  - Delete or conditionally gate `admin/src/app/api/auth/setup/route.ts` for production only. Environment flag: `ALLOW_ADMIN_SETUP=false` by default in production Vercel deployment.
  - Replace with manual admin user creation via Supabase dashboard or one-off admin script that isn't deployed.

- [ ] Secrets rotation and environment strategy:
  - Create three Supabase projects: `dev`, `staging`, `prod`.
  - Generate fresh API keys for each (anon key + service role key).
  - Add to Vercel:
    - Storefront project: `.env.production` and `.env.preview` (staging)
    - Admin project: same, separate keys
  - Verify `SUPABASE_SERVICE_ROLE_KEY` is never exposed to browser (server-only).
  - Rotate all keys before go-live (document date).

- [ ] Admin access hardening:
  - Require MFA for all admin accounts:
    - Enable Supabase Auth MFA (TOTP).
    - Document enrollment steps in admin onboarding.
  - Add session timeout: 30 mins of inactivity, forced re-auth.
    - Implement in admin middleware: check session age on every admin route.
  - Optional: IP allowlist for admin dash:
    - Add Supabase PostgREST IP rules or Vercel IP restriction.

- [ ] Rate limiting and anti-abuse:
  - Implement rate limiting middleware on:
    - `/api/auth/signin` — 5 attempts per 15 min per IP
    - `/api/contact` — 3 per hour per IP
    - `/api/orders` (POST) — 2 per minute per user
    - Admin `/api/products`, `/api/orders` — 10 per minute per admin
  - Tool choice: `express-rate-limit` or Upstash Redis.
  - Contact form: add CAPTCHA (hCaptcha or reCAPTCHA v3).

- [ ] WAF and bot protection:
  - Enable Vercel Edge Protection (automatic).
  - Optional: Cloudflare WAF layer in front.

---

### 2) Payment integration (NEW — Critical for commerce)

**Tasks:**

- [ ] **Choose payment provider:**
  - **Option A (Recommended for South Africa):** Stripe + Luno or PayFast
    - Stripe: supports ZAR, webhooks, tokenization.
    - PayFast: local ZAR provider, simpler integration.
  - **Option B:** Square (global, good UX)
  - Setup: Create test + live accounts.

- [ ] **Implement payment flow (example with Stripe):**

  ```typescript
  // src/app/api/orders/payment/route.ts (NEW)
  import { stripe } from "@/lib/stripe"; // initialize client
  import { NextRequest, NextResponse } from "next/server";

  export async function POST(req: NextRequest) {
    const { orderId, amount, email } = await req.json();

    try {
      // Step 1: Create Stripe payment intent with idempotency key
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(amount * 100), // cents
          currency: "zar",
          metadata: { orderId },
          receipt_email: email,
        },
        { idempotencyKey: `order-${orderId}` }, // prevent double-charge
      );

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        amount,
      });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
  ```

  - [ ] Add Stripe webhook listener for payment events:

    ```typescript
    // src/app/api/webhooks/stripe/route.ts (NEW)
    import { stripe } from "@/lib/stripe";
    import { createAdminClient } from "@/lib/supabase/server";

    export async function POST(req: Request) {
      const sig = req.headers.get("stripe-signature")!;
      const body = await req.text();

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!,
        );
      } catch (err) {
        return new Response("Invalid signature", { status: 400 });
      }

      const supabase = createAdminClient();

      if (event.type === "payment_intent.succeeded") {
        const { metadata } = event.data.object;
        await supabase
          .from("orders")
          .update({ status: "paid", updated_at: new Date() })
          .eq("id", metadata.orderId);
      }

      if (event.type === "payment_intent.payment_failed") {
        const { metadata } = event.data.object;
        await supabase
          .from("orders")
          .update({ status: "failed", updated_at: new Date() })
          .eq("id", metadata.orderId);
      }

      return new Response("Webhook processed");
    }
    ```

  - [ ] Update checkout flow to use Stripe client-side:

    ```typescript
    // src/components/Checkout/CheckoutForm.tsx (UPDATE)
    const stripe = useStripe();
    const handleCheckout = async () => {
      // 1. Create order via existing /api/orders (status: 'pending')
      const { order } = await fetch("/api/orders", { method: "POST" }).then(
        (r) => r.json(),
      );

      // 2. Request payment intent
      const { clientSecret } = await fetch("/api/orders/payment", {
        method: "POST",
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          email: order.billing_email,
        }),
      }).then((r) => r.json());

      // 3. Confirm payment with Stripe
      const result = await stripe?.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
      });

      if (result?.error) {
        setError(result.error.message);
      } else {
        // Success — order status auto-updated by webhook
        router.push(`/order-success/${order.id}`);
      }
    };
    ```

- [ ] **Add inventory safety for paid orders:**
  - Create trigger in Supabase: when order status → 'paid', decrement product stock atomically.
  - Prevent oversell: only allow if stock >= quantity.

- [ ] **Implement idempotency for payment safety:**
  - All POST requests to `/api/orders` include `Idempotency-Key` header.
  - Store request hashes in DB; return cached response if duplicate.

---

### 3) Data integrity and transactional safety

**Tasks:**

- [ ] Add strict DB constraints:
  - Ensure order `total = subtotal + shipping_cost` with CHECK constraint.
  - Ensure `subtotal >= 0` and `quantity > 0` on order items.

- [ ] Create rollback-safe migration workflow:
  - All migrations versioned with timestamps (already done).
  - Staging: Test migration on production data copy weekly.
  - Runbook: How to rollback if migration fails (documented steps).

- [ ] Backup and restore drill:
  - Enable Supabase automated backups (daily).
  - Document restore procedure.
  - Monthly: Restore to staging and verify data integrity.

---

### 4) CI/CD and release governance

**Tasks:**

- [ ] Set up GitHub Actions CI pipeline (`.github/workflows/ci.yml`):

  ```yaml
  name: CI
  on: [push, pull_request]

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        # Storefront
        - name: Lint & Build Storefront
          run: npm run lint && npm run build

        # Admin
        - name: Lint & Build Admin
          run: cd admin && npm run lint && npm run build

        # Tests
        - name: Run Tests
          run: npm run test -- --coverage
  ```

- [ ] Add branch protection:
  - Main branch: require PR review + CI pass.
  - Enable auto-dismiss stale reviews on new commits.

- [ ] Staging environment:
  - Create staging Vercel projects (separate from prod).
  - Deploy to staging on every PR.
  - Manual approval for prod deploy.

- [ ] Release checklist (doc):
  - Migrations tested on staging data copy.
  - All tests green.
  - Security scan passed.
  - Rollback steps documented and tested.

---

### 5) Testing foundation

**Tasks:**

- [ ] Add Jest config and first test suite:

  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom
  ```

  - [ ] Unit tests (core logic):

    ```typescript
    // src/lib/__tests__/formatCurrency.test.ts
    import { formatCurrency } from "../formatCurrency";

    describe("formatCurrency", () => {
      it("formats ZAR correctly", () => {
        expect(formatCurrency(1000, "ZAR")).toBe("R1,000.00");
      });
    });
    ```

  - [ ] Integration tests (API routes):

    ```typescript
    // src/app/api/__tests__/orders.integration.test.ts
    import { POST } from '../orders/route';

    describe('POST /api/orders', () => {
      it('creates order and calculates total correctly', async () => {
        const req = new Request('http://localhost/api/orders', {
          method: 'POST',
          body: JSON.stringify({
            billing: {...},
            shippingMethod: 'free',
            cart: [{id: 1, qty: 2, price: 100}]
          })
        });
        const res = await POST(req);
        const data = await res.json();
        expect(data.order.total).toBe(200);
      });
    });
    ```

  - [ ] E2E tests (Playwright):

    ```bash
    npm install --save-dev @playwright/test
    ```

    ```typescript
    // e2e/checkout.spec.ts
    import { test, expect } from "@playwright/test";

    test("user can checkout", async ({ page }) => {
      await page.goto("http://localhost:3000");
      await page.click('button:has-text("Add to Cart")');
      await page.goto("http://localhost:3000/checkout");
      await page.fill('input[name="email"]', "test@example.com");
      // ... fill form
      await page.click('button:has-text("Place Order")');
      await expect(page).toHaveURL(/\/order-success/);
    });
    ```

---

### 6) Observability and operational readiness

**Tools:** Sentry (errors) + LogRocket (user session replay) + Vercel Analytics

**Tasks:**

- [ ] Add error tracking (Sentry):

  ```bash
  npm install @sentry/nextjs
  ```

  - Capture all API errors, client-side crashes, unhandled promise rejections.
  - Set error alert thresholds (e.g., >10 errors/hour = page alert).

- [ ] Add structured logging:

  ```typescript
  // src/lib/logger.ts (NEW)
  export function logEvent(
    level: "info" | "warn" | "error",
    message: string,
    context: Record<string, any>,
  ) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        requestId: context.requestId,
        userId: context.userId,
        ...context,
      }),
    );
  }
  ```

- [ ] Define SLOs and dashboards:
  - Storefront p95 latency: < 2s
  - Checkout success rate: > 98%
  - API error rate: < 0.5%

- [ ] On-call runbook:
  - Define severity: Critical (checkout down), High (API errors spiking), Medium (perf degraded).
  - Escalation contacts and escalation time (example: 5 mins for critical).

---

### Phase 1 Exit Gates

- [ ] Zero critical security findings (manual code review + dependency scan).
- [ ] CI passes on all commits to main for 1 week.
- [ ] 95%+ test coverage on critical paths.
- [ ] Load test completed: 100 concurrent users, p95 latency < 3s.
- [ ] Documented rollback procedure tested in staging.
- [ ] All environment variables validated and rotated.
- [ ] Stripe webhooks verified working in staging.
- [ ] Admin MFA enforced and documented.

---

## Phase 2: Scalable, Resilient Growth Platform

Timeline suggestion: 6-12 weeks after Phase 1  
Goal: scale traffic, improve conversion, and strengthen reliability.

### 1) Platform scalability

**Tasks:**

- [ ] Add email notification queue (Vercel Background Functions + Resend or SendGrid):

  ```typescript
  // api/webhooks/orders/events.ts (NEW)
  // Trigger when order status changes
  import { resend } from "@/lib/email";

  export async function notifyOrderStatus(orderId: string, status: string) {
    // Queue email job (Vercel Background Function)
    await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/email/order-update`,
      {
        method: "POST",
        body: JSON.stringify({ orderId, status }),
      },
    );
  }

  // api/email/order-update.ts
  export async function POST(req: Request) {
    const { orderId, status } = await req.json();
    const order = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    await resend.emails.send({
      from: "orders@store.com",
      to: order.billing_email,
      subject: `Order ${orderId} is ${status}`,
      html: `Your order status: ${status}`,
    });
  }
  ```

- [ ] Add product search indexing (Algolia or MeiliSearch):

  ```bash
  npm install algoliasearch
  ```

  - Sync product catalog to Algolia on every product update.
  - Frontend search component uses Algolia Instant Search.
  - Full-text + typo tolerance + faceted filtering.

- [ ] Add Redis caching layer (Upstash):

  ```typescript
  // src/lib/cache.ts (NEW)
  import { Redis } from "@upstash/redis";
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  export async function getCategoriesWithCache() {
    const cached = await redis.get("categories");
    if (cached) return cached;

    const categories = await supabase.from("categories").select("*");
    await redis.setex("categories", 3600, JSON.stringify(categories));
    return categories;
  }
  ```

- [ ] Add background job queue (Bull/BullMQ with Redis):
  - Order event processing
  - Email notifications
  - Inventory sync
  - Reporting

---

### 2) Commerce depth and reliability

**Tasks:**

- [ ] **Expand payment methods:**
  - [ ] PayFast (local ZAR provider)
  - [ ] Apple Pay / Google Pay
  - [ ] BNPL (Afterpay/Klarna for qualifying customers)
  - Route logic: customer selects payment method, trigger different flows.

- [ ] **Add fraud screening (optional but recommended):**
  - Seon.io or Stripe Radar integration.
  - Rules: flag high-risk transactions (new email, high amount, suspicious IP).
  - Admin review queue for flagged orders.

- [ ] **Add returns/refunds workflow:**

  ```sql
  -- Add to schema
  CREATE TABLE refund_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id),
    reason text,
    status text DEFAULT 'pending', -- pending, approved, rejected, refunded
    created_at timestamptz DEFAULT now()
  );
  ```

  ```typescript
  // admin/src/app/api/refunds/route.ts (NEW)
  export async function POST(req: Request) {
    const { orderId, reason } = await req.json();

    const refund = await supabase
      .from("refund_requests")
      .insert({ order_id: orderId, reason, status: "pending" })
      .select()
      .single();

    // Notify admin
    await notifyAdmins(`Refund request for order ${orderId}`);

    return NextResponse.json(refund);
  }
  ```

- [ ] **Add shipping SLA tracking:**
  - Integrate carrier APIs (Takealot, Superbalist, or generic Fulfil).
  - Store tracking number and expected delivery date.
  - Send proactive delay alerts if ETA passes.

---

### 3) Data and analytics maturity

**Tools:** Mixpanel or Amplitude for events, BigQuery for warehouse

**Tasks:**

- [ ] **Define event taxonomy:**

  ```typescript
  // src/lib/analytics.ts (NEW)
  import { Mixpanel } from "mixpanel-browser";
  const mp = Mixpanel.init("token");

  // Page views
  mp.track("page_view", { page: pathname, userId: user?.id });

  // Product browsing
  mp.track("product_viewed", { productId, categoryId, price });

  // Cart actions
  mp.track("item_added_to_cart", { productId, quantity, price });
  mp.track("checkout_started", { cartValue, itemCount });

  // Order events
  mp.track("order_placed", { orderId, total, paymentMethod });
  mp.track("payment_success", { orderId, amount });
  ```

- [ ] **Build conversion funnel dashboard:**
  - Product views → Add to cart → Checkout → Payment → Order
  - Segment by: device, traffic source, geography, payment method.
  - Goal: Track conversion rate by segment and identify drop-off points.

- [ ] **Add anomaly alerting:**
  - Daily email with KPI changes (conversion ↓5%, avg order ↑10%, etc.).
  - Tool: Mixpanel Alerts or custom Lambda function.

- [ ] **Warehouse-ready data exports:**
  - Daily export of orders, products, users to CSV in S3.
  - Finance team pulls for reconciliation and tax reporting.

---

### 4) Reliability engineering

**Tasks:**

- [ ] **Formalize SLOs with error budgets:**
  - Checkout: 99.95% uptime (2h downtime/month allowed)
  - Product catalog: 99.9% uptime
  - API endpoints: p95 latency < 1s
  - If exceeded, priority is incident response, not new features.

- [ ] **Add chaos testing drills (monthly):**
  - Scenario 1: Supabase auth unavailable → verify graceful degradation
  - Scenario 2: Payment provider timeout → verify order queued for retry
  - Scenario 3: Database connection pool exhausted → verify backpressure handling
  - Document findings and fixes.

- [ ] **Add feature flags (LaunchDarkly or Vercel Edge Config):**
  ```typescript
  // Canary deploy new payment method
  const enableStripeACH = flags.get("enable_stripe_ach");
  if (enableStripeACH) {
    // Show ACH payment option
  }
  ```

---

### 5) Security and compliance progression

**Tasks:**

- [ ] **Full audit logging:**

  ```sql
  -- Add to schema
  CREATE TABLE audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid,
    action text,
    table_name text,
    record_id text,
    old_values jsonb,
    new_values jsonb,
    created_at timestamptz DEFAULT now()
  );
  ```

  - Log all admin mutations (create, update, delete product/order/promotion).
  - Frontend: audit log viewer for admins (read-only).

- [ ] **PII minimization:**
  - Remove address fields after fulfillment (keep only order snapshot).
  - Hash email in logs.
  - Exclude from exports/backups.

- [ ] **POPIA/GDPR compliance**:
  - [ ] Data export endpoint: `/api/account/export` — user can download all their data as JSON.
  - [ ] Data deletion: `/api/account/delete` — purge all user data (but keep anonymized order history for accounting).
  - [ ] Consent tracking: record consent for marketing emails.

- [ ] **Regular security scanning:**
  - Automated: npm audit in CI.
  - Monthly: OWASP dependency check.
  - Quarterly: external penetration test.

---

### Phase 2 Exit Gates

- [ ] Checkout availability >= 99.9% weekly monitored.
- [ ] Conversion rate improved by at least 10% (tracked via analytics).
- [ ] Fraud chargeback rate < 0.5% (tracked via payment provider dashboard).
- [ ] Full audit trail available and tested for admin actions.
- [ ] Chaos drill completed with documented recovery times.
- [ ] Data export and deletion endpoints functional and tested.
- [ ] Payment refund workflow tested end-to-end (staged + live).

---

## Phase 3: Marketplace-Grade Maturity and Optimization

Timeline suggestion: 3-6 months after Phase 2  
Goal: achieve top-tier operational excellence, intelligence, and continuous optimization.

### 1) Intelligent commerce and personalization

**Tools:** Segment, Personalization Engine, A/B testing platform

**Tasks:**

- [ ] **Build recommendation engine:**
  - Behavioral: "customers who viewed X also viewed Y"
  - Collaborative filtering: user similarity recommendations
  - Tool: Algolia Recommend or custom ML model

  ```typescript
  // GET /api/products/[id]/recommendations
  export async function getProductRecommendations(productId: number) {
    const recs = await algolia.getRecommendations(productId);
    return NextResponse.json(recs);
  }
  ```

- [ ] **Dynamic search ranking:**
  - Boost bestsellers and high-margin products.
  - Rank by conversion rate, not just relevance.
  - A/B test ranking algorithms.

- [ ] **Personalized promotions:**
  - Segment users: new, at-risk (no purchase in 30d), VIP (top spenders).
  - Rules engine: offer 10% discount to new users first purchase, 15% to at-risk.
  - Tool: Segment or custom Python service.

- [ ] **A/B testing framework:**

  ```typescript
  // src/lib/experiments.ts (NEW)
  export async function runExperiment(userId: string, experimentId: string) {
    // Deterministic bucketing: same user always in same group
    const hash = hashUserId(userId);
    const variant = hash % 2 === 0 ? 'control' : 'treatment';

    return variant;
  }

  // Usage in checkout
  const variant = runExperiment(user.id, 'express_checkout_v1');
  if (variant === 'treatment') {
    return <ExpressCheckout />; // New flow
  } else {
    return <StandardCheckout />; // Baseline
  }
  ```

---

### 2) Advanced fulfillment and logistics

**Tasks:**

- [ ] **Inventory by location:**

  ```sql
  CREATE TABLE inventory (
    product_id int REFERENCES products(id),
    warehouse_id int,
    quantity_available int,
    quantity_reserved int,
    PRIMARY KEY (product_id, warehouse_id)
  );
  ```

- [ ] **Order routing algorithm:**
  - Route to warehouse closest to shipping address.
  - Balance load across warehouses.
  - Prioritize fast-moving inventory.

- [ ] **Carrier integration:**
  - Integrate with 2-3 carriers (DHL, Fedex, Takealot Logistics).
  - Auto-generate labels, track shipments, notify customers.
  - Tool: ShipHero or custom carrier API integration.

- [ ] **Predictive delivery windows:**
  - ML model: estimate delivery date based on origin/destination/carrier.
  - Show to customer at checkout and in order tracking.

---

### 3) Enterprise architecture evolution

**Tasks:**

- [ ] **Domain-driven boundaries:**
  - Catalog service (products, categories)
  - Order service (orders, payments, fulfillment)
  - Customer service (auth, profiles, preferences)
  - Admin service (moderation, settings, reporting)
  - Consider microservices if any service exceeds 50K LOC.

- [ ] **Event-driven architecture:**
  - Central event bus (Kafka or Supabase Real-time + webhooks).
  - Events: `order.placed`, `payment.captured`, `inventory.decremented`, `customer.created`.
  - Services subscribe and react async.

- [ ] **Zero-downtime deployments:**
  - Blue-green: current version (green) + new version (blue) live simultaneously.
  - Traffic gradually shifts to blue; if issues, shift back to green.
  - DB migrations must be backwards-compatible.

- [ ] **Disaster recovery SLOs:**
  - RTO (Recovery Time Objective): 1 hour
  - RPO (Recovery Point Objective): 15 minutes
  - Monthly: test restore from backup to standby environment.

---

### 4) Governance, risk, and trust

**Tasks:**

- [ ] **Formal security program:**
  - Quarterly threat modeling sessions.
  - Annual penetration tests (external).
  - Red-team exercises (simulate attacker).
  - Security policy and incident response plan.

- [ ] **Compliance evidence automation:**
  - Automated reports: PCI DSS compliance, GDPR data requests, SOC 2 audit logs.
  - Tool: Secureframe or custom audit script.

- [ ] **Data governance council:**
  - Quarterly: review data quality, lineage, retention policies.
  - Ownership: who owns each dataset, SLA for quality.
  - Privacy: identify and classify PII, apply retention/encryption rules.

- [ ] **Vendor risk management:**
  - Contracts with payment providers, shipping carriers.
  - Audit clause: quarterly security assessments.
  - Backup vendors: if primary fails, automatic fallback.

---

### 5) Org/process maturity

**Tasks:**

- [ ] **Engineering metrics tracking:**
  - Lead time: code commit to production (target: <1 day)
  - Change failure rate: % of deployments causing incidents (target: <5%)
  - MTTR: incident detection to resolution (target: <30 min critical)
  - Deployment frequency: pushes per week (target: >10)

- [ ] **Reliability SLO integration into product planning:**
  - 10% of sprint capacity reserved for reliability/debt work.
  - Bug severity: P0 (blocks checkout) = drop all else; P1 (impacts conversion) = within 24h; P2 = next sprint.

- [ ] **Quarterly architecture review board:**
  - Tech leads discuss: new library/framework adoption, major refactors, scaling bottlenecks.
  - Approve/reject proposals with trade-off analysis.

---

### Phase 3 Exit Gates

- [ ] Recommendation engine deployed and measurably improving AOV (target: +8%).
- [ ] Multi-warehouse order routing tested and live (fulfillment cost down by 5%).
- [ ] Blue-green deployment tested and successful on prod.
- [ ] Disaster recovery drill completed with RTO < 30 min.
- [ ] Security red-team test passed with zero critical findings.
- [ ] Compliance reports automated and audit-ready.
- [ ] Org KPIs (lead time, MTTR, change failure rate) within top-quartile targets for industry.

---

## Cross-Phase KPI Framework (recommended)

- Availability:
  - Storefront uptime
  - Checkout uptime
- Performance:
  - p95 API latency
  - Core Web Vitals pass rate
- Commerce:
  - Conversion rate
  - AOV
  - Cart abandonment rate
- Reliability:
  - Incident count by severity
  - MTTR
- Security:
  - Open critical vulnerabilities
  - Unauthorized access attempts blocked
- Quality:
  - Change failure rate
  - Defect escape rate

---

## Immediate next 14-day execution sprint (start now)

This is your actual to-do list to start Phase 1.

### Day 1-2: Security lockdown

- [ ] Disable admin setup endpoint:

  ```bash
  # admin/src/app/api/auth/setup/route.ts — add at top:
  const ALLOW_SETUP = process.env.ALLOW_ADMIN_SETUP === 'true';
  if (!ALLOW_SETUP) return new Response('Disabled', { status: 403 });
  ```

- [ ] Rotate Supabase keys:
  - Go to Supabase dashboard > API settings.
  - Regenerate anon key and service role key.
  - Update `.env.production` in Vercel for both apps.
  - Document: Date rotated = [today].

- [ ] Create staging Supabase project:
  - Clone schema from prod.
  - Use for testing deployments.

### Day 3-4: Payment gateway setup

- [ ] Choose payment provider:
  - [ ] Stripe (recommended): go to stripe.com, create account.
  - [ ] PayFast: go to payfast.io, create account.

- [ ] Add to project:

  ```bash
  npm install stripe  # if using Stripe
  npm install @stripe/react-stripe-js @stripe/js
  ```

- [ ] Implement payment endpoint (code samples provided in Phase 1 section above).

- [ ] Test in sandbox mode with test card: `4242 4242 4242 4242`

### Day 5-6: Testing setup

- [ ] Initialize Jest and Playwright:

  ```bash
  npm install --save-dev jest @testing-library/react jest-environment-jsdom @playwright/test
  npx jest --init
  npx playwright install
  ```

- [ ] Add first tests (use samples from Phase 1 above):

  ```bash
  mkdir -p src/__tests__
  # Create formatCurrency.test.ts, orders.integration.test.ts
  npm test
  ```

- [ ] Add E2E test:
  ```bash
  mkdir -p e2e
  # Create checkout.spec.ts
  npx playwright test
  ```

### Day 7-8: CI/CD setup

- [ ] Create GitHub Actions workflow:

  ```bash
  mkdir -p .github/workflows
  cat > .github/workflows/ci.yml << 'EOF'
  name: CI
  on: [push, pull_request]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '18'
        - run: npm install
        - run: npm run lint
        - run: npm run build
        - run: npm test -- --coverage
        - run: cd admin && npm install && npm run build
  EOF
  git add .github/workflows/ci.yml && git commit -m "Add CI workflow"
  ```

- [ ] Add branch protection (GitHub > Settings > Branches > Require status checks).

### Day 9-10: Observability

- [ ] Add Sentry:

  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

  - Add error tracking to API routes and client-side.

- [ ] Add structured logging:
  ```typescript
  // src/lib/logger.ts
  export const log = (level: string, message: string, data?: any) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...data,
      }),
    );
  };
  ```

### Day 11-12: Staging environment

- [ ] Create Vercel staging projects:
  - Storefront staging project (separate from prod).
  - Admin staging project.

- [ ] Deploy staging from main branch automatically.

- [ ] Seed staging with test data:
  - 100 test users.
  - 500 test products.
  - 50 test orders.

### Day 13-14: Documentation and sign-off

- [ ] Create go-live checklist:

  ```markdown
  # Go-Live Checklist

  - [ ] All tests passing
  - [ ] Security scan passed (npm audit)
  - [ ] Staging deployment verified
  - [ ] Payment flow tested end-to-end
  - [ ] Admin MFA tested
  - [ ] Rate limiting tested
  - [ ] Sentry alerts configured
  - [ ] Rollback procedure documented and tested
  - [ ] Team signed off
  ```

- [ ] Create runbook:

  ```markdown
  # Production Runbook

  ## Incident response

  - P0 (checkout down): Page on-call within 5 min
  - P1 (errors > 1%): Page within 15 min

  ## Rollback procedure

  1. Identify last known good deployment
  2. Go to Vercel, select deployment, click "Promote to Production"
  3. Verify orders can be placed
  4. Notify team
  ```

- [ ] Get sign-off from:
  - [ ] Security owner
  - [ ] Product owner
  - [ ] Tech lead

---

## Concrete implementation checklist (pick one per day)

### Payment Gateway

**Day X: Integrate Stripe payments**

```bash
# 1. Install
npm install stripe @stripe/react-stripe-js @stripe/js

# 2. Create API route (sample in Phase 1)
touch src/app/api/orders/payment/route.ts

# 3. Create webhook listener (sample in Phase 1)
touch src/app/api/webhooks/stripe/route.ts

# 4. Test locally
# Run in dev, use stripe CLI to forward webhooks:
# stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Email Notifications

**Day X: Add email alerts**

```bash
# 1. Install Resend (ZA-friendly)
npm install resend

# 2. Create email route
touch src/app/api/email/order-update.ts

# 3. Hook into order status update
# In admin/src/app/api/orders/[id]/route.ts, call email endpoint

# 4. Test by creating order in staging
```

### Search Optimization

**Day X: Add full-text search**

```bash
# 1. Add search extension to Supabase (via dashboard)
# In Supabase: SQL > Run
# CREATE EXTENSION IF NOT EXISTS pgroonga;

# 2. Create search endpoint
touch src/app/api/products/search/route.ts

# 3. Test search on storefront
curl "localhost:3000/api/products/search?q=shoes&limit=10"
```

### Analytics

**Day X: Add event tracking**

```bash
# 1. Install Mixpanel
npm install mixpanel-browser

# 2. Create analytics wrapper
touch src/lib/analytics.ts

# 3. Add events throughout app (samples in Phase 2)

# 4. Verify events in Mixpanel dashboard
```

---

## Tech stack recap (recommended choices)

| Layer         | Tool                                 | Why                                              |
| ------------- | ------------------------------------ | ------------------------------------------------ |
| Payment       | Stripe or PayFast                    | Stripe: global, webhook-safe; PayFast: local ZAR |
| Email         | Resend or SendGrid                   | Resend: simple, cheap; SendGrid: more features   |
| Search        | Algolia or MeiliSearch               | Algolia: proven; MeiliSearch: self-hosted option |
| Caching       | Upstash Redis                        | Serverless, no infra                             |
| Errors        | Sentry                               | Standard, integrates with Vercel                 |
| Analytics     | Mixpanel or Amplitude                | Mixpanel: simpler; Amplitude: more advanced      |
| Feature Flags | Vercel Edge Config or LaunchDarkly   | Vercel: built-in; LaunchDarkly: more control     |
| DB Backups    | Supabase automated                   | Already included                                 |
| Monitoring    | Vercel Analytics + custom dashboards | Works with Supabase events                       |

---

## Ownership model (assign these roles now)

- **Security owner**: Hardening, key rotation, threat modeling, vulnerability scanning, incident response.
- **Platform owner**: CI/CD, staging/prod environments, observability, SLOs, uptime dashboards.
- **Commerce owner**: Checkout flow, payment reliability, conversion metrics, customer experience.
- **Data owner**: Analytics, warehouse exports, financial reconciliation, compliance reporting.
- **Support owner**: Incident response, customer comms, issue triage, documentation.

---

## Quick reference: What's broken and how to fix it

| Issue                                   | Phase 1 Fix                                                           |
| --------------------------------------- | --------------------------------------------------------------------- |
| Admin setup endpoint exposed            | Gate with env flag `ALLOW_ADMIN_SETUP`                                |
| No automated tests                      | Add Jest + Playwright suite (see Day 5-6 sprint)                      |
| No CI/CD pipeline                       | Add GitHub Actions workflow (see Day 7-8 sprint)                      |
| Framework version drift (Next 15 vs 16) | Upgrade storefront to Next 16 in Phase 1 or Phase 2                   |
| Payment flow incomplete                 | Integrate Stripe or PayFast (see Phase 1 payment section)             |
| No error tracking                       | Add Sentry (see Day 9-10 sprint)                                      |
| No staging environment                  | Create Vercel staging projects (see Day 11-12 sprint)                 |
| No RLS on admin routes                  | Add `assertAdmin` check to all admin endpoints (already done in repo) |

---

## Success metrics at end of each phase

### Phase 1 completion

- ✅ All tests passing in CI
- ✅ Zero critical security findings
- ✅ Payment flow works sandbox + prod
- ✅ Admin MFA enforced
- ✅ Staging env live and parity with prod
- ✅ Load test: 100 concurrent users, p95 < 3s
- ✅ Team can roll back from production in < 5 min

### Phase 2 completion

- ✅ Checkout uptime >= 99.9% (weekly)
- ✅ Conversion rate improved (e.g., +10%)
- ✅ Email notifications working
- ✅ Search indexed and fast
- ✅ Anomaly alerts working
- ✅ Audit log functional for all admin actions
- ✅ Refunds and returns flow tested

### Phase 3 completion

- ✅ Recommendations engine live (AOV +8%)
- ✅ Multi-warehouse routing live (cost -5%)
- ✅ Blue-green deployments working
- ✅ DR drill < 30 min RTO
- ✅ Security red-team passed
- ✅ Compliance reports automated
- ✅ Engineering metrics within industry targets

---

## Final note

Enterprise level is not a feature. It's **disciplined execution** across security, reliability, data integrity, and operational excellence.

- **Phase 1** = controlled, safe launch.
- **Phase 2** = scale without breaking.
- **Phase 3** = compete at scale and optimize.

Start Phase 1 now. Assign owners. Track progress weekly. Move fast.

Good luck. 🚀
