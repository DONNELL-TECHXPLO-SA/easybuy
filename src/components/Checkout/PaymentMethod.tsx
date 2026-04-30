import React from "react";
import Image from "next/image";
import { UseFormRegister } from "react-hook-form";
import { CheckoutFormData } from "./checkoutSchema";

type Props = {
  register: UseFormRegister<CheckoutFormData>;
  value: string;
};

const PaymentMethod = ({ register, value }: Props) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          <label
            htmlFor="paymentMethod-bank"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                id="paymentMethod-bank"
                value="bank"
                {...register("paymentMethod")}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  value === "bank" ? "border-4 border-blue" : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none ${
                value === "bank" ? "border-transparent bg-gray-2" : "border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/bank.svg" alt="bank" width={29} height={12} />
                </div>
                <div className="border-l border-gray-4 pl-2.5">
                  <p>Direct bank transfer</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="paymentMethod-cash"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                id="paymentMethod-cash"
                value="cash"
                {...register("paymentMethod")}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  value === "cash" ? "border-4 border-blue" : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                value === "cash" ? "border-transparent bg-gray-2" : "border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/cash.svg" alt="cash" width={21} height={21} />
                </div>
                <div className="border-l border-gray-4 pl-2.5">
                  <p>Cash on delivery</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="paymentMethod-paypal"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                id="paymentMethod-paypal"
                value="paypal"
                {...register("paymentMethod")}
                className="sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  value === "paypal" ? "border-4 border-blue" : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                value === "paypal" ? "border-transparent bg-gray-2" : "border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/paypal.svg" alt="paypal" width={75} height={20} />
                </div>
                <div className="border-l border-gray-4 pl-2.5">
                  <p>Paypal</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
