// PROPOSED edge function (not deployed). Emails the owner about unusual sign-in activity.
//
// Uses the same optional email path as new-lead-alert: RESEND_API_KEY and ALERT_FROM_EMAIL.
// Without those secrets it only logs, so it adds no new paid service.
//
// Wire-up (Supabase dashboard): Database > Webhooks > new webhook on table `login_events`,
// event INSERT, type "Supabase Edge Function" -> unusual-login-alert.
import { createClient } from "npm:@supabase/supabase-js@2";

type EventRecord = {
  id: string;
  user_id: string;
  kind?: string;
  reason?: string;
  device_label?: string;
  timezone?: string;
};

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

const COPY: Record<string, { title: string; body: string }> = {
  new_device: {
    title: "A new device signed in to your LeadKeep account",
    body: "Someone signed in from a device we haven't seen before. If this was you, you can ignore this email. If it wasn't, change your password in LeadKeep.",
  },
  new_location: {
    title: "A LeadKeep sign-in from a new place",
    body: "A sign-in used a different time zone than usual. If this wasn't you, change your password in LeadKeep.",
  },
  failed_logins: {
    title: "Several failed LeadKeep sign-in attempts",
    body: "Someone tried your email with the wrong password several times. If this wasn't you, change your password in LeadKeep.",
  },
};

Deno.serve(async (req) => {
  const payload = (await req.json().catch(() => null)) as { type?: string; record?: EventRecord } | null;
  const event = payload?.record;
  if (payload?.type !== "INSERT" || event?.kind !== "unusual" || !event.user_id) {
    return new Response("ignored", { status: 200 });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: profile } = await admin.from("business_profiles").select("email").eq("user_id", event.user_id).maybeSingle();
  let to = profile?.email?.trim() ?? "";
  if (!to) {
    const { data } = await admin.auth.admin.getUserById(event.user_id);
    to = data.user?.email ?? "";
  }
  if (!to) return new Response("no owner email", { status: 200 });

  const copy = COPY[event.reason ?? ""] ?? COPY.new_device;
  const appUrl = Deno.env.get("APP_URL") ?? "";
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#0B1F3B">
      <h2 style="margin:0 0 8px">${escape(copy.title)}</h2>
      <p>${escape(copy.body)}</p>
      ${event.device_label ? `<p>Device: ${escape(event.device_label)}</p>` : ""}
      ${event.timezone ? `<p>Time zone: ${escape(event.timezone)}</p>` : ""}
      ${appUrl ? `<p><a href="${appUrl}/settings#security" style="background:#FF5F03;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Review sign-in security</a></p>` : ""}
    </div>`;
  const result = await sendEmail(to, copy.title, html);
  console.log(`unusual-login-alert ${event.id}: ${result}`);
  return new Response(result, { status: 200 });
});
