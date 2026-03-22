import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: boolean;
}

export default function KpiCard({ label, value, icon, accent }: KpiCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-white p-5 shadow-sm ${
        accent ? "ring-1 ring-accent/20" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {label}
          </p>
          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${
              accent ? "text-accent" : "text-text-primary"
            }`}
          >
            {value}
          </p>
        </div>
        {icon && (
          <span className="text-text-secondary/50">{icon}</span>
        )}
      </div>
    </div>
  );
}
