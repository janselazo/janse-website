import type { MockSprint, TaskStatus } from "@/lib/crm/mock-data";

/** Sprint row stored per project (same shape as MockSprint). */
export type WorkspaceSprint = MockSprint;

export interface WorkspaceTask {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  assigneeId: string | null;
  /** null = backlog only */
  sprintId: string | null;
  startDate: string;
  endDate: string;
  progress?: number;
  estimateHours?: number;
  priority?: "low" | "medium" | "high";
}

export type RequestStatus = "new" | "in_review" | "done";

export interface WorkspaceRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
}

export interface ScopeSection {
  id: string;
  title: string;
  lines: string[];
}

export interface WorkspaceMeeting {
  id: string;
  title: string;
  startsAt: string;
  link?: string;
  notes?: string;
}

export type ResourceKind = "doc" | "design" | "repo" | "other";

export interface WorkspaceResource {
  id: string;
  label: string;
  url: string;
  kind: ResourceKind;
}

export interface ProjectWorkspace {
  sprints: WorkspaceSprint[];
  tasks: WorkspaceTask[];
  requests: WorkspaceRequest[];
  scopeSections: ScopeSection[];
  meetings: WorkspaceMeeting[];
  resources: WorkspaceResource[];
}

export function defaultProjectWorkspace(): ProjectWorkspace {
  return {
    sprints: [],
    tasks: [],
    requests: [],
    scopeSections: [],
    meetings: [],
    resources: [],
  };
}
