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
      const itemStatus = item.isHidden ? "hidden" : item.isSold || String(item.status).toUpperCase() === "SOLD" ? "sold" : "active";
      const matchText = !text || item.title?.toLowerCase().includes(text) || item.user?.name?.toLowerCase().includes(text);
      return matchText && (status === "all" || itemStatus === status);
    });
  }, [listings, query, status]);

  const handleAction = async (id: string, action: () => Promise<unknown>) => {
    setActionLoading(id);
    try {
      await action();
      setRefreshKey((prev) => prev + 1);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageShell title="Listings">
      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or seller"
          className="rounded-md border px-3 py-2 text-sm outline-none"
          style={{ borderColor: "#EEEEEE", color: "#111111" }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm outline-none"
          style={{ borderColor: "#EEEEEE", color: "#111111", backgroundColor: "#FFFFFF" }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <DataState loading={loading} error={error} isEmpty={filtered.length === 0} emptyText="No listings found.">
        <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: "#EEEEEE" }}>
          <table className="min-w-full text-left text-sm">
            <thead style={{ color: "#666666" }}>
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Seller</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const sold = item.isSold || String(item.status).toUpperCase() === "SOLD";
                const hidden = Boolean(item.isHidden) || String(item.status).toUpperCase() === "HIDDEN";
                return (
                  <tr key={item.id} className="border-t" style={{ borderColor: "#EEEEEE", color: "#111111" }}>
                    <td className="px-3 py-2">{item.title}</td>
                    <td className="px-3 py-2">{item.user?.name ?? "-"}</td>
                    <td className="px-3 py-2">₹{Number(item.price ?? 0)}</td>
                    <td className="px-3 py-2">{hidden ? "Hidden" : sold ? "Sold" : "Active"}</td>
                    <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {!sold && !hidden ? (
                          <>
                            <button
                              type="button"
                              disabled={actionLoading === item.id}
                              onClick={() => void handleAction(item.id, () => api.markListingSold(item.id))}
                              className="rounded-md px-2 py-1 text-xs"
                              style={{ border: "1px solid #EEEEEE", color: "#111111", backgroundColor: "#FFFFFF" }}
                            >
                              Sold
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading === item.id}
                              onClick={() => void handleAction(item.id, () => api.hideListing(item.id))}
                              className="rounded-md px-2 py-1 text-xs"
                              style={{ border: "1px solid #EEEEEE", color: "#111111", backgroundColor: "#FFFFFF" }}
                            >
                              Hide
                            </button>
                          </>
                        ) : null}
                        {hidden ? (
                          <button
                            type="button"
                            disabled={actionLoading === item.id}
                            onClick={() => void handleAction(item.id, () => api.restoreListing(item.id))}
                            className="rounded-md px-2 py-1 text-xs"
                            style={{ border: "1px solid #EEEEEE", color: "#111111", backgroundColor: "#FFFFFF" }}
                          >
                            Restore
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={actionLoading === item.id}
                          onClick={() => {
                            if (!window.confirm("Delete this listing permanently?")) return;
                            void handleAction(item.id, () => api.deleteListing(item.id));
                          }}
                          className="rounded-md px-2 py-1 text-xs"
                          style={{ border: "1px solid #FF4C3B", color: "#FF4C3B", backgroundColor: "#FFFFFF" }}
                        >
                          Delete
                        </button>
                      </div>
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
