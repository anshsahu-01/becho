"use client";

import { useMemo, useState } from "react";
import { DataState } from "@/components/DataState";
import { PageShell } from "@/components/PageShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate } from "@/lib/format";
import { useAdminApiService } from "@/services/api";

export default function ListingsPage() {
  const api = useAdminApiService();
  const { data, loading, error } = useAsyncData(() => api.getListings(), [api]);
  const listings = data ?? [];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return listings.filter((item) => {
      const itemStatus = item.isSold || String(item.status).toUpperCase() === "SOLD" ? "sold" : "active";
      const matchText = !text || item.title?.toLowerCase().includes(text) || item.user?.name?.toLowerCase().includes(text);
      return matchText && (status === "all" || itemStatus === status);
    });
  }, [listings, query, status]);

  return <PageShell title="Listings"><div className="mb-4 grid gap-2 sm:grid-cols-2"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or seller" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="all">All</option><option value="active">Active</option><option value="sold">Sold</option></select></div><DataState loading={loading} error={error} isEmpty={filtered.length === 0} emptyText="No listings found."><div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-2">Product title</th><th className="px-3 py-2">Seller</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Created date</th></tr></thead><tbody>{filtered.map((item) => { const sold = item.isSold || String(item.status).toUpperCase() === "SOLD"; return <tr key={item.id} className="border-t border-slate-100"><td className="px-3 py-2">{item.title}</td><td className="px-3 py-2">{item.user?.name ?? "-"}</td><td className="px-3 py-2">?{Number(item.price ?? 0)}</td><td className="px-3 py-2">{sold ? "Sold" : "Active"}</td><td className="px-3 py-2">{formatDate(item.createdAt)}</td></tr>;})}</tbody></table></div></DataState></PageShell>;
}