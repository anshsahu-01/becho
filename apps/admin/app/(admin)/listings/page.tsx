"use client";

import { useMemo, useState } from "react";
import { DataState } from "@/components/DataState";
import { PageShell } from "@/components/PageShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate } from "@/lib/format";
import { useAdminApiService } from "@/services/api";

export default function ListingsPage() {
  const api = useAdminApiService();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, loading, error } = useAsyncData(() => api.getListings(), [api, refreshKey]);
  const listings = data ?? [];

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return listings.filter((item) => {
      const itemStatus = item.isHidden
        ? "hidden"
        : item.isSold || String(item.status).toUpperCase() === "SOLD"
        ? "sold"
        : "active";
      const matchText =
        !text ||
        item.title?.toLowerCase().includes(text) ||
        item.user?.name?.toLowerCase().includes(text);
      return matchText && (status === "all" || itemStatus === status);
    });
  }, [listings, query, status]);

  const handleAction = async (id: string, action: () => Promise<unknown>) => {
    setActionLoading(id);
    try {
      await action();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageShell title="Listings">
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or seller"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      <DataState
        loading={loading}
        error={error}
        isEmpty={filtered.length === 0}
        emptyText="No listings found."
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2">Product title</th>
                <th className="px-3 py-2">Seller</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created date</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const sold = item.isSold || String(item.status).toUpperCase() === "SOLD";
                const hidden = Boolean(item.isHidden) || String(item.status).toUpperCase() === "HIDDEN";

                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{item.title}</td>
                    <td className="px-3 py-2">{item.user?.name ?? "-"}</td>
                    <td className="px-3 py-2">₹{Number(item.price ?? 0)}</td>
                    <td className="px-3 py-2">{hidden ? "Hidden" : sold ? "Sold" : "Active"}</td>
                    <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
                    <td className="px-3 py-2 space-x-2">
                      {!sold && !hidden && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading === item.id}
                            onClick={() => handleAction(item.id, () => api.markListingSold(item.id))}
                            className="rounded bg-emerald-600 px-2 py-1 text-white disabled:opacity-50"
                          >
                            SOLD
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === item.id}
                            onClick={() => handleAction(item.id, () => api.hideListing(item.id))}
                            className="rounded bg-yellow-500 px-2 py-1 text-white disabled:opacity-50"
                          >
                            HIDE
                          </button>
                        </>
                      )}
                      {hidden && (
                        <button
                          type="button"
                          disabled={actionLoading === item.id}
                          onClick={() => handleAction(item.id, () => api.restoreListing(item.id))}
                          className="rounded bg-sky-600 px-2 py-1 text-white disabled:opacity-50"
                        >
                          RESTORE
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actionLoading === item.id}
                        onClick={() => {
                          if (!window.confirm("Delete this listing permanently?")) return;
                          handleAction(item.id, () => api.deleteListing(item.id));
                        }}
                        className="rounded bg-red-600 px-2 py-1 text-white disabled:opacity-50"
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DataState>
    </PageShell>
  );
}