import { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children?: ReactNode;
};

export function PageShell({ title, children }: PageShellProps) {
  return (
    <section className="rounded-xl border bg-white p-4 md:p-6" style={{ borderColor: "#EEEEEE" }}>
      <h2 className="mb-1 text-xl font-semibold" style={{ color: "#111111" }}>{title}</h2>
      <p className="mb-5 text-sm" style={{ color: "#666666" }}>
        Manage {title.toLowerCase()} with clear operational visibility.
      </p>
      {children}
    </section>
  );
}
