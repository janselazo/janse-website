"use client";

import { useState } from "react";
import type { WorkspaceMeeting } from "@/lib/crm/project-workspace-types";

type Props = {
  meetings: WorkspaceMeeting[];
  onAdd: (input: Omit<WorkspaceMeeting, "id">) => void;
};

export default function ProjectMeetingsView({ meetings, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");

  const sorted = [...meetings].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary dark:text-zinc-100">
          Meetings
        </h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          {open ? "Cancel" : "+ Add meeting"}
        </button>
      </div>

      {open ? (
        <form
          className="rounded-2xl border border-border bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !startsAt) return;
            onAdd({
              title: title.trim(),
              startsAt: new Date(startsAt).toISOString(),
              link: link.trim() || undefined,
              notes: notes.trim() || undefined,
            });
            setTitle("");
            setStartsAt("");
            setLink("");
            setNotes("");
            setOpen(false);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                Start (local)
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                Link (Zoom, Meet, etc.)
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                placeholder="https://"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Save meeting
          </button>
        </form>
      ) : null}

      <ul className="space-y-2">
        {sorted.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-text-secondary dark:border-zinc-700">
            No meetings scheduled.
          </li>
        ) : (
          sorted.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div>
                <p className="font-medium text-text-primary dark:text-zinc-100">
                  {m.title}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {new Date(m.startsAt).toLocaleString()}
                </p>
                {m.notes ? (
                  <p className="mt-2 text-sm text-text-secondary">{m.notes}</p>
                ) : null}
              </div>
              {m.link ? (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Join link
                </a>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
