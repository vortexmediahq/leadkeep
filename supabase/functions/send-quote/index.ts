// PROPOSED edge function (not deployed). Emails a customer their quote link through Resend.
//
// Called by the app two ways:
//   1. the owner, signed in: { leadId }  (a "Email it" button on the lead page; can be repeated)
//   2. the public quote page right after a customer asks for a quote: { token }  (works once per lead)
// Secrets (Edge Functions > Secrets): RESEND_API_KEY, ALERT_FROM_EMAIL (e.g. "LeadKeep <quotes@yourdomain>"), APP_URL.
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are provided automatically.
// Browser calls need CORS (handled below). Keep "Verify JWT" ON: the app's anon key is enough for case 2. Needs 20261113120000_quote_flow.sql.
// Without RESEND_API_KEY it only logs and answers "skipped", so the app shows the copy-link fallback.
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildQuoteEmail, canEmail, CORS_HEADERS, parseRequest, quoteLink, type QuoteLead } from "./logic.ts";

const reply = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return reply({ error: "POST only" }, 405);
  const parsed = parseRequest(await req.json().catch(() => null));
  if (!parsed) return reply({ error: "bad request" }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const columns = "id, user_id, name, email, quote, quote_token, quote_state, quote_expires_at, quote_emailed_at, service_name";

  let lead: QuoteLead | null = null;
  let by: "owner" | "public" = "public";
  if ("leadId" in parsed) {
    // Owner path: the caller's own JWT must see this lead (row-level security does the check).
    const mine = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: user } = await mine.auth.getUser();
    if (!user.user) return reply({ error: "sign in first" }, 401);
    const { data } = await mine.from("leads").select("id").eq("id", parsed.leadId).maybeSingle();
    if (!data) return reply({ error: "not found" }, 404);
    by = "owner";
    lead = (await admin.from("leads").select(columns).eq("id", parsed.leadId).maybeSingle()).data as QuoteLead | null;
  } else {
    lead = (await admin.from("leads").select(columns).eq("quote_token", parsed.token).maybeSingle()).data as QuoteLead | null;
  }
  if (!lead) return reply({ error: "not found" }, 404);

  const check = canEmail(lead, by);
  if (!check.ok) return reply({ sent: false, reason: check.reason });

  const key = Deno.env.get("RESEND_API_KEY");
  const appUrl = Deno.env.get("APP_URL") ?? "";
  if (!key || !appUrl) {
    console.log(`send-quote ${lead.id}: skipped (RESEND_API_KEY or APP_URL missing)`);
    return reply({ sent: false, reason: "email not set up" });
  }

  const { data: profile } = await admin.from("business_profiles").select("name, email").eq("user_id", lead.user_id).maybeSingle();
  const mail = buildQuoteEmail({
    businessName: profile?.name ?? "",
    customerName: lead.name ?? "",
    service: lead.service_name ?? "",
    link: quoteLink(appUrl, lead.quote_token!),
    expiresAt: lead.quote_expires_at,
  });
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("ALERT_FROM_EMAIL") ?? "LeadKeep <onboarding@resend.dev>",
      to: lead.email!.trim(),
      reply_to: profile?.email?.trim() || undefined,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });
  if (!res.ok) {
    console.log(`send-quote ${lead.id}: failed ${res.status}`);
    return reply({ sent: false, reason: "email provider refused" }, 502);
  }
  await admin.from("leads").update({ quote_emailed_at: new Date().toISOString() }).eq("id", lead.id);
  return reply({ sent: true });
});
