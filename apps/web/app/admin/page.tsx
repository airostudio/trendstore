"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  products: number;
  orders: number;
  customers: number;
  revenue: number;
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

const statCards = (s: Stats) => [
  { label: "Products", value: s.products, href: "/admin/products", color: "bg-indigo-500" },
  { label: "Orders", value: s.orders, href: "/admin/orders", color: "bg-emerald-500" },
  { label: "Customers", value: s.customers, href: "/admin/customers", color: "bg-violet-500" },
  { label: "Revenue", value: fmt(s.revenue), href: "/admin/orders", color: "bg-amber-500" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?all=1").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/customers").then((r) => r.json()),
    ])
      .then(([p, o, c]) => {
        const orders = o.orders ?? [];
        setStats({
          products: (p.products ?? []).length,
          orders: orders.length,
          customers: (c.customers ?? []).length,
          revenue: orders.reduce((sum: number, ord: { total: number }) => sum + (ord.total ?? 0), 0),
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Your store at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-28" />
            ))
          : statCards(stats).map(({ label, value, href, color }) => (
              <Link
                key={label}
                href={href}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow group"
              >
                <div className={`${color} w-10 h-10 rounded-xl flex-shrink-0`} />
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                </div>
              </Link>
            ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Manage products
          </Link>
          <Link href="/admin/orders" className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            View orders
          </Link>
          <Link href="/admin/customers" className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            View customers
          </Link>
          <Link href="/" target="_blank" className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Open store ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
