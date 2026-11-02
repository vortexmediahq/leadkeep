export type Plan = "free" | "pro";

export type PlanStatus = "active" | "non_renewing" | "attention" | "cancelled";

export type Allowance = {
  plan: Plan;
  status: PlanStatus;
  periodEnd: string | null;
  used: number;
  limit: number;
};

export const FREE_QUOTE_LIMIT = 5;

const STATUSES: PlanStatus[] = ["active", "non_renewing", "attention", "cancelled"];

export function toAllowance(raw: unknown): Allowance | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as { plan?: unknown; status?: unknown; periodEnd?: unknown; used?: unknown; limit?: unknown };
  if (typeof value.used !== "number") return null;
  return {
    plan: value.plan === "pro" ? "pro" : "free",
    status: STATUSES.includes(value.status as PlanStatus) ? (value.status as PlanStatus) : "active",
    periodEnd: typeof value.periodEnd === "string" ? value.periodEnd : null,
    used: value.used,
    limit: typeof value.limit === "number" ? value.limit : FREE_QUOTE_LIMIT,
  };
}

export function quotesLeft(allowance: Allowance) {
  return Math.max(0, allowance.limit - allowance.used);
}
