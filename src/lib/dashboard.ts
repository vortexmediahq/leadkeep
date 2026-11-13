import { needsFollowUp } from "./alerts.ts";
import { isFixedPrice, quoteReminder, type LinkKind } from "./quote-flow.ts";
import type { Lead } from "./types.ts";

export const AVG_VALUE_KEY = "leadkeep.avgJobValue";

/** First number in a price like "R650", "R650–R1,200" or "from R500". Null when there isn't one. */
export function priceNumber(price: string): number | null {
  const match = price.replace(/\s(?=\d{3}\b)/g, "").match(/\d[\d,]*(?:\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Average of the saved service prices (the first number of each). Null when no service has a price. */
export function averageServicePrice(services: { price: string }[]): number | null {
  const values = services.map((service) => priceNumber(service.price)).filter((value): value is number => value !== null);
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/** A lead is "left on the table" when it still needs a follow-up: new for a day, or a quote with no reply in 2+ days. */
export function leadsWithoutFollowUp(leads: Lead[], now: Date = new Date()): Lead[] {
  return leads.filter((lead) => lead.status !== "won" && lead.status !== "lost" && lead.quoteState !== "accepted" && (needsFollowUp(lead, now) || quoteReminder(lead, now)));
}

export function moneyLeft(leads: Lead[], avgValue: number | null, now: Date = new Date()): { count: number; amount: number | null } {
  const count = leadsWithoutFollowUp(leads, now).length;
  return { count, amount: avgValue && avgValue > 0 ? Math.round(avgValue * count) : null };
}

export function money(currency: string, amount: number): string {
  return `${currency || "R"}${Math.round(amount).toLocaleString("en-US")}`;
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** Leads per calendar month for the last `months` months, oldest first. */
export function monthlyCounts(leads: Pick<Lead, "createdAt" | "status">[], months = 6, now: Date = new Date()) {
  const slots: { key: string; label: string; leads: number; won: number }[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({ key: monthKey(date), label: date.toLocaleString("en-US", { month: "short" }), leads: 0, won: 0 });
  }
  for (const lead of leads) {
    const created = new Date(lead.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    const slot = slots.find((item) => item.key === monthKey(created));
    if (!slot) continue;
    slot.leads += 1;
    if (lead.status === "won") slot.won += 1;
  }
  return slots;
}

export type DashboardStats = {
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  total: number;
  won: number;
  winRate: number | null;
  quotesSent: number;
  quotesViewed: number;
  quotesAccepted: number;
};

export function dashboardStats(leads: Lead[], now: Date = new Date()): DashboardStats {
  const thisKey = monthKey(now);
  const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  let thisMonth = 0;
  let lastMonth = 0;
  let thisYear = 0;
  for (const lead of leads) {
    const created = new Date(lead.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    const key = monthKey(created);
    if (key === thisKey) thisMonth += 1;
    if (key === lastKey) lastMonth += 1;
    if (created.getFullYear() === now.getFullYear()) thisYear += 1;
  }
  const won = leads.filter((lead) => lead.status === "won" || lead.quoteState === "accepted").length;
  const quoted = leads.filter((lead) => lead.quoteState === "sent" || lead.quoteState === "viewed" || lead.quoteState === "accepted" || lead.status === "quoted");
  return {
    thisMonth,
    lastMonth,
    thisYear,
    total: leads.length,
    won,
    winRate: leads.length ? Math.round((won / leads.length) * 100) : null,
    quotesSent: quoted.length,
    quotesViewed: leads.filter((lead) => lead.quoteState === "viewed" || lead.quoteState === "accepted").length,
    quotesAccepted: leads.filter((lead) => lead.quoteState === "accepted").length,
  };
}

export type AutomationReason = { id: string; label: string; points: number; max: number; tip: string };

const INSTANT_MS = 5 * 60 * 1000;

/**
 * Honest 0-100 score, with the reasons shown:
 * 40 for having an auto-send quote link on a clear price, 40 for the share of leads that actually got an instant quote
 * (within 5 minutes, no owner work), 20 for email alerts being on.
 */
export function automationScore(input: {
  leads: Pick<Lead, "createdAt" | "quoteSentAt" | "quoteState">[];
  links: { kind: LinkKind; autoSend: boolean; serviceId: string | null }[];
  services: { id: string; price: string }[];
  emailAlerts: boolean;
}): { score: number; reasons: AutomationReason[] } {
  const ready = input.links.some((link) => {
    if (link.kind !== "quote" || !link.autoSend || !link.serviceId) return false;
    const service = input.services.find((item) => item.id === link.serviceId);
    return !!service && isFixedPrice(service.price);
  });
  const instant = input.leads.filter((lead) => {
    if (!lead.quoteSentAt || !lead.quoteState) return false;
    const gap = Date.parse(lead.quoteSentAt) - Date.parse(lead.createdAt);
    return Number.isFinite(gap) && gap >= -60_000 && gap <= INSTANT_MS;
  }).length;
  const share = input.leads.length ? instant / input.leads.length : 0;
  const reasons: AutomationReason[] = [
    {
      id: "link",
      label: "A quote link that sends by itself",
      points: ready ? 40 : 0,
      max: 40,
      tip: ready ? "Done. Your quote link goes out on its own." : "Make a quote link for a service with one clear price and leave 'Send straight away' on.",
    },
    {
      id: "instant",
      label: "Leads that got an instant quote",
      points: Math.round(share * 40),
      max: 40,
      tip: input.leads.length ? `${instant} of ${input.leads.length} leads got a quote within 5 minutes.` : "Fills in as leads arrive.",
    },
    {
      id: "alerts",
      label: "Email alerts for new leads",
      points: input.emailAlerts ? 20 : 0,
      max: 20,
      tip: input.emailAlerts ? "On." : "Turn on email alerts in Settings.",
    },
  ];
  return { score: reasons.reduce((sum, reason) => sum + reason.points, 0), reasons };
}
