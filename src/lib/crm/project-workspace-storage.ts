import type { TaskStatus } from "@/lib/crm/mock-data";
import {
  defaultProjectWorkspace,
  type ProjectWorkspace,
  type WorkspaceTask,
  type WorkspaceTaskAttachment,
  type WorkspaceTaskComment,
  type WorkspaceTaskSubtask,
} from "@/lib/crm/project-workspace-types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeComment(raw: unknown): WorkspaceTaskComment | null {
  if (!isRecord(raw)) return null;
  const id = String(raw.id ?? "");
  if (!id) return null;
  return {
    id,
    authorName: String(raw.authorName ?? "Unknown"),
    body: String(raw.body ?? ""),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

function normalizeSubtask(raw: unknown): WorkspaceTaskSubtask | null {
  if (!isRecord(raw)) return null;
  const id = String(raw.id ?? "");
  if (!id) return null;
  return {
    id,
    title: String(raw.title ?? ""),
    done: Boolean(raw.done),
  };
}

function normalizeAttachment(raw: unknown): WorkspaceTaskAttachment | null {
  if (!isRecord(raw)) return null;
  const id = String(raw.id ?? "");
  if (!id) return null;
  return {
    id,
    name: String(raw.name ?? "File"),
    url: raw.url != null ? String(raw.url) : undefined,
  };
}

export function normalizeWorkspaceTask(raw: unknown): WorkspaceTask | null {
  if (!isRecord(raw)) return null;
  const id = String(raw.id ?? "");
  const projectId = String(raw.projectId ?? "");
  if (!id || !projectId) return null;

  const status = (raw.status as TaskStatus) || "not_started";
  const commentsIn = Array.isArray(raw.comments)
    ? raw.comments.map(normalizeComment).filter(Boolean) as WorkspaceTaskComment[]
    : [];
  const subtasksIn = Array.isArray(raw.subtasks)
    ? raw.subtasks.map(normalizeSubtask).filter(Boolean) as WorkspaceTaskSubtask[]
    : [];
  const attachmentsIn = Array.isArray(raw.attachments)
    ? raw.attachments.map(normalizeAttachment).filter(Boolean) as WorkspaceTaskAttachment[]
    : [];
  const assigneeIdsIn = Array.isArray(raw.assigneeIds)
    ? raw.assigneeIds.map((x) => String(x)).filter(Boolean)
    : [];
  const milestoneTagsIn = Array.isArray(raw.milestoneTags)
    ? raw.milestoneTags.map((x) => String(x)).filter(Boolean)
    : [];

  const assigneeId =
    raw.assigneeId != null && String(raw.assigneeId)
      ? String(raw.assigneeId)
      : assigneeIdsIn[0] ?? null;

  const assigneeIdsOut =
    assigneeIdsIn.length > 0
      ? assigneeIdsIn
      : assigneeId
        ? [assigneeId]
        : undefined;

  const today = new Date().toISOString().slice(0, 10);
  const startDate = String(raw.startDate ?? today);
  const endDate = String(raw.endDate ?? startDate);

  const sprintIdRaw = raw.sprintId;
  const sprintId =
    sprintIdRaw === null || sprintIdRaw === undefined || sprintIdRaw === ""
      ? null
      : String(sprintIdRaw);

  return {
    id,
    projectId,
    title: String(raw.title ?? "Untitled"),
    status,
    assigneeId,
    sprintId,
    startDate,
    endDate,
    progress: typeof raw.progress === "number" ? raw.progress : 0,
    estimateHours: typeof raw.estimateHours === "number" ? raw.estimateHours : 1,
    priority:
      raw.priority === "low" || raw.priority === "medium" || raw.priority === "high"
        ? raw.priority
        : undefined,
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    comments: commentsIn.length ? commentsIn : undefined,
    subtasks: subtasksIn.length ? subtasksIn : undefined,
    attachments: attachmentsIn.length ? attachmentsIn : undefined,
    assigneeIds: assigneeIdsOut,
    milestoneTags: milestoneTagsIn.length ? milestoneTagsIn : undefined,
    startTime: typeof raw.startTime === "string" ? raw.startTime : undefined,
    endTime: typeof raw.endTime === "string" ? raw.endTime : undefined,
  };
}

export const CRM_PROJECT_WORKSPACE_KEY = "crm_project_workspace_v1";

export const CRM_PROJECT_WORKSPACE_EVENT = "crm-project-workspace-changed";

type WorkspaceMap = Record<string, ProjectWorkspace>;

function readAll(): WorkspaceMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CRM_PROJECT_WORKSPACE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return {};
    return data as WorkspaceMap;
  } catch {
    return {};
  }
}

function writeAll(map: WorkspaceMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CRM_PROJECT_WORKSPACE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(CRM_PROJECT_WORKSPACE_EVENT));
  } catch {
    /* ignore */
  }
}

export function readProjectWorkspace(projectId: string): ProjectWorkspace {
  const all = readAll();
  const w = all[projectId];
  if (!w) return defaultProjectWorkspace();
  return {
    ...defaultProjectWorkspace(),
    ...w,
    sprints: Array.isArray(w.sprints) ? w.sprints : [],
    tasks: Array.isArray(w.tasks)
      ? w.tasks
          .map((t) => normalizeWorkspaceTask(t))
          .filter((t): t is WorkspaceTask => t != null)
      : [],
    requests: Array.isArray(w.requests) ? w.requests : [],
    scopeSections: Array.isArray(w.scopeSections) ? w.scopeSections : [],
    meetings: Array.isArray(w.meetings) ? w.meetings : [],
    resources: Array.isArray(w.resources) ? w.resources : [],
  };
}

export function saveProjectWorkspace(
  projectId: string,
  workspace: ProjectWorkspace
) {
  const all = readAll();
  all[projectId] = workspace;
  writeAll(all);
}

export function newEntityId(prefix: string): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
