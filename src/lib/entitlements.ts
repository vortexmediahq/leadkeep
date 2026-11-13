import type { Lead } from "@/lib/types";

/** Everything about "who gets what" lives here, so changing a limit or a price is a one-line edit. */
export type Tier = "free" | "care" | "growth";

export const FREE_LEAD_LIMIT = 10;
export const FOUNDING_SPOTS = 20;
/** Testers keep full access until this moment (end of 30 Nov 2026, South Africa time). */
export const TESTER_ACCESS_ENDS = "2026-11-30T21:59:59.000Z";
/** Show the "your free access ends soon" reminder this many days before. */
export const TESTER_REMINDER_DAYS = 7;

export type FeatureKey =
  | "emailAlerts"
  | "csvExport"
  | "customBranding"
  | "aiQuotes"
  | "sourceDashboard"
  | "monthlyReport";

export type Access = {
  tier: Tier;
  /** Leads whose details are visible. Infinity = all of them. */
  leadLimit: number;
  /** How many questionnaires can be saved. */
  questionnaireLimit: number;
  features: Record<FeatureKey, boolean>;
};

const NONE: Record<FeatureKey, boolean> = {
  emailAlerts: false,
  csvExport: false,
  customBranding: false,
  aiQuotes: false,
  sourceDashboard: false,
  monthlyReport: false,
};

export const ACCESS: Record<Tier, Access> = {
  free: { tier: "free", leadLimit: FREE_LEAD_LIMIT, questionnaireLimit: 1, features: { ...NONE } },
  care: {
    tier: "care",
    leadLimit: Infinity,
    questionnaireLimit: 3,
    features: { ...NONE, emailAlerts: true, csvExport: true, customBranding: true, aiQuotes: true },
  },
  growth: {
    tier: "growth",
    leadLimit: Infinity,
    questionnaireLimit: 10,
    features: { emailAlerts: true, csvExport: true, customBranding: true, aiQuotes: true, sourceDashboard: true, monthlyReport: true },
  },
};

/** What the owner sees on the pricing page. `soon` marks things that are promised but not built yet. */
export const PRICES = {
  care: { normal: 49, founding: 29 },
  growth: { normal: 99, founding: 69 },
} as const;

export type Entitlements = {
  /** false = the database update hasn't been applied, so nothing is limited (safe default). */
  ready: boolean;
  tier: Tier;
  founding: boolean;
  admin: boolean;
  fullAccessUntil: string | null;
  status: "active" | "cancelling" | "attention" | "none";
  periodEnd: string | null;
};

export const NO_LIMITS: Entitlements = {
  ready: false,
  tier: "growth",
  founding: false,
  admin: false,
  fullAccessUntil: null,
  status: "none",
  periodEnd: null,
};

const TIERS: Tier[] = ["free", "care", "growth"];
const STATUSES = ["active", "cancelling", "attention", "none"] as const;

export function toEntitlements(raw: unknown): Entitlements | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const tier = TIERS.includes(value.tier as Tier) ? (value.tier as Tier) : "free";
  return {
    ready: true,
    tier,
    founding: value.founding === true,
    admin: value.admin === true,
    fullAccessUntil: typeof value.fullAccessUntil === "string" ? value.fullAccessUntil : null,
    status: STATUSES.includes(value.status as (typeof STATUSES)[number]) ? (value.status as Entitlements["status"]) : "none",
    periodEnd: typeof value.periodEnd === "string" ? value.periodEnd : null,
  };
}

export function hasTesterAccess(e: Entitlements, now: Date = new Date()): boolean {
  if (!e.fullAccessUntil) return false;
  const until = Date.parse(e.fullAccessUntil);
  return !Number.isNaN(until) && until > now.getTime();
}

/** The tier that actually applies right now: the owner (admin) and testers get everything. */
export function effectiveTier(e: Entitlements, now: Date = new Date()): Tier {
  if (!e.ready || e.admin || hasTesterAccess(e, now)) return "growth";
  return e.tier;
}

export function accessFor(e: Entitlements, now: Date = new Date()): Access {
  return ACCESS[effectiveTier(e, now)];
}

/** Days left of tester access if the reminder should show (inside the last week), otherwise null. */
export function testerReminderDays(e: Entitlements, now: Date = new Date()): number | null {
  if (e.admin || e.tier !== "free" || !hasTesterAccess(e, now)) return null;
  const left = Math.ceil((Date.parse(e.fullAccessUntil as string) - now.getTime()) / 86_400_000);
  return left <= TESTER_REMINDER_DAYS ? left : null;
}

export function foundingOpen(spotsLeft: number | null): boolean {
  return spotsLeft === null || spotsLeft > 0;
}

export type GatedLead = Lead & { locked: boolean };

/** Shown (blurred) in place of a locked lead's details. Never real data. */
export const LOCKED_PLACEHOLDER = {
  name: "Hidden lead",
  line: "Upgrade to see who this is and how to reach them",
};

export function maskLead(lead: Lead): GatedLead {
  return {
    ...lead,
    locked: true,
    name: LOCKED_PLACEHOLDER.name,
    phone: "",
    email: "",
    address: "",
    jobType: "",
    description: "",
    urgency: "",
    preferredTime: "",
    propertyType: "",
    budget: "",
    accessNotes: "",
    responses: [],
    quote: null,
    quoteUpdatedAt: null,
  };
}

/**
 * The first `leadLimit` leads (oldest first) keep their details. Every newer lead is still saved
 * and counted, but its details stay hidden until the owner upgrades. Order of the input is kept.
 */
export function gateLeads(leads: Lead[], access: Access): GatedLead[] {
  if (!Number.isFinite(access.leadLimit)) return leads.map((lead) => ({ ...lead, locked: false }));
  const open = new Set(
    [...leads]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
      .slice(0, access.leadLimit)
      .map((lead) => lead.id),
  );
  return leads.map((lead) => (open.has(lead.id) ? { ...lead, locked: false } : maskLead(lead)));
}

export const lockedCount = (leads: GatedLead[]) => leads.filter((lead) => lead.locked).length;

export function canAddQuestionnaire(access: Access, count: number): boolean {
  return count < access.questionnaireLimit;
}

const csvCell = (value: string) => (/[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** Leads as CSV text. Locked leads are never included. A leading apostrophe stops spreadsheet formulas. */
export function leadsToCsv(leads: GatedLead[]): string {
  const safe = (value: string) => (/^[=+\-@]/.test(value) ? `'${value}` : value);
  const header = ["Received", "Name", "Phone", "Email", "Source", "Status", "Job", "Details"];
  const rows = leads
    .filter((lead) => !lead.locked)
    .map((lead) =>
      [lead.createdAt, lead.name, lead.phone, lead.email, lead.source, lead.status, lead.jobType, lead.description]
        .map((cell) => csvCell(safe(cell)))
        .join(","),
    );
  return `\uFEFF${[header.join(","), ...rows].join("\r\n")}`;
}
