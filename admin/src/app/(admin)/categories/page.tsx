import { requireAdmin } from "@/lib/auth";
import CategoriesTable from "@/components/Categories/CategoriesTable";

export default async function CategoriesPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">Manage product categories.</p>
      </div>
      <CategoriesTable />
    </div>
  );
}
