import { requireAdmin } from "@/lib/auth";
import OrdersTable from "@/components/Orders/OrdersTable";

export default async function OrdersPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage customer orders.</p>
      </div>
      <OrdersTable />
    </div>
  );
}
