"use client";

import { Fragment } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Target,
  Flame,
  Clock,
  ArrowRight,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  CalendarCheck,
  MoreHorizontal,
} from "lucide-react";
import {
  leads,
  deals,
  playbookCategories,
  prospectingTasks,
  DEAL_STAGE_LABELS,
  DEAL_STAGE_COLORS,
  type DealStage,
  type ProspectingTask,
  type ProspectingTaskType,
} from "@/lib/crm/mock-data";
import type { DailyMoneyPoint } from "@/components/crm/DashboardCharts";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
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

const TASK_TYPE_ICONS: Record<ProspectingTaskType, React.ReactNode> = {
  follow_up: <Clock className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  text: <MessageSquare className="h-4 w-4" />,
  appointment: <CalendarCheck className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

// ── Sales funnel data ───────────────────────────────────────────────────────

type FunnelStage = {
  label: string;
  count: number;
  value: number;
  color: string;
  bg: string;
};

function buildFunnel(): FunnelStage[] {
  const leadCount = leads.length;
  const appointmentCount = leads.filter(
    (l) => l.stage !== "new"
  ).length;
  const qualifiedCount = leads.filter(
    (l) => l.stage === "qualified"
  ).length;
  const dealsClosed = deals.filter(
    (d) => d.stage === "closed_won"
  );
  const closedCount = dealsClosed.length;
  const revenue = dealsClosed.reduce((s, d) => s + d.value, 0);

  return [
    { label: "Leads", count: leadCount, value: 0, color: "#3b82f6", bg: "bg-blue-50" },
    { label: "Appointments", count: appointmentCount, value: 0, color: "#8b5cf6", bg: "bg-violet-50" },
    { label: "Qualified", count: qualifiedCount, value: 0, color: "#10b981", bg: "bg-emerald-50" },
    { label: "Deals Closed", count: closedCount, value: 0, color: "#f59e0b", bg: "bg-amber-50" },
    { label: "Revenue", count: 0, value: revenue, color: "#10b981", bg: "bg-emerald-50" },
  ];
}

function convRate(a: number, b: number) {
  if (a === 0) return "—";
  return `${Math.round((b / a) * 100)}%`;
}

// ── Leads & appointments chart data ─────────────────────────────────────────

function buildLeadsChart() {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const appointments = [3, 5, 2, 7, 8, 10];
  const newLeads = [4, 6, 3, 8, 9, 9];
  return months.map((m, i) => ({
    month: m,
    appointments: appointments[i],
    leads: newLeads[i],
  }));
}

// ── Active tasks for dashboard ──────────────────────────────────────────────

function getActiveTasks(today: Date): ProspectingTask[] {
  return prospectingTasks
    .filter((t) => t.status !== "completed" && t.status !== "skipped")
    .sort((a, b) => {
      const aOver = daysBetween(a.dueDate, today) > 0 ? 0 : 1;
      const bOver = daysBetween(b.dueDate, today) > 0 ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 4);
}

// ── Deals activity heatmap data ─────────────────────────────────────────────

function buildDealsHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"];
  const data: { day: string; hour: string; value: number }[] = [];
  days.forEach((day) => {
    hours.forEach((hour) => {
      data.push({
        day,
        hour,
        value: Math.random() > 0.65 ? Math.floor(Math.random() * 4) + 1 : 0,
      });
    });
  });
  return { days, hours, data };
}

// ── Component ───────────────────────────────────────────────────────────────

interface DashboardViewProps {
  leadsThisWeek: number;
  appointmentsToday: number;
  revenueWeek: number;
  expensesWeek: number;
  chartData: DailyMoneyPoint[];
  hasErrors: boolean;
}

export default function DashboardView({
  leadsThisWeek,
  appointmentsToday,
  revenueWeek,
  expensesWeek,
  chartData,
  hasErrors,
}: DashboardViewProps) {
  const today = new Date();
  const funnel = buildFunnel();
  const activeTasks = getActiveTasks(today);
  const leadsChartData = buildLeadsChart();
  const heatmap = buildDealsHeatmap();
  const profit = revenueWeek - expensesWeek;

  const totalActivities = playbookCategories.reduce(
    (s, c) => s + c.activities.length, 0
  );
  const totalPoints = playbookCategories.reduce(
    (s, c) => s + c.activities.reduce((a, act) => a + act.points, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-display text-2xl font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary">
            This week · at-a-glance
          </p>
        </div>
        <Link
          href="/leads"
          className="text-sm font-medium text-accent hover:underline"
        >
          Manage leads →
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="New leads (week)" value={String(leadsThisWeek)} />
        <KpiCard label="Appointments today" value={String(appointmentsToday)} />
        <KpiCard label="Revenue (week)" value={fmt(revenueWeek)} />
        <KpiCard label="Expenses (week)" value={fmt(expensesWeek)} />
        <KpiCard label="Profit (week)" value={fmt(profit)} accent />
      </div>

      {/* Daily Playbook summary */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/60">
          Daily Playbook
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Today&apos;s Progress</p>
              <p className="text-sm font-semibold text-text-primary">
                0 / {totalActivities}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs text-text-secondary">Points Today</p>
              <p className="text-sm font-semibold text-text-primary">
                0 / {totalPoints}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Current Streak</p>
              <p className="text-sm font-semibold text-text-primary">0 days</p>
            </div>
          </div>
          <Link
            href="/prospecting"
            className="ml-auto flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Open Playbook <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Sales Funnel */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/60">
            Sales Funnel
          </p>
          <span className="text-xs text-text-secondary">All time</span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-2">
          {funnel.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stage.bg}`}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: stage.color }}
                  >
                    {stage.label === "Revenue"
                      ? fmt(stage.value).replace("$", "$")
                      : stage.count}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-medium text-text-primary">
                  {stage.label}
                </p>
                {i < funnel.length - 1 && stage.count > 0 && (
                  <p className="text-[10px] text-text-secondary">
                    {convRate(
                      stage.count || 1,
                      funnel[i + 1].count || funnel[i + 1].value
                    )}{" "}
                    of {stage.label.toLowerCase()}
                  </p>
                )}
              </div>
              {i < funnel.length - 1 && (
                <div className="mx-1 h-px w-6 bg-border lg:w-10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Appointments + Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Next Appointments */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/60">
              Next Appointments
            </p>
            <Link
              href="/calendar"
              className="text-xs font-medium text-accent hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
            <Calendar className="h-8 w-8 text-text-secondary/30" />
            <p className="text-sm text-text-secondary">
              No upcoming appointments
            </p>
          </div>
        </div>

        {/* Tasks */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/60">
              Tasks
            </p>
            <Link
              href="/prospecting"
              className="text-xs font-medium text-accent hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {activeTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-secondary">
                No active tasks
              </p>
            ) : (
              activeTasks.map((t) => {
                const diff = daysBetween(t.dueDate, today);
                const isOverdue = diff > 0;
                return (
                  <div
                    key={t.id}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${
                      isOverdue ? "bg-red-50/60" : ""
                    }`}
                  >
                    <span className={isOverdue ? "text-red-400" : "text-text-secondary/40"}>
                      {TASK_TYPE_ICONS[t.type]}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {t.title}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        {t.linkedLead && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                            {t.linkedLead}
                          </span>
                        )}
                        {isOverdue && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                            Overdue by {diff} day{diff > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Leads & Appointments + Deals Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads & Appointments chart */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/60">
              Leads & Appointments
            </p>
            <span className="text-xs text-text-secondary">This Month</span>
          </div>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadsChartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf1" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5c6370" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5c6370" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e8ecf1", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="appointments" name="Appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="leads" name="Leads" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deals Activity heatmap */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/60">
              Deals Activity
            </p>
            <span className="text-xs text-text-secondary">This Week</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="grid min-w-[400px]" style={{ gridTemplateColumns: `auto repeat(${heatmap.hours.length}, 1fr)` }}>
              {/* Header row */}
              <div />
              {heatmap.hours.map((h) => (
                <div key={h} className="px-1 pb-1 text-center text-[10px] text-text-secondary">
                  {h}
                </div>
              ))}
              {/* Data rows */}
              {heatmap.days.map((day) => (
                <Fragment key={day}>
                  <div className="flex items-center pr-2 text-xs text-text-secondary">
                    {day}
                  </div>
                  {heatmap.hours.map((hour) => {
                    const cell = heatmap.data.find(
                      (c) => c.day === day && c.hour === hour
                    );
                    const v = cell?.value ?? 0;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`m-0.5 h-6 rounded ${
                          v === 0
                            ? "bg-gray-50"
                            : v === 1
                              ? "bg-emerald-100"
                              : v <= 3
                                ? "bg-emerald-300"
                                : "bg-emerald-500"
                        }`}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-text-secondary">
              <span>Less</span>
              <span className="h-3 w-3 rounded bg-gray-50" />
              <span className="h-3 w-3 rounded bg-emerald-100" />
              <span className="h-3 w-3 rounded bg-emerald-300" />
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses */}
      {!hasErrors && chartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Revenue vs expenses (last 7 days)
          </h2>
          <div className="mt-4 h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf1" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5c6370" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5c6370" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                <Tooltip formatter={(value) => fmt(Number(value))} contentStyle={{ borderRadius: 12, border: "1px solid #e8ecf1", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expenses" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared ───────────────────────────────────────────────────────────────────

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border bg-white p-5 shadow-sm ${accent ? "ring-1 ring-accent/20" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${accent ? "text-accent" : "text-text-primary"}`}>{value}</p>
    </div>
  );
}
