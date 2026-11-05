import type { Lead } from "@/lib/types";

/** How an owner wants to hear about new leads. */
export type AlertChannel = "app" | "email" | "both";
export const ALERT_CHANNELS: { id: AlertChannel; label: string; help: string }[] = [
  { id: "both", label: "In the app and by email", help: "Recommended. You won't miss a lead." },
  { id: "app", label: "In the app only", help: "See new leads under the bell." },
  { id: "email", label: "By email only", help: "We email you each new lead." },
];
export const DEFAULT_CHANNEL: AlertChannel = "both";

export function parseChannel(value: unknown): AlertChannel {
  return value === "app" || value === "email" || value === "both" ? value : DEFAULT_CHANNEL;
}
export const wantsApp = (channel: AlertChannel) => channel !== "email";
export const wantsEmail = (channel: AlertChannel) => channel !== "app";

/** Digits only, with a local leading 0 turned into the country code (default 27, South Africa). */
export function internationalNumber(phone: string, countryCode = "27"): string {
  const trimmed = phone.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (trimmed.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) digits = countryCode + digits.slice(1);
  return digits;
}

export function callHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 6 ? `tel:${digits}` : null;
}

export function whatsappHref(phone: string, message = "", countryCode = "27"): string | null {
  const number = internationalNumber(phone, countryCode);
  if (number.length < 8) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function emailHref(email: string, subject = "", body = ""): string | null {
  const address = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return null;
  const params = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean);
  return `mailto:${address}${params.length ? `?${params.join("&")}` : ""}`;
}

export function greeting(name: string, business: string): string {
  const first = name.trim().split(/\s+/)[0] || "there";
  return `Hi ${first}, thanks for getting in touch${business.trim() ? ` with ${business.trim()}` : ""}. `;
}

export const FOLLOW_UP_HOURS = 24;

/** A lead still marked "New" a day after it came in needs a nudge. */
export function needsFollowUp(lead: Pick<Lead, "status" | "createdAt">, now: Date = new Date()): boolean {
  if (lead.status !== "new") return false;
  const created = Date.parse(lead.createdAt);
  if (Number.isNaN(created)) return false;
  return now.getTime() - created >= FOLLOW_UP_HOURS * 60 * 60 * 1000;
}

/** Leads that arrived after the owner last opened the bell. */
export function unreadLeads<T extends Pick<Lead, "createdAt">>(leads: T[], lastSeenAt: string | null): T[] {
  const seen = lastSeenAt ? Date.parse(lastSeenAt) : 0;
  return leads.filter((lead) => Date.parse(lead.createdAt) > (Number.isNaN(seen) ? 0 : seen));
}

export const FEEDBACK_KINDS = [
  { id: "idea", label: "An idea" },
  { id: "problem", label: "Something isn't working" },
  { id: "praise", label: "Something I like" },
  { id: "other", label: "Other" },
] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]["id"];
export const FEEDBACK_MAX = 2000;

export function validateFeedback(message: string): string | null {
  const text = message.trim();
  if (text.length < 3) return "Please write a few words so we know what you mean.";
  if (text.length > FEEDBACK_MAX) return `Please keep it under ${FEEDBACK_MAX} characters.`;
  return null;
}
