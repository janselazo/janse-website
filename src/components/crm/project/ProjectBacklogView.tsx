"use client";

import { useState } from "react";
import {
  TASK_STATUS_LABELS,
  type TaskStatus,
} from "@/lib/crm/mock-data";
import { readStoredTeamMembers } from "@/lib/crm/team-members-storage";
import type { WorkspaceSprint, WorkspaceTask } from "@/lib/crm/project-workspace-types";

const STATUSES: TaskStatus[] = [
  "not_started",
  "action_started",
  "in_progress",
  "test_qa",
  "completed",
];

type Props = {
  tasks: WorkspaceTask[];
  sprints: WorkspaceSprint[];
  onAddTask: (input: {
    title: string;
    status: TaskStatus;
    sprintId: string | null;
    assigneeId?: string | null;
  }) => void;
  onUpdateTask: (id: string, patch: Partial<WorkspaceTask>) => void;
};

export default function ProjectBacklogView({
  tasks,
  sprints,
  onAddTask,
  onUpdateTask,
}: Props) {
  const backlog = tasks.filter((t) => t.sprintId == null);
  const members = readStoredTeamMembers();
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text-primary dark:text-zinc-100">
          Backlog
        </h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          {open ? "Cancel" : "+ Add task"}
        </button>
      </div>

      {open ? (
        <form
          className="rounded-2xl border border-border bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onAddTask({
              title: title.trim(),
              status: "not_started",
              sprintId: null,
            });
            setTitle("");
            setOpen(false);
          }}
        >
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            placeholder="Task title"
          />
          <button
            type="submit"
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Add to backlog
          </button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border dark:border-zinc-700">
              <th className="px-4 py-3 font-semibold text-text-secondary">
                Task
              </th>
              <th className="px-4 py-3 font-semibold text-text-secondary">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-text-secondary">
                Assignee
              </th>
              <th className="px-4 py-3 font-semibold text-text-secondary">
                Sprint
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-zinc-700">
            {backlog.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-text-secondary"
                >
                  No backlog items. Add a task or move work here from a sprint.
                </td>
              </tr>
            ) : (
              backlog.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium text-text-primary dark:text-zinc-100">
                    {t.title}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      onChange={(e) =>
                        onUpdateTask(t.id, {
                          status: e.target.value as TaskStatus,
                        })
                      }
                      className="rounded-lg border border-border bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {TASK_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={t.assigneeId ?? ""}
                      onChange={(e) =>
                        onUpdateTask(t.id, {
                          assigneeId: e.target.value || null,
                        })
                      }
                      className="max-w-[10rem] rounded-lg border border-border bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800"
                    >
                      <option value="">—</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={t.sprintId ?? ""}
                      onChange={(e) =>
                        onUpdateTask(t.id, {
                          sprintId: e.target.value || null,
                        })
                      }
                      className="max-w-[10rem] rounded-lg border border-border bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800"
                    >
                      <option value="">Backlog</option>
                      {sprints.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
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
