"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    void signOut({ redirectUrl: "/unauthorized" });
  }, [signOut]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-600">This account is not allowed to access the admin dashboard.</p>
      </div>
    </div>
  );
}