interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  icon: React.ReactNode;
}

export default function StatCard({ label, value, subLabel, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {subLabel && <p className="mt-0.5 text-xs text-gray-400">{subLabel}</p>}
      </div>
    </div>
  );
}
