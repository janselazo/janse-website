"use client";

import { useState } from "react";
import { teamMembers, teams, getTeamById } from "@/lib/crm/mock-data";

type ViewMode = "all" | "by-team";

export default function TeamPage() {
  const [view, setView] = useState<ViewMode>("all");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-2xl font-bold text-text-primary">
            Team
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {teamMembers.length} members across {teams.length} teams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleButton active={view === "all"} onClick={() => setView("all")}>
            All Members
          </ToggleButton>
          <ToggleButton
            active={view === "by-team"}
            onClick={() => setView("by-team")}
          >
            By Team
          </ToggleButton>
        </div>
      </div>

      <div className="mt-8">
        {view === "all" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {teams.map((team) => {
              const members = teamMembers.filter(
                (m) => m.teamId === team.id
              );
              if (members.length === 0) return null;
              return (
                <div key={team.id}>
                  <div className="mb-4 flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <h2 className="text-lg font-bold text-text-primary">
                      {team.name}
                    </h2>
                    <span className="text-sm text-text-secondary">
                      · {members.length} members
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({
  member,
}: {
  member: (typeof teamMembers)[number];
}) {
  const team = getTeamById(member.teamId);
  const utilizationColor =
    member.utilization > 100
      ? "bg-red-500"
      : member.utilization >= 81
        ? "bg-green-500"
        : "bg-amber-400";

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
          {member.avatarFallback}
        </div>
        <div>
          <p className="font-medium text-text-primary">{member.name}</p>
          <p className="text-xs text-text-secondary">{member.role}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Team</span>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: team?.color }}
            />
            <span className="font-medium text-text-primary">
              {team?.name ?? "—"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Active projects</span>
          <span className="font-medium text-text-primary">
            {member.activeProjects}
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Utilization</span>
            <span
              className={`font-medium ${
                member.utilization > 100
                  ? "text-red-600"
                  : "text-text-primary"
              }`}
            >
              {member.utilization}%
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className={`h-full rounded-full ${utilizationColor}`}
              style={{ width: `${Math.min(member.utilization, 100)}%` }}
            />
          </div>
        </div>
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
