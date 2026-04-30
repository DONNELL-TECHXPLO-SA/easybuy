"use client";
import { useState } from "react";

export interface ProductFormData {
  title: string;
  price: number;
  discounted_price: number;
  reviews: number;
  category_id: number | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  thumbnail_images: string[];
  preview_images: string[];
}

interface Category { id: number; title: string; }

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const emptyForm: ProductFormData = {
  title: "", price: 0, discounted_price: 0, reviews: 0, category_id: null,
  is_featured: false, is_new_arrival: false, is_best_seller: false,
  thumbnail_images: [], preview_images: [],
};

export default function ProductForm({ initialData, categories, onSubmit, onCancel, submitting }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm, ...initialData });
  const [thumbnailText, setThumbnailText] = useState((initialData?.thumbnail_images ?? []).join("\n"));
  const [previewText, setPreviewText] = useState((initialData?.preview_images ?? []).join("\n"));

  const set = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      thumbnail_images: thumbnailText.split("\n").map((s) => s.trim()).filter(Boolean),
      preview_images: previewText.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input required value={form.title} onChange={(e) => set("title", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (ZAR) *</label>
          <input required type="number" min={0} step={0.01} value={form.price} onChange={(e) => set("price", Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (ZAR)</label>
          <input type="number" min={0} step={0.01} value={form.discounted_price} onChange={(e) => set("discounted_price", Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={form.category_id ?? ""} onChange={(e) => set("category_id", e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Review Count</label>
          <input type="number" min={0} value={form.reviews} onChange={(e) => set("reviews", Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex gap-6">
        {(["is_featured", "is_new_arrival", "is_best_seller"] as const).map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="rounded border-gray-300" />
            {key === "is_featured" ? "Featured" : key === "is_new_arrival" ? "New Arrival" : "Best Seller"}
          </label>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URLs (one per line)</label>
        <textarea rows={3} value={thumbnailText} onChange={(e) => setThumbnailText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preview Image URLs (one per line)</label>
        <textarea rows={3} value={previewText} onChange={(e) => setPreviewText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {submitting ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
