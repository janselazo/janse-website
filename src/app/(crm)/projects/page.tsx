"use client";

import { useState } from "react";
import Link from "next/link";
import {
  projects as initialProjects,
  teams,
  PLAN_COLORS,
  PLAN_LABELS,
  type PlanStage,
  type MockProject,
} from "@/lib/crm/mock-data";
import KanbanBoard, { type KanbanColumn } from "@/components/crm/KanbanBoard";

type ViewMode = "kanban" | "table";

const planOrder: PlanStage[] = ["pipeline", "planning", "mvp", "growth"];

export default function ProjectsPage() {
  const [view, setView] = useState<ViewMode>("kanban");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [projectList, setProjectList] = useState<MockProject[]>(initialProjects);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = projectList.filter((p) => {
    if (filterPlan !== "all" && p.plan !== filterPlan) return false;
    if (filterTeam !== "all" && p.teamId !== filterTeam) return false;
    return true;
  });

  const kanbanColumns: KanbanColumn<MockProject>[] = planOrder.map((plan) => ({
    id: plan,
    label: PLAN_LABELS[plan],
    color: PLAN_COLORS[plan],
    items: filtered.filter((p) => p.plan === plan),
  }));

  function handleMove(itemId: string, _from: string, to: string) {
    setProjectList((prev) =>
      prev.map((p) =>
        p.id === itemId ? { ...p, plan: to as PlanStage } : p
      )
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="heading-display text-2xl font-bold text-text-primary">
            Projects
          </h1>
          <ToggleButton
            active={view === "kanban"}
            onClick={() => setView("kanban")}
          >
            Kanban
          </ToggleButton>
          <ToggleButton
            active={view === "table"}
            onClick={() => setView("table")}
          >
            Table
          </ToggleButton>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover"
        >
          + Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-3 text-sm">
        <span className="text-text-secondary">Filter by:</span>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="all">All Status</option>
          {planOrder.map((p) => (
            <option key={p} value={p}>
              {PLAN_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="all">All Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {view === "kanban" ? (
          <KanbanBoard
            columns={kanbanColumns}
            renderCard={(project) => <ProjectCard project={project} />}
            onAddNew={() => setModalOpen(true)}
            onMove={handleMove}
          />
        ) : (
          <ProjectTable projects={filtered} />
        )}
      </div>

      {modalOpen && (
        <NewProjectModal
          onClose={() => setModalOpen(false)}
          onAdd={(project) => {
            setProjectList((prev) => [...prev, project]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: MockProject }) {
  const team = teams.find((t) => t.id === project.teamId);
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-xl border border-border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-medium text-text-primary">{project.title}</p>
      <p className="mt-1 text-xs text-text-secondary">
        {team?.name ?? "—"} · {project.sprintCount} sprints · {project.taskCount} tasks
      </p>
    </Link>
  );
}

function ProjectTable({ projects: items }: { projects: MockProject[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 font-semibold text-text-secondary">Project</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Plan</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Team</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">End Date</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Sprints</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Tasks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((p) => {
            const team = teams.find((t) => t.id === p.teamId);
            return (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${p.id}`}
                    className="font-medium text-text-primary hover:text-accent"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: PLAN_COLORS[p.plan] }}
                  >
                    {PLAN_LABELS[p.plan]}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{team?.name ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">{p.expectedEndDate}</td>
                <td className="px-4 py-3 text-text-secondary">{p.sprintCount}</td>
                <td className="px-4 py-3 text-text-secondary">{p.taskCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NewProjectModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: MockProject) => void;
}) {
  const [title, setTitle] = useState("");
  const [plan, setPlan] = useState<PlanStage>("pipeline");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [endDate, setEndDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: `proj-${Date.now()}`,
      title: title.trim(),
      plan,
      teamId,
      color: "#6366f1",
      expectedEndDate: endDate || "TBD",
      sprintCount: 0,
      taskCount: 0,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-text-primary">New Project</h2>

        <label className="mt-4 block text-sm font-medium text-text-secondary">
          Project Name
        </label>
        <input
          autoFocus
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
          placeholder="e.g. Acme Redesign"
        />

        <label className="mt-4 block text-sm font-medium text-text-secondary">
          Status
        </label>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as PlanStage)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        >
          {planOrder.map((p) => (
            <option key={p} value={p}>{PLAN_LABELS[p]}</option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-medium text-text-secondary">
          Team
        </label>
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-medium text-text-secondary">
          Expected End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover"
          >
            Add Project
          </button>
        </div>
      </form>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-accent/10 text-accent"
          : "text-text-secondary hover:bg-surface hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
