"use client";
import { useState, useEffect, useCallback } from "react";
import AdminTable from "@/components/ui/AdminTable";
import AdminModal from "@/components/ui/AdminModal";

interface Promotion { id: number; title: string; subtitle: string; discount_label: string; description: string; image_url: string; button_text: string; button_link: string; is_active: boolean; sort_order: number; }
const emptyForm = { title: "", subtitle: "", discount_label: "", description: "", image_url: "", button_text: "Shop Now", button_link: "/", is_active: false, sort_order: 0 };

export default function PromotionsTable() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Promotion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promotions");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPromotions(data.promotions ?? []);
    } catch { setError("Failed to load promotions."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: number, updates: Partial<Promotion>) => {
    const res = await fetch(`/api/promotions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    if (!res.ok) throw new Error();
  };

  const set = <K extends keyof typeof emptyForm>(k: K, v: typeof emptyForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleToggleActive = async (p: Promotion) => {
    try { await patch(p.id, { is_active: !p.is_active }); load(); }
    catch { setError("Failed to update promotion."); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setModal(null); load();
    } catch { setError("Failed to create promotion."); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected) return; setSubmitting(true);
    try { await patch(selected.id, form); setModal(null); load(); }
    catch { setError("Failed to update promotion."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selected) return; setSubmitting(true);
    try {
      const res = await fetch(`/api/promotions/${selected.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setModal(null); load();
    } catch { setError("Failed to delete promotion."); }
    finally { setSubmitting(false); }
  };

  const FormFields = (
    <div className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input required value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount Label</label>
          <input value={form.discount_label} onChange={(e) => set("discount_label", e.target.value)} placeholder="20% OFF" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
          <input value={form.button_text} onChange={(e) => set("button_text", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
          <input value={form.button_link} onChange={(e) => set("button_link", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input type="number" min={0} value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-5">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="rounded border-gray-300" />Active
        </label>
      </div>
    </div>
  );

  const columns = [
    { header: "Title", render: (p: Promotion) => <span className="font-medium text-gray-900">{p.title}</span> },
    { header: "Discount", render: (p: Promotion) => <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{p.discount_label || "—"}</span> },
    { header: "Sort", render: (p: Promotion) => <span>{p.sort_order}</span> },
    { header: "Active", render: (p: Promotion) => (
      <button onClick={() => handleToggleActive(p)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${p.is_active ? "bg-green-500" : "bg-gray-200"}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${p.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    )},
    { header: "Actions", className: "text-right", render: (p: Promotion) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => { setSelected(p); setForm({ title: p.title, subtitle: p.subtitle, discount_label: p.discount_label, description: p.description, image_url: p.image_url, button_text: p.button_text, button_link: p.button_link, is_active: p.is_active, sort_order: p.sort_order }); setModal("edit"); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
        <button onClick={() => { setSelected(p); setModal("delete"); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex justify-between">{error}<button onClick={() => setError("")} className="font-medium">Dismiss</button></div>}
      <div className="flex justify-end mb-5">
        <button onClick={() => { setForm(emptyForm); setModal("create"); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Promotion
        </button>
      </div>
      <AdminTable columns={columns} rows={promotions} loading={loading} keyFn={(p) => p.id} emptyMessage="No promotions yet." />
      {(modal === "create" || modal === "edit") && (
        <AdminModal title={modal === "create" ? "Add Promotion" : "Edit Promotion"} onClose={() => setModal(null)} size="lg" footer={
          <><button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" form="promo-form" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? "Saving..." : "Save"}</button></>
        }>
          <form id="promo-form" onSubmit={modal === "create" ? handleCreate : handleEdit}>{FormFields}</form>
        </AdminModal>
      )}
      {modal === "delete" && selected && (
        <AdminModal title="Delete Promotion" onClose={() => setModal(null)} footer={
          <><button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">{submitting ? "Deleting..." : "Delete"}</button></>
        }>
          <p className="text-sm text-gray-600">Delete promotion <strong>{selected.title}</strong>?</p>
        </AdminModal>
      )}
    </div>
  );
}
