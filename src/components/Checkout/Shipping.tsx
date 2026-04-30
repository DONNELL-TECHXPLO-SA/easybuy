import React, { useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "./checkoutSchema";

type Props = {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
};

const Shipping = ({ register, errors }: Props) => {
  const [dropdown, setDropdown] = useState(false);

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div
        onClick={() => setDropdown(!dropdown)}
        className="cursor-pointer flex items-center gap-2.5 font-medium text-lg text-dark py-5 px-5.5"
      >
        Ship to a different address?
        <svg
          className={`fill-current ease-out duration-200 ${dropdown && "rotate-180"}`}
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
            fill=""
          />
        </svg>
      </div>

      <div className={`p-4 sm:p-8.5 ${dropdown ? "block" : "hidden"}`}>
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="shipping.firstName" className="block mb-2.5">
              First Name
            </label>
            <input
              type="text"
              id="shipping.firstName"
              placeholder="John"
              {...register("shipping.firstName")}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="w-full">
            <label htmlFor="shipping.lastName" className="block mb-2.5">
              Last Name
            </label>
            <input
              type="text"
              id="shipping.lastName"
              placeholder="Doe"
              {...register("shipping.lastName")}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="shipping.country" className="block mb-2.5">
            Country/ Region
          </label>
          <input
            type="text"
            id="shipping.country"
            placeholder="e.g. South Africa"
            {...register("shipping.country")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="shipping.address" className="block mb-2.5">
            Street Address
          </label>
          <input
            type="text"
            id="shipping.address"
            placeholder="House number and street name"
            {...register("shipping.address")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          <div className="mt-5">
            <input
              type="text"
              id="shipping.address2"
              placeholder="Apartment, suite, unit, etc. (optional)"
              {...register("shipping.address2")}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="shipping.city" className="block mb-2.5">
            Town/ City
          </label>
          <input
            type="text"
            id="shipping.city"
            {...register("shipping.city")}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>
      </div>
    </div>
  );
};

export default Shipping;
