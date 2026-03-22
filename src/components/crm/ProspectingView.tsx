"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Phone,
  PenLine,
  Megaphone,
  Handshake,
  Gift,
  Search,
  Clock,
  Circle,
  CheckCircle2,
  Mail,
  MessageSquare,
  Calendar,
  CalendarCheck,
  MoreHorizontal,
  Flame,
  Plus,
  Target,
  DollarSign,
  Pencil,
} from "lucide-react";
import TabBar from "@/components/crm/TabBar";
import {
  playbookCategories,
  monthlyGoals,
  deals,
  prospectingTasks,
  PROSPECTING_TASK_TYPE_LABELS,
  type PlaybookCategory,
  type PlaybookActivity,
  type MonthlyGoal,
  type ProspectingTask,
  type ProspectingTaskType,
  type ProspectingTaskStatus,
} from "@/lib/crm/mock-data";
import { getCompletions, saveCompletions } from "@/lib/crm/playbook-store";

// ── Shared helpers ──────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  phone: <Phone className="h-4 w-4" />,
  "pen-line": <PenLine className="h-4 w-4" />,
  megaphone: <Megaphone className="h-4 w-4" />,
  handshake: <Handshake className="h-4 w-4" />,
  gift: <Gift className="h-4 w-4" />,
  search: <Search className="h-4 w-4" />,
};

const TASK_TYPE_ICONS: Record<ProspectingTaskType, React.ReactNode> = {
  follow_up: <Clock className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  text: <MessageSquare className="h-4 w-4" />,
  appointment: <CalendarCheck className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function daysBetween(a: string, b: Date) {
  const d = new Date(a);
  d.setHours(0, 0, 0, 0);
  const bNorm = new Date(b);
  bNorm.setHours(0, 0, 0, 0);
  return Math.floor((bNorm.getTime() - d.getTime()) / 86_400_000);
}

// ── DateNavigator ───────────────────────────────────────────────────────────

function DateNavigator({
  date,
  onChange,
}: {
  date: Date;
  onChange: (d: Date) => void;
}) {
  function shift(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    onChange(d);
  }

  return (
    <div className="flex items-center justify-center gap-4 rounded-xl border border-border bg-white px-4 py-2.5">
      <button
        type="button"
        onClick={() => shift(-1)}
        className="rounded-lg p-1 text-text-secondary hover:bg-surface hover:text-text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm font-medium text-text-primary">
        {formatDate(date)}
      </span>
      <button
        type="button"
        onClick={() => shift(1)}
        className="rounded-lg p-1 text-text-secondary hover:bg-surface hover:text-text-primary"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

type ActiveTab = "playbook" | "agenda" | "tasks";

const TABS = [
  { id: "playbook", label: "Playbook" },
  { id: "agenda", label: "Agenda" },
  { id: "tasks", label: "Tasks" },
];

function getMonthlyDealsMetrics() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const wonThisMonth = deals.filter((d) => {
    if (d.stage !== "closed_won") return false;
    const close = new Date(d.expectedClose);
    return close.getMonth() === month && close.getFullYear() === year;
  });
  return {
    wonCount: wonThisMonth.length,
    wonRevenue: wonThisMonth.reduce((s, d) => s + d.value, 0),
  };
}

export default function ProspectingView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("playbook");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [goals, setGoals] = useState<MonthlyGoal[]>(monthlyGoals);

  const { wonCount, wonRevenue } = getMonthlyDealsMetrics();
  const goalsWithActuals = useMemo(
    () =>
      goals.map((g) => {
        if (g.id === "mg-1") return { ...g, current: wonCount };
        if (g.id === "mg-2") return { ...g, current: wonRevenue };
        return g;
      }),
    [goals, wonCount, wonRevenue]
  );

  return (
    <div>
      <div>
        <h1 className="heading-display text-2xl font-bold text-text-primary">
          Prospecting
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Complete your income-producing activities every day to generate more
          leads, appointments, and deals
        </p>
      </div>

      {/* Monthly Goals */}
      <MonthlyGoalsCard goals={goalsWithActuals} onChange={setGoals} />

      {/* Date navigator */}
      <div className="mt-6">
        <DateNavigator date={currentDate} onChange={setCurrentDate} />
      </div>

      {/* Tabs */}
      <div className="mt-4">
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as ActiveTab)}
        />
      </div>

      <div className="mt-6">
        {activeTab === "playbook" && <PlaybookTab />}
        {activeTab === "agenda" && (
          <AgendaTab date={currentDate} />
        )}
        {activeTab === "tasks" && <TasksTab today={currentDate} />}
      </div>
    </div>
  );
}

// ── Monthly Goals Card ──────────────────────────────────────────────────────

function MonthlyGoalsCard({
  goals,
  onChange,
}: {
  goals: MonthlyGoal[];
  onChange: (goals: MonthlyGoal[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  function startEdit(g: MonthlyGoal) {
    setEditingId(g.id);
    setEditValue(g.unit === "currency" ? g.target : g.target);
  }

  function confirmEdit(g: MonthlyGoal) {
    const val = Math.max(1, editValue);
    onChange(goals.map((goal) => (goal.id === g.id ? { ...goal, target: val } : goal)));
    setEditingId(null);
  }

  function addGoal() {
    onChange([
      ...goals,
      {
        id: `mg-${Date.now()}`,
        title: "New Goal",
        current: 0,
        target: 10,
        unit: "count",
        icon: "handshake",
      },
    ]);
  }

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/60">
          Monthly Goals
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-primary">
            <Calendar className="h-3 w-3 text-accent" />
            {monthLabel}
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-5">
        {goals.map((g) => {
          const pct = Math.min(
            (g.current / Math.max(g.target, 1)) * 100,
            100
          );
          const GoalIcon =
            g.icon === "handshake" ? Handshake : DollarSign;
          const isEditing = editingId === g.id;

          return (
            <div key={g.id}>
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GoalIcon className="h-4 w-4 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">
                    {g.title}
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    {g.unit === "currency" && (
                      <span className="text-sm text-text-secondary">$</span>
                    )}
                    <input
                      type="number"
                      min="1"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit(g);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="w-20 rounded-lg border border-accent bg-white px-2 py-1 text-right text-sm font-semibold text-text-primary outline-none ring-2 ring-accent/15"
                    />
                    <button
                      type="button"
                      onClick={() => confirmEdit(g)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-emerald-500 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-text-primary">
                      {g.unit === "currency"
                        ? `${g.current} / ${g.target}`
                        : `${g.current} / ${g.target}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(g)}
                      className="rounded p-0.5 text-text-secondary/40 transition-colors hover:text-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress visualization */}
              {g.unit === "count" ? (
                <div className="mt-2 flex items-center gap-1.5">
                  {Array.from({ length: g.target }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 w-2.5 rounded-full ${
                        i < g.current
                          ? "bg-emerald-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-text-secondary">
                    {formatCurrency(g.current)} earned
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addGoal}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border py-2 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent"
      >
        <Plus className="h-3 w-3" /> Add Goal
      </button>
    </div>
  );
}

// ── Playbook Tab ────────────────────────────────────────────────────────────

function PlaybookTab() {
  const [completions, setCompletions] = useState<Record<string, number>>(getCompletions);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    saveCompletions(completions);
  }, [completions]);

  const totalPoints = playbookCategories.reduce(
    (sum, c) => sum + c.activities.reduce((s, a) => s + a.points, 0),
    0
  );
  const earnedPoints = playbookCategories.reduce(
    (sum, c) =>
      sum +
      c.activities.reduce((s, a) => {
        const done = completions[a.id] ?? 0;
        return s + (done >= a.target ? a.points : 0);
      }, 0),
    0
  );
  const totalActivities = playbookCategories.reduce(
    (s, c) => s + c.activities.length,
    0
  );
  const completedActivities = playbookCategories.reduce(
    (s, c) =>
      s +
      c.activities.filter((a) => (completions[a.id] ?? 0) >= a.target).length,
    0
  );
  const pct =
    totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

  function increment(activityId: string, target: number) {
    setCompletions((prev) => {
      const cur = prev[activityId] ?? 0;
      if (cur >= target) return prev;
      return { ...prev, [activityId]: cur + 1 };
    });
  }

  function toggleCollapse(catId: string) {
    setCollapsed((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniKpi
          icon={<Target className="h-5 w-5 text-text-secondary" />}
          label="Today's Progress"
          value={`${completedActivities} / ${totalActivities}`}
        />
        <MiniKpi
          icon={<Flame className="h-5 w-5 text-amber-500" />}
          label="Points Today"
          value={`${earnedPoints} / ${totalPoints}`}
        />
        <MiniKpi
          icon={<Clock className="h-5 w-5 text-text-secondary" />}
          label="Current Streak"
          value="0 days"
        />
        <MiniKpi
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          label="Keep going"
          value="Time to make money."
        />
      </div>

      {/* Progress bar */}
      <div className="mt-5 flex items-center gap-3">
        <span className="text-xs font-medium text-text-secondary">Today</span>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-medium text-text-secondary">
          {pct}% complete
        </span>
      </div>

      {/* Activity sections */}
      <div className="mt-6 space-y-4">
        {playbookCategories.map((cat) => {
          const catEarned = cat.activities.reduce((s, a) => {
            const done = completions[a.id] ?? 0;
            return s + (done >= a.target ? a.points : 0);
          }, 0);
          const catTotal = cat.activities.reduce((s, a) => s + a.points, 0);
          const isOpen = !collapsed[cat.id];

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-border bg-white shadow-sm"
            >
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleCollapse(cat.id)}
                className="flex w-full items-center gap-3 px-5 py-4"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {CATEGORY_ICONS[cat.icon] ?? (
                    <Circle className="h-4 w-4" />
                  )}
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {cat.name}
                </span>
                {/* mini progress */}
                <div className="ml-2 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${catTotal > 0 ? (catEarned / catTotal) * 100 : 0}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                <span className="text-xs text-text-secondary">
                  {catEarned}/{catTotal} pts
                </span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 text-text-secondary transition-transform ${
                    isOpen ? "" : "-rotate-90"
                  }`}
                />
              </button>

              {/* Activities */}
              {isOpen && (
                <div className="border-t border-border">
                  {cat.activities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      completed={completions[activity.id] ?? 0}
                      onIncrement={() =>
                        increment(activity.id, activity.target)
                      }
                    />
                  ))}
                  <div className="px-5 py-3">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-accent"
                    >
                      <Plus className="h-3 w-3" /> Add Activity
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-text-secondary hover:border-accent hover:text-accent"
      >
        <Plus className="h-4 w-4" /> Add New Section
      </button>
    </div>
  );
}

function ActivityRow({
  activity,
  completed,
  onIncrement,
}: {
  activity: PlaybookActivity;
  completed: number;
  onIncrement: () => void;
}) {
  const isDone = completed >= activity.target;

  return (
    <div className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
      <span className="w-6 text-center text-[11px] font-bold text-text-secondary/50">
        {activity.id.replace("a-", "")}
      </span>
      <div className="flex-1">
        <p
          className={`text-sm ${
            isDone
              ? "text-text-secondary line-through"
              : "text-text-primary"
          }`}
        >
          {activity.title}
        </p>
        <p className="text-xs text-text-secondary/60">
          {activity.points} pts each · {activity.timeEstimate}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs tabular-nums text-text-secondary">
          {completed}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={isDone}
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors ${
            isDone
              ? "border-emerald-300 bg-emerald-50 text-emerald-500"
              : "border-border bg-white text-text-secondary hover:border-accent hover:text-accent"
          }`}
        >
          {isDone ? "✓" : "+"}
        </button>
      </div>
    </div>
  );
}

// ── Agenda Tab ──────────────────────────────────────────────────────────────

interface AgendaEntry {
  id: string;
  text: string;
  time: string;
}

function AgendaTab({ date }: { date: Date }) {
  const dateKey = date.toISOString().slice(0, 10);
  const [entriesByDate, setEntriesByDate] = useState<
    Record<string, AgendaEntry[]>
  >({});
  const [draft, setDraft] = useState("");

  const entries = entriesByDate[dateKey] ?? [];

  function addEntry() {
    if (!draft.trim()) return;
    const entry: AgendaEntry = {
      id: `ae-${Date.now()}`,
      text: draft.trim(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    setEntriesByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] ?? []), entry],
    }));
    setDraft("");
  }

  return (
    <div className="rounded-2xl border border-border bg-amber-50/40 p-6">
      <h2 className="text-sm font-semibold italic text-text-primary">
        {formatShortDate(date)}
      </h2>

      <div className="mt-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addEntry()}
          placeholder="Write something…"
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-secondary/40 focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
      </div>

      {entries.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-3xl">📋</span>
          <p className="text-sm font-medium text-text-secondary">
            Nothing on the agenda yet.
          </p>
          <p className="text-xs text-text-secondary/60">
            Start listing activities or what took your time today.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-3 rounded-xl bg-white px-4 py-3"
            >
              <span className="mt-0.5 text-xs text-text-secondary/60">
                {e.time}
              </span>
              <p className="text-sm text-text-primary">{e.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tasks Tab ───────────────────────────────────────────────────────────────

type TaskFilter =
  | "active"
  | ProspectingTaskStatus
  | ProspectingTaskType;

const STATUS_FILTERS: TaskFilter[] = [
  "active",
  "pending",
  "in_progress",
  "completed",
  "skipped",
];
const TYPE_FILTERS: ProspectingTaskType[] = [
  "follow_up",
  "call",
  "email",
  "text",
  "appointment",
  "other",
];

const FILTER_LABELS: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  skipped: "Skipped",
  ...PROSPECTING_TASK_TYPE_LABELS,
};

function TasksTab({ today }: { today: Date }) {
  const [localTasks, setLocalTasks] = useState<ProspectingTask[]>(prospectingTasks);
  const [filter, setFilter] = useState<TaskFilter>("active");
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const counts = useMemo(() => {
    const pending = localTasks.filter((t) => t.status === "pending").length;
    const inProgress = localTasks.filter(
      (t) => t.status === "in_progress"
    ).length;
    const completed = localTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const overdue = localTasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.status !== "skipped" &&
        daysBetween(t.dueDate, today) > 0
    ).length;
    return { pending, inProgress, completed, overdue };
  }, [localTasks, today]);

  const filtered = useMemo(() => {
    let list = localTasks;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.linkedLead?.toLowerCase().includes(q)
      );
    }

    if (filter === "active") {
      list = list.filter(
        (t) => t.status !== "completed" && t.status !== "skipped"
      );
    } else if (STATUS_FILTERS.includes(filter)) {
      list = list.filter((t) => t.status === filter);
    } else {
      list = list.filter((t) => t.type === filter);
    }

    return list;
  }, [localTasks, filter, search, today]);

  const overdueTasks = filtered.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "skipped" &&
      daysBetween(t.dueDate, today) > 0
  );
  const upcomingTasks = filtered.filter(
    (t) => !overdueTasks.includes(t)
  );

  function toggleComplete(id: string) {
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status:
                t.status === "completed"
                  ? "pending"
                  : "completed",
            }
          : t
      )
    );
  }

  function addTask(task: ProspectingTask) {
    setLocalTasks((prev) => [task, ...prev]);
    setAddModalOpen(false);
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Manage your follow-ups, calls, emails, and activities
        </p>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
        >
          + Add Task
        </button>
      </div>

      {/* KPI row */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TaskKpi
          color="text-amber-500"
          label="Pending"
          value={counts.pending}
        />
        <TaskKpi
          color="text-blue-500"
          label="In Progress"
          value={counts.inProgress}
        />
        <TaskKpi
          color="text-emerald-500"
          label="Completed"
          value={counts.completed}
        />
        <TaskKpi
          color="text-red-500"
          label="Overdue"
          value={counts.overdue}
        />
      </div>

      {/* Search + filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
          <input
            type="text"
            placeholder="Search tasks or leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-lg border border-border bg-white py-1.5 pl-8 pr-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>
        {[...STATUS_FILTERS, ...TYPE_FILTERS].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-accent text-white"
                : "bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Task lists */}
      <div className="mt-6 space-y-6">
        {overdueTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">
              Overdue ({overdueTasks.length})
            </h3>
            <div className="mt-2 space-y-2">
              {overdueTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  today={today}
                  overdue
                  onToggle={() => toggleComplete(t.id)}
                />
              ))}
            </div>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              {filter === "completed" ? "Completed" : "Upcoming"} ({upcomingTasks.length})
            </h3>
            <div className="mt-2 space-y-2">
              {upcomingTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  today={today}
                  onToggle={() => toggleComplete(t.id)}
                />
              ))}
            </div>
          </div>
        )}

        {overdueTasks.length === 0 && upcomingTasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center text-sm text-text-secondary">
            No tasks match your filters.
          </div>
        )}
      </div>

      {addModalOpen && (
        <AddTaskModal
          onClose={() => setAddModalOpen(false)}
          onAdd={addTask}
        />
      )}
    </div>
  );
}

function TaskRow({
  task,
  today,
  overdue,
  onToggle,
}: {
  task: ProspectingTask;
  today: Date;
  overdue?: boolean;
  onToggle: () => void;
}) {
  const diff = daysBetween(task.dueDate, today);
  const isCompleted = task.status === "completed";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        overdue
          ? "border-red-200 bg-red-50/60"
          : "border-border bg-white"
      }`}
    >
      <button type="button" onClick={onToggle} className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-text-secondary/30" />
        )}
      </button>
      <span className="text-text-secondary/60">
        {TASK_TYPE_ICONS[task.type]}
      </span>
      <div className="flex-1">
        <p
          className={`text-sm ${
            isCompleted
              ? "text-text-secondary line-through"
              : "font-medium text-text-primary"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {task.linkedLead && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              {task.linkedLead}
            </span>
          )}
          {overdue && diff > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
              Overdue by {diff} day{diff > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-text-secondary">
        {new Date(task.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  );
}

function TaskKpi({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function MiniKpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
      {icon}
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

// ── Add Task Modal ──────────────────────────────────────────────────────────

function AddTaskModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (task: ProspectingTask) => void;
}) {
  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onAdd({
      id: `pt-${Date.now()}`,
      title: (fd.get("title") as string) || "Untitled Task",
      type: (fd.get("type") as ProspectingTaskType) || "other",
      status: "pending",
      dueDate: (fd.get("dueDate") as string) || new Date().toISOString().slice(0, 10),
      linkedLead: (fd.get("linkedLead") as string) || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        aria-labelledby="add-task-title"
      >
        <h2
          id="add-task-title"
          className="text-sm font-bold uppercase tracking-wider text-text-secondary"
        >
          New Task
        </h2>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Title
            </label>
            <input name="title" type="text" required className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Type
              </label>
              <select name="type" className={inputClass}>
                {TYPE_FILTERS.map((t) => (
                  <option key={t} value={t}>
                    {PROSPECTING_TASK_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Due Date
              </label>
              <input name="dueDate" type="date" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Linked Lead / Company
            </label>
            <input
              name="linkedLead"
              type="text"
              placeholder="e.g. Orbital AI"
              className={inputClass}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Add task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
