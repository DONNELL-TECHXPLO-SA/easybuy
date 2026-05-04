# What's Broken (The Nitty Gritties)

A detailed breakdown of actual issues found in the codebase with concrete fixes.

---

## CRITICAL: Security & Production Risk

### 1. Admin Bootstrap Endpoint Exposed to Network

**Where:** `admin/src/app/api/auth/setup/route.ts`

**What's broken:**

```typescript
// This endpoint is LIVE on the internet right now
// Anyone can POST to it and:
// - Create a new admin account
// - Reset any admin's password
// - Gain full access to the admin dashboard

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // NO authentication check before creating admin
  // NO rate limiting
  // NO ALLOW_ADMIN_SETUP env check

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // <-- Confirmed immediately, no email verification
  });
}

// GET endpoint also lists all admin users!
export async function GET() {
  const { data: users } = await adminClient.auth.admin.listUsers();
  return NextResponse.json({
    totalUsers: users?.users.length,
    users: adminUsers, // Exposes user IDs and creation dates
  });
}
```

**Why it's critical:**

- Someone can call: `curl -X POST http://your-admin.com/api/auth/setup -d '{"email":"attacker@evil.com","password":"hacker"}'`
- Attacker gets admin access immediately.
- No audit trail of who created the account.

**How to fix it:**

**Option A: Disable for production (recommended)**

```typescript
// admin/src/app/api/auth/setup/route.ts

const ALLOW_ADMIN_SETUP = process.env.ALLOW_ADMIN_SETUP === "true";

export async function POST(request: NextRequest) {
  // Disable in production
  if (!ALLOW_ADMIN_SETUP) {
    return NextResponse.json(
      { error: "Admin setup is disabled" },
      { status: 403 },
    );
  }

  const { email, password, secretKey } = await request.json();

  // Add one-time setup key for extra safety
  if (secretKey !== process.env.ADMIN_SETUP_SECRET_KEY) {
    return NextResponse.json({ error: "Invalid setup key" }, { status: 401 });
  }

  // Log this attempt
  console.log(`[ADMIN_SETUP] Attempt to create admin: ${email}`);

  // Continue with creation...
}

export async function GET() {
  // Disable GET endpoint entirely in production
  if (!ALLOW_ADMIN_SETUP) {
    return NextResponse.json({ error: "Disabled" }, { status: 403 });
  }
  // ...
}
```

**In Vercel, set env variables:**

```env
# Production
ALLOW_ADMIN_SETUP=false

# Staging (for testing only)
ALLOW_ADMIN_SETUP=false

# Local only
ALLOW_ADMIN_SETUP=true
ADMIN_SETUP_SECRET_KEY=supersecretkey12345
```

**Better option B: One-time setup token (ephemeral)**

Create an API endpoint that:

1. Generates a time-limited token (5 min expiry)
2. Token can only be used once
3. Logs the creation in audit table

```typescript
// admin/src/app/api/auth/setup-token/route.ts
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { adminSetupPassword } = await request.json();

  // Verify setup password (hardcoded or from env)
  if (adminSetupPassword !== process.env.ADMIN_SETUP_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid setup password" },
      { status: 401 },
    );
  }

  const supabase = createAdminClient();

  // Create time-limited token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  const { error } = await supabase.from("admin_setup_tokens").insert({
    token,
    expires_at: expiresAt,
    used: false,
    created_at: new Date(),
  });

  if (error) throw error;

  return NextResponse.json({
    token,
    expiresAt,
    message: "Use this token to create admin user",
  });
}
```

Then use token:

```typescript
// admin/src/app/api/auth/setup/route.ts
export async function POST(request: NextRequest) {
  const { email, password, token } = await request.json();

  const supabase = createAdminClient();

  // Verify token exists and not expired
  const { data: setupToken, error: tokenError } = await supabase
    .from("admin_setup_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (tokenError || !setupToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (new Date() > new Date(setupToken.expires_at)) {
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  if (setupToken.used) {
    return NextResponse.json({ error: "Token already used" }, { status: 401 });
  }

  // Mark token as used
  await supabase
    .from("admin_setup_tokens")
    .update({ used: true })
    .eq("token", token);

  // Now create user...
  // Log to audit table
  await supabase.from("audit_log").insert({
    action: "admin_created",
    actor_id: null,
    email,
    created_at: new Date(),
  });
}
```

---

### 2. `.env` File Committed with Real Secrets

**Where:** `/.env` and `admin/.env.example`

**What's broken:**

```bash
# .env (COMMITTED TO REPO)
NEXT_PUBLIC_SUPABASE_URL=https://cgmlroqsxmrlifsqgbom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Why it's bad:**

- Real Supabase project URL is exposed.
- Anyone who sees this repo can use your Supabase project.
- Git history preserves the keys even if deleted.
- `.env` appears in `.gitignore` at line 38, but is still in the repo.

**How to fix it:**

1. **Remove from git history:**

```bash
# Remove from git permanently
git rm --cached .env
git rm --cached admin/.env.example
echo ".env" >> .gitignore
echo "admin/.env.example" >> .gitignore
git add .gitignore
git commit -m "Remove .env files with secrets"

# Force push (careful!)
git push origin main --force-with-lease
```

2. **Rotate all keys immediately:**
   - Go to https://app.supabase.com
   - Settings > API > Regenerate keys
   - Update Vercel environment variables with new keys
   - Document the rotation date

3. **Create `.env.example` template (without secrets):**

```bash
# .env.example (safe to commit)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

4. **Set up Vercel environment variables:**

```bash
# Install Vercel CLI
npm i -g vercel

# Link to Vercel
vercel link

# Set env variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

### 3. Service Role Key Fallback to Anon Key

**Where:** `admin/src/lib/supabase/server.ts`

**What's broken:**

```typescript
export function createAdminClient() {
  return createSupabaseClient<Database>(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, // <-- BAD!
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
```

**Why it's bad:**

- If `SUPABASE_SERVICE_ROLE_KEY` is missing, code silently uses the anon key.
- Anon key has RLS restrictions; service role bypasses RLS.
- This creates unpredictable behavior or silent failures.

**How to fix it:**

```typescript
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required for admin operations. " +
      "Set it in Vercel environment variables or .env.local",
  );
}

export function createAdminClient() {
  return createSupabaseClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY, // Must be present
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
```

---

## HIGH: Type Safety & Runtime Errors

### 4. TypeScript Strict Mode Disabled

**Where:** `tsconfig.json` and `admin/tsconfig.json`

**What's broken:**

```json
{
  "compilerOptions": {
    "strict": false, // <-- DISABLED
    "noImplicitAny": false,
    "strictNullChecks": false,
    "strictFunctionTypes": false
  }
}
```

**Why it's bad:**

- Type errors are silently ignored.
- Code like `something.property` doesn't warn if `something` could be null.
- Catch typos at compile time, not runtime.
- Runtime errors like `Cannot read property 'x' of undefined` are harder to debug.

**Issues in the code:**

```typescript
// src/app/api/cart/route.ts - Line 69
const { data: existing } = (await supabase
  .from("cart_items")
  .select("id, quantity")
  .eq("user_id", user.id)
  .eq("product_id", product_id)
  .maybeSingle()) as { data: { id: string; quantity: number } | null }; // <-- Unsafe cast

// Later: if (existing) { const newQuantity = existing.quantity + (quantity as number); }
// ^^ Why 'as number'? Because strict type checking is off!
```

**How to fix it:**

1. **Enable strict mode in `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitThis": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

2. **Fix all errors that appear:**

```typescript
// Before (line 69)
const { data: existing } = (await supabase
  .from("cart_items")
  .select("id, quantity")
  .eq("user_id", user.id)
  .eq("product_id", product_id)
  .maybeSingle()) as { data: { id: string; quantity: number } | null };

if (existing) {
  const newQuantity = existing.quantity + (quantity as number);
}

// After
interface CartItem {
  id: string;
  quantity: number;
}

const { data: existing, error: existingError } = await supabase
  .from("cart_items")
  .select("id, quantity")
  .eq("user_id", user.id)
  .eq("product_id", product_id)
  .maybeSingle<CartItem>();

if (existingError) {
  return NextResponse.json({ error: existingError.message }, { status: 500 });
}

if (existing) {
  // Now TypeScript knows existing is CartItem (not null)
  if (typeof quantity !== "number" || quantity <= 0) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const newQuantity = existing.quantity + quantity;
}
```

3. **Fix database type casts:**

```typescript
// Instead of 'as never', use proper types
const { data, error } = await supabase
  .from("cart_items")
  .insert({
    user_id: user.id,
    product_id: product_id,
    quantity,
  })
  .select()
  .single<CartItem>();
```

---

### 5. Widespread Use of `as never` and Type Bypassing

**Where:** `admin/src/app/api/products/route.ts`, `src/app/api/contact/route.ts`, etc.

**What's broken:**

```typescript
// admin/src/app/api/products/route.ts - Line 47
const { data, error } = await supabase
  .from("products")
  .insert(parsed.data as never) // <-- BYPASS TYPES
  .select()
  .maybeSingle();

// src/app/api/orders/route.ts - Line 109
.insert({...} as never)

// src/app/api/contact/route.ts - Line 50
.insert({ first_name, last_name, ... } as never)
```

**Why it's bad:**

- Silences TypeScript compiler.
- Hides real type mismatches.
- Makes refactoring dangerous (change schema, types break silently).

**How to fix it:**

1. **Define proper types:**

```typescript
// types/api.ts (NEW)
export interface ProductInput {
  title: string;
  price: number;
  discounted_price: number;
  reviews?: number;
  category_id?: number | null;
  thumbnail_images?: string[];
  preview_images?: string[];
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
}

export interface Product extends ProductInput {
  id: number;
  created_at: string;
  updated_at: string;
}
```

2. **Use typed inserts:**

```typescript
// admin/src/app/api/products/route.ts
import { ProductInput } from "@/types/api";

const productSchema = z.object({
  title: z.string().min(1),
  price: z.number().min(0),
  discounted_price: z.number().min(0),
  // ...
});

export async function POST(req: NextRequest) {
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error });

  const data: ProductInput = parsed.data;

  const { data: product, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single<Product>();

  // No 'as never' needed!
}
```

---

## HIGH: Input Validation & Security

### 6. Missing Input Validation on API Endpoints

**Where:** Multiple endpoints

**What's broken:**

**`src/app/api/profile/route.ts` - No validation on PATCH:**

```typescript
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { first_name, last_name, phone, country } = body;

  // NO VALIDATION - Attacker can send:
  // { first_name: "<script>alert('xss')</script>" }
  // { phone: 999999999999999999999 }
  // { country: null }

  const { data, error } = await supabase
    .from("user_profiles")
    .update({ first_name, last_name, phone, country } as never)
    .eq("id", user.id)
    .select()
    .maybeSingle();
}
```

**`src/app/api/addresses/route.ts` - No validation on POST:**

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    type,
    first_name,
    last_name,
    company,
    country,
    street_address,
    street_address_2,
    city,
    phone,
    email,
    is_default,
  } = body;

  // NO VALIDATION - Missing fields allowed, no length checks, no format checks
  // Attacker can send empty strings, nulls, or HTML

  const { data, error } = await supabase.from("addresses").insert({
    user_id: user.id,
    type: type ?? "shipping", // What if type is "admin"?
    first_name: first_name ?? "",
    street_address: street_address ?? "", // No zip code!
    // ...
  } as never);
}
```

**`src/app/api/products/route.ts` - No validation on GET:**

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoryId = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1", 10); // Could be NaN!
  const pageSize = parseInt(searchParams.get("pageSize") ?? "12", 10); // Could be NaN!

  // No validation - Attacker can send:
  // ?page=-999999
  // ?pageSize=9999999 (DOS attack, queries entire DB)
  // ?search='; DROP TABLE products; --
  // ?search=%00 (null byte injection)

  let query = supabase.from("products").select("*", { count: "exact" });

  if (minPrice) {
    query = query.gte("discounted_price", parseFloat(minPrice)); // NaN if "abc"
  }

  query = query.range(offset, offset + pageSize - 1);
}
```

**How to fix it:**

1. **Add validation schema to all endpoints:**

```typescript
// src/app/api/profile/route.ts
import { z } from "zod";

const profileUpdateSchema = z.object({
  first_name: z.string().max(50).trim(),
  last_name: z.string().max(50).trim(),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d\-\+\s]+$/)
    .optional(),
  country: z.string().max(100).optional(),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { first_name, last_name, phone, country } = parsed.data;

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      first_name,
      last_name,
      phone: phone || null,
      country: country || null,
    })
    .eq("id", user.id)
    .select()
    .single();
}
```

2. **Add pagination validation:**

```typescript
// src/app/api/products/route.ts
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

export async function GET(request: NextRequest) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      MIN_PAGE_SIZE,
      parseInt(searchParams.get("pageSize") ?? "12", 10) || 12,
    ),
  );

  const minPrice = searchParams.get("minPrice")
    ? parseFloat(searchParams.get("minPrice") || "0")
    : undefined;

  if (isNaN(minPrice)) {
    return NextResponse.json(
      { error: "Invalid minPrice parameter" },
      { status: 400 },
    );
  }

  const offset = (page - 1) * pageSize;

  // Query is now safe
}
```

3. **Add address validation:**

```typescript
const addressSchema = z.object({
  type: z.enum(["shipping", "billing"]),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  company: z.string().max(100).optional(),
  country: z.string().min(2).max(100),
  street_address: z.string().min(5).max(150),
  street_address_2: z.string().max(150).optional(),
  city: z.string().min(1).max(100),
  postal_code: z.string().min(1).max(20), // NEW!
  phone: z
    .string()
    .regex(/^[\d\-\+\s]+$/)
    .max(20),
  email: z.string().email(),
  is_default: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Now insert validated data
}
```

---

### 7. SQL Injection via Search / ilike

**Where:** `src/app/api/products/route.ts`

**What's broken:**

```typescript
if (search) {
  query = query.ilike("title", `%${search}%`); // Vulnerable to SQL injection
}
```

**Why it's bad:**

- Attacker sends: `search=%'; DROP TABLE products; --%`
- Although Supabase uses parameterized queries, unescaped wildcards are still risky.

**How to fix it:**

```typescript
if (search) {
  // Sanitize search input
  const sanitizedSearch = search
    .trim()
    .replace(/[%_\\]/g, "\\$&") // Escape SQL wildcards
    .substring(0, 100); // Limit length

  if (sanitizedSearch.length > 0) {
    query = query.ilike("title", `%${sanitizedSearch}%`);
  }
}
```

**Better approach: Use full-text search**

```typescript
// Enable in Supabase: CREATE EXTENSION IF NOT EXISTS pgroonga;

if (search) {
  // Use full-text search instead of ILIKE
  query = query.textSearch("title", search, {
    config: "english",
  });
}
```

---

## MEDIUM: Error Handling & Logging

### 8. Generic Error Responses Everywhere

**Where:** All API routes

**What's broken:**

```typescript
// Every endpoint does this:
catch {
  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}

// OR:
if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**Why it's bad:**

- No error tracking (Sentry can't categorize).
- No request ID for debugging.
- No user context in logs.
- Client can't distinguish between "DB is down" vs "invalid input".
- Debug logs show `error.message` directly (could expose secrets).

**How to fix it:**

1. **Create centralized error handling:**

```typescript
// src/lib/api-error.ts (NEW)
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown, requestId: string) {
  console.error(
    JSON.stringify({
      requestId,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: error instanceof ApiError ? error.errorCode : "UNKNOWN",
      context: error instanceof ApiError ? error.context : {},
    }),
  );

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        errorCode: error.errorCode,
        requestId,
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error && error.message.includes("Unauthorized")) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        errorCode: "UNAUTHORIZED",
        requestId,
      },
      { status: 401 },
    );
  }

  // Generic error (don't expose internals)
  return NextResponse.json(
    {
      error: "Internal server error",
      errorCode: "INTERNAL_ERROR",
      requestId,
    },
    { status: 500 },
  );
}
```

2. **Use in all endpoints:**

```typescript
// src/app/api/cart/route.ts
import { v4 as uuidv4 } from "uuid";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  const requestId = uuidv4();

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new ApiError(401, "NOT_AUTHENTICATED", "User not authenticated");
    }

    const body = await request.json();
    const { product_id, quantity = 1 } = body;

    if (!product_id) {
      throw new ApiError(400, "MISSING_PRODUCT_ID", "product_id is required");
    }

    // ... rest of logic

    return NextResponse.json({ item: data });
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
```

---

### 9. No Error Codes for Client Differentiation

**Where:** All API routes

**What's broken:**

```typescript
// Client receives generic 500 for everything
return NextResponse.json({ error: "Server error" }, { status: 500 });

// Client can't tell:
// - Is the DB down?
// - Is the user unauthorized?
// - Did the email send fail?
```

**How to fix it:**

Create error code system:

```typescript
// src/lib/error-codes.ts
export const ERROR_CODES = {
  // Auth
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Validation
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_FIELD: "MISSING_FIELD",

  // Commerce
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  CART_EMPTY: "CART_EMPTY",
  ORDER_ALREADY_PAID: "ORDER_ALREADY_PAID",

  // Payment
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_DECLINED: "PAYMENT_DECLINED",
  PAYMENT_TIMEOUT: "PAYMENT_TIMEOUT",

  // Server
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

export interface ApiErrorResponse {
  error: string;
  errorCode: keyof typeof ERROR_CODES;
  requestId?: string;
  details?: Record<string, any>;
}
```

Then use in endpoints:

```typescript
throw new ApiError(404, ERROR_CODES.PRODUCT_NOT_FOUND, "Product not found", {
  productId: product_id,
});
```

Client code:

```typescript
try {
  const res = await fetch('/api/cart', { method: 'POST', body: JSON.stringify({...}) });
  const data = await res.json();

  if (data.errorCode === 'OUT_OF_STOCK') {
    // Show: "This item is out of stock"
  } else if (data.errorCode === 'NOT_AUTHENTICATED') {
    // Redirect to login
  } else if (data.errorCode === 'VALIDATION_FAILED') {
    // Show validation errors
  }
} catch (e) {
  // Network error
}
```

---

### 10. No Request/Correlation ID for Debugging

**Where:** All API endpoints

**What's broken:**

```typescript
// When error occurs at 2:45 PM, no way to find it in logs
// Logs show 1000 requests with no correlation
```

**How to fix it:**

1. **Add middleware to inject request ID:**

```typescript
// middleware.ts (UPDATE)
import { v4 as uuidv4 } from "uuid";

export function middleware(request: NextRequest) {
  // Add request ID to header
  const requestId = request.headers.get("x-request-id") || uuidv4();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-request-id", requestId);
  return response;
}
```

2. **Log with request ID:**

```typescript
// src/lib/logger.ts (NEW)
import { headers } from "next/headers";

export async function logEvent(
  level: "info" | "warn" | "error",
  message: string,
  data?: Record<string, any>,
) {
  const headersList = await headers();
  const requestId = headersList.get("x-request-id");

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId,
      userId: data?.userId,
      ...data,
    }),
  );
}
```

---

## MEDIUM: Data Integrity & Transactions

### 11. No Idempotency Keys on Order Creation

**Where:** `src/app/api/orders/route.ts`

**What's broken:**

```typescript
export async function POST(request: NextRequest) {
  // ...
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      payment_method: paymentMethod,
      // ...
    })
    .select()
    .single();

  // If network fails and client retries:
  // DUPLICATE ORDER CREATED
  // User charged twice
  // Revenue counts twice
}
```

**Why it's bad:**

- Customer clicks "Place Order" → network fails → retry → 2 orders created.
- Inventory decremented twice.
- Payment charged twice.

**How to fix it:**

1. **Require idempotency key from client:**

```typescript
// src/app/api/orders/route.ts
import { createHash } from 'crypto';

interface CheckoutRequest {
  billing: {...};
  shipping?: {...};
  idempotencyKey: string; // Client generates UUID
}

const checkoutSchema = z.object({
  // ...existing fields...
  idempotencyKey: z.string().uuid('Invalid idempotency key'),
});

export async function POST(request: NextRequest) {
  const requestId = uuidv4();

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_FAILED, 'Validation failed');
    }

    const { idempotencyKey, ...orderData } = parsed.data;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if order with this key already exists
    const { data: existingRequest } = await supabase
      .from('idempotency_requests')
      .select('order_id, response')
      .eq('user_id', user.id)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingRequest) {
      // Return cached response
      return NextResponse.json(JSON.parse(existingRequest.response));
    }

    // Create order (same logic as before)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({...})
      .select()
      .single();

    if (orderError) throw orderError;

    // Store idempotency request
    await supabase.from('idempotency_requests').insert({
      user_id: user.id,
      idempotency_key: idempotencyKey,
      order_id: order.id,
      response: JSON.stringify(order),
      created_at: new Date(),
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
```

2. **Client sends idempotency key:**

```typescript
// src/components/Checkout/CheckoutForm.tsx
import { v4 as uuidv4 } from 'uuid';

const handleCheckout = async () => {
  const idempotencyKey = uuidv4(); // Generate once, reuse on retry

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey, // Send as header
      },
      body: JSON.stringify({
        billing: {...},
        shipping: {...},
        idempotencyKey,
      }),
    });

    if (!response.ok) throw new Error('Order failed');
    const { order } = await response.json();
    // Success
  } catch (error) {
    // Retry with SAME idempotencyKey
    // Server will return cached result, not create new order
  }
};
```

---

### 12. No Stock Checking on Cart/Checkout

**Where:** `src/app/api/cart/route.ts` and `src/app/api/orders/route.ts`

**What's broken:**

```typescript
// When adding to cart:
export async function POST(request: NextRequest) {
  const { product_id, quantity = 1 } = body;

  // NO CHECK if product has quantity available
  // Just insert into cart

  const { data, error } = await supabase
    .from("cart_items")
    .insert({ user_id: user.id, product_id, quantity } as never)
    .select()
    .single();
}

// When creating order:
export async function POST(request: NextRequest) {
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      quantity,
      products (...)
    `)
    .eq("user_id", user.id);

  // NO CHECK if items still in stock or prices changed
  // Just create order with whatever quantity

  const { data: order } = await supabase
    .from("orders")
    .insert({...})
    .select()
    .single();
}
```

**Why it's bad:**

- Customer adds 10 units to cart, but only 2 in stock.
- Order created for 10 units.
- Fulfillment team can't ship.
- Customer support burden.

**How to fix it:**

1. **Add inventory table to schema:**

```sql
-- supabase/migrations/TIMESTAMP_add_inventory.sql
CREATE TABLE IF NOT EXISTS product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id int NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_available int NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved int NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_sold int NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Stock = available + (reserved - sold)
CREATE INDEX idx_inventory_product_id ON product_inventory(product_id);
```

2. **Check stock before adding to cart:**

```typescript
// src/app/api/cart/route.ts
export async function POST(request: NextRequest) {
  const { product_id, quantity = 1 } = body;

  if (quantity < 1) {
    throw new ApiError(400, "INVALID_QUANTITY", "Quantity must be >= 1");
  }

  // Check stock
  const { data: inventory, error: invError } = await supabase
    .from("product_inventory")
    .select("quantity_available")
    .eq("product_id", product_id)
    .single();

  if (invError || !inventory) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
  }

  const availableStock = inventory.quantity_available;

  if (quantity > availableStock) {
    throw new ApiError(
      400,
      "OUT_OF_STOCK",
      `Only ${availableStock} items available`,
      { requested: quantity, available: availableStock },
    );
  }

  // Add to cart
  const { data: cartItem } = await supabase
    .from("cart_items")
    .insert({
      user_id: user.id,
      product_id,
      quantity,
      added_at: new Date(),
    })
    .select()
    .single();

  return NextResponse.json({ item: cartItem });
}
```

3. **Reserve stock on checkout:**

```typescript
// src/app/api/orders/route.ts
export async function POST(request: NextRequest) {
  const { idempotencyKey, ...orderData } = body;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get cart items
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      product_id,
      quantity,
      products (id, title, price, discounted_price)
    `)
    .eq("user_id", user.id);

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(400, 'CART_EMPTY', 'Cart is empty');
  }

  // Check all items are in stock (atomic check)
  for (const item of cartItems) {
    const { data: inv } = await supabase
      .from('product_inventory')
      .select('quantity_available')
      .eq('product_id', item.product_id)
      .single();

    if (!inv || inv.quantity_available < item.quantity) {
      throw new ApiError(
        400,
        'OUT_OF_STOCK',
        `${item.products.title} is out of stock`,
        { product_id: item.product_id }
      );
    }
  }

  // Create order
  const { data: order } = await supabase
    .from('orders')
    .insert({...})
    .select()
    .single();

  // Reserve stock
  for (const item of cartItems) {
    await supabase
      .from('product_inventory')
      .update({
        quantity_reserved: (await supabase
          .from('product_inventory')
          .select('quantity_reserved')
          .eq('product_id', item.product_id)
          .single()).data?.quantity_reserved + item.quantity,
      })
      .eq('product_id', item.product_id);
  }

  // Clear cart
  await supabase.from('cart_items').delete().eq('user_id', user.id);

  return NextResponse.json({ order }, { status: 201 });
}
```

---

### 13. Price Changes Between Cart and Checkout

**Where:** `src/app/api/orders/route.ts`

**What's broken:**

```typescript
const { data: cartItems } = await supabase
  .from("cart_items")
  .select(
    `
    quantity,
    products (
      id,
      title,
      price,
      discounted_price,
      thumbnail_images
    )
  `,
  )
  .eq("user_id", user.id);

// Calculate totals BASED ON CURRENT PRICE
const subtotal = cartItems.reduce(
  (sum, item) => sum + item.products.discounted_price * item.quantity,
  0,
);
// ^^ Product price could have changed since added to cart!
// Attacker could:
// 1. Add $1000 item to cart
// 2. Admin changes price to $0.01
// 3. Customer checks out for $0.01
```

**How to fix it:**

1. **Store price snapshot in cart_items:**

```sql
-- supabase/migrations/TIMESTAMP_add_cart_pricing.sql
ALTER TABLE cart_items ADD COLUMN price_at_time numeric(10, 2);
ALTER TABLE cart_items ADD COLUMN discounted_price_at_time numeric(10, 2);
```

2. **Store prices when adding to cart:**

```typescript
// src/app/api/cart/route.ts
export async function POST(request: NextRequest) {
  // ...inventory check...

  // Fetch current product prices
  const { data: product, error: prodError } = await supabase
    .from("products")
    .select("price, discounted_price")
    .eq("id", product_id)
    .single();

  if (prodError || !product) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
  }

  // Store with snapshot
  const { data: cartItem } = await supabase
    .from("cart_items")
    .insert({
      user_id: user.id,
      product_id,
      quantity,
      price_at_time: product.price,
      discounted_price_at_time: product.discounted_price,
      added_at: new Date(),
    })
    .select()
    .single();
}
```

3. **Use snapshots on checkout:**

```typescript
// src/app/api/orders/route.ts
const subtotal = cartItems.reduce(
  (sum, item) =>
    sum +
    (item.discounted_price_at_time || item.products.discounted_price) *
      item.quantity,
  0,
);

// Better: validate prices haven't changed too much
for (const item of cartItems) {
  const { data: current } = await supabase
    .from("products")
    .select("discounted_price")
    .eq("id", item.product_id)
    .single();

  const priceDiff = Math.abs(
    current.discounted_price - item.discounted_price_at_time,
  );
  if (priceDiff > 10) {
    // Price changed more than R10 since added
    throw new ApiError(
      400,
      "PRICE_CHANGED",
      "Prices have changed. Please review your cart.",
      {
        productId: item.product_id,
        oldPrice: item.discounted_price_at_time,
        newPrice: current.discounted_price,
      },
    );
  }
}
```

---

## MEDIUM: API Design & Standards

### 14. Inconsistent HTTP Status Codes

**Where:** All API routes

**What's broken:**

```typescript
// Some endpoints use 500 for everything:
if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// Some use 400:
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Some return error without status code (defaults to 200!):
return NextResponse.json({ error: "Something went wrong" });
```

**How to fix it:**

Create error HTTP status mapping:

```typescript
// src/lib/http-status.ts
export const HTTP_STATUS_CODES = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Map error codes to HTTP status
export const errorCodeToStatus: Record<string, number> = {
  // Auth
  NOT_AUTHENTICATED: HTTP_STATUS_CODES.UNAUTHORIZED,
  SESSION_EXPIRED: HTTP_STATUS_CODES.UNAUTHORIZED,

  // Validation
  VALIDATION_FAILED: HTTP_STATUS_CODES.BAD_REQUEST,
  INVALID_INPUT: HTTP_STATUS_CODES.BAD_REQUEST,

  // Commerce
  OUT_OF_STOCK: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
  PRODUCT_NOT_FOUND: HTTP_STATUS_CODES.NOT_FOUND,
  ORDER_ALREADY_PAID: HTTP_STATUS_CODES.CONFLICT,

  // Server
  DATABASE_ERROR: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  INTERNAL_ERROR: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
};
```

---

### 15. No Rate Limiting on Sensitive Endpoints

**Where:** All endpoints

**What's broken:**

```typescript
// Attacker can:
// 1. Brute force login: 1000 attempts/sec
// 2. Scrape product catalog: grab all products
// 3. DOS: hit checkout endpoint 10000x/sec
// 4. Enumerate user IDs: hit /api/auth/user for each ID
```

**How to fix it:**

1. **Add Upstash Redis rate limiter:**

```bash
npm install @upstash/ratelimit
```

2. **Create rate limit middleware:**

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Different limits for different endpoints
export const rateLimits = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 min
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 orders per hour per user
    analytics: true,
    prefix: "ratelimit:checkout",
  }),

  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"), // 3 contact forms per day per IP
    analytics: true,
    prefix: "ratelimit:contact",
  }),

  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute per IP
    analytics: true,
    prefix: "ratelimit:api",
  }),
};

export async function checkRateLimit(limiter: Ratelimit, key: string) {
  const { success, limit, remaining, reset, pending } =
    await limiter.limit(key);

  if (!success) {
    throw new ApiError(
      429,
      "RATE_LIMIT_EXCEEDED",
      "Too many requests. Please try again later.",
      { limit, remaining, resetAt: new Date(reset) },
    );
  }

  return { limit, remaining, reset };
}
```

3. **Use in endpoints:**

```typescript
// src/app/api/auth/signin/route.ts
import { rateLimits, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  // Check rate limit
  await checkRateLimit(rateLimits.auth, `signin:${ip}`);

  // Continue with signin...
}

// src/app/api/orders/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check rate limit per user
  await checkRateLimit(rateLimits.checkout, `checkout:${user?.id}`);

  // Continue...
}
```

---

## Summary: Critical Actions (Next 7 Days)

| Priority | Issue                            | Fix                                      | Est Time |
| -------- | -------------------------------- | ---------------------------------------- | -------- |
| P0 🔴    | Admin bootstrap endpoint exposed | Disable endpoint, add token verification | 2h       |
| P0 🔴    | `.env` with secrets in repo      | Remove from git history, rotate keys     | 1h       |
| P0 🔴    | Service role key fallback        | Fix to throw error if missing            | 15m      |
| P1 🟠    | TypeScript strict mode off       | Enable strict mode, fix errors           | 4h       |
| P1 🟠    | No input validation              | Add Zod validation to all endpoints      | 6h       |
| P1 🟠    | No error tracking/logging        | Add Sentry, structured logging           | 3h       |
| P2 🟡    | No idempotency keys              | Add idempotency table & logic            | 4h       |
| P2 🟡    | No stock checking                | Add inventory table and checks           | 4h       |
| P2 🟡    | No rate limiting                 | Add Upstash rate limit                   | 3h       |

**Total: ~27 hours of work** (3-4 days of focused engineering)
