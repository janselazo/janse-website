"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { DayPicker } from "react-day-picker";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import "react-day-picker/style.css";

function parseIso(iso: string): Date | undefined {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  /** Full trigger button classes (include `relative`, height, border, etc.) */
  triggerClassName: string;
};

export default function CrmPopoverDateField({
  id,
  value,
  onChange,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseIso(value);
  const display = selected
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(selected)
    : null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        <CalendarIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/55"
          aria-hidden
        />
        <span
          className={`block w-full pl-10 pr-10 text-left text-sm tabular-nums ${
            display ? "text-text-primary" : "text-text-secondary/50"
          }`}
        >
          {display ?? "mm / dd / yyyy"}
        </span>
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/55 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-[110] mt-2 overflow-hidden rounded-2xl border border-border bg-white shadow-xl dark:border-zinc-600 dark:bg-zinc-900"
          role="dialog"
          aria-label="Choose date"
        >
          <div className="p-3 pb-1">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => {
                if (d) {
                  onChange(toIso(d));
                  setOpen(false);
                }
              }}
              defaultMonth={selected ?? new Date()}
              captionLayout="dropdown"
              startMonth={new Date(2000, 0)}
              endMonth={new Date(2040, 11)}
              className="crm-rdp text-text-primary dark:text-zinc-100"
              style={
                {
                  "--rdp-accent-color": "#2563eb",
                  "--rdp-accent-background-color": "rgba(37, 99, 235, 0.12)",
                  "--rdp-day_button-height": "2.25rem",
                  "--rdp-day_button-width": "2.25rem",
                  "--rdp-nav-height": "2.5rem",
                } as CSSProperties
              }
            />
          </div>
          <div className="flex items-center justify-between border-t border-border px-3 py-2.5 dark:border-zinc-700">
            <button
              type="button"
              className="text-sm font-medium text-accent hover:underline dark:text-blue-400"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-sm font-medium text-accent hover:underline dark:text-blue-400"
              onClick={() => {
                onChange(toIso(new Date()));
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
