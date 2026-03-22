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
  | "not_qualified";

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
  email: string;
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
  not_qualified: "Not Qualified",
};

export const teams: MockTeam[] = [
  { id: "team-1", name: "Core", color: "#6b7280" },
  { id: "team-2", name: "UX", color: "#8b5cf6" },
  { id: "team-3", name: "Hamza", color: "#3b82f6" },
  { id: "team-4", name: "Harrison", color: "#10b981" },
];

export const teamMembers: MockTeamMember[] = [
  { id: "m-1", name: "Jan Selazo", email: "jan@agency.co", role: "Founder / Lead", teamId: "team-1", utilization: 210, activeProjects: 5, avatarFallback: "JS" },
  { id: "m-2", name: "Hamza Ali", email: "hamza@agency.co", role: "Full-stack Dev", teamId: "team-3", utilization: 180, activeProjects: 3, avatarFallback: "HA" },
  { id: "m-3", name: "Harrison Cole", email: "harrison@agency.co", role: "Full-stack Dev", teamId: "team-4", utilization: 160, activeProjects: 3, avatarFallback: "HC" },
  { id: "m-4", name: "Sofia Reyes", email: "sofia@agency.co", role: "UX Designer", teamId: "team-2", utilization: 95, activeProjects: 4, avatarFallback: "SR" },
  { id: "m-5", name: "Marcus Chen", email: "marcus@agency.co", role: "Frontend Dev", teamId: "team-1", utilization: 75, activeProjects: 2, avatarFallback: "MC" },
  { id: "m-6", name: "Priya Sharma", email: "priya@agency.co", role: "Backend Dev", teamId: "team-1", utilization: 88, activeProjects: 2, avatarFallback: "PS" },
  { id: "m-7", name: "Alex Torres", email: "alex@agency.co", role: "QA Engineer", teamId: "team-1", utilization: 65, activeProjects: 3, avatarFallback: "AT" },
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
  { id: "l-5", name: "Ryan O'Brien", email: "ryan@buildright.dev", company: "BuildRight", stage: "qualified", source: "Conference", createdAt: "2026-03-05" },
  { id: "l-6", name: "Lisa Chang", email: "lisa@orbital.ai", company: "Orbital AI", stage: "contacted", source: "Referral", createdAt: "2026-02-20" },
  { id: "l-7", name: "Jake Morrison", email: "jake@bluewave.co", company: "BlueWave", stage: "not_qualified", source: "Website", createdAt: "2026-02-15" },
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

// ── Deals ──────────────────────────────────────────────────────────────────

export type DealStage =
  | "prospect"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface MockDeal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: DealStage;
  contactName: string;
  contactEmail: string;
  createdAt: string;
  expectedClose: string;
}

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  prospect: "Prospect",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  prospect: "#6b7280",
  proposal: "#3b82f6",
  negotiation: "#f59e0b",
  closed_won: "#10b981",
  closed_lost: "#ef4444",
};

export const deals: MockDeal[] = [
  { id: "d-1", title: "HealthTruth MVP Build", company: "HealthTruth Inc.", value: 24000, stage: "closed_won", contactName: "Sarah Lin", contactEmail: "sarah@healthtruth.io", createdAt: "2025-10-01", expectedClose: "2025-11-15" },
  { id: "d-2", title: "SaleLexi Growth Phase", company: "SaleLexi Corp", value: 36000, stage: "negotiation", contactName: "Tom Briggs", contactEmail: "tom@salelexi.com", createdAt: "2026-01-10", expectedClose: "2026-03-01" },
  { id: "d-3", title: "Coral Redesign", company: "Coral Labs", value: 18000, stage: "proposal", contactName: "Maya Santos", contactEmail: "maya@coral.dev", createdAt: "2026-02-05", expectedClose: "2026-04-01" },
  { id: "d-4", title: "FutureCast Platform", company: "FutureCast", value: 42000, stage: "prospect", contactName: "Jake Morrison", contactEmail: "jake@futurecast.co", createdAt: "2026-03-01", expectedClose: "2026-06-01" },
  { id: "d-5", title: "NexGen Labs Dashboard", company: "NexGen Labs", value: 15000, stage: "prospect", contactName: "Carlos Ruiz", contactEmail: "carlos@nexgen.com", createdAt: "2026-03-10", expectedClose: "2026-05-15" },
  { id: "d-6", title: "Finova Mobile App", company: "Finova", value: 55000, stage: "proposal", contactName: "Aisha Patel", contactEmail: "aisha@finova.io", createdAt: "2026-02-20", expectedClose: "2026-05-01" },
  { id: "d-7", title: "BlueWave Ecommerce", company: "BlueWave", value: 28000, stage: "closed_lost", contactName: "Nina Kowalski", contactEmail: "nina@bluewave.co", createdAt: "2025-12-01", expectedClose: "2026-02-01" },
  { id: "d-8", title: "Orbital AI Integration", company: "Orbital AI", value: 60000, stage: "negotiation", contactName: "Lisa Chang", contactEmail: "lisa@orbital.ai", createdAt: "2026-01-25", expectedClose: "2026-04-15" },
];

// ── Prospecting ────────────────────────────────────────────────────────────

export interface PlaybookActivity {
  id: string;
  title: string;
  points: number;
  target: number;
  timeEstimate: string;
}

export interface PlaybookCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  activities: PlaybookActivity[];
}

export const playbookCategories: PlaybookCategory[] = [
  {
    id: "cat-1", name: "Cold Outreach", icon: "phone", color: "#10b981",
    activities: [
      { id: "a-1", title: "Call 10 warm leads", points: 10, target: 10, timeEstimate: "45 min" },
      { id: "a-2", title: "Send 15 cold emails to prospects", points: 15, target: 15, timeEstimate: "30 min" },
      { id: "a-3", title: "Follow up with 5 active conversations", points: 5, target: 5, timeEstimate: "20 min" },
    ],
  },
  {
    id: "cat-2", name: "Content Marketing", icon: "pen-line", color: "#3b82f6",
    activities: [
      { id: "a-4", title: "Publish 1 LinkedIn post", points: 5, target: 1, timeEstimate: "20 min" },
      { id: "a-5", title: "Publish 1 case study or blog post", points: 10, target: 1, timeEstimate: "60 min" },
      { id: "a-6", title: "Post 2 project showcases on Instagram", points: 5, target: 2, timeEstimate: "15 min" },
      { id: "a-7", title: "Share 1 behind-the-scenes on Stories", points: 3, target: 1, timeEstimate: "10 min" },
      { id: "a-8", title: "Post 1 thread on X / Twitter", points: 5, target: 1, timeEstimate: "15 min" },
    ],
  },
  {
    id: "cat-3", name: "Paid Ads", icon: "megaphone", color: "#f59e0b",
    activities: [
      { id: "a-9", title: "Launch / manage 1 Meta Ads campaign", points: 10, target: 1, timeEstimate: "30 min" },
      { id: "a-10", title: "Launch / manage 1 Google Ads campaign", points: 10, target: 1, timeEstimate: "30 min" },
    ],
  },
  {
    id: "cat-4", name: "Partnerships", icon: "handshake", color: "#8b5cf6",
    activities: [
      { id: "a-11", title: "Reach out to 1 referral partner", points: 5, target: 1, timeEstimate: "15 min" },
      { id: "a-12", title: "Attend 1 networking event or meetup", points: 10, target: 1, timeEstimate: "120 min" },
    ],
  },
  {
    id: "cat-5", name: "Referrals", icon: "gift", color: "#ef4444",
    activities: [
      { id: "a-13", title: "Ask 2 existing clients for referrals", points: 10, target: 2, timeEstimate: "15 min" },
      { id: "a-14", title: "Request 1 testimonial or Google review", points: 5, target: 1, timeEstimate: "10 min" },
    ],
  },
  {
    id: "cat-6", name: "SEO", icon: "search", color: "#6b7280",
    activities: [
      { id: "a-15", title: "Audit 1 landing page", points: 5, target: 1, timeEstimate: "30 min" },
      { id: "a-16", title: "Publish 1 SEO-optimized blog post", points: 10, target: 1, timeEstimate: "45 min" },
    ],
  },
];

export interface MonthlyGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: "count" | "currency";
  icon: string;
}

export const monthlyGoals: MonthlyGoal[] = [
  { id: "mg-1", title: "New Deals", current: 5, target: 12, unit: "count", icon: "handshake" },
  { id: "mg-2", title: "Revenue", current: 4200, target: 15000, unit: "currency", icon: "dollar-sign" },
];

export type ProspectingTaskType = "follow_up" | "call" | "email" | "text" | "appointment" | "other";
export type ProspectingTaskStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface ProspectingTask {
  id: string;
  title: string;
  type: ProspectingTaskType;
  status: ProspectingTaskStatus;
  dueDate: string;
  linkedLead?: string;
}

export const PROSPECTING_TASK_TYPE_LABELS: Record<ProspectingTaskType, string> = {
  follow_up: "Follow Up",
  call: "Call",
  email: "Email",
  text: "Text",
  appointment: "Appointment",
  other: "Other",
};

export const prospectingTasks: ProspectingTask[] = [
  { id: "pt-1", title: "Follow up with Aisha Patel on Finova proposal", type: "follow_up", status: "pending", dueDate: "2026-03-15", linkedLead: "Finova" },
  { id: "pt-2", title: "Follow up with Carlos Ruiz on NexGen scope", type: "follow_up", status: "pending", dueDate: "2026-03-16", linkedLead: "NexGen Labs" },
  { id: "pt-3", title: "Send case study to Jake Morrison", type: "email", status: "completed", dueDate: "2026-03-18" },
  { id: "pt-4", title: "Call Lisa Chang re: Orbital AI timeline", type: "call", status: "in_progress", dueDate: "2026-03-20", linkedLead: "Orbital AI" },
  { id: "pt-5", title: "Schedule intro call with FutureCast team", type: "appointment", status: "pending", dueDate: "2026-03-22", linkedLead: "FutureCast" },
  { id: "pt-6", title: "Text Ryan about BuildRight feedback", type: "text", status: "completed", dueDate: "2026-03-19" },
  { id: "pt-7", title: "Prepare pitch deck for Coral redesign", type: "other", status: "pending", dueDate: "2026-03-21", linkedLead: "Coral Labs" },
  { id: "pt-8", title: "Send contract to SaleLexi for growth phase", type: "email", status: "completed", dueDate: "2026-03-17", linkedLead: "SaleLexi" },
  { id: "pt-9", title: "Follow up with Emma Wilson at GreenLeaf", type: "follow_up", status: "pending", dueDate: "2026-03-14", linkedLead: "GreenLeaf" },
  { id: "pt-10", title: "Email David Kim about TechStart kickoff", type: "email", status: "completed", dueDate: "2026-03-18", linkedLead: "TechStart" },
];
