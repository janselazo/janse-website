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
  /** Trigger label: Mar 25, 2026 vs 03/25/2026 */
  displayFormat?: "medium" | "numeric";
};

export default function CrmPopoverDateField({
  id,
  value,
  onChange,
  triggerClassName,
  displayFormat = "medium",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseIso(value);
  const display = selected
    ? displayFormat === "numeric"
      ? new Intl.DateTimeFormat("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }).format(selected)
      : new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(selected)
    : null;
  const placeholder =
    displayFormat === "numeric" ? "mm/dd/yyyy" : "mm / dd / yyyy";

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
          {display ?? placeholder}
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
          className="absolute left-0 top-full z-[110] mt-2 overflow-hidden rounded-xl border-2 border-zinc-200 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
          role="dialog"
          aria-label="Choose date"
        >
          <div className="p-3 pb-2">
            <DayPicker
              mode="single"
              selected={selected}
              showOutsideDays
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
              modifiersClassNames={{
                today:
                  "rounded-md font-medium shadow-[inset_0_0_0_2px_rgb(24,24,27)] dark:shadow-[inset_0_0_0_2px_rgb(228,228,231)]",
                selected:
                  "!bg-blue-600 !text-white hover:!bg-blue-600 focus:!bg-blue-600 rounded-md font-semibold !shadow-none",
                outside: "text-zinc-400 opacity-55 dark:text-zinc-500",
              }}
              style={
                {
                  "--rdp-accent-color": "#2563eb",
                  "--rdp-accent-background-color": "rgba(37, 99, 235, 0.14)",
                  "--rdp-day_button-height": "2.35rem",
                  "--rdp-day_button-width": "2.35rem",
                  "--rdp-nav-height": "2.5rem",
                } as CSSProperties
              }
            />
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
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
