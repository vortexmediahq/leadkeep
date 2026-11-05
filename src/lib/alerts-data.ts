import { supabase } from "@/lib/supabase";
import { DEFAULT_CHANNEL, parseChannel, type AlertChannel, type FeedbackKind } from "@/lib/alerts";

/**
 * Alert settings and feedback need the database update in
 * supabase/proposed/20261105090000_alerts_feedback.sql. Until it's applied,
 * settings are kept on this device and feedback shows a friendly "not ready yet" note.
 */
export type AlertSettings = { channel: AlertChannel; lastSeenAt: string | null };
const LOCAL_KEY = "leadkeep.alerts.v1";

function readLocal(userId: string): AlertSettings {
  try {
    const raw = window.localStorage.getItem(`${LOCAL_KEY}.${userId}`);
    const parsed = raw ? (JSON.parse(raw) as { channel?: unknown; lastSeenAt?: unknown }) : {};
    return {
      channel: parseChannel(parsed.channel),
      lastSeenAt: typeof parsed.lastSeenAt === "string" ? parsed.lastSeenAt : null,
    };
  } catch {
    return { channel: DEFAULT_CHANNEL, lastSeenAt: null };
  }
}

function writeLocal(userId: string, settings: AlertSettings) {
  try {
    window.localStorage.setItem(`${LOCAL_KEY}.${userId}`, JSON.stringify(settings));
  } catch {
    // Private mode etc. Nothing else to do.
  }
}

export async function fetchAlertSettings(userId: string): Promise<AlertSettings> {
  const local = readLocal(userId);
  const { data, error } = await supabase
    .from("alert_settings")
    .select("channel, last_seen_at")
    .maybeSingle();
  if (error || !data) return local;
  const row = data as { channel: unknown; last_seen_at: string | null };
  const remote = { channel: parseChannel(row.channel), lastSeenAt: row.last_seen_at };
  // Keep the newest "seen" time from either place.
  if (local.lastSeenAt && (!remote.lastSeenAt || local.lastSeenAt > remote.lastSeenAt)) remote.lastSeenAt = local.lastSeenAt;
  return remote;
}

export async function saveAlertSettings(userId: string, settings: AlertSettings): Promise<void> {
  writeLocal(userId, settings);
  await supabase
    .from("alert_settings")
    .upsert(
      { channel: settings.channel, last_seen_at: settings.lastSeenAt, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
}

export type FeedbackItem = {
  id: string;
  kind: FeedbackKind;
  message: string;
  page: string;
  email: string;
  createdAt: string;
};

export async function sendFeedback(input: { kind: FeedbackKind; message: string; page: string; email: string }) {
  const { error } = await supabase.from("feedback").insert({
    kind: input.kind,
    message: input.message.trim(),
    page: input.page.slice(0, 200),
    email: input.email.slice(0, 200),
  });
  if (error) throw new Error("We couldn't send that just yet. Please try again a bit later.");
}

/** Owners see their own messages; the admin sees everyone's (enforced by the database). */
export async function fetchFeedback(): Promise<FeedbackItem[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select("id, kind, message, page, email, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return (data as { id: string; kind: FeedbackKind; message: string; page: string; email: string; created_at: string }[]).map(
    (row) => ({ ...row, createdAt: row.created_at }),
  );
}

export async function isFeedbackAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_leadkeep_admin");
  return !error && data === true;
}
