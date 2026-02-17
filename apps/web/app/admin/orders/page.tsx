"use client";

import { useEffect, useState } from "react";

interface Customer {
  name: string | null;
  email: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  customers: Customer | null;
  order_items: { quantity: number }[];
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const statusStyle: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  FULFILLING: "bg-indigo-100 text-indigo-700",
  FULFILLED: "bg-green-100 text-green-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-red-100 text-red-600",
  RETURNED: "bg-gray-100 text-gray-600",
  REFUNDED: "bg-orange-100 text-orange-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-sm text-gray-500 mt-1">{orders.length} total</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">No orders yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Order", "Customer", "Items", "Status", "Total", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {o.customers?.name || o.customers?.email || "Guest"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {o.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{fmt(o.total, o.currency)}</td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
