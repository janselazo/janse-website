// Shared mock data for all CRM pages. Will be replaced with Supabase queries later.

// ── Types ──────────────────────────────────────────────────────────────────

export type PlanStage = "pipeline" | "planning" | "mvp" | "growth";
export type TaskStatus =
  | "not_started"
  | "action_started"
  | "in_progress"
  | "test_qa"
  | "completed";
export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export interface MockProject {
  id: string;
  title: string;
  plan: PlanStage;
  teamId: string;
  color: string;
  expectedEndDate: string;
  figmaLink?: string;
  lovableLink?: string;
  slackChannel?: string;
  sprintCount: number;
  taskCount: number;
}

export interface MockSprint {
  id: string;
  projectId: string;
  name: string;
  milestone: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface MockTask {
  id: string;
  sprintId: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  assigneeId: string | null;
}

export interface MockTeamMember {
  id: string;
  name: string;
  role: string;
  teamId: string;
  utilization: number;
  activeProjects: number;
  avatarFallback: string;
}

export interface MockTeam {
  id: string;
  name: string;
  color: string;
}

export interface MockLead {
  id: string;
  name: string;
  email: string;
  company: string;
  stage: LeadStage;
  source: string;
  createdAt: string;
}

// ── Data ───────────────────────────────────────────────────────────────────

export const PLAN_COLORS: Record<PlanStage, string> = {
  pipeline: "#ef4444",
  planning: "#f59e0b",
  mvp: "#3b82f6",
  growth: "#10b981",
};

export const PLAN_LABELS: Record<PlanStage, string> = {
  pipeline: "Pipeline",
  planning: "Planning",
  mvp: "MVP",
  growth: "Growth",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not Yet Started",
  action_started: "Action Started",
  in_progress: "In Progress",
  test_qa: "Test/QA",
  completed: "Completed",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: "#6b7280",
  action_started: "#f59e0b",
  in_progress: "#3b82f6",
  test_qa: "#ef4444",
  completed: "#10b981",
};

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const teams: MockTeam[] = [
  { id: "team-1", name: "Core", color: "#6b7280" },
  { id: "team-2", name: "UX", color: "#8b5cf6" },
  { id: "team-3", name: "Hamza", color: "#3b82f6" },
  { id: "team-4", name: "Harrison", color: "#10b981" },
];

export const teamMembers: MockTeamMember[] = [
  { id: "m-1", name: "Jan Selazo", role: "Founder / Lead", teamId: "team-1", utilization: 210, activeProjects: 5, avatarFallback: "JS" },
  { id: "m-2", name: "Hamza Ali", role: "Full-stack Dev", teamId: "team-3", utilization: 180, activeProjects: 3, avatarFallback: "HA" },
  { id: "m-3", name: "Harrison Cole", role: "Full-stack Dev", teamId: "team-4", utilization: 160, activeProjects: 3, avatarFallback: "HC" },
  { id: "m-4", name: "Sofia Reyes", role: "UX Designer", teamId: "team-2", utilization: 95, activeProjects: 4, avatarFallback: "SR" },
  { id: "m-5", name: "Marcus Chen", role: "Frontend Dev", teamId: "team-1", utilization: 75, activeProjects: 2, avatarFallback: "MC" },
  { id: "m-6", name: "Priya Sharma", role: "Backend Dev", teamId: "team-1", utilization: 88, activeProjects: 2, avatarFallback: "PS" },
  { id: "m-7", name: "Alex Torres", role: "QA Engineer", teamId: "team-1", utilization: 65, activeProjects: 3, avatarFallback: "AT" },
];

export const projects: MockProject[] = [
  { id: "proj-1", title: "Survival Sports", plan: "pipeline", teamId: "team-2", color: "#8b5cf6", expectedEndDate: "2026-05-15", sprintCount: 0, taskCount: 0 },
  { id: "proj-2", title: "FutureCast", plan: "pipeline", teamId: "team-2", color: "#8b5cf6", expectedEndDate: "2026-06-01", sprintCount: 0, taskCount: 0 },
  { id: "proj-3", title: "HealthTruth", plan: "mvp", teamId: "team-3", color: "#3b82f6", expectedEndDate: "2025-12-04", figmaLink: "#", lovableLink: "#", slackChannel: "#", sprintCount: 1, taskCount: 8 },
  { id: "proj-4", title: "SaleLexi", plan: "growth", teamId: "team-4", color: "#10b981", expectedEndDate: "2026-03-30", figmaLink: "#", sprintCount: 3, taskCount: 15 },
  { id: "proj-5", title: "Coral", plan: "growth", teamId: "team-1", color: "#ef4444", expectedEndDate: "2026-04-20", sprintCount: 2, taskCount: 12 },
  { id: "proj-6", title: "ML Merge", plan: "planning", teamId: "team-1", color: "#f59e0b", expectedEndDate: "2026-07-01", sprintCount: 0, taskCount: 0 },
];

export const sprints: MockSprint[] = [
  { id: "spr-1", projectId: "proj-3", name: "Sprint 1", milestone: "MVP", startDate: "2025-11-20", endDate: "2025-12-04", isCurrent: true },
  { id: "spr-2", projectId: "proj-4", name: "Sprint 1", milestone: "Growth", startDate: "2026-01-06", endDate: "2026-01-20", isCurrent: false },
  { id: "spr-3", projectId: "proj-4", name: "Sprint 2", milestone: "Growth", startDate: "2026-01-21", endDate: "2026-02-04", isCurrent: false },
  { id: "spr-4", projectId: "proj-4", name: "Sprint 3", milestone: "Growth", startDate: "2026-02-05", endDate: "2026-02-19", isCurrent: true },
  { id: "spr-5", projectId: "proj-5", name: "Sprint 1", milestone: "Growth", startDate: "2026-02-01", endDate: "2026-02-15", isCurrent: false },
  { id: "spr-6", projectId: "proj-5", name: "Sprint 2", milestone: "Growth", startDate: "2026-02-16", endDate: "2026-03-02", isCurrent: true },
];

export const tasks: MockTask[] = [
  // HealthTruth – Sprint 1
  { id: "t-1", sprintId: "spr-1", projectId: "proj-3", title: "User auth flow", status: "completed", assigneeId: "m-2" },
  { id: "t-2", sprintId: "spr-1", projectId: "proj-3", title: "Dashboard layout", status: "completed", assigneeId: "m-4" },
  { id: "t-3", sprintId: "spr-1", projectId: "proj-3", title: "API integration", status: "in_progress", assigneeId: "m-2" },
  { id: "t-4", sprintId: "spr-1", projectId: "proj-3", title: "Health data schema", status: "in_progress", assigneeId: "m-6" },
  { id: "t-5", sprintId: "spr-1", projectId: "proj-3", title: "Onboarding screens", status: "action_started", assigneeId: "m-4" },
  { id: "t-6", sprintId: "spr-1", projectId: "proj-3", title: "Push notifications", status: "not_started", assigneeId: null },
  { id: "t-7", sprintId: "spr-1", projectId: "proj-3", title: "Error handling", status: "test_qa", assigneeId: "m-7" },
  { id: "t-8", sprintId: "spr-1", projectId: "proj-3", title: "Landing page", status: "not_started", assigneeId: "m-5" },
  // SaleLexi – Sprint 3
  { id: "t-9", sprintId: "spr-4", projectId: "proj-4", title: "AI prompt tuning", status: "in_progress", assigneeId: "m-3" },
  { id: "t-10", sprintId: "spr-4", projectId: "proj-4", title: "CRM export", status: "action_started", assigneeId: "m-6" },
  { id: "t-11", sprintId: "spr-4", projectId: "proj-4", title: "Billing dashboard", status: "not_started", assigneeId: "m-5" },
  { id: "t-12", sprintId: "spr-4", projectId: "proj-4", title: "Email templates", status: "completed", assigneeId: "m-3" },
  // Coral – Sprint 2
  { id: "t-13", sprintId: "spr-6", projectId: "proj-5", title: "User analytics", status: "in_progress", assigneeId: "m-5" },
  { id: "t-14", sprintId: "spr-6", projectId: "proj-5", title: "Performance audit", status: "test_qa", assigneeId: "m-7" },
  { id: "t-15", sprintId: "spr-6", projectId: "proj-5", title: "Mobile responsive", status: "action_started", assigneeId: "m-4" },
];

export const leads: MockLead[] = [
  { id: "l-1", name: "David Kim", email: "david@techstart.io", company: "TechStart", stage: "new", source: "Website", createdAt: "2026-03-18" },
  { id: "l-2", name: "Emma Wilson", email: "emma@greenleaf.co", company: "GreenLeaf", stage: "new", source: "Referral", createdAt: "2026-03-17" },
  { id: "l-3", name: "Carlos Ruiz", email: "carlos@nexgen.com", company: "NexGen Labs", stage: "contacted", source: "LinkedIn", createdAt: "2026-03-15" },
  { id: "l-4", name: "Aisha Patel", email: "aisha@finova.io", company: "Finova", stage: "qualified", source: "Cold outreach", createdAt: "2026-03-10" },
  { id: "l-5", name: "Ryan O'Brien", email: "ryan@buildright.dev", company: "BuildRight", stage: "proposal", source: "Conference", createdAt: "2026-03-05" },
  { id: "l-6", name: "Lisa Chang", email: "lisa@orbital.ai", company: "Orbital AI", stage: "won", source: "Referral", createdAt: "2026-02-20" },
  { id: "l-7", name: "Jake Morrison", email: "jake@bluewave.co", company: "BlueWave", stage: "lost", source: "Website", createdAt: "2026-02-15" },
  { id: "l-8", name: "Nina Kowalski", email: "nina@dataflow.io", company: "DataFlow", stage: "contacted", source: "LinkedIn", createdAt: "2026-03-12" },
  { id: "l-9", name: "Sam Ahmed", email: "sam@cruxhq.com", company: "Crux HQ", stage: "new", source: "Website", createdAt: "2026-03-19" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getProjectById(id: string) {
  return projects.find((p) => p.id === id);
}

export function getSprintsForProject(projectId: string) {
  return sprints.filter((s) => s.projectId === projectId);
}

export function getTasksForSprint(sprintId: string) {
  return tasks.filter((t) => t.sprintId === sprintId);
}

export function getTeamById(id: string) {
  return teams.find((t) => t.id === id);
}

export function getMemberById(id: string) {
  return teamMembers.find((m) => m.id === id);
}

export function getMembersForTeam(teamId: string) {
  return teamMembers.filter((m) => m.teamId === teamId);
}
