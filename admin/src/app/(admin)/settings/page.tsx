import { requireAdmin } from "@/lib/auth";
import SettingsForm from "@/components/Settings/SettingsForm";

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Site Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Update store information and contact details.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SettingsForm />
      </div>
    </div>
  );
}
