"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Users", href: "/users" },
  { label: "Listings", href: "/listings" },
  { label: "Orders", href: "/orders" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside className="w-full border-b bg-white md:h-screen md:w-64 md:border-b-0 md:border-r" style={{ borderColor: "#EEEEEE" }}>
      <div className="px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em]" style={{ color: "#666666" }}>Admin</p>
        <p className="mt-1 text-lg font-semibold" style={{ color: "#111111" }}>Control Panel</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:overflow-visible md:pb-0">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium transition"
              style={{
                color: active ? "#111111" : "#666666",
                backgroundColor: active ? "#FFFFFF" : "transparent",
                border: active ? "1px solid #FF4C3B" : "1px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 pt-6 md:mt-auto">
        <button
          type="button"
          onClick={() => void signOut({ redirectUrl: "/login" })}
          className="w-full rounded-md px-3 py-2 text-sm font-medium transition"
          style={{ border: "1px solid #EEEEEE", color: "#FF4C3B", backgroundColor: "#FFFFFF" }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
