import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "./checkoutSchema";

type Props = {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
};

const Billing = ({ register, errors }: Props) => {
  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Billing details
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="billing.firstName" className="block mb-2.5">
              First Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="billing.firstName"
              placeholder="John"
              {...register("billing.firstName")}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
            {errors.billing?.firstName && (
              <p className="text-red text-custom-sm mt-1">{errors.billing.firstName.message}</p>
            )}
          </div>

          <div className="w-full">
            <label htmlFor="billing.lastName" className="block mb-2.5">
              Last Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="billing.lastName"
              placeholder="Doe"
              {...register("billing.lastName")}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
            {errors.billing?.lastName && (
              <p className="text-red text-custom-sm mt-1">{errors.billing.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="billing.company" className="block mb-2.5">
            Company Name
          </label>
          <input
            type="text"
            id="billing.company"
            {...register("billing.company")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="billing.country" className="block mb-2.5">
            Country/ Region <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="billing.country"
            placeholder="e.g. South Africa"
            {...register("billing.country")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.billing?.country && (
            <p className="text-red text-custom-sm mt-1">{errors.billing.country.message}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="billing.address" className="block mb-2.5">
            Street Address <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="billing.address"
            placeholder="House number and street name"
            {...register("billing.address")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.billing?.address && (
            <p className="text-red text-custom-sm mt-1">{errors.billing.address.message}</p>
          )}
          <div className="mt-5">
            <input
              type="text"
              id="billing.address2"
              placeholder="Apartment, suite, unit, etc. (optional)"
              {...register("billing.address2")}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="billing.city" className="block mb-2.5">
            Town/ City <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="billing.city"
            {...register("billing.city")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.billing?.city && (
            <p className="text-red text-custom-sm mt-1">{errors.billing.city.message}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="billing.phone" className="block mb-2.5">
            Phone <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="billing.phone"
            {...register("billing.phone")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.billing?.phone && (
            <p className="text-red text-custom-sm mt-1">{errors.billing.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="billing.email" className="block mb-2.5">
            Email Address <span className="text-red">*</span>
          </label>
          <input
            type="email"
            id="billing.email"
            {...register("billing.email")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          {errors.billing?.email && (
            <p className="text-red text-custom-sm mt-1">{errors.billing.email.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
