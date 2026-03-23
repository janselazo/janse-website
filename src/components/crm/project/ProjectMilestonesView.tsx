"use client";

import { Fragment, useMemo, useState } from "react";
import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  getMemberById,
} from "@/lib/crm/mock-data";
import { readStoredTeamMembers } from "@/lib/crm/team-members-storage";
import type { WorkspaceTask } from "@/lib/crm/project-workspace-types";
import {
  addDays,
  daysBetween,
  formatISODate,
  parseISODate,
  startOfWeekMonday,
} from "@/lib/crm/project-date-utils";

const HOUR_START = 8;
const HOUR_END = 17;
const HOUR_COUNT = HOUR_END - HOUR_START + 1;
const ROW_H = 44;
const DEFAULT_START_HOUR = 9;

function weekBounds(weekStart: Date) {
  const ws = new Date(weekStart);
  ws.setHours(0, 0, 0, 0);
  const we = addDays(ws, 6);
  we.setHours(23, 59, 59, 999);
  return { ws, we };
}

function taskOverlapsWeek(t: WorkspaceTask, weekStart: Date) {
  const { ws, we } = weekBounds(weekStart);
  const s = parseISODate(t.startDate);
  const e = parseISODate(t.endDate);
  return s <= we && e >= ws;
}

function startDayIndexInWeek(t: WorkspaceTask, weekStart: Date) {
  const s = parseISODate(t.startDate);
  const { ws } = weekBounds(weekStart);
  const clipped = s < ws ? ws : s;
  return Math.min(6, Math.max(0, daysBetween(weekStart, clipped)));
}

function spanDaysInWeek(t: WorkspaceTask, weekStart: Date) {
  const s = parseISODate(t.startDate);
  const e = parseISODate(t.endDate);
  const { ws, we } = weekBounds(weekStart);
  const clipS = s < ws ? ws : s;
  const clipE = e > we ? we : e;
  return Math.max(1, daysBetween(clipS, clipE) + 1);
}

type Props = {
  tasks: WorkspaceTask[];
  onGoToGantt?: () => void;
};

export default function ProjectMilestonesView({
  tasks,
  onGoToGantt,
}: Props) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = useMemo(() => {
    const x = new Date();
    x.setHours(0, 0, 0, 0);
    return x;
  }, []);

  const weekStart = useMemo(
    () => addDays(startOfWeekMonday(today), weekOffset * 7),
    [today, weekOffset]
  );

  const dayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return {
        d,
        dow: d.toLocaleDateString("en-US", { weekday: "short" }),
        dom: d.getDate(),
        isToday: formatISODate(d) === formatISODate(new Date()),
      };
    });
  }, [weekStart]);

  const weekEnd = addDays(weekStart, 6);
  const weekRangeLabel = `${weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const milestoneTasks = useMemo(
    () => tasks.filter((t) => taskOverlapsWeek(t, weekStart)),
    [tasks, weekStart]
  );

  const members = readStoredTeamMembers();
  function resolveMember(assigneeId: string | null) {
    if (!assigneeId) return null;
    return (
      members.find((m) => m.id === assigneeId) ?? getMemberById(assigneeId)
    );
  }

  const now = new Date();
  const weekContainsToday = dayLabels.some((x) => x.isToday);
  const todayIdx = dayLabels.findIndex((x) => x.isToday);
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const fracInDay = Math.min(
    1,
    Math.max(0, (nowHour - HOUR_START) / (HOUR_END - HOUR_START + 1))
  );
  const showNowLine = weekContainsToday && nowHour >= HOUR_START && nowHour <= HOUR_END + 1;

  const gridBodyHeight = HOUR_COUNT * ROW_H;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text-primary dark:text-zinc-100">
          Milestones
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-text-primary dark:text-zinc-200">
            {weekRangeLabel}
          </span>
          <div className="flex rounded-lg border border-border dark:border-zinc-600">
            <button
              type="button"
              className="border-r border-border px-3 py-1.5 text-text-secondary hover:bg-surface dark:border-zinc-600 dark:hover:bg-zinc-800"
              onClick={() => setWeekOffset((o) => o - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="border-r border-border px-3 py-1.5 text-text-secondary hover:bg-surface dark:border-zinc-600 dark:hover:bg-zinc-800"
              onClick={() => setWeekOffset(0)}
            >
              Today
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-text-secondary hover:bg-surface dark:hover:bg-zinc-800"
              onClick={() => setWeekOffset((o) => o + 1)}
            >
              Next
            </button>
          </div>
          <span className="text-xs text-text-secondary">Zoom: Week</span>
        </div>
      </div>

      {milestoneTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-text-secondary">
            No dated tasks overlap this week. Add a task with start and end dates
            on the Gantt tab, or pick another week.
          </p>
          {onGoToGantt ? (
            <button
              type="button"
              onClick={onGoToGantt}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              Open Gantt
            </button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <div className="min-w-[720px]">
            <div
              className="grid"
              style={{
                gridTemplateColumns: "3rem repeat(7, minmax(0, 1fr))",
              }}
            >
              <div className="border-b border-r border-border p-2 dark:border-zinc-700" />
              {dayLabels.map((day) => (
                <div
                  key={formatISODate(day.d)}
                  className={`border-b border-r border-border p-2 text-center last:border-r-0 dark:border-zinc-700 ${
                    day.isToday ? "bg-accent/10" : ""
                  }`}
                >
                  <div className="text-xs font-semibold text-text-primary dark:text-zinc-100">
                    {day.dow}
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    {day.dom}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative" style={{ height: gridBodyHeight }}>
              <div
                className="pointer-events-none absolute inset-0 grid"
                style={{
                  gridTemplateColumns: "3rem repeat(7, minmax(0, 1fr))",
                  gridTemplateRows: `repeat(${HOUR_COUNT}, ${ROW_H}px)`,
                }}
              >
                {Array.from({ length: HOUR_COUNT }, (_, i) => {
                  const h = HOUR_START + i;
                  const label =
                    h === 12
                      ? "12 pm"
                      : h < 12
                        ? `${h} am`
                        : `${h - 12} pm`;
                  return (
                    <Fragment key={h}>
                      <div
                        className="border-b border-r border-border pr-1 text-right text-[10px] text-text-secondary dark:border-zinc-700"
                        style={{ gridRow: i + 1, gridColumn: 1 }}
                      >
                        {label}
                      </div>
                      {Array.from({ length: 7 }, (_, d) => (
                        <div
                          key={d}
                          className="border-b border-r border-border/80 dark:border-zinc-800"
                          style={{ gridRow: i + 1, gridColumn: d + 2 }}
                        />
                      ))}
                    </Fragment>
                  );
                })}
              </div>

              {showNowLine ? (
                <div
                  className="pointer-events-none absolute z-20 w-0.5 bg-accent"
                  style={{
                    left: `calc(3rem + (100% - 3rem) * (${todayIdx} + ${fracInDay}) / 7)`,
                    top: 0,
                    height: gridBodyHeight,
                  }}
                >
                  <span className="absolute -left-6 -top-1 rounded bg-accent px-1 py-0.5 text-[9px] font-bold text-white">
                    Now
                  </span>
                </div>
              ) : null}

              <div className="pointer-events-none absolute inset-0 z-10">
                {milestoneTasks.map((t, stackIdx) => {
                  const dayIdx = startDayIndexInWeek(t, weekStart);
                  const colSpan = Math.min(
                    spanDaysInWeek(t, weekStart),
                    7 - dayIdx
                  );
                  const est = t.estimateHours ?? 2;
                  const rowSpan = Math.max(
                    1,
                    Math.min(
                      Math.ceil(est),
                      HOUR_COUNT - (DEFAULT_START_HOUR - HOUR_START)
                    )
                  );
                  const heightPx = rowSpan * ROW_H - 6;
                  const topPx =
                    (DEFAULT_START_HOUR - HOUR_START) * ROW_H +
                    2 +
                    (stackIdx % 4) * 6;
                  const progress = Math.min(
                    100,
                    Math.max(0, t.progress ?? 0)
                  );
                  const m = resolveMember(t.assigneeId);
                  return (
                    <div
                      key={t.id}
                      className="pointer-events-auto absolute flex flex-col overflow-hidden rounded-lg border border-white/30 p-1.5 text-left text-white shadow-md"
                      style={{
                        top: topPx,
                        left: `calc(3rem + (100% - 3rem) * ${dayIdx} / 7 + 2px)`,
                        width: `calc((100% - 3rem) * ${colSpan} / 7 - 4px)`,
                        minHeight: Math.min(heightPx, 72),
                        maxHeight: heightPx,
                        backgroundColor: TASK_STATUS_COLORS[t.status],
                      }}
                    >
                      <p className="line-clamp-2 text-[11px] font-semibold leading-tight">
                        {t.title}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between gap-1 text-[9px] opacity-90">
                        <span>
                          {t.estimateHours != null
                            ? `${t.estimateHours}h est.`
                            : ""}
                        </span>
                        {m ? (
                          <span className="rounded-full bg-black/20 px-1">
                            {m.avatarFallback ?? m.name.slice(0, 2)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/20">
                        <div
                          className="h-full rounded-full bg-white/90"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="mt-0.5 text-[8px] opacity-80">
                        {TASK_STATUS_LABELS[t.status]} · {progress}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
