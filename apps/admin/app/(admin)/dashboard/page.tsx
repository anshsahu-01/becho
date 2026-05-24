"use client";

import { PageShell } from "@/components/PageShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAdminApiService } from "@/services/api";

export default function DashboardPage() {
  const api = useAdminApiService();
  const { data, loading, error } = useAsyncData(() => api.getDashboardStats(), [api]);

  return (
    <PageShell title="Dashboard">
      {loading ? <p className="text-sm text-slate-600">Loading dashboard stats...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {!loading && !error && data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[{ label: "Total Users", value: data.totalUsers }, { label: "Total Listings", value: data.totalListings }, { label: "Total Orders", value: data.totalOrders }, { label: "Active Listings", value: data.activeListings }, { label: "Sold Listings", value: data.soldListings }].map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{card.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}