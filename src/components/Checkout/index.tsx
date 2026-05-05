"use client";
import React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
  fetchCartFromDb,
  removeAllItemsFromCart,
} from "@/redux/features/cart-slice";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import {
  checkoutSchema,
  CheckoutFormData,
  SHIPPING_COSTS,
} from "./checkoutSchema";
import { formatZar } from "@/lib/formatCurrency";
import { FieldErrors } from "react-hook-form";

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cartReducer.items);
  const [cartReady, setCartReady] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormData>,
    defaultValues: {
      shippingMethod: "free",
    },
  });

  const shippingMethod = watch("shippingMethod");

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await dispatch(fetchCartFromDb()).unwrap();
      } catch {
        // Cart hydration can fail for signed-out users; the submit guard below handles that.
      } finally {
        if (isMounted) {
          setCartReady(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0,
  );
  const shippingCost = SHIPPING_COSTS[shippingMethod] ?? 0;
  const total = subtotal + shippingCost;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cartReady) {
      toast.error("Please wait while your cart loads.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      console.debug("Checkout submit payload", data);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          cartItems,
        }),
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

      dispatch(removeAllItemsFromCart());
      toast.success(
        "Order placed. Payment was simulated for pre-deploy testing.",
      );
      router.push("/my-account");
    } catch (error) {
      console.error("Checkout submit failed", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const onInvalid = (formErrors: FieldErrors<CheckoutFormData>) => {
    if (formErrors.billing?.firstName) {
      toast.error("Please enter your first name.");
      return;
    }
    if (formErrors.billing?.lastName) {
      toast.error("Please enter your last name.");
      return;
    }
    if (formErrors.billing?.country) {
      toast.error("Please enter your country.");
      return;
    }
    if (formErrors.billing?.address) {
      toast.error("Please enter your billing address.");
      return;
    }
    if (formErrors.billing?.city) {
      toast.error("Please enter your city.");
      return;
    }
    if (formErrors.billing?.phone) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (formErrors.billing?.email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    toast.error("Please complete the required checkout fields.");
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">
                        Subtotal
                      </h4>
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
                              <span className="text-dark-4">
                                x{item.quantity}
                              </span>
                            )}
                          </p>
                          <p className="text-dark text-right">
                            {formatZar(item.discountedPrice * item.quantity)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-5 border-b border-gray-3">
                        <p className="text-dark-4 text-sm">
                          Your cart is empty
                        </p>
                      </div>
                    )}

                    {shippingCost > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <p className="text-dark">Shipping Fee</p>
                        <p className="text-dark text-right">
                          {formatZar(shippingCost)}
                        </p>
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

                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Payment</h3>
                  </div>

                  <div className="p-4 sm:p-8.5">
                    <p className="text-dark-4 leading-relaxed">
                      Payment is currently simulated for pre-deployment testing.
                      Orders are marked as processing automatically so they can
                      be reviewed and approved in admin. A live payment gateway
                      will replace this after deployment.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting || !cartReady || cartItems.length === 0
                  }
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {!cartReady
                    ? "Loading Cart..."
                    : isSubmitting
                      ? "Placing Order..."
                      : "Place Order"}
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
