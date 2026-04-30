import { requireAdmin } from "@/lib/auth";
import PromotionsTable from "@/components/Promotions/PromotionsTable";

export default async function PromotionsPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Promotions</h1>
        <p className="mt-1 text-sm text-gray-500">Create and manage promotional banners.</p>
      </div>
      <PromotionsTable />
    </div>
  );
}
