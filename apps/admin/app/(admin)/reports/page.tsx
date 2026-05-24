"use client";

import { PageShell } from "@/components/PageShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAdminApiService } from "@/services/api";

export default function ReportsPage() {
  const api = useAdminApiService();
  const users = useAsyncData(() => api.getUsers(), [api]);
  const listings = useAsyncData(() => api.getListings(), [api]);
  const orders = useAsyncData(() => api.getOrders(), [api]);
  const loading = users.loading || listings.loading || orders.loading;
  const error = users.error || listings.error || orders.error;

  return (
    <PageShell title="Reports">
      {loading ? <p className="text-sm text-slate-600">Loading report summary...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {!loading && !error ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">New users</p><p className="mt-1 text-xl font-semibold">{users.data?.length ?? 0}</p></div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">New listings</p><p className="mt-1 text-xl font-semibold">{listings.data?.length ?? 0}</p></div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Orders</p><p className="mt-1 text-xl font-semibold">{orders.data?.length ?? 0}</p></div>
        </div>
      ) : null}
    </PageShell>
  );
}