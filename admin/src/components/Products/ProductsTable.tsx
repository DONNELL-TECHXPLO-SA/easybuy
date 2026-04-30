"use client";
import { useState, useEffect, useCallback } from "react";
import AdminTable from "@/components/ui/AdminTable";
import AdminModal from "@/components/ui/AdminModal";
import ProductForm, { ProductFormData } from "@/components/Products/ProductForm";
import { formatZar } from "@/lib/formatCurrency";

interface Product {
  id: number; title: string; price: number; discounted_price: number; reviews: number;
  category_id: number | null; is_featured: boolean; is_new_arrival: boolean; is_best_seller: boolean;
  thumbnail_images: string[]; preview_images: string[]; created_at: string;
}

interface Category { id: number; title: string; }

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
    } catch { setError("Failed to load products."); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories ?? [])).catch(() => {});
  }, []);

  const handleCreate = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setModal(null); load();
    } catch { setError("Failed to create product."); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (data: ProductFormData) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setModal(null); load();
    } catch { setError("Failed to update product."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${selected.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setModal(null); load();
    } catch { setError("Failed to delete product."); }
    finally { setSubmitting(false); }
  };

  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { header: "ID", render: (p: Product) => <span className="text-gray-400 font-mono text-xs">{p.id}</span>, className: "w-14" },
    {
      header: "Product",
      render: (p: Product) => (
        <div>
          <p className="font-medium text-gray-900">{p.title}</p>
          <div className="flex gap-1.5 mt-1">
            {p.is_featured && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Featured</span>}
            {p.is_new_arrival && <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">New</span>}
            {p.is_best_seller && <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Best Seller</span>}
          </div>
        </div>
      ),
    },
    { header: "Price", render: (p: Product) => <span>{formatZar(p.price)}</span> },
    { header: "Sale", render: (p: Product) => <span>{p.discounted_price ? formatZar(p.discounted_price) : "—"}</span> },
    { header: "Reviews", render: (p: Product) => <span>{p.reviews}</span> },
    {
      header: "Actions", className: "text-right",
      render: (p: Product) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => { setSelected(p); setModal("edit"); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
          <button onClick={() => { setSelected(p); setModal("delete"); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex justify-between">{error}<button onClick={() => setError("")} className="font-medium">Dismiss</button></div>}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-500">{total} total</span>
        </div>
        <button onClick={() => setModal("create")} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>
      <AdminTable columns={columns} rows={products} loading={loading} keyFn={(p) => p.id} emptyMessage="No products found." />
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
      {modal === "create" && (
        <AdminModal title="Add Product" onClose={() => setModal(null)} size="lg">
          <ProductForm categories={categories} onSubmit={handleCreate} onCancel={() => setModal(null)} submitting={submitting} />
        </AdminModal>
      )}
      {modal === "edit" && selected && (
        <AdminModal title="Edit Product" onClose={() => setModal(null)} size="lg">
          <ProductForm initialData={{ ...selected }} categories={categories} onSubmit={handleEdit} onCancel={() => setModal(null)} submitting={submitting} />
        </AdminModal>
      )}
      {modal === "delete" && selected && (
        <AdminModal title="Delete Product" onClose={() => setModal(null)} footer={
          <><button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">{submitting ? "Deleting..." : "Delete"}</button></>
        }>
          <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{selected.title}</strong>? This cannot be undone.</p>
        </AdminModal>
      )}
    </div>
  );
}
