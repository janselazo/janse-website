import {
  defaultProjectWorkspace,
  type ProjectWorkspace,
} from "@/lib/crm/project-workspace-types";

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
    tasks: Array.isArray(w.tasks) ? w.tasks : [],
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
