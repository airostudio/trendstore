"use client";

import { useEffect, useState } from "react";

interface Variant {
  id: string;
  sku: string | null;
  price: number;
  currency: string;
  inventory_items: { stock_on_hand: number }[];
}

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  created_at: string;
  product_variants: Variant[];
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

const statusStyle: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-red-100 text-red-600",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/products?all=1")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleStatus = async (p: Product) => {
    setPublishing(p.id);
    const next = p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setPublishing(null);
    load();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">{products.length} total</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading…</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">No products yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Title", "Handle", "Status", "Price", "Stock", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const v = p.product_variants?.[0];
                const stock = v?.inventory_items?.[0]?.stock_on_hand ?? 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.handle}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {v ? fmt(v.price, v.currency) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${stock > 0 ? "text-green-600" : "text-red-500"}`}>
                        {stock > 0 ? `${stock} units` : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => toggleStatus(p)}
                        disabled={publishing === p.id}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                      >
                        {publishing === p.id ? "…" : p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        disabled={deleting === p.id}
                        className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deleting === p.id ? "…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
