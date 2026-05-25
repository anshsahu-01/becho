"use client";

import { PageShell } from "@/components/PageShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAdminApiService } from "@/services/api";

export default function DashboardPage() {
  const api = useAdminApiService();
  const { data, loading, error } = useAsyncData(() => api.getDashboardStats(), [api]);

  return (
    <PageShell title="Dashboard">
      {loading ? <p className="text-sm" style={{ color: "#666666" }}>Loading dashboard stats...</p> : null}
      {error ? <p className="text-sm" style={{ color: "#FF4C3B" }}>{error}</p> : null}
      {!loading && !error && data ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total Users", value: data.totalUsers },
            { label: "Total Listings", value: data.totalListings },
            { label: "Total Orders", value: data.totalOrders },
            { label: "Active Listings", value: data.activeListings },
            { label: "Sold Listings", value: data.soldListings },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border bg-white p-4" style={{ borderColor: "#EEEEEE" }}>
              <p className="text-xs" style={{ color: "#666666" }}>{card.label}</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "#111111" }}>{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
