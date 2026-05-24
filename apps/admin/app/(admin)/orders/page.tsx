"use client";

import { DataState } from "@/components/DataState";
import { PageShell } from "@/components/PageShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate } from "@/lib/format";
import { useAdminApiService } from "@/services/api";

export default function OrdersPage() {
  const api = useAdminApiService();
  const { data, loading, error } = useAsyncData(() => api.getOrders(), [api]);
  const orders = data ?? [];

  return <PageShell title="Orders"><DataState loading={loading} error={error} isEmpty={orders.length === 0} emptyText="No orders found."><div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-2">Order ID</th><th className="px-3 py-2">Product</th><th className="px-3 py-2">Buyer</th><th className="px-3 py-2">Seller</th><th className="px-3 py-2">Payment status</th><th className="px-3 py-2">Created at</th></tr></thead><tbody>{orders.map((o) => <tr key={o.id} className="border-t border-slate-100"><td className="px-3 py-2">{o.id}</td><td className="px-3 py-2">{o.product?.title ?? "-"}</td><td className="px-3 py-2">{o.buyer?.name ?? "-"}</td><td className="px-3 py-2">{o.seller?.name ?? "-"}</td><td className="px-3 py-2">{o.paymentStatus ?? "-"}</td><td className="px-3 py-2">{formatDate(o.createdAt)}</td></tr>)}</tbody></table></div></DataState></PageShell>;
}