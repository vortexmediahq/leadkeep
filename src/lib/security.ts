import { supabase } from "@/lib/supabase";
import type { Business, Lead, LeadLink, Questionnaire, QuoteTemplate, Service } from "@/lib/types";
import type { Branding } from "@/lib/branding";
import type { AlertChannel } from "@/lib/alerts";

export type UnusualReason = "new_device" | "new_location" | "failed_logins";

export type LoginEvent = {
  id: string;
  kind: "sign_in" | "unusual";
  reason: UnusualReason | "";
  deviceLabel: string;
  timezone: string;
  createdAt: string;
  seenAt: string | null;
};

export const UNUSUAL_COPY: Record<UnusualReason, { title: string; body: string }> = {
  new_device: {
    title: "A new device signed in",
    body: "Someone signed in to your account from a device we haven't seen before. If this was you, you can ignore this. If it wasn't, change your password.",
  },
  new_location: {
    title: "A sign-in from a new place",
    body: "A sign-in used a different time zone than usual, which often means a new place. If this wasn't you, change your password.",
  },
  failed_logins: {
    title: "Several failed sign-in attempts",
    body: "Someone tried your email with the wrong password several times in a short span. If this wasn't you, change your password.",
  },
};

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((part) => part.toString(16).padStart(2, "0")).join("");
}

export async function deviceFingerprint(): Promise<{ hash: string; label: string; timezone: string }> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const ua = navigator.userAgent;
  let label = "This device";
  if (/iPhone|iPad/.test(ua)) label = "iPhone or iPad";
  else if (/Android/.test(ua)) label = "Android phone or tablet";
  else if (/Mac/.test(ua)) label = "Mac";
  else if (/Win/.test(ua)) label = "Windows computer";
  else if (/Linux/.test(ua)) label = "Linux computer";
  if (/Edg\//.test(ua)) label = `Edge on ${label}`;
  else if (/Chrome\//.test(ua)) label = `Chrome on ${label}`;
  else if (/Firefox\//.test(ua)) label = `Firefox on ${label}`;
  else if (/Safari\//.test(ua)) label = `Safari on ${label}`;

  const raw = [ua, navigator.language, timezone, `${screen.width}x${screen.height}`].join("|");
  const hash = bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)));
  return { hash, label, timezone };
}

export async function recordSignIn() {
  try {
    const device = await deviceFingerprint();
    await supabase.rpc("record_sign_in", {
      p_device_hash: device.hash,
      p_device_label: device.label,
      p_timezone: device.timezone,
    });
  } catch {
    // Migration may not be applied yet; the app still works.
  }
}

export async function recordFailedLogin(email: string) {
  try {
    await supabase.rpc("record_failed_login", { p_email: email });
  } catch {
    // Same as above — ignore until the database update is applied.
  }
}

function toEvent(row: {
  id: string;
  kind: "sign_in" | "unusual";
  reason: string;
  device_label: string;
  timezone: string;
  created_at: string;
  seen_at: string | null;
}): LoginEvent {
  const reason: UnusualReason | "" =
    row.reason === "new_device" || row.reason === "new_location" || row.reason === "failed_logins" ? row.reason : "";
  return {
    id: row.id,
    kind: row.kind,
    reason,
    deviceLabel: row.device_label,
    timezone: row.timezone,
    createdAt: row.created_at,
    seenAt: row.seen_at,
  };
}

export async function fetchUnseenLoginEvents(): Promise<LoginEvent[]> {
  const { data, error } = await supabase.rpc("unseen_login_events");
  if (error || !data) return [];
  return (data as Parameters<typeof toEvent>[0][]).map(toEvent);
}

export async function fetchRecentLoginEvents(): Promise<LoginEvent[]> {
  const { data, error } = await supabase
    .from("login_events")
    .select("id, kind, reason, device_label, timezone, created_at, seen_at")
    .eq("kind", "unusual")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error || !data) return [];
  return (data as Parameters<typeof toEvent>[0][]).map(toEvent);
}

export async function markLoginEventsSeen() {
  await supabase.rpc("mark_login_events_seen");
}

export type AccountExport = {
  exportedAt: string;
  business: Business;
  branding: Branding;
  services: Service[];
  links: LeadLink[];
  questionnaires: Questionnaire[];
  quoteStyle: QuoteTemplate;
  leads: Lead[];
  alertChannel: AlertChannel | null;
};

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadLeadsCsv(filename: string, leads: Lead[]) {
  const headers = [
    "id",
    "createdAt",
    "source",
    "name",
    "phone",
    "email",
    "address",
    "jobType",
    "description",
    "status",
    "quote",
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...leads.map((lead) =>
      [
        lead.id,
        lead.createdAt,
        lead.source,
        lead.name,
        lead.phone,
        lead.email,
        lead.address,
        lead.jobType,
        lead.description,
        lead.status,
        lead.quote ?? "",
      ]
        .map((value) => escape(String(value)))
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function deleteMyAccount() {
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw new Error("We couldn't delete your account just yet. Please try again in a moment.");
}
