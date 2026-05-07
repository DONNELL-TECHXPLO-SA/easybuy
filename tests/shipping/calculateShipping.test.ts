import { describe, expect, it } from "vitest";
import { calculateShipping } from "@/lib/shipping/calculateShipping";
import { ShippingCalculationError } from "@/types/shipping";

const zones = [
  {
    code: "ZA_METRO",
    name: "South Africa Metro Areas",
    countries: ["za"],
    regions: [],
    postalCodePatterns: ["2*", "4*"],
    priority: 10,
    isActive: true,
  },
  {
    code: "INTL_DEFAULT",
    name: "International Default",
    countries: ["*"],
    regions: [],
    postalCodePatterns: [],
    priority: 1000,
    isActive: true,
  },
];

const methods = [
  {
    code: "free",
    label: "Free Shipping",
    carrier: "EasyBuy",
    sortOrder: 10,
    isActive: true,
    allowFreeShipping: true,
  },
  {
    code: "fedex",
    label: "FedEx Standard",
    carrier: "FedEx",
    sortOrder: 20,
    isActive: true,
    allowFreeShipping: false,
  },
  {
    code: "dhl",
    label: "DHL Express",
    carrier: "DHL",
    sortOrder: 30,
    isActive: true,
    allowFreeShipping: false,
  },
];

const rules = [
  {
    id: 1,
    zoneCode: "ZA_METRO",
    methodCode: "free",
    minSubtotal: 1000,
    maxSubtotal: null,
    minWeightGrams: null,
    maxWeightGrams: null,
    minItems: null,
    maxItems: null,
    price: 0,
    etaMinDays: 2,
    etaMaxDays: 4,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 2,
    zoneCode: "ZA_METRO",
    methodCode: "fedex",
    minSubtotal: null,
    maxSubtotal: null,
    minWeightGrams: null,
    maxWeightGrams: 5000,
    minItems: null,
    maxItems: null,
    price: 89,
    etaMinDays: 2,
    etaMaxDays: 4,
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 3,
    zoneCode: "ZA_METRO",
    methodCode: "dhl",
    minSubtotal: null,
    maxSubtotal: null,
    minWeightGrams: null,
    maxWeightGrams: 5000,
    minItems: null,
    maxItems: null,
    price: 149,
    etaMinDays: 1,
    etaMaxDays: 2,
    sortOrder: 30,
    isActive: true,
  },
];

describe("calculateShipping", () => {
  it("returns the matching methods and selected shipping cost", () => {
    const result = calculateShipping({
      destination: {
        country: "ZA",
        postalCode: "2001",
        city: "Johannesburg",
      },
      cartLines: [{ productId: 1, quantity: 1, unitPrice: 100 }],
      zones,
      methods,
      rules,
      selectedMethodCode: "fedex",
      freeShippingThreshold: 1000,
    });

    expect(result.subtotal).toBe(100);
    expect(result.selectedMethodCode).toBe("fedex");
    expect(result.shippingCost).toBe(89);
    expect(result.total).toBe(189);
    expect(result.availableMethods.map((method) => method.methodCode)).toEqual([
      "fedex",
      "dhl",
    ]);
  });

  it("applies free shipping when the threshold is met", () => {
    const result = calculateShipping({
      destination: {
        country: "ZA",
        postalCode: "2001",
      },
      cartLines: [{ productId: 1, quantity: 10, unitPrice: 100 }],
      zones,
      methods,
      rules,
      selectedMethodCode: "free",
      freeShippingThreshold: 1000,
    });

    expect(result.selectedMethodCode).toBe("free");
    expect(result.shippingCost).toBe(0);
    expect(result.availableMethods[0]?.isFreeShippingApplied).toBe(true);
  });

  it("throws when the destination does not match any zone", () => {
    expect(() =>
      calculateShipping({
        destination: {
          country: "US",
          postalCode: "10001",
        },
        cartLines: [{ productId: 1, quantity: 1, unitPrice: 100 }],
        zones: zones.filter((zone) => zone.code === "ZA_METRO"),
        methods,
        rules: rules.filter((rule) => rule.zoneCode === "ZA_METRO"),
      }),
    ).toThrow(ShippingCalculationError);
  });
});
