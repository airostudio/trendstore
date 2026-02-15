"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  variants: Array<{
    id: string;
    price: number;
    currency: string;
    inventory: {
      stockOnHand: number;
    };
  }>;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Trend Store
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/admin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <div className="bg-indigo-700">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                Welcome to Trend Store
              </h1>
              <p className="mt-4 max-w-xl mx-auto text-xl text-indigo-200">
                Modern commerce powered by the latest technology
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Featured Products
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600">No products available yet.</div>
              <Link
                href="/admin"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
              >
                Add your first product in the admin panel
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                    <div className="h-48 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-medium text-gray-900">
                      {product.variants[0] &&
                        formatPrice(
                          product.variants[0].price,
                          product.variants[0].currency
                        )}
                    </p>
                    {product.variants[0]?.inventory && (
                      <p className="text-sm text-gray-500">
                        {product.variants[0].inventory.stockOnHand > 0
                          ? "In stock"
                          : "Out of stock"}
                      </p>
                    )}
                  </div>
                  <button className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-50 mt-24">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; 2024 Trend Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
