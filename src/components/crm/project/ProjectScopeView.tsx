"use client";

import { useState } from "react";
import type { ScopeSection } from "@/lib/crm/project-workspace-types";

type Props = {
  sections: ScopeSection[];
  onAddSection: (title: string) => void;
  onAddLine: (sectionId: string, line: string) => void;
};

export default function ProjectScopeView({
  sections,
  onAddSection,
  onAddLine,
}: Props) {
  const [sectionTitle, setSectionTitle] = useState("");
  const [lineBySection, setLineBySection] = useState<Record<string, string>>(
    {}
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            New section title
          </label>
          <input
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            placeholder="e.g. Authentication"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (!sectionTitle.trim()) return;
            onAddSection(sectionTitle);
            setSectionTitle("");
          }}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Add section
        </button>
      </div>

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-text-secondary dark:border-zinc-700">
          No scope sections yet. Add a section to capture scope.
        </p>
      ) : (
        <div className="space-y-4">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="rounded-2xl border border-border bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <h3 className="font-semibold text-text-primary dark:text-zinc-100">
                {sec.title}
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
                {sec.lines.map((line, i) => (
                  <li key={`${sec.id}-${i}`}>{line}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  value={lineBySection[sec.id] ?? ""}
                  onChange={(e) =>
                    setLineBySection((prev) => ({
                      ...prev,
                      [sec.id]: e.target.value,
                    }))
                  }
                  className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  placeholder="Add line"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const v = lineBySection[sec.id]?.trim();
                      if (v) {
                        onAddLine(sec.id, v);
                        setLineBySection((prev) => ({ ...prev, [sec.id]: "" }));
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = lineBySection[sec.id]?.trim();
                    if (v) {
                      onAddLine(sec.id, v);
                      setLineBySection((prev) => ({ ...prev, [sec.id]: "" }));
                    }
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm dark:border-zinc-600"
                >
                  Add line
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
