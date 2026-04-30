import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";
import { Order } from "@/types/order";
import { formatZar } from "@/lib/formatCurrency";

type Props = {
  orderItem: Order;
  smallView: boolean;
};

const SingleOrder = ({ orderItem, smallView }: Props) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => setShowDetails(!showDetails);
  const toggleEdit = () => setShowEdit(!showEdit);
  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  const dateLabel = new Date(orderItem.created_at).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const itemsLabel =
    orderItem.order_items?.length > 0
      ? orderItem.order_items[0].title +
        (orderItem.order_items.length > 1 ? ` +${orderItem.order_items.length - 1} more` : "")
      : "—";

  const statusClass =
    orderItem.status === "delivered"
      ? "text-green bg-green-light-6"
      : orderItem.status === "on-hold"
      ? "text-red bg-red-light-6"
      : orderItem.status === "pending" || orderItem.status === "processing"
      ? "text-yellow bg-yellow-light-4"
      : "text-dark-4 bg-gray-2";

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <p className="text-custom-sm text-red">#{orderItem.id.slice(-8)}</p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{dateLabel}</p>
          </div>
          <div className="min-w-[128px]">
            <p className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${statusClass}`}>
              {orderItem.status}
            </p>
          </div>
          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark">{itemsLabel}</p>
          </div>
          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">{formatZar(orderItem.total)}</p>
          </div>
          <div className="flex gap-5 items-center">
            <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-4.5 px-7.5">
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Order:</span> #{orderItem.id.slice(-8)}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Date:</span> {dateLabel}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Status:</span>{" "}
              <span className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${statusClass}`}>
                {orderItem.status}
              </span>
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Items:</span> {itemsLabel}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Total:</span> {formatZar(orderItem.total)}
            </p>
            <p className="text-custom-sm text-dark flex items-center">
              <span className="font-bold pr-2">Actions:</span>{" "}
              <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
            </p>
          </div>
        </div>
      )}

      <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        order={orderItem}
      />
    </>
  );
};

export default SingleOrder;
