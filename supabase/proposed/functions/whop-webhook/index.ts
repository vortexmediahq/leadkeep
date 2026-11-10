// PROPOSED edge function (not deployed). Sets an owner's plan when a Whop membership starts or ends.
//
// Wire-up
// 1. Supabase > Edge Functions: create `whop-webhook` from this folder (index.ts + logic.ts).
//    Turn OFF "Verify JWT" for it (Whop can't send a Supabase login). Security is the signature check below.
// 2. Secret (Edge Functions > Secrets): WHOP_WEBHOOK_SECRET = the signing secret Whop shows for the webhook.
//    SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
// 3. Whop > Developer > Webhooks > Create: URL = https://<project>.supabase.co/functions/v1/whop-webhook,
//    API version v1, events: membership.activated, membership.updated (and membership.deactivated if offered).
//    Use the "send test event" button once the SQL file has been run.
// Every call is logged in the whop_events table, including ones that couldn't be matched to an account.
import { createClient } from "npm:@supabase/supabase-js@2";
import { parseMembershipEvent, verifyWhopSignature } from "./logic.ts";

const reply = (status: number, text: string) => new Response(text, { status });

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, "method not allowed");
  const secret = Deno.env.get("WHOP_WEBHOOK_SECRET") ?? "";
  const body = await req.text();
  if (!(await verifyWhopSignature(secret, req.headers, body))) return reply(401, "bad signature");

  const payload = JSON.parse(body || "null");
  const event = parseMembershipEvent(payload, req.headers.get("webhook-id") ?? "");
  if (!event) return reply(200, "ignored");

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await admin.rpc("apply_whop_membership", {
    p_event_id: event.eventId,
    p_event_type: event.eventType,
    p_membership_id: event.membershipId,
    p_plan_id: event.planId,
    p_valid: event.valid,
    p_cancelling: event.cancelling,
    p_past_due: event.pastDue,
    p_period_end: event.periodEnd,
    p_email: event.email,
    p_user_id: event.userId,
    p_whop_user_id: event.whopUserId,
  });
  if (error) {
    console.error(`whop-webhook ${event.eventId}: ${error.message}`);
    return reply(500, "could not apply"); // Whop retries
  }
  console.log(`whop-webhook ${event.eventId} (${event.eventType}): ${JSON.stringify(data)}`);
  return reply(200, JSON.stringify(data));
});
