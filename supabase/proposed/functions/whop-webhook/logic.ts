// Pure helpers for the Whop webhook. No Deno-only APIs, so they can be tested with Node.

export type ParsedMembership = {
  eventId: string;
  eventType: string;
  membershipId: string;
  planId: string;
  valid: boolean;
  cancelling: boolean;
  pastDue: boolean;
  periodEnd: string | null;
  email: string;
  userId: string | null;
  whopUserId: string | null;
};

const encoder = new TextEncoder();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const str = (value: unknown) => (typeof value === "string" ? value : "");
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64(bytes: ArrayBuffer): string {
  let binary = "";
  new Uint8Array(bytes).forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(key: Uint8Array, content: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(content)));
}

/**
 * Standard Webhooks check (what Whop's v1 webhooks use): header webhook-signature holds one or more
 * "v1,<base64 hmac>" values over `${id}.${timestamp}.${body}`. The secret may be given as "whsec_<base64>"
 * or as plain text, so both readings of the key are tried.
 */
export async function verifyWhopSignature(
  secret: string,
  headers: { get(name: string): string | null },
  body: string,
  nowMs: number = Date.now(),
  toleranceSeconds = 300,
): Promise<boolean> {
  const id = headers.get("webhook-id") ?? "";
  const timestamp = headers.get("webhook-timestamp") ?? "";
  const signatures = (headers.get("webhook-signature") ?? "").split(" ").filter(Boolean);
  if (!secret || !id || !timestamp || signatures.length === 0) return false;
  const sent = Number(timestamp);
  if (!Number.isFinite(sent) || Math.abs(nowMs / 1000 - sent) > toleranceSeconds) return false;

  const keys: Uint8Array[] = [];
  const trimmed = secret.trim();
  const raw = trimmed.startsWith("whsec_") ? trimmed.slice(6) : trimmed;
  try {
    keys.push(base64ToBytes(raw));
  } catch {
    // not base64: fall through to the plain-text reading
  }
  keys.push(encoder.encode(trimmed));

  const content = `${id}.${timestamp}.${body}`;
  for (const key of keys) {
    const expected = await sign(key, content);
    if (signatures.some((entry) => sameText(entry.replace(/^v1,/, ""), expected))) return true;
  }
  return false;
}

const VALID_STATUSES = new Set(["active", "trialing", "completed"]);
const PAST_DUE_STATUSES = new Set(["past_due"]);

/**
 * Turns a Whop v1 event into what the database needs, or null when it isn't a membership event we act on.
 * Valid = the membership is active; invalid = cancelled, expired or otherwise ended.
 */
export function parseMembershipEvent(payload: unknown, fallbackEventId = ""): ParsedMembership | null {
  const root = obj(payload);
  const type = str(root.type) || str(root.event);
  if (!type.startsWith("membership.")) return null;
  const data = obj(root.data);
  const membershipId = str(data.id);
  const meta = obj(data.metadata);
  const user = obj(data.user);
  const member = obj(data.member);
  const planId = str(data.plan_id) || str(data.variant_id) || str(obj(data.plan).id) || str(obj(data.variant).id);
  if (!membershipId || !planId) return null;

  const status = str(data.status).toLowerCase();
  let valid: boolean;
  if (type === "membership.deactivated") valid = false;
  else if (typeof data.valid === "boolean") valid = data.valid;
  else if (status) valid = VALID_STATUSES.has(status) || PAST_DUE_STATUSES.has(status);
  else if (type === "membership.activated") valid = true;
  else return null; // an update we can't read: leave the plan alone

  const metaUser = str(meta.user_id) || str(meta.customer_id) || str(meta.leadkeep_user_id);
  return {
    eventId: str(root.id) || fallbackEventId || `${type}:${membershipId}:${str(data.updated_at) || str(root.timestamp)}`,
    eventType: type,
    membershipId,
    planId,
    valid,
    cancelling: data.cancel_at_period_end === true,
    pastDue: PAST_DUE_STATUSES.has(status),
    periodEnd: str(data.renewal_period_end) || str(data.expires_at) || null,
    email: (str(user.email) || str(member.email) || str(data.email) || str(meta.email)).trim().toLowerCase(),
    userId: UUID.test(metaUser) ? metaUser : null,
    whopUserId: str(data.user_id) || str(user.id) || null,
  };
}
