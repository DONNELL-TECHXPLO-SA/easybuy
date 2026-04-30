"use client";
import { useState, useEffect, useCallback } from "react";
import AdminTable from "@/components/ui/AdminTable";
import AdminModal from "@/components/ui/AdminModal";
import { formatZar } from "@/lib/formatCurrency";

interface OrderItem { id: string; quantity: number; unit_price: number; products: { title: string } | null; }
interface Order { id: string; status: string; total: number; billing_first_name: string; billing_last_name: string; billing_email: string; created_at: string; order_items: OrderItem[]; }

const STATUS_OPTIONS = ["pending", "processing", "on-hold", "shipped", "delivered", "cancelled"] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-blue-50 text-blue-800",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Status>("pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } catch { setError("Failed to load orders."); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async () => {
    if (!editOrder) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${editOrder.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error();
      setEditOrder(null); load();
    } catch { setError("Failed to update order status."); }
    finally { setSubmitting(false); }
  };

  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { header: "Order ID", render: (o: Order) => <span className="font-mono text-xs text-gray-500">{o.id.slice(0, 8)}…</span>, className: "w-28" },
    { header: "Customer", render: (o: Order) => (<div><p className="font-medium text-gray-900">{o.billing_first_name} {o.billing_last_name}</p><p className="text-xs text-gray-500">{o.billing_email}</p></div>) },
    { header: "Total", render: (o: Order) => <span className="font-medium">{formatZar(o.total)}</span> },
    { header: "Status", render: (o: Order) => <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>{o.status}</span> },
    { header: "Date", render: (o: Order) => <span className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</span> },
    { header: "Actions", className: "text-right", render: (o: Order) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => setViewOrder(o)} className="text-xs text-gray-600 hover:text-gray-900 font-medium">View</button>
        <button onClick={() => { setEditOrder(o); setNewStatus(o.status as Status); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Status</button>
      </div>
    )},
  ];

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex justify-between">{error}<button onClick={() => setError("")} className="font-medium">Dismiss</button></div>}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={() => { setStatusFilter(""); setPage(1); }} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${!statusFilter ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>All</button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-1.5 text-sm rounded-lg border capitalize transition-colors ${statusFilter === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>{s}</button>
        ))}
        <span className="ml-auto text-sm text-gray-500">{total} orders</span>
      </div>
      <AdminTable columns={columns} rows={orders} loading={loading} keyFn={(o) => o.id} emptyMessage="No orders found." />
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
      {viewOrder && (
        <AdminModal title={`Order ${viewOrder.id.slice(0, 8)}…`} onClose={() => setViewOrder(null)} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Customer</p><p className="font-medium">{viewOrder.billing_first_name} {viewOrder.billing_last_name}</p></div>
              <div><p className="text-gray-500">Email</p><p className="font-medium">{viewOrder.billing_email}</p></div>
              <div><p className="text-gray-500">Status</p><span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[viewOrder.status] ?? ""}`}>{viewOrder.status}</span></div>
              <div><p className="text-gray-500">Total</p><p className="font-semibold text-lg">{formatZar(viewOrder.total)}</p></div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Items</p>
              <div className="space-y-2">
                {viewOrder.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.products?.title ?? "Unknown"} × {item.quantity}</span>
                    <span className="font-medium">{formatZar(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminModal>
      )}
      {editOrder && (
        <AdminModal title="Update Order Status" onClose={() => setEditOrder(null)} footer={
          <><button onClick={() => setEditOrder(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleStatusUpdate} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? "Saving..." : "Update"}</button></>
        }>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Order <strong>{editOrder.id.slice(0, 8)}…</strong> — current: <strong>{editOrder.status}</strong></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as Status)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
