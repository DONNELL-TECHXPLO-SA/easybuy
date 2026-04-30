"use client";
import { useState, useEffect, useCallback } from "react";
import AdminTable from "@/components/ui/AdminTable";
import AdminModal from "@/components/ui/AdminModal";

interface Category { id: number; title: string; img: string; sort_order: number; }
const emptyForm = { title: "", img: "", sort_order: 0 };

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch { setError("Failed to load categories."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setModal(null); load();
    } catch { setError("Failed to create category."); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected) return; setSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setModal(null); load();
    } catch { setError("Failed to update category."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selected) return; setSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${selected.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setModal(null); load();
    } catch { setError("Failed to delete category."); }
    finally { setSubmitting(false); }
  };

  const FormFields = (
    <div className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
        <input type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
    </div>
  );

  const columns = [
    { header: "ID", render: (c: Category) => <span className="font-mono text-xs text-gray-400">{c.id}</span>, className: "w-14" },
    { header: "Name", render: (c: Category) => <span className="font-medium text-gray-900">{c.title}</span> },
    { header: "Sort", render: (c: Category) => <span>{c.sort_order}</span> },
    { header: "Actions", className: "text-right", render: (c: Category) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => { setSelected(c); setForm({ title: c.title, img: c.img, sort_order: c.sort_order }); setModal("edit"); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
        <button onClick={() => { setSelected(c); setModal("delete"); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex justify-between">{error}<button onClick={() => setError("")} className="font-medium">Dismiss</button></div>}
      <div className="flex justify-end mb-5">
        <button onClick={() => { setForm(emptyForm); setModal("create"); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Category
        </button>
      </div>
      <AdminTable columns={columns} rows={categories} loading={loading} keyFn={(c) => c.id} emptyMessage="No categories found." />
      {(modal === "create" || modal === "edit") && (
        <AdminModal title={modal === "create" ? "Add Category" : "Edit Category"} onClose={() => setModal(null)} footer={
          <><button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" form="cat-form" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? "Saving..." : "Save"}</button></>
        }>
          <form id="cat-form" onSubmit={modal === "create" ? handleCreate : handleEdit}>{FormFields}</form>
        </AdminModal>
      )}
      {modal === "delete" && selected && (
        <AdminModal title="Delete Category" onClose={() => setModal(null)} footer={
          <><button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">{submitting ? "Deleting..." : "Delete"}</button></>
        }>
          <p className="text-sm text-gray-600">Delete <strong>{selected.title}</strong>? Products will lose their category association.</p>
        </AdminModal>
      )}
    </div>
  );
}
