// PROPOSED edge function (not deployed). Emails the owner when a new lead arrives.
//
// Wire-up: migration 20261113150000_alert_triggers_and_accept_won.sql calls this on every new lead (Verify JWT is OFF; the function checks the lead itself).
// Secrets (Edge Functions > Secrets): RESEND_API_KEY, ALERT_FROM_EMAIL (e.g. "LeadKeep <alerts@yourdomain>"),
// APP_URL (e.g. https://your-app). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided automatically.
// Without RESEND_API_KEY it only logs, so it is safe to deploy early. Swap sendEmail() for another provider if wanted.
import { createClient } from "npm:@supabase/supabase-js@2";

type LeadRecord = { id: string; user_id: string; name?: string; phone?: string; email?: string; source?: string; job_type?: string };

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function sendEmail(to: string, subject: string, html: string): Promise<string> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "skipped: no RESEND_API_KEY";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: Deno.env.get("ALERT_FROM_EMAIL") ?? "LeadKeep <onboarding@resend.dev>", to, subject, html }),
  });
  return res.ok ? "sent" : `failed: ${res.status}`;
}

Deno.serve(async (req) => {
  const payload = (await req.json().catch(() => null)) as { type?: string; record?: LeadRecord } | null;
  const lead = payload?.record;
  if (payload?.type !== "INSERT" || !lead?.user_id) return new Response("ignored", { status: 200 });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  // Called by a database trigger with no secret, so never trust the payload: read the real, recent lead from the database.
  const { data: real } = await admin
    .from("leads")
    .select("id, user_id, customer_name, phone, email, source, created_at")
    .eq("id", lead.id)
    .maybeSingle();
  if (!real || Date.now() - Date.parse(real.created_at) > 10 * 60 * 1000) return new Response("not a recent lead", { status: 200 });
  lead.user_id = real.user_id;
  lead.name = real.customer_name;
  lead.phone = real.phone;
  lead.email = real.email;
  lead.source = real.source;
  // Email alerts are a Care/Growth feature. If the stage 3 SQL isn't applied yet the call fails and we send as before.
  const { data: tier, error: tierError } = await admin.rpc("entitlement_tier", { p_user: lead.user_id });
  if (!tierError && tier === "free") return new Response("free plan: no email alerts", { status: 200 });

  const { data: settings } = await admin.from("alert_settings").select("channel").eq("user_id", lead.user_id).maybeSingle();
  const channel = settings?.channel ?? "both";
  if (channel === "app") return new Response("owner chose app only", { status: 200 });

  const { data: profile } = await admin.from("business_profiles").select("name, email").eq("user_id", lead.user_id).maybeSingle();
  let to = profile?.email?.trim() ?? "";
  if (!to) {
    const { data } = await admin.auth.admin.getUserById(lead.user_id);
    to = data.user?.email ?? "";
  }
  if (!to) return new Response("no owner email", { status: 200 });

  const appUrl = Deno.env.get("APP_URL") ?? "";
  const name = escape(lead.name || "Someone");
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#0B1F3B">
      <h2 style="margin:0 0 8px">You have a new lead 🎉</h2>
      <p><strong>${name}</strong> just got in touch${lead.source ? ` via ${escape(lead.source)}` : ""}.</p>
      ${lead.job_type ? `<p>About: ${escape(lead.job_type)}</p>` : ""}
      ${lead.phone ? `<p>Phone: ${escape(lead.phone)}</p>` : ""}
      ${lead.email ? `<p>Email: ${escape(lead.email)}</p>` : ""}
      ${appUrl ? `<p><a href="${appUrl}/leads/${lead.id}" style="background:#FF5F03;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Open the lead</a></p>` : ""}
      <p style="color:#64748b;font-size:13px">Tip: replying within the hour wins more work. Change these emails in LeadKeep &gt; Settings.</p>
    </div>`;
  const result = await sendEmail(to, `New lead: ${lead.name || "someone"} wants to hear from you`, html);
  console.log(`new-lead-alert ${lead.id}: ${result}`);
  return new Response(result, { status: 200 });
});
