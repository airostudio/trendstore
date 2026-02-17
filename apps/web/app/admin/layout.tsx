"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/admin" className="text-lg font-bold text-indigo-600">Trend Store</Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate mb-3">{session.user.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-full text-xs font-medium text-gray-600 hover:text-red-600 transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-sm font-semibold text-gray-700">
            {navLinks.find((l) => l.href === pathname)?.label ?? "Admin"}
          </h1>
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
