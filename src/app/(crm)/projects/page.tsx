"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  projects as initialProjects,
  projectTeamDisplayName,
  PLAN_COLORS,
  PLAN_LABELS,
  LEAD_PROJECT_TYPE_OPTIONS,
  type PlanStage,
  type MockProject,
} from "@/lib/crm/mock-data";
import { ChevronDown } from "lucide-react";
import KanbanBoard, { type KanbanColumn } from "@/components/crm/KanbanBoard";
import CrmPopoverDateField from "@/components/crm/CrmPopoverDateField";
import { useCrmTeamMembers } from "@/lib/crm/use-crm-team-members";
import {
  createProjectId,
  readStoredProjects,
  writeStoredProjects,
} from "@/lib/crm/projects-storage";

type ViewMode = "kanban" | "table";

const planOrder: PlanStage[] = ["pipeline", "planning", "mvp", "growth"];

export default function ProjectsPage() {
  const [view, setView] = useState<ViewMode>("kanban");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [projectList, setProjectList] = useState<MockProject[]>(() => [
    ...initialProjects,
  ]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredProjects();
    if (stored.length > 0) setProjectList(stored);
  }, []);

  useEffect(() => {
    const sync = () => {
      const next = readStoredProjects();
      if (next.length > 0) setProjectList(next);
    };
    window.addEventListener("crm-projects-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("crm-projects-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const teamFilterOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const p of projectList) {
      labels.add(projectTeamDisplayName(p));
    }
    return Array.from(labels).sort((a, b) => {
      if (a === "Unassigned") return -1;
      if (b === "Unassigned") return 1;
      return a.localeCompare(b);
    });
  }, [projectList]);

  const filtered = projectList.filter((p) => {
    if (filterPlan !== "all" && p.plan !== filterPlan) return false;
    if (filterTeam !== "all" && projectTeamDisplayName(p) !== filterTeam) {
      return false;
    }
    return true;
  });

  const kanbanColumns: KanbanColumn<MockProject>[] = planOrder.map((plan) => ({
    id: plan,
    label: PLAN_LABELS[plan],
    color: PLAN_COLORS[plan],
    items: filtered.filter((p) => p.plan === plan),
  }));

  function handleMove(itemId: string, _from: string, to: string) {
    setProjectList((prev) => {
      const next = prev.map((p) =>
        p.id === itemId ? { ...p, plan: to as PlanStage } : p
      );
      writeStoredProjects(next);
      return next;
    });
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
          <option value="all">All teams</option>
          {teamFilterOptions.map((name) => (
            <option key={name} value={name}>
              {name}
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
            setProjectList((prev) => {
              const next = [...prev, project];
              writeStoredProjects(next);
              return next;
            });
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: MockProject }) {
  const teamLabel = projectTeamDisplayName(project);
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-xl border border-border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-medium text-text-primary">{project.title}</p>
      <p className="mt-1 text-xs text-text-secondary">
        {project.projectType ? (
          <span className="mr-1 font-medium text-text-primary/80">
            {project.projectType}
          </span>
        ) : null}
        {teamLabel} · {project.sprintCount} sprints · {project.taskCount}{" "}
        tasks
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
            <th className="px-4 py-3 font-semibold text-text-secondary">Type</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Plan</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Team name</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">End Date</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Budget</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Website</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Sprints</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Tasks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((p) => {
            const teamLabel = projectTeamDisplayName(p);
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
                <td className="px-4 py-3 text-text-secondary">
                  {p.projectType ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: PLAN_COLORS[p.plan] }}
                  >
                    {PLAN_LABELS[p.plan]}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{teamLabel}</td>
                <td className="px-4 py-3 text-text-secondary">{p.expectedEndDate}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {p.budget != null && p.budget > 0
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(p.budget)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {p.website ? (
                    <span className="max-w-[10rem] truncate block" title={p.website}>
                      {p.website.replace(/^https?:\/\//i, "")}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
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
  const teamMembers = useCrmTeamMembers();
  const [title, setTitle] = useState("");
  const [plan, setPlan] = useState<PlanStage>("pipeline");
  const [teamMemberId, setTeamMemberId] = useState("");
  const [projectType, setProjectType] = useState<string>(
    LEAD_PROJECT_TYPE_OPTIONS[0]
  );
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [website, setWebsite] = useState("");

  const fieldClass =
    "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text-primary shadow-sm outline-none transition-[box-shadow,border-color] placeholder:text-text-secondary/45 focus:border-accent focus:ring-2 focus:ring-accent/15";

  const selectClass = `${fieldClass} cursor-pointer appearance-none pr-10`;

  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-primary";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const budgetRaw = budget.replace(/,/g, "").trim();
    let budgetNum: number | null = null;
    if (budgetRaw !== "") {
      const n = Number(budgetRaw);
      if (!Number.isNaN(n) && n >= 0) budgetNum = n;
    }
    const member = teamMemberId
      ? teamMembers.find((m) => m.id === teamMemberId)
      : undefined;
    const name = member?.name.trim() ?? "";
    onAdd({
      id: createProjectId(),
      title: title.trim(),
      plan,
      teamId: member ? member.teamId : "team-general",
      teamName: name || null,
      projectType,
      color: "#6366f1",
      expectedEndDate: endDate || "TBD",
      budget: budgetNum,
      website: website.trim() || null,
      sprintCount: 0,
      taskCount: 0,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className="max-h-[min(92vh,44rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">
            Create
          </p>
          <h2
            id="new-project-title"
            className="mt-1 font-sans text-xl font-bold tracking-tight text-text-primary"
          >
            New project
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            Name your build, set status and type, then pick a target date or leave
            it open as TBD.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="np-title" className={labelClass}>
                Project name
              </label>
              <input
                id="np-title"
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
                placeholder="e.g. Acme Redesign"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="np-status" className={labelClass}>
                  Status
                </label>
                <div className="relative">
                  <select
                    id="np-status"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as PlanStage)}
                    className={selectClass}
                  >
                    {planOrder.map((p) => (
                      <option key={p} value={p}>
                        {PLAN_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/55"
                    aria-hidden
                  />
                </div>
              </div>
              <div>
                <label htmlFor="np-team-name" className={labelClass}>
                  Team name
                </label>
                <div className="relative">
                  <select
                    id="np-team-name"
                    value={teamMemberId}
                    onChange={(e) => setTeamMemberId(e.target.value)}
                    className={selectClass}
                    disabled={teamMembers.length === 0}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {m.role ? ` · ${m.role}` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/55"
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="np-type" className={labelClass}>
                Project type
              </label>
              <div className="relative">
                <select
                  id="np-type"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className={selectClass}
                >
                  {LEAD_PROJECT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/55"
                  aria-hidden
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="np-budget" className={labelClass}>
                  Budget (USD)
                </label>
                <input
                  id="np-budget"
                  type="text"
                  inputMode="decimal"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. 25000"
                />
              </div>
              <div>
                <label htmlFor="np-website" className={labelClass}>
                  Website
                </label>
                <input
                  id="np-website"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={fieldClass}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="np-end" className={labelClass}>
                Expected end date
              </label>
              <CrmPopoverDateField
                id="np-end"
                value={endDate}
                onChange={setEndDate}
                triggerClassName={`${fieldClass} relative flex min-h-[2.625rem] items-center`}
              />
              <p className="mt-1.5 text-xs text-text-secondary">
                Optional. If you skip this, the project shows as{" "}
                <span className="font-medium text-text-primary">TBD</span>.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              Add project
            </button>
          </div>
        </form>
      </div>
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
