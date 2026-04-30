import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";
import { formatZar } from "@/lib/formatCurrency";

interface RecentOrder {
  id: string;
  status: string;
  total: number;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-blue-50 text-blue-800",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function DashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [ordersCount, productsCount, customersCount, revenueResult, recentOrdersResult] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total").eq("status", "delivered"),
      supabase
        .from("orders")
        .select("id, status, total, billing_first_name, billing_last_name, billing_email, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const totalRevenue = ((revenueResult.data ?? []) as { total: number }[]).reduce(
    (sum, o) => sum + (o.total ?? 0),
    0
  );
  const recentOrders = (recentOrdersResult.data ?? []) as RecentOrder[];

  const stats = [
    {
      label: "Total Orders",
      value: String(ordersCount.count ?? 0),
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: "Total Products",
      value: String(productsCount.count ?? 0),
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      ),
    },
    {
      label: "Total Revenue",
      value: formatZar(totalRevenue),
      subLabel: "Delivered orders only",
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Customers",
      value: String(customersCount.count ?? 0),
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { label: "Manage Products", href: "/products", desc: "Add, edit or remove products" },
    { label: "View Orders", href: "/orders", desc: "Track and update order statuses" },
    { label: "Categories", href: "/categories", desc: "Organise product categories" },
    { label: "Promotions", href: "/promotions", desc: "Create promotional banners" },
    { label: "Settings", href: "/settings", desc: "Update store information" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your store&apos;s activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} subLabel={(s as { subLabel?: string }).subLabel} icon={s.icon} />
        ))}
      </div>

      {recentOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Customer</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Total</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{order.billing_first_name} {order.billing_last_name}</p>
                      <p className="text-xs text-gray-500">{order.billing_email}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium">{formatZar(order.total)}</td>
                    <td className="px-6 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
            <p className="font-medium text-gray-900">{link.label}</p>
            <p className="mt-1 text-sm text-gray-500">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
