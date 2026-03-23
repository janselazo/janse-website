"use client";

import { useState } from "react";
import type { RequestStatus, WorkspaceRequest } from "@/lib/crm/project-workspace-types";

const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "New",
  in_review: "In review",
  done: "Done",
};

type Props = {
  requests: WorkspaceRequest[];
  onAdd: (title: string, description: string) => void;
  onUpdateStatus: (id: string, status: RequestStatus) => void;
};

export default function ProjectRequestsView({
  requests,
  onAdd,
  onUpdateStatus,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary dark:text-zinc-100">
          Requests
        </h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          {open ? "Cancel" : "+ Add request"}
        </button>
      </div>

      {open ? (
        <form
          className="rounded-2xl border border-border bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onAdd(title, description);
            setTitle("");
            setDescription("");
            setOpen(false);
          }}
        >
          <div className="space-y-3">
            <div>
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
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Save
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border dark:border-zinc-700">
              <th className="px-4 py-3 font-semibold text-text-secondary">
                Title
              </th>
              <th className="px-4 py-3 font-semibold text-text-secondary">
                Description
              </th>
              <th className="px-4 py-3 font-semibold text-text-secondary">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-text-secondary">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-zinc-700">
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-text-secondary"
                >
                  No requests yet.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-text-primary dark:text-zinc-100">
                    {r.title}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-text-secondary">
                    {r.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        onUpdateStatus(r.id, e.target.value as RequestStatus)
                      }
                      className="rounded-lg border border-border px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800"
                    >
                      {(Object.keys(STATUS_LABEL) as RequestStatus[]).map(
                        (s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
