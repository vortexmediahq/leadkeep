export type Plan = "free" | "pro";

export type Allowance = { plan: Plan; used: number; limit: number };

export const FREE_QUOTE_LIMIT = 5;

export function toAllowance(raw: unknown): Allowance | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as { plan?: unknown; used?: unknown; limit?: unknown };
  if (typeof value.used !== "number") return null;
  return {
    plan: value.plan === "pro" ? "pro" : "free",
    used: value.used,
    limit: typeof value.limit === "number" ? value.limit : FREE_QUOTE_LIMIT,
  };
}

export function quotesLeft(allowance: Allowance) {
  return Math.max(0, allowance.limit - allowance.used);
}
