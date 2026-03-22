"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  getProjectById,
  getSprintsForProject,
  getTasksForSprint,
  getTeamById,
  getMemberById,
  PLAN_COLORS,
  PLAN_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  type TaskStatus,
  type MockTask,
} from "@/lib/crm/mock-data";
import KanbanBoard, { type KanbanColumn } from "@/components/crm/KanbanBoard";
import TabBar, { type Tab } from "@/components/crm/TabBar";

const tabs: Tab[] = [
  { id: "sprint-board", label: "Sprint Board" },
  { id: "backlog", label: "Backlog" },
  { id: "requests", label: "Requests" },
  { id: "timeline", label: "Timeline" },
  { id: "scope", label: "Scope Requirements" },
  { id: "meetings", label: "Meetings" },
  { id: "resources", label: "Resources" },
];

const statusOrder: TaskStatus[] = [
  "not_started",
  "action_started",
  "in_progress",
  "test_qa",
  "completed",
];

type Props = { params: Promise<{ id: string }> };

export default function ProjectDetailPage({ params }: Props) {
  const { id } = use(params);
  const project = getProjectById(id);
  const [activeTab, setActiveTab] = useState("sprint-board");

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Project not found.</p>
        <Link href="/projects" className="mt-2 text-sm text-accent hover:underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  const team = getTeamById(project.teamId);
  const sprints = getSprintsForProject(project.id);
  const currentSprint = sprints.find((s) => s.isCurrent) ?? sprints[0];

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-white px-8 py-3 text-sm text-text-secondary">
        <Link href="/projects" className="hover:text-accent">
          Projects
        </Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-text-primary">{project.title}</span>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-5">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="heading-display text-xl font-bold text-text-primary">
            {project.title}
          </h1>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <MetaField label="Plan">
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: PLAN_COLORS[project.plan] }}
            >
              {PLAN_LABELS[project.plan]}
            </span>
          </MetaField>
          <MetaField label="Team">
            <span className="font-medium text-text-primary">{team?.name ?? "—"}</span>
          </MetaField>
          <MetaField label="Expected End Date">
            <span className="font-medium text-text-primary">
              {project.expectedEndDate}
            </span>
          </MetaField>
          {project.figmaLink && (
            <MetaField label="Figma Link">
              <span className="text-accent">Add</span>
            </MetaField>
          )}
          {project.lovableLink && (
            <MetaField label="Lovable Link">
              <span className="text-accent">Add</span>
            </MetaField>
          )}
          {project.slackChannel && (
            <MetaField label="Slack Channel">
              <span className="text-accent">Open ↗</span>
            </MetaField>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-8">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === "sprint-board" && currentSprint ? (
          <SprintBoard
            sprint={currentSprint}
            projectId={project.id}
            sprintsInMilestone={
              sprints.filter((s) => s.milestone === currentSprint.milestone).length
            }
          />
        ) : activeTab === "sprint-board" && !currentSprint ? (
          <EmptyTab message="No sprints yet. Create one to get started." />
        ) : (
          <EmptyTab message={`${tabs.find((t) => t.id === activeTab)?.label ?? ""} content coming soon.`} />
        )}
      </div>
    </div>
  );
}

function SprintBoard({
  sprint,
  projectId,
  sprintsInMilestone,
}: {
  sprint: (typeof import("@/lib/crm/mock-data"))["sprints"][number];
  projectId: string;
  sprintsInMilestone: number;
}) {
  const sprintTasks = getTasksForSprint(sprint.id);

  const columns: KanbanColumn<MockTask>[] = statusOrder.map((status) => ({
    id: status,
    label: TASK_STATUS_LABELS[status],
    color: TASK_STATUS_COLORS[status],
    items: sprintTasks.filter((t) => t.status === status),
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <h2 className="text-lg font-bold text-text-primary">Sprint Board</h2>
        <MetaField label="Current Sprint">
          <span className="font-medium text-text-primary">{sprint.name}</span>
        </MetaField>
        <MetaField label="Expected End Date">
          <span className="font-medium text-text-primary">{sprint.endDate}</span>
        </MetaField>
        <MetaField label="Milestone">
          <span className="font-medium text-text-primary">{sprint.milestone} ›</span>
        </MetaField>
        <MetaField label="Sprints in Milestone">
          <span className="font-medium text-text-primary">{sprintsInMilestone}</span>
        </MetaField>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1.5 text-text-secondary hover:bg-surface"
        >
          Filter
        </button>
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1.5 text-text-secondary hover:bg-surface"
        >
          Complete Sprint
        </button>
      </div>

      <div className="mt-4">
        <KanbanBoard
          columns={columns}
          renderCard={(task) => <TaskCard task={task} />}
          onAddNew={() => {}}
        />
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: MockTask }) {
  const assignee = task.assigneeId ? getMemberById(task.assigneeId) : null;
  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
      <p className="text-sm font-medium text-text-primary">{task.title}</p>
      {assignee && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
            {assignee.avatarFallback}
          </span>
          <span className="text-xs text-text-secondary">{assignee.name}</span>
        </div>
      )}
    </div>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-white py-20">
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}
