"use client";

type Props = {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyText: string;
  children: React.ReactNode;
};

export function DataState({ loading, error, isEmpty, emptyText, children }: Props) {
  if (loading) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading...</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (isEmpty) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">{emptyText}</div>;
  return <>{children}</>;
}