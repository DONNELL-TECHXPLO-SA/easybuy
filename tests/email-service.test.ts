import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendMock: vi.fn(),
  initMock: vi.fn(),
}));

vi.mock("@emailjs/nodejs", () => ({
  default: {
    init: mocks.initMock,
    send: mocks.sendMock,
  },
}));

import {
  resolveShippingEtaLabel,
  resolveShippingMethodLabel,
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "@/lib/email-service";

beforeEach(() => {
  mocks.sendMock.mockReset();
  mocks.initMock.mockReset();
  mocks.sendMock.mockResolvedValue(undefined);
});

describe("email shipping snapshots", () => {
  it("prefers persisted shipping labels over raw method codes", () => {
    expect(
      resolveShippingMethodLabel({
        shippingMethod: "fedex",
        shippingMethodLabel: "FedEx Standard",
      }),
    ).toBe("FedEx Standard");

    expect(
      resolveShippingMethodLabel({
        shippingMethod: "dhl",
      }),
    ).toBe("dhl");
  });

  it("formats shipping ETA from persisted snapshot fields", () => {
    expect(
      resolveShippingEtaLabel({
        shippingEtaMinDays: 2,
        shippingEtaMaxDays: 4,
      }),
    ).toBe("2-4 business days");
  });

  it("sends order confirmation emails with shipping snapshot values", async () => {
    await sendOrderConfirmationEmail({
      customerEmail: "customer@example.com",
      customerName: "Jane",
      orderId: "order-123",
      orderDate: "7 May 2026",
      items: [
        {
          title: "T-Shirt",
          quantity: 2,
          price: 100,
          selectedVariations: { Size: "M" },
        },
      ],
      subtotal: 200,
      shippingCost: 89,
      total: 289,
      shippingAddress: {
        firstName: "Jane",
        lastName: "Doe",
        address: "12 Main St",
        city: "Johannesburg",
        country: "ZA",
      },
      shippingMethod: "fedex",
      shippingMethodLabel: "FedEx Standard",
      shippingEtaMinDays: 2,
      shippingEtaMaxDays: 4,
      shippingZoneCode: "ZA_METRO",
    });

    expect(mocks.sendMock).toHaveBeenCalledTimes(1);
    const [, , payload] = mocks.sendMock.mock.calls[0];
    expect(payload.shipping_method_label).toBe("FedEx Standard");
    expect(payload.shipping_cost_formatted).toBe("R89,00");
    expect(payload.total_formatted).toBe("R289,00");
    expect(payload.message).toContain("Shipping (FedEx Standard): R89,00");
    expect(payload.message).toContain("Estimated Delivery: 2-4 business days");
  });

  it("sends admin notifications with shipping snapshot values", async () => {
    await sendAdminOrderNotification({
      customerEmail: "customer@example.com",
      customerName: "Jane",
      orderId: "order-123",
      orderDate: "7 May 2026",
      items: [
        {
          title: "T-Shirt",
          quantity: 2,
          price: 100,
        },
      ],
      subtotal: 200,
      shippingCost: 89,
      total: 289,
      shippingAddress: {
        firstName: "Jane",
        lastName: "Doe",
        address: "12 Main St",
        city: "Johannesburg",
        country: "ZA",
      },
      shippingMethod: "fedex",
      shippingMethodLabel: "FedEx Standard",
      shippingEtaMinDays: 2,
      shippingEtaMaxDays: 4,
      shippingZoneCode: "ZA_METRO",
    });

    expect(mocks.sendMock).toHaveBeenCalledTimes(1);
    const [, , payload] = mocks.sendMock.mock.calls[0];
    expect(payload.shipping_method_label).toBe("FedEx Standard");
    expect(payload.shipping_cost_formatted).toBe("R89,00");
    expect(payload.total_formatted).toBe("R289,00");
    expect(payload.message).toContain("SHIPPING METHOD: FedEx Standard");
    expect(payload.message).toContain("ESTIMATED DELIVERY: 2-4 business days");
  });
});
