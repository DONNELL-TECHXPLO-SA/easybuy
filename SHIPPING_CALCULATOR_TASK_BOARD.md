# Shipping Calculator Implementation Task Board

## Goal

Implement a database-driven shipping calculator that replaces hardcoded shipping rates, keeps cart and checkout totals consistent, recalculates shipping on the server during order placement, and propagates shipping details to customer views, admin views, and emails.

## Milestones

- M1: Data model and seed rules are in place
- M2: Shipping quote service and API are live
- M3: Checkout uses dynamic shipping methods and totals
- M4: Orders, admin, and emails reflect computed shipping data
- M5: Tests and rollout checks pass

## Ticket SC-001: Add shipping schema and migrations

- Priority: P0
- Estimate: 1 day
- Depends on: none

### Scope

Add Supabase tables and constraints for shipping zones, methods, and rate rules. Keep orders as immutable snapshots of chosen shipping values.

### File-level change list

- Add new migration: supabase/migrations/<timestamp>\_create_shipping_rules.sql
- Update existing orders constraints in a new migration if needed:
  - [supabase/migrations/20260409155542_create_orders_and_order_items.sql](supabase/migrations/20260409155542_create_orders_and_order_items.sql)
- Align with migration style used in:
  - [supabase/migrations/20260507000000_add_product_variations.sql](supabase/migrations/20260507000000_add_product_variations.sql)

### Acceptance criteria

- Shipping zone, method, and rule tables exist with indexes.
- At least one active method and one valid rule are seedable.
- Orders table can store shipping method code/label and shipping cost snapshot.
- Migration applies cleanly on a fresh database.

## Ticket SC-002: Seed baseline shipping rules

- Priority: P1
- Estimate: 0.5 day
- Depends on: SC-001

### Scope

Create initial shipping rules for current markets and free-shipping threshold policy.

### File-level change list

- Add new migration: supabase/migrations/<timestamp>\_seed_shipping_rules.sql

### Acceptance criteria

- Seed creates deterministic shipping zones, methods, and tier rules.
- Free shipping threshold is represented in data.
- Rerunning migration logic is safe (idempotent where applicable).

## Ticket SC-003: Build server shipping calculator module

- Priority: P0
- Estimate: 1 day
- Depends on: SC-001

### Scope

Create a reusable server-side calculator that evaluates destination plus cart values and returns available shipping options.

### File-level change list

- Add new server module: src/lib/shipping/calculateShipping.ts
- Add shared shipping types: src/types/shipping.ts
- Reuse cart and pricing helpers from:
  - [src/redux/features/cart-slice.ts](src/redux/features/cart-slice.ts)
  - [src/lib/formatCurrency.ts](src/lib/formatCurrency.ts)

### Acceptance criteria

- Calculator returns methods sorted by price or rank.
- Calculator applies rule matching precedence deterministically.
- Unsupported destinations return structured errors.
- No client-provided shipping price is trusted.

## Ticket SC-004: Add shipping quote API endpoint

- Priority: P0
- Estimate: 1 day
- Depends on: SC-003

### Scope

Create API endpoint that computes live shipping rates for the authenticated user cart and destination payload.

### File-level change list

- Add route: src/app/api/shipping/quote/route.ts
- Reuse auth and cart retrieval pattern from:
  - [src/app/api/orders/route.ts](src/app/api/orders/route.ts)

### Acceptance criteria

- Endpoint validates destination payload.
- Endpoint uses database cart as source of truth when available.
- Response includes methods, selected method, shipping cost, subtotal, total preview.
- Unsupported destination returns 4xx with useful message.

## Ticket SC-005: Extend checkout validation schema

- Priority: P0
- Estimate: 0.5 day
- Depends on: SC-004

### Scope

Add any missing shipping input fields needed for accurate quote calculation (postal code and optional region/province).

### File-level change list

- Update [src/components/Checkout/checkoutSchema.ts](src/components/Checkout/checkoutSchema.ts)
- Update consumer typing in:
  - [src/components/Checkout/index.tsx](src/components/Checkout/index.tsx)
  - [src/components/Checkout/Shipping.tsx](src/components/Checkout/Shipping.tsx)

### Acceptance criteria

- Form requires fields needed by quote API.
- Type safety holds across checkout components.
- Invalid payloads are rejected before API submit.

## Ticket SC-006: Replace static shipping methods in checkout UI

- Priority: P0
- Estimate: 1 day
- Depends on: SC-004, SC-005

### Scope

Swap static method radio list with dynamic methods from quote API and keep total synchronized.

### File-level change list

- Update [src/components/Checkout/ShippingMethod.tsx](src/components/Checkout/ShippingMethod.tsx)
- Update [src/components/Checkout/index.tsx](src/components/Checkout/index.tsx)
- Update [src/components/Checkout/Shipping.tsx](src/components/Checkout/Shipping.tsx)

### Acceptance criteria

- Shipping method list is data-driven.
- Total updates immediately when method changes.
- Place Order is blocked if quote is stale after cart or address changes.
- Loading and error states are visible and clear.

## Ticket SC-007: Recompute shipping on order creation

- Priority: P0
- Estimate: 1 day
- Depends on: SC-003

### Scope

Remove hardcoded shipping constants in order creation and always recompute shipping server-side.

### File-level change list

- Update [src/app/api/orders/route.ts](src/app/api/orders/route.ts)

### Acceptance criteria

- Hardcoded method-to-cost map is removed.
- Server computes shipping from cart plus destination plus selected method.
- Submitted tampered shipping price is ignored.
- Persisted subtotal, shipping, and total are internally consistent.

## Ticket SC-008: Keep cart summary aligned with checkout estimate

- Priority: P1
- Estimate: 0.5 day
- Depends on: SC-004

### Scope

Show estimated shipping in cart summary based on destination defaults or user-entered estimate context.

### File-level change list

- Update [src/components/Cart/OrderSummary.tsx](src/components/Cart/OrderSummary.tsx)
- Update [src/components/Cart/index.tsx](src/components/Cart/index.tsx)
- Optional shared state update in:
  - [src/redux/features/cart-slice.ts](src/redux/features/cart-slice.ts)

### Acceptance criteria

- Cart summary can display estimated shipping and estimated grand total.
- Messaging clarifies estimate may change at checkout.
- Estimate refreshes when cart content changes.

## Ticket SC-009: Update order read models and API responses

- Priority: P1
- Estimate: 0.5 day
- Depends on: SC-007

### Scope

Expose shipping details consistently across customer order list and order details endpoints.

### File-level change list

- Update [src/app/api/orders/route.ts](src/app/api/orders/route.ts)
- Update [src/app/api/orders/[orderId]/route.ts](src/app/api/orders/[orderId]/route.ts)
- Update [src/types/order.ts](src/types/order.ts)

### Acceptance criteria

- Customer APIs return method code/label and shipping cost values used at purchase time.
- Type definitions match API payloads.
- Existing order screens remain backward compatible.

## Ticket SC-010: Admin order visibility for shipping data

- Priority: P1
- Estimate: 0.5 day
- Depends on: SC-009

### Scope

Ensure admin APIs and pages can consume and show shipping method and cost clearly.

### File-level change list

- Update [admin/src/app/api/orders/route.ts](admin/src/app/api/orders/route.ts)
- Update [admin/src/app/api/orders/[id]/route.ts](admin/src/app/api/orders/[id]/route.ts)
- Update related admin UI components under admin/src/components if fields are rendered there

### Acceptance criteria

- Admin order list/detail can access shipping method and cost.
- No regression in status update flow.
- Build succeeds for admin workspace.

## Ticket SC-011: Email payload and currency consistency

- Priority: P1
- Estimate: 0.5 day
- Depends on: SC-007

### Scope

Ensure email templates and payloads present shipping values and currency consistently with storefront.

### File-level change list

- Update [src/lib/email-service.ts](src/lib/email-service.ts)
- Update HTML templates if placeholders change:
  - [email-templates/order-confirmation.html](email-templates/order-confirmation.html)
  - [email-templates/admin-notification.html](email-templates/admin-notification.html)

### Acceptance criteria

- Emails include shipping method and shipping cost from persisted order data.
- Currency symbols and formatting are consistent with storefront convention.
- No template rendering errors.

## Ticket SC-012: Test coverage and launch checks

- Priority: P0
- Estimate: 1 day
- Depends on: SC-006, SC-007, SC-009, SC-011

### Scope

Add targeted tests and rollout checklist for shipping calculator behavior.

### File-level change list

- Add API tests for:
  - src/app/api/shipping/quote/route.ts
  - [src/app/api/orders/route.ts](src/app/api/orders/route.ts)
- Add unit tests for shipping calculator module:
  - src/lib/shipping/calculateShipping.ts
- Update readiness docs as needed:
  - [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md)
  - [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md)

### Acceptance criteria

- Unit tests cover rule selection, thresholds, and unsupported destinations.
- Integration tests confirm checkout total equals persisted order total.
- Negative test confirms client price tampering is rejected.
- Deployment checklist updated with shipping smoke tests.

## Execution Order

1. SC-001
2. SC-002
3. SC-003
4. SC-004
5. SC-005
6. SC-006
7. SC-007
8. SC-009
9. SC-010
10. SC-011
11. SC-008
12. SC-012

## Risks and Mitigations

- Risk: Mismatch between displayed totals and final charged totals.
  - Mitigation: Server-side recompute in SC-007 and stale quote guard in SC-006.
- Risk: Incomplete destination data causing quote failures.
  - Mitigation: Required field validation in SC-005 and clear API errors in SC-004.
- Risk: Currency inconsistency between UI and emails.
  - Mitigation: Normalize formatting in SC-011 and include test assertions in SC-012.

## Done Definition

- Shipping options are fully data-driven.
- Checkout, cart estimate, order records, admin views, and emails all align.
- All acceptance criteria across SC-001 to SC-012 are met.
- Storefront and admin builds pass after integration.
