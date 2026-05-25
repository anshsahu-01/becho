"use client";

import { DataState } from "@/components/DataState";
import { PageShell } from "@/components/PageShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAdminApiService } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

export default function OrdersPage() {
  const api = useAdminApiService();
  const { data, loading, error } = useAsyncData(() => api.getOrders(), [api]);
  const [orders, setOrders] = useState(data ?? []);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setOrders(data ?? []);
  }, [data]);

  const filtered = useMemo(() => {
    return (orders ?? []).filter((o) => {
      const status = (o.paymentStatus ?? "").toString();
      if (filter === "pending") return status.includes("pending");
      if (filter === "approved") return status.includes("confirmed");
      return status.includes("cancelled");
    });
  }, [orders, filter]);

  const handleApprove = async (id: string) => {
    await api.approveOrder(id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: "confirmed" } : o)));
  };

  const handleReject = async (id: string) => {
    await api.rejectOrder(id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: "cancelled" } : o)));
  };

  return (
    <PageShell title="Orders">
      <DataState loading={loading} error={error} isEmpty={filtered.length === 0} emptyText="No orders found.">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: "pending", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className="rounded-md px-3 py-2 text-sm font-medium"
              style={{
                border: `1px solid ${filter === tab.key ? "#FF4C3B" : "#EEEEEE"}`,
                color: filter === tab.key ? "#111111" : "#666666",
                backgroundColor: "#FFFFFF",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((o) => (
            <article key={o.id} className="rounded-lg border bg-white p-3" style={{ borderColor: "#EEEEEE" }}>
              <div className="flex gap-3">
                {o.product?.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.product.images[0]} alt={o.product?.title ?? "product"} className="h-14 w-14 rounded-md object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-md" style={{ border: "1px solid #EEEEEE" }} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: "#111111" }}>{o.product?.title ?? "-"}</p>
                  <p className="text-xs" style={{ color: "#666666" }}>Buyer: {o.buyer?.name ?? "-"}</p>
                  <p className="text-xs" style={{ color: "#666666" }}>Phone: {o.mobileNumber ?? "-"}</p>
                </div>
                <span
                  className="h-fit rounded-md px-2 py-1 text-xs font-medium"
                  style={{ border: "1px solid #EEEEEE", color: "#111111", backgroundColor: "#FFFFFF" }}
                >
                  {o.paymentStatus}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs" style={{ color: "#666666" }}>
                <p className="truncate">Pickup: {o.locationDetails ?? "-"}</p>
                <p className="truncate">UTR: {o.utrNumber ?? "-"}</p>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div>
                  {o.paymentScreenshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.paymentScreenshot}
                      alt="proof"
                      className="h-12 w-16 cursor-pointer rounded-md object-cover"
                      onClick={() => setPreviewUrl(o.paymentScreenshot ?? null)}
                    />
                  ) : (
                    <div className="rounded-md border px-2 py-1 text-xs" style={{ borderColor: "#EEEEEE", color: "#666666" }}>
                      No screenshot
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(o.id)}
                    className="rounded-md px-3 py-1.5 text-xs font-medium"
                    style={{ border: "1px solid #EEEEEE", color: "#111111", backgroundColor: "#FFFFFF" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(o.id)}
                    className="rounded-md px-3 py-1.5 text-xs font-medium"
                    style={{ border: "1px solid #FF4C3B", color: "#FF4C3B", backgroundColor: "#FFFFFF" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {previewUrl ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(17,17,17,0.75)" }} onClick={() => setPreviewUrl(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="proof preview" className="max-h-[85vh] max-w-[95vw] rounded-md border bg-white" style={{ borderColor: "#EEEEEE" }} />
          </div>
        ) : null}
      </DataState>
    </PageShell>
  );
}
