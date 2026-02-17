"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Variant {
  id: string;
  price: number;
  currency: string;
  inventory_items: { stock_on_hand: number }[];
}

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  product_variants: Variant[];
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const firstVariant = (p: Product) => p.product_variants?.[0];
  const inStock = (p: Product) =>
    (firstVariant(p)?.inventory_items?.[0]?.stock_on_hand ?? 0) > 0;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-indigo-600">
            Trend Store
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Sign in
            </Link>
            <Link href="/admin" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Admin
            </Link>
          </div>
        </nav>
      </header>

      <section className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white py-24 px-4 text-center">
        <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-3">New collection</p>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">Welcome to Trend Store</h1>
        <p className="text-lg text-indigo-200 max-w-xl mx-auto">
          Curated essentials. Clean design. Powered by Supabase.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Featured Products</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No products yet.</p>
            <Link href="/admin" className="mt-3 inline-block text-indigo-600 hover:underline text-sm">
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const v = firstVariant(product);
              return (
                <div key={product.id} className="group flex flex-col rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-52 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.title}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-base font-bold text-gray-900">
                        {v ? fmt(v.price, v.currency) : "—"}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inStock(product) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {inStock(product) ? "In stock" : "Sold out"}
                      </span>
                    </div>
                    <button className="w-full mt-2 bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      Add to cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-10 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Trend Store. Powered by Supabase.
      </footer>
    </div>
  );
}
