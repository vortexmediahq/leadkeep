// Pure helpers for the send-quote edge function (kept free of Deno APIs so they can be tested with node).

export type QuoteLead = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  quote: string | null;
  quote_token: string | null;
  quote_state: string | null;
  quote_expires_at: string | null;
  quote_emailed_at: string | null;
  service_name?: string | null;
};

/** The app calls this function from the browser, so every reply (and the OPTIONS check) must carry these. */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export type SendRequest = { leadId: string } | { token: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[a-z0-9]{24,64}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseRequest(body: unknown): SendRequest | null {
  if (!body || typeof body !== "object") return null;
  const { leadId, token } = body as { leadId?: unknown; token?: unknown };
  if (typeof leadId === "string" && UUID.test(leadId)) return { leadId };
  if (typeof token === "string" && TOKEN.test(token)) return { token };
  return null;
}

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Decides whether this lead's quote may be emailed now.
 * - the owner (signed in) may resend as often as they like;
 * - a public caller (customer who just asked for the quote) may only trigger it once.
 */
export function canEmail(lead: QuoteLead, by: "owner" | "public", now: Date = new Date()): { ok: true } | { ok: false; reason: string } {
  if (!lead.quote_token) return { ok: false, reason: "no quote link yet" };
  if (lead.quote_state !== "sent" && lead.quote_state !== "viewed") return { ok: false, reason: "quote not sent yet" };
  if (!lead.email || !EMAIL.test(lead.email.trim())) return { ok: false, reason: "no customer email" };
  if (lead.quote_expires_at && Date.parse(lead.quote_expires_at) < now.getTime()) return { ok: false, reason: "quote expired" };
  if (by === "public" && lead.quote_emailed_at) return { ok: false, reason: "already emailed" };
  return { ok: true };
}

export function buildQuoteEmail(input: {
  businessName: string;
  customerName: string;
  service: string;
  link: string;
  expiresAt: string | null;
}): { subject: string; html: string; text: string } {
  const business = input.businessName.trim() || "Your quote";
  const first = input.customerName.trim().split(/\s+/)[0] || "there";
  const subject = input.service.trim() ? `Your ${input.service.trim()} quote from ${business}` : `Your quote from ${business}`;
  const expiry = input.expiresAt ? ` It is open until ${new Date(input.expiresAt).toISOString().slice(0, 10)}.` : "";
  const text = `Hi ${first}, thanks for asking. Your quote from ${business} is ready: ${input.link}${expiry}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#0B1F3B;max-width:520px">
      <p>Hi ${escapeHtml(first)},</p>
      <p>Thanks for asking. Your quote from <strong>${escapeHtml(business)}</strong> is ready.${escapeHtml(expiry)}</p>
      <p><a href="${escapeHtml(input.link)}" style="background:#FF5F03;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">View your quote</a></p>
      <p style="color:#64748b;font-size:13px">You can print it, save it as a PDF, or accept it from that page.</p>
    </div>`;
  return { subject, html, text };
}

export const quoteLink = (appUrl: string, token: string) => `${appUrl.replace(/\/+$/, "")}/q/${token}`;
