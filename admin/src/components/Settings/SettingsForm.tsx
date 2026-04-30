"use client";
import { useState, useEffect } from "react";

interface Settings { store_name: string; support_phone: string; support_email: string; store_address: string; }
const emptySettings: Settings = { store_name: "", support_phone: "", support_email: "", store_address: "" };

export default function SettingsForm() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => { if (d.settings) setSettings(d.settings); })
      .catch(() => setError("Failed to load settings.")).finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof Settings>(k: K, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error();
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch { setError("Failed to save settings."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3,4].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">Settings saved successfully.</div>}
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
        <input required value={settings.store_name} onChange={(e) => set("store_name", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
        <input value={settings.support_phone} onChange={(e) => set("support_phone", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
        <input type="email" value={settings.support_email} onChange={(e) => set("support_email", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
        <textarea rows={3} value={settings.store_address} onChange={(e) => set("store_address", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div className="pt-2">
        <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
}