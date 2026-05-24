"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

export default function DebugPage() {
  const { data, loading, error } = useAsyncData(async () => {
    const res = await fetch("https://just-sell.onrender.com", { cache: "no-store" });
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 2000) };
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-3 text-lg font-semibold">Debug Reachability</h1>
      {loading ? <p>Loading...</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}
      {data ? <pre className="whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-3 text-xs">{JSON.stringify(data, null, 2)}</pre> : null}
    </div>
  );
}