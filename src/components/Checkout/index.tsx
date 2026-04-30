"use client";
import React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { clearCartDb } from "@/redux/features/cart-slice";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { checkoutSchema, CheckoutFormData, SHIPPING_COSTS } from "./checkoutSchema";
import { formatZar } from "@/lib/formatCurrency";

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cartReducer.items);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormData>,
    defaultValues: {
      shippingMethod: "free",
      paymentMethod: "bank",
    },
  });

  const shippingMethod = watch("shippingMethod");
  const paymentMethod = watch("paymentMethod");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0
  );
  const shippingCost = SHIPPING_COSTS[shippingMethod] ?? 0;
  const total = subtotal + shippingCost;

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 401) {
        toast.error("Please sign in to place an order.");
        return;
      }

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Failed to place order.");
        return;
      }

      dispatch(clearCartDb());
      toast.success("Order placed successfully!");
      router.push("/my-account");
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              <div className="lg:max-w-[670px] w-full">
                <Login />

                <Billing register={register} errors={errors} />

                <Shipping register={register} errors={errors} />

                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={5}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      {...register("notes")}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">Subtotal</h4>
                    </div>

                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-5 border-b border-gray-3"
                        >
                          <p className="text-dark">
                            {item.title}{" "}
                            {item.quantity > 1 && (
                              <span className="text-dark-4">x{item.quantity}</span>
                            )}
                          </p>
                          <p className="text-dark text-right">
                            {formatZar(item.discountedPrice * item.quantity)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-5 border-b border-gray-3">
                        <p className="text-dark-4 text-sm">Your cart is empty</p>
                      </div>
                    )}

                    {shippingCost > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <p className="text-dark">Shipping Fee</p>
                        <p className="text-dark text-right">{formatZar(shippingCost)}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">
                        {formatZar(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <Coupon />

                <ShippingMethod register={register} value={shippingMethod} />

                <PaymentMethod register={register} value={paymentMethod} />

                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Placing Order..." : "Process to Checkout"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
