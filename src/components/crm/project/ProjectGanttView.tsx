"use client";

import { useMemo, useState } from "react";
import {
  getMemberById,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  type TaskStatus,
} from "@/lib/crm/mock-data";
import { readStoredTeamMembers } from "@/lib/crm/team-members-storage";
import type { WorkspaceTask } from "@/lib/crm/project-workspace-types";
import {
  addDays,
  daysBetween,
  formatISODate,
  parseISODate,
} from "@/lib/crm/project-date-utils";

const DAY_WIDTH = 36;
const ROW_H = 40;

const GANTT_GROUPS: {
  id: string;
  label: string;
  statuses: TaskStatus[];
}[] = [
  { id: "todo", label: "To do", statuses: ["not_started"] },
  {
    id: "in_progress",
    label: "In progress",
    statuses: ["action_started", "in_progress"],
  },
  { id: "in_review", label: "In review", statuses: ["test_qa"] },
  { id: "done", label: "Done", statuses: ["completed"] },
];

function buildFlatRows(tasks: WorkspaceTask[]) {
  const rows: { task: WorkspaceTask; groupLabel: string }[] = [];
  for (const g of GANTT_GROUPS) {
    for (const t of tasks) {
      if (g.statuses.includes(t.status)) {
        rows.push({ task: t, groupLabel: g.label });
      }
    }
  }
  return rows;
}

type Props = {
  tasks: WorkspaceTask[];
  onAddTask: (title: string, status: TaskStatus) => void;
};

export default function ProjectGanttView({ tasks, onAddTask }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<TaskStatus>("not_started");

  const flatRows = useMemo(() => buildFlatRows(tasks), [tasks]);

  const { rangeStart, totalDays, dayLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (tasks.length === 0) {
      const start = addDays(today, -7);
      const days = 42;
      const labels = Array.from({ length: days }, (_, i) => {
        const d = addDays(start, i);
        return {
          d,
          label: d.getDate(),
          week: d.toLocaleDateString("en-US", { weekday: "short" }),
        };
      });
      return { rangeStart: start, totalDays: days, dayLabels: labels };
    }
    let minT = today;
    let maxT = today;
    for (const t of tasks) {
      const a = parseISODate(t.startDate);
      const b = parseISODate(t.endDate);
      if (a < minT) minT = a;
      if (b > maxT) maxT = b;
    }
    minT = addDays(minT, -3);
    maxT = addDays(maxT, 10);
    const days = Math.max(14, daysBetween(minT, maxT) + 1);
    const labels = Array.from({ length: days }, (_, i) => {
      const d = addDays(minT, i);
      return {
        d,
        label: d.getDate(),
        week: d.toLocaleDateString("en-US", { weekday: "short" }),
      };
    });
    return { rangeStart: minT, totalDays: days, dayLabels: labels };
  }, [tasks]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOffset = daysBetween(rangeStart, today);

  const members = readStoredTeamMembers();
  function resolveMember(assigneeId: string | null) {
    if (!assigneeId) return null;
    return (
      members.find((m) => m.id === assigneeId) ?? getMemberById(assigneeId)
    );
  }

  const timelineWidth = totalDays * DAY_WIDTH;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text-primary dark:text-zinc-100">
        Gantt
      </h2>

      <form
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTitle.trim()) return;
          onAddTask(newTitle.trim(), newStatus);
          setNewTitle("");
        }}
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title"
          className="min-w-[12rem] flex-1 rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
          className="rounded-lg border border-border px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        >
          {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {TASK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Add task
        </button>
      </form>

      <div className="flex overflow-hidden rounded-2xl border border-border bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="w-72 shrink-0 border-r border-border dark:border-zinc-700">
          <div className="flex h-14 items-end border-b border-border pb-1 pl-3 text-xs font-semibold text-text-secondary dark:border-zinc-700">
            Task
          </div>
          {flatRows.map(({ task: t, groupLabel }) => (
            <div
              key={t.id}
              className="flex items-center gap-2 border-b border-border/60 px-3 text-sm dark:border-zinc-800"
              style={{ height: ROW_H }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: TASK_STATUS_COLORS[t.status] }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary dark:text-zinc-100">
                  {t.title}
                </p>
                <p className="truncate text-[10px] text-text-secondary">
                  {groupLabel}
                </p>
              </div>
            </div>
          ))}
          {flatRows.length === 0 ? (
            <div className="px-3 py-8 text-sm text-text-secondary">
              No tasks yet. Add one above.
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="relative" style={{ width: timelineWidth }}>
            <div className="flex h-14 border-b border-border dark:border-zinc-700">
              {dayLabels.map(({ d, label, week }, i) => {
                const isToday =
                  formatISODate(d) === formatISODate(new Date());
                return (
                  <div
                    key={i}
                    style={{ width: DAY_WIDTH }}
                    className={`flex shrink-0 flex-col items-center justify-end pb-1 text-xs ${
                      isToday ? "bg-accent/10" : ""
                    } border-r border-border/40 dark:border-zinc-800`}
                  >
                    <span className="text-[10px] text-text-secondary">
                      {week}
                    </span>
                    <span className="font-medium text-text-primary dark:text-zinc-100">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {todayOffset >= 0 && todayOffset < totalDays ? (
              <div
                className="pointer-events-none absolute bottom-0 top-14 z-20 w-px bg-accent"
                style={{
                  left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2,
                }}
              >
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold text-white">
                  Today
                </span>
              </div>
            ) : null}

            {flatRows.map(({ task: t }) => {
              const s = parseISODate(t.startDate);
              const e = parseISODate(t.endDate);
              const left = Math.max(0, daysBetween(rangeStart, s)) * DAY_WIDTH;
              const spanDays = Math.max(1, daysBetween(s, e) + 1);
              const width = Math.max(spanDays * DAY_WIDTH - 4, DAY_WIDTH - 4);
              const m = resolveMember(t.assigneeId);
              return (
                <div
                  key={t.id}
                  className="relative border-b border-border/60 dark:border-zinc-800"
                  style={{ width: timelineWidth, height: ROW_H }}
                >
                  <div
                    className="absolute top-1 flex h-8 max-w-full cursor-default items-center justify-between gap-1 overflow-hidden rounded-lg px-2 text-xs font-medium text-white shadow-sm"
                    style={{
                      left: left + 2,
                      width,
                      minWidth: 24,
                      backgroundColor: TASK_STATUS_COLORS[t.status],
                    }}
                    title={`${t.startDate} → ${t.endDate}`}
                  >
                    <span className="truncate">{t.title}</span>
                    {m ? (
                      <span className="shrink-0 rounded-full bg-white/20 px-1.5 text-[10px]">
                        {m.avatarFallback ?? m.name.slice(0, 2)}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
