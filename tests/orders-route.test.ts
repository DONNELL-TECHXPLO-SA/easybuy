import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendOrderConfirmationEmailMock: vi.fn(),
  sendAdminOrderNotificationMock: vi.fn(),
}));

let insertedOrderPayload: Record<string, unknown> | null = null;

const cartRows = [
  {
    quantity: 1,
    selected_variations: {},
    products: {
      id: 101,
      title: "Test Product",
      price: 120,
      discounted_price: 100,
      thumbnail_images: ["thumb.jpg"],
    },
  },
];

const zones = [
  {
    code: "ZA_METRO",
    name: "South Africa Metro Areas",
    countries: ["za"],
    regions: [],
    postal_code_patterns: ["2*"],
    priority: 10,
    is_active: true,
  },
];

const methods = [
  {
    code: "fedex",
    label: "FedEx Standard",
    carrier: "FedEx",
    description: "Tracked standard delivery",
    sort_order: 20,
    is_active: true,
    allow_free_shipping: false,
  },
];

const rules = [
  {
    id: 1,
    min_subtotal: null,
    max_subtotal: null,
    min_weight_grams: null,
    max_weight_grams: 5000,
    min_items: null,
    max_items: null,
    price: 89,
    eta_min_days: 2,
    eta_max_days: 4,
    sort_order: 20,
    is_active: true,
    shipping_zones: { code: "ZA_METRO" },
    shipping_methods: { code: "fedex" },
  },
];

const createFakeSupabase = () => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    }),
  },
  from: vi.fn((table: string) => {
    if (table === "cart_items") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: cartRows, error: null })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      };
    }

    if (table === "shipping_zones") {
      return {
        select: vi.fn(() => Promise.resolve({ data: zones, error: null })),
      };
    }

    if (table === "shipping_methods") {
      return {
        select: vi.fn(() => Promise.resolve({ data: methods, error: null })),
      };
    }

    if (table === "shipping_rate_rules") {
      return {
        select: vi.fn(() => Promise.resolve({ data: rules, error: null })),
      };
    }

    if (table === "shipping_settings") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() =>
              Promise.resolve({
                data: { free_shipping_threshold: 1000 },
                error: null,
              }),
            ),
          })),
        })),
      };
    }

    if (table === "orders") {
      return {
        insert: vi.fn((payload: Record<string, unknown>) => {
          insertedOrderPayload = payload;
          return {
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: {
                    id: "order-1",
                    created_at: "2026-05-07T00:00:00Z",
                    ...payload,
                  },
                  error: null,
                }),
              ),
            })),
          };
        }),
      };
    }

    if (table === "order_items") {
      return {
        insert: vi.fn(() => Promise.resolve({ error: null })),
      };
    }

    return {};
  }),
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => createFakeSupabase() as any),
}));

vi.mock("@/lib/email-service", () => ({
  sendOrderConfirmationEmail: mocks.sendOrderConfirmationEmailMock,
  sendAdminOrderNotification: mocks.sendAdminOrderNotificationMock,
}));

// Set required env vars for PayFast URL generation in test
process.env.PAYFAST_MERCHANT_ID = "test_merchant_id";
process.env.PAYFAST_MERCHANT_KEY = "test_merchant_key";
process.env.PAYFAST_PASSPHRASE = "test_passphrase";
process.env.PAYFAST_SANDBOX = "true";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

import { POST } from "@/app/api/orders/route";

describe("orders POST route", () => {
  beforeEach(() => {
    insertedOrderPayload = null;
    mocks.sendOrderConfirmationEmailMock.mockReset();
    mocks.sendAdminOrderNotificationMock.mockReset();
    mocks.sendOrderConfirmationEmailMock.mockResolvedValue(undefined);
    mocks.sendAdminOrderNotificationMock.mockResolvedValue(undefined);
  });

  it("recomputes shipping server-side and uses persisted snapshot fields in outbound email payloads", async () => {
    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billing: {
          firstName: "Jane",
          lastName: "Doe",
          country: "ZA",
          region: "Gauteng",
          address: "12 Main St",
          city: "Johannesburg",
          postalCode: "2001",
          phone: "0123456789",
          email: "jane@example.com",
        },
        shippingMethod: "fedex",
        shippingCost: 1,
        notes: "",
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.order.shipping_cost).toBe(89);
    expect(payload.order.total).toBe(189);
    expect(insertedOrderPayload?.shipping_cost).toBe(89);
    expect(insertedOrderPayload?.total).toBe(189);
    expect(insertedOrderPayload?.shipping_method_label).toBe("FedEx Standard");
  });
});
