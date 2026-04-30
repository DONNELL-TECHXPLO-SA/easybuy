import React from "react";
import { Order } from "@/types/order";
import { formatZar } from "@/lib/formatCurrency";

type Props = {
  orderItem: Order;
};

const OrderDetails = ({ orderItem }: Props) => {
  const dateLabel = new Date(orderItem.created_at).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusClass =
    orderItem.status === "delivered"
      ? "text-green bg-green-light-6"
      : orderItem.status === "on-hold"
      ? "text-red bg-red-light-6"
      : orderItem.status === "pending" || orderItem.status === "processing"
      ? "text-yellow bg-yellow-light-4"
      : "text-dark-4 bg-gray-2";

  return (
    <div className="w-full px-7.5">
      <div className="flex flex-col gap-2 mb-4">
        <p className="text-custom-sm text-dark">
          <span className="font-bold">Order:</span> #{orderItem.id.slice(-8)}
        </p>
        <p className="text-custom-sm text-dark">
          <span className="font-bold">Date:</span> {dateLabel}
        </p>
        <p className="text-custom-sm text-dark flex items-center gap-2">
          <span className="font-bold">Status:</span>
          <span className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${statusClass}`}>
            {orderItem.status}
          </span>
        </p>
        <p className="text-custom-sm text-dark">
          <span className="font-bold">Total:</span> {formatZar(orderItem.total)}
        </p>
      </div>

      {orderItem.order_items?.length > 0 && (
        <div className="mb-4">
          <p className="font-bold text-custom-sm text-dark mb-1">Items:</p>
          {orderItem.order_items.map((item) => (
            <p key={item.id} className="text-custom-sm text-dark">
              {item.title} x{item.quantity} — {formatZar(item.discounted_price * item.quantity)}
            </p>
          ))}
        </div>
      )}

      <p className="font-bold text-custom-sm text-dark">Billing:</p>
      <p className="text-custom-sm text-dark">
        {orderItem.billing_first_name} {orderItem.billing_last_name} &bull; {orderItem.billing_email}
      </p>
    </div>
  );
};

export default OrderDetails;
