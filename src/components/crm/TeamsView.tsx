"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  FolderKanban,
  Mail,
  ChevronDown,
} from "lucide-react";
import {
  type MockTeamMember,
  type MockTeam,
  type MockProject,
  type MockTask,
  teams as allTeams,
  projects as allProjects,
  tasks as allTasks,
  PLAN_LABELS,
  PLAN_COLORS,
} from "@/lib/crm/mock-data";

const ROLE_COLORS: Record<string, string> = {
  "Founder / Lead": "bg-amber-100 text-amber-800",
  "Full-stack Dev": "bg-blue-100 text-blue-800",
  "UX Designer": "bg-violet-100 text-violet-800",
  "Frontend Dev": "bg-sky-100 text-sky-800",
  "Backend Dev": "bg-emerald-100 text-emerald-800",
  "QA Engineer": "bg-orange-100 text-orange-800",
};

function getRoleClasses(role: string) {
  return ROLE_COLORS[role] ?? "bg-gray-100 text-gray-700";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAssignedProjects(
  member: MockTeamMember,
  projects: MockProject[],
  tasks: MockTask[]
) {
  const projectIds = new Set<string>();
  // Projects the member is on via teamId
  for (const p of projects) {
    if (p.teamId === member.teamId) projectIds.add(p.id);
  }
  // Projects the member has tasks assigned to them
  for (const t of tasks) {
    if (t.assigneeId === member.id) projectIds.add(t.projectId);
  }
  return projects.filter((p) => projectIds.has(p.id));
}

export default function TeamsView({
  members: initialMembers,
}: {
  members: MockTeamMember[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (teamFilter !== "all" && m.teamId !== teamFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    });
  }, [members, search, teamFilter]);

  function handleAdd(member: MockTeamMember) {
    setMembers((prev) => [...prev, member]);
    setModalOpen(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Team</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your agency team and view project assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-border bg-white py-1.5 pl-8 pr-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-2">
        <FilterPill
          active={teamFilter === "all"}
          onClick={() => setTeamFilter("all")}
        >
          All ({members.length})
        </FilterPill>
        {allTeams.map((t) => {
          const count = members.filter((m) => m.teamId === t.id).length;
          return (
            <FilterPill
              key={t.id}
              active={teamFilter === t.id}
              onClick={() => setTeamFilter(t.id)}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              {t.name} ({count})
            </FilterPill>
          );
        })}
      </div>

      {/* Member Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => {
          const team = allTeams.find((t) => t.id === m.teamId);
          const assigned = getAssignedProjects(m, allProjects, allTasks);
          const expanded = expandedId === m.id;

          return (
            <div
              key={m.id}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Top row: avatar, name, role */}
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: team?.color ?? "#6b7280" }}
                >
                  {m.avatarFallback}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {m.name}
                  </p>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${getRoleClasses(m.role)}`}
                  >
                    {m.role}
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {m.email}
                </span>
              </div>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary/60">
                    Utilization
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-text-primary">
                    {m.utilization}%
                  </p>
                </div>
                <div className="rounded-xl bg-surface px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary/60">
                    Projects
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-text-primary">
                    {assigned.length}
                  </p>
                </div>
              </div>

              {/* Project assignments */}
              {assigned.length > 0 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expanded ? null : m.id)
                    }
                    className="flex w-full items-center gap-1 text-xs font-medium text-text-secondary hover:text-accent"
                  >
                    <FolderKanban className="h-3 w-3" />
                    Assigned projects
                    <ChevronDown
                      className={`ml-auto h-3 w-3 transition-transform ${expanded ? "" : "-rotate-90"}`}
                    />
                  </button>

                  {expanded && (
                    <div className="mt-2 space-y-1.5">
                      {assigned.map((p) => (
                        <Link
                          key={p.id}
                          href={`/projects/${p.id}`}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-surface"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="truncate font-medium text-text-primary">
                            {p.title}
                          </span>
                          <span
                            className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{
                              backgroundColor: PLAN_COLORS[p.plan],
                            }}
                          >
                            {PLAN_LABELS[p.plan]}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-white py-16 text-center text-sm text-text-secondary">
          No team members found.
        </div>
      )}

      {modalOpen && (
        <NewMemberModal
          onClose={() => setModalOpen(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

function FilterPill({
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
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-white text-text-secondary hover:border-accent/40 hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

function NewMemberModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (m: MockTeamMember) => void;
}) {
  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string) || "New Member";
    onAdd({
      id: `m-${Date.now()}`,
      name,
      email: (fd.get("email") as string) || "",
      role: (fd.get("role") as string) || "Developer",
      teamId: (fd.get("teamId") as string) || allTeams[0].id,
      utilization: 0,
      activeProjects: 0,
      avatarFallback: initials(name),
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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        aria-labelledby="new-member-title"
      >
        <h2
          id="new-member-title"
          className="text-sm font-bold uppercase tracking-wider text-text-secondary"
        >
          Add Team Member
        </h2>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Name
            </label>
            <input name="name" type="text" required className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Role
            </label>
            <input
              name="role"
              type="text"
              placeholder="e.g. Frontend Dev"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Team
            </label>
            <select name="teamId" className={inputClass}>
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Add member
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
