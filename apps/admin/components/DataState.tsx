"use client";

type Props = {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyText: string;
  children: React.ReactNode;
};

export function DataState({ loading, error, isEmpty, emptyText, children }: Props) {
  if (loading) return <div className="rounded-lg border bg-white p-4 text-sm" style={{ borderColor: "#EEEEEE", color: "#666666" }}>Loading...</div>;
  if (error) return <div className="rounded-lg border bg-white p-4 text-sm" style={{ borderColor: "#FF4C3B", color: "#FF4C3B" }}>{error}</div>;
  if (isEmpty) return <div className="rounded-lg border bg-white p-6 text-sm" style={{ borderColor: "#EEEEEE", color: "#666666" }}>{emptyText}</div>;
  return <>{children}</>;
}
