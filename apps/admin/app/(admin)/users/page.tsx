"use client";

import { useMemo, useState } from "react";
import { DataState } from "@/components/DataState";
import { PageShell } from "@/components/PageShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate } from "@/lib/format";
import { useAdminApiService } from "@/services/api";

export default function UsersPage() {
  const api = useAdminApiService();
  const { data, loading, error } = useAsyncData(() => api.getUsers(), [api]);
  const users = data ?? [];
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(text) || u.email?.toLowerCase().includes(text));
  }, [users, query]);

  return <PageShell title="Users"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /><DataState loading={loading} error={error} isEmpty={filtered.length === 0} emptyText="No users found."><div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">College</th><th className="px-3 py-2">Joined date</th><th className="px-3 py-2">Listings count</th><th className="px-3 py-2">Orders count</th></tr></thead><tbody>{filtered.map((u) => <tr key={u.id} className="border-t border-slate-100"><td className="px-3 py-2">{u.name ?? "-"}</td><td className="px-3 py-2">{u.email ?? "-"}</td><td className="px-3 py-2">{u.collegeName ?? "-"}</td><td className="px-3 py-2">{formatDate(u.createdAt)}</td><td className="px-3 py-2">{u.products?.length ?? 0}</td><td className="px-3 py-2">{(u.ordersAsBuyer?.length ?? 0) + (u.ordersAsSeller?.length ?? 0)}</td></tr>)}</tbody></table></div></DataState></PageShell>;
}