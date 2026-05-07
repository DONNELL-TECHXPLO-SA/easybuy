export type ShippingDestination = {
  country: string;
  region?: string;
  city?: string;
  postalCode?: string;
};

export type ShippingCartLine = {
  productId: number;
  quantity: number;
  unitPrice: number;
  weightGrams?: number;
};

export type ShippingZone = {
  code: string;
  name: string;
  countries: string[];
  regions?: string[];
  postalCodePatterns?: string[];
  priority: number;
  isActive: boolean;
};

export type ShippingMethod = {
  code: string;
  label: string;
  carrier?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  allowFreeShipping: boolean;
};

export type ShippingRateRule = {
  id: number;
  zoneCode: string;
  methodCode: string;
  minSubtotal?: number | null;
  maxSubtotal?: number | null;
  minWeightGrams?: number | null;
  maxWeightGrams?: number | null;
  minItems?: number | null;
  maxItems?: number | null;
  price: number;
  etaMinDays?: number | null;
  etaMaxDays?: number | null;
  sortOrder: number;
  isActive: boolean;
};

export type ShippingMethodQuote = {
  methodCode: string;
  methodLabel: string;
  carrier?: string;
  zoneCode: string;
  price: number;
  etaMinDays?: number;
  etaMaxDays?: number;
  isFreeShippingApplied: boolean;
};

export type ShippingCalculationInput = {
  destination: ShippingDestination;
  cartLines: ShippingCartLine[];
  zones: ShippingZone[];
  methods: ShippingMethod[];
  rules: ShippingRateRule[];
  selectedMethodCode?: string;
  freeShippingThreshold?: number | null;
};

export type ShippingCalculationResult = {
  subtotal: number;
  totalWeightGrams: number;
  itemCount: number;
  availableMethods: ShippingMethodQuote[];
  selectedMethodCode: string | null;
  shippingCost: number;
  total: number;
};

export type ShippingCalculationErrorCode =
  | "EMPTY_CART"
  | "NO_ZONE_MATCH"
  | "NO_METHOD_AVAILABLE";

export class ShippingCalculationError extends Error {
  code: ShippingCalculationErrorCode;

  constructor(code: ShippingCalculationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "ShippingCalculationError";
  }
}
