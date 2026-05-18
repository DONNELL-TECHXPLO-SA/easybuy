"use client";
import React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { checkoutSchema, CheckoutFormData } from "./checkoutSchema";
import { formatZar } from "@/lib/formatCurrency";
import { FieldErrors } from "react-hook-form";
import { ShippingMethodQuote } from "@/types/shipping";
import { useAuth } from "@/app/context/AuthContext";

type ShippingQuoteResponse = {
  subtotal: number;
  shippingCost: number;
  total: number;
  selectedMethodCode: string | null;
  availableMethods: ShippingMethodQuote[];
};

const buildDestinationFromForm = (data: CheckoutFormData) => {
  const shippingCountry = data.shipping?.country?.trim();
  const shippingPostalCode = data.shipping?.postalCode?.trim();
  const useShippingDestination = Boolean(shippingCountry && shippingPostalCode);

  if (useShippingDestination) {
    return {
      country: shippingCountry!,
      region: data.shipping?.region?.trim() || "",
      city: data.shipping?.city?.trim() || "",
      postalCode: shippingPostalCode!,
    };
  }

  return {
    country: data.billing?.country?.trim() || "",
    region: data.billing?.region?.trim() || "",
    city: data.billing?.city?.trim() || "",
    postalCode: data.billing?.postalCode?.trim() || "",
  };
};

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: authLoading } = useAuth();
  const authenticated = !!user;
  const cartItems = useSelector((state: RootState) => state.cartReducer.items);
  const [cartReady, setCartReady] = React.useState(false);
  const [quote, setQuote] = React.useState<ShippingQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);
  const [quoteStale, setQuoteStale] = React.useState(true);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormData>,
    defaultValues: {
      shippingMethod: "free",
    },
  });

  const shippingMethod = watch("shippingMethod");
  const billingCountry = watch("billing.country");
  const billingRegion = watch("billing.region");
  const billingCity = watch("billing.city");
  const billingPostalCode = watch("billing.postalCode");
  const shippingCountry = watch("shipping.country");
  const shippingRegion = watch("shipping.region");
  const shippingCity = watch("shipping.city");
  const shippingPostalCode = watch("shipping.postalCode");

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
  }, [dispatch, authenticated]);

  React.useEffect(() => {
    if (!cartReady || !authenticated) return;

    if (cartItems.length === 0) {
      setQuote(null);
      setQuoteError(null);
      setQuoteStale(false);
      return;
    }

    const formValues = getValues();
    const destination = buildDestinationFromForm(formValues);

    if (!destination.country || !destination.postalCode) {
      setQuote(null);
      setQuoteError(
        "Enter destination country and postal code to view shipping methods.",
      );
      setQuoteStale(true);
      return;
    }

    const controller = new AbortController();

    setQuoteLoading(true);
    setQuoteStale(true);

    (async () => {
      try {
        const response = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination,
            selectedMethodCode: shippingMethod,
          }),
          signal: controller.signal,
        });

        const payload = await response.json();

        if (!response.ok) {
          setQuote(null);
          setQuoteError(payload.error || "Failed to calculate shipping.");
          setQuoteStale(true);
          return;
        }

        setQuote(payload as ShippingQuoteResponse);
        setQuoteError(null);
        setQuoteStale(false);

        if (
          payload.selectedMethodCode &&
          payload.selectedMethodCode !== shippingMethod
        ) {
          setValue("shippingMethod", payload.selectedMethodCode, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setQuote(null);
        setQuoteError("Failed to calculate shipping.");
        setQuoteStale(true);
      } finally {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [
    cartReady,
    cartItems,
    shippingMethod,
    billingCountry,
    billingRegion,
    billingCity,
    billingPostalCode,
    shippingCountry,
    shippingRegion,
    shippingCity,
    shippingPostalCode,
    getValues,
    setValue,
    authenticated,
  ]);

  const subtotal =
    quote?.subtotal ??
    cartItems.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0,
    );
  const shippingCost = quote?.shippingCost ?? 0;
  const total = quote?.total ?? subtotal;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cartReady) {
      toast.error("Please wait while your cart loads.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (quoteLoading || quoteStale || !quote) {
      toast.error("Please wait for shipping rates to be calculated.");
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

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to place order.");
        return;
      }

      if (json.redirectUrl) {
        toast.success("Order created. Redirecting to payment...");
        window.location.href = json.redirectUrl;
      } else {
        // Fallback or legacy flow
        dispatch(removeAllItemsFromCart());
        toast.success("Order placed successfully.");
        router.push("/my-account");
      }
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
    if (formErrors.billing?.postalCode) {
      toast.error("Please enter your postal code.");
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
    if (formErrors.shippingMethod) {
      toast.error("Please select a shipping method.");
      return;
    }

    toast.error("Please complete the required checkout fields.");
  };

  if (authLoading) {
    return (
      <>
        <Breadcrumb title={"Checkout"} pages={["checkout"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 text-center">
            <p className="text-dark-4">Loading...</p>
          </div>
        </section>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Breadcrumb title={"Checkout"} pages={["checkout"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[570px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11 text-center">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-4">
                Sign in to continue
              </h2>
              <p className="text-dark-4 mb-8 leading-relaxed">
                Please{" "}
                <Link
                  href="/signin?redirectTo=/checkout"
                  className="text-blue font-medium hover:underline"
                >
                  sign in
                </Link>{" "}
                to your existing account or{" "}
                <Link
                  href="/signup?redirectTo=/checkout"
                  className="text-blue font-medium hover:underline"
                >
                  create a new account
                </Link>{" "}
                to continue with the checkout process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signin?redirectTo=/checkout"
                  className="inline-flex justify-center font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup?redirectTo=/checkout"
                  className="inline-flex justify-center font-medium text-dark bg-gray-3 py-3 px-8 rounded-md ease-out duration-200 hover:bg-gray-4"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

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

                <ShippingMethod
                  register={register}
                  value={shippingMethod}
                  methods={quote?.availableMethods ?? []}
                  loading={quoteLoading}
                  error={quoteError}
                />

                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Payment</h3>
                  </div>

                  <div className="p-4 sm:p-8.5">
                    <p className="text-dark-4 leading-relaxed">
                      Secure payment via <strong>PayFast</strong>. You will be redirected
                       to a secure payment page to complete your purchase. We do
                      not store your card details.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !cartReady ||
                    cartItems.length === 0 ||
                    quoteLoading ||
                    quoteStale ||
                    !quote
                  }
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {!cartReady
                    ? "Loading Cart..."
                    : quoteLoading
                      ? "Calculating Shipping..."
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
