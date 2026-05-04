"use client";
import { useState } from "react";
import toast from "react-hot-toast";

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
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<"thumbnail" | "preview" | null>(null);

  const set = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const uploadImages = async (files: FileList, type: "thumbnail" | "preview") => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadingType(type);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          console.error("Upload error:", response.statusText);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      if (uploadedUrls.length > 0) {
        const key = type === "thumbnail" ? "thumbnail_images" : "preview_images";
        set(key, [...form[key], ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const removeImage = (type: "thumbnail" | "preview", index: number) => {
    const key = type === "thumbnail" ? "thumbnail_images" : "preview_images";
    const updated = form[key].filter((_, i) => i !== index);
    set(key, updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
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

      {/* Thumbnail Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={(e) => uploadImages(e.target.files!, "thumbnail")}
            disabled={uploading}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-2">Select multiple image files (JPG, PNG, WebP, GIF)</p>
          {uploadingType === "thumbnail" && uploading && (
            <p className="text-xs text-blue-600 mt-2">Uploading...</p>
          )}
        </div>

        {form.thumbnail_images.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-2">Uploaded images ({form.thumbnail_images.length}):</p>
            <div className="grid grid-cols-4 gap-3">
              {form.thumbnail_images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Thumbnail ${idx}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeImage("thumbnail", idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preview Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={(e) => uploadImages(e.target.files!, "preview")}
            disabled={uploading}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-2">Select multiple image files (JPG, PNG, WebP, GIF)</p>
          {uploadingType === "preview" && uploading && (
            <p className="text-xs text-blue-600 mt-2">Uploading...</p>
          )}
        </div>

        {form.preview_images.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-2">Uploaded images ({form.preview_images.length}):</p>
            <div className="grid grid-cols-4 gap-3">
              {form.preview_images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeImage("preview", idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" disabled={submitting || uploading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {submitting ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
