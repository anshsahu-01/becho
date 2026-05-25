"use client";

import { useClerk } from "@clerk/nextjs";

export function Topbar() {
  const { signOut } = useClerk();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6" style={{ borderColor: "#EEEEEE" }}>
      <div>
        <h1 className="text-sm font-semibold" style={{ color: "#111111" }}>Admin Dashboard</h1>
        <p className="text-xs" style={{ color: "#666666" }}>Operations Overview</p>
      </div>
      <button
        type="button"
        onClick={() => void signOut({ redirectUrl: "/login" })}
        className="rounded-md px-3 py-2 text-xs font-medium md:hidden"
        style={{ border: "1px solid #EEEEEE", color: "#FF4C3B", backgroundColor: "#FFFFFF" }}
      >
        Logout
      </button>
    </header>
  );
}
