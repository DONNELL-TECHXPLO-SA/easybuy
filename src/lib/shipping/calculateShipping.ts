import {
  ShippingCalculationError,
  ShippingCalculationInput,
  ShippingCalculationResult,
  ShippingDestination,
  ShippingMethod,
  ShippingMethodQuote,
  ShippingRateRule,
  ShippingZone,
} from "@/types/shipping";

const roundCurrency = (value: number) => Number(value.toFixed(2));

const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();

const withinRange = (
  value: number,
  min?: number | null,
  max?: number | null,
): boolean => {
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
};

const matchesPattern = (value: string, pattern: string): boolean => {
  const normalizedValue = normalize(value);
  const normalizedPattern = normalize(pattern);

  if (!normalizedPattern || normalizedPattern === "*") return true;

  if (normalizedPattern.includes("*")) {
    const prefix = normalizedPattern.replace(/\*/g, "");
    return normalizedValue.startsWith(prefix);
  }

  return (
    normalizedValue === normalizedPattern ||
    normalizedValue.startsWith(normalizedPattern)
  );
};

const destinationMatchesZone = (
  destination: ShippingDestination,
  zone: ShippingZone,
): boolean => {
  const country = normalize(destination.country);
  const region = normalize(destination.region);
  const postalCode = normalize(destination.postalCode);

  const countries = zone.countries.map((value) => normalize(value));
  const countryMatch = countries.includes("*") || countries.includes(country);
  if (!countryMatch) return false;

  const regions = (zone.regions ?? [])
    .map((value) => normalize(value))
    .filter(Boolean);
  if (regions.length > 0 && !regions.includes(region)) return false;

  const patterns = (zone.postalCodePatterns ?? [])
    .map((value) => normalize(value))
    .filter(Boolean);

  if (patterns.length === 0) return true;
  if (!postalCode) return false;

  return patterns.some((pattern) => matchesPattern(postalCode, pattern));
};

const chooseRuleForMethod = (
  method: ShippingMethod,
  matchingZones: ShippingZone[],
  rules: ShippingRateRule[],
  subtotal: number,
  totalWeightGrams: number,
  itemCount: number,
): ShippingRateRule | null => {
  const activeRules = rules
    .filter((rule) => rule.isActive && rule.methodCode === method.code)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.price - b.price;
    });

  for (const zone of matchingZones) {
    const zoneRule = activeRules.find((rule) => {
      if (rule.zoneCode !== zone.code) return false;

      return (
        withinRange(subtotal, rule.minSubtotal, rule.maxSubtotal) &&
        withinRange(
          totalWeightGrams,
          rule.minWeightGrams,
          rule.maxWeightGrams,
        ) &&
        withinRange(itemCount, rule.minItems, rule.maxItems)
      );
    });

    if (zoneRule) return zoneRule;
  }

  return null;
};

export const calculateShipping = (
  input: ShippingCalculationInput,
): ShippingCalculationResult => {
  const subtotal = roundCurrency(
    input.cartLines.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0,
    ),
  );
  const totalWeightGrams = input.cartLines.reduce(
    (sum, line) => sum + (line.weightGrams ?? 0) * line.quantity,
    0,
  );
  const itemCount = input.cartLines.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );

  if (itemCount <= 0) {
    throw new ShippingCalculationError(
      "EMPTY_CART",
      "Cannot calculate shipping for an empty cart.",
    );
  }

  const matchingZones = input.zones
    .filter((zone) => zone.isActive)
    .filter((zone) => destinationMatchesZone(input.destination, zone))
    .sort((a, b) => a.priority - b.priority);

  if (matchingZones.length === 0) {
    throw new ShippingCalculationError(
      "NO_ZONE_MATCH",
      "No shipping zone matched the provided destination.",
    );
  }

  const activeMethods = input.methods
    .filter((method) => method.isActive)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.code.localeCompare(b.code);
    });

  const availableMethods: ShippingMethodQuote[] = [];

  for (const method of activeMethods) {
    const rule = chooseRuleForMethod(
      method,
      matchingZones,
      input.rules,
      subtotal,
      totalWeightGrams,
      itemCount,
    );

    if (!rule) continue;

    const thresholdApplies =
      method.allowFreeShipping &&
      input.freeShippingThreshold != null &&
      subtotal >= input.freeShippingThreshold;

    availableMethods.push({
      methodCode: method.code,
      methodLabel: method.label,
      carrier: method.carrier,
      zoneCode: rule.zoneCode,
      price: thresholdApplies ? 0 : roundCurrency(rule.price),
      etaMinDays: rule.etaMinDays ?? undefined,
      etaMaxDays: rule.etaMaxDays ?? undefined,
      isFreeShippingApplied: thresholdApplies,
    });
  }

  if (availableMethods.length === 0) {
    throw new ShippingCalculationError(
      "NO_METHOD_AVAILABLE",
      "No shipping methods are available for this destination and cart.",
    );
  }

  availableMethods.sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return a.methodCode.localeCompare(b.methodCode);
  });

  const selectedMethod =
    availableMethods.find(
      (method) => method.methodCode === input.selectedMethodCode,
    ) ?? availableMethods[0];

  const shippingCost = roundCurrency(selectedMethod.price);

  return {
    subtotal,
    totalWeightGrams,
    itemCount,
    availableMethods,
    selectedMethodCode: selectedMethod.methodCode,
    shippingCost,
    total: roundCurrency(subtotal + shippingCost),
  };
};
