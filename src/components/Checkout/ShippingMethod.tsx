import React from "react";
import { UseFormRegister } from "react-hook-form";
import { CheckoutFormData } from "./checkoutSchema";
import { formatZar } from "@/lib/formatCurrency";
import { ShippingMethodQuote } from "@/types/shipping";

type Props = {
  register: UseFormRegister<CheckoutFormData>;
  value: string;
  methods: ShippingMethodQuote[];
  loading: boolean;
  error?: string | null;
};

const ShippingMethod = ({
  register,
  value,
  methods,
  loading,
  error,
}: Props) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        {loading ? (
          <p className="text-dark-4 text-sm">Calculating shipping options...</p>
        ) : error ? (
          <p className="text-red text-sm">{error}</p>
        ) : methods.length === 0 ? (
          <p className="text-dark-4 text-sm">
            Enter your destination to view shipping methods.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {methods.map((method) => (
              <label
                key={method.methodCode}
                htmlFor={`shippingMethod-${method.methodCode}`}
                className="flex cursor-pointer select-none items-center gap-3.5"
              >
                <div className="relative">
                  <input
                    type="radio"
                    id={`shippingMethod-${method.methodCode}`}
                    value={method.methodCode}
                    {...register("shippingMethod")}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      value === method.methodCode
                        ? "border-4 border-blue"
                        : "border border-gray-4"
                    }`}
                  ></div>
                </div>

                <div className="w-full rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-dark">
                        {method.methodLabel}
                      </p>
                      <p className="text-custom-xs text-dark-4">
                        {method.carrier || "Standard Delivery"}
                        {method.etaMinDays != null && method.etaMaxDays != null
                          ? ` • ${method.etaMinDays}-${method.etaMaxDays} days`
                          : ""}
                      </p>
                    </div>
                    <p className="font-semibold text-dark">
                      {formatZar(method.price)}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingMethod;
