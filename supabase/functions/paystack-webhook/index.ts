import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Data = Record<string, any>;

function reply(status = 200) {
  return new Response(JSON.stringify({ ok: status < 300 }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hmacSha512Hex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function planCodeOf(plan: unknown) {
  if (!plan) return "";
  if (typeof plan === "string") return plan;
  if (typeof plan === "object" && plan && "plan_code" in plan) return String((plan as Data).plan_code ?? "");
  return "";
}

function readMetadata(raw: unknown): Data {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw && typeof raw === "object" ? (raw as Data) : {};
}

function monthAfter(iso: unknown) {
  const date = typeof iso === "string" && !Number.isNaN(Date.parse(iso)) ? new Date(iso) : new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

function eventKey(event: string, data: Data) {
  const id = data.id ?? data.reference ?? data.subscription_code ?? data.invoice_code ?? "";
  return `${event}:${id}:${data.status ?? ""}:${data.paid_at ?? data.next_payment_date ?? ""}`.slice(0, 300);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return reply(405);
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    const planCode = Deno.env.get("PAYSTACK_PLAN_CODE");
    if (!secret || !planCode) return reply(503);

    const raw = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";
    const expected = await hmacSha512Hex(secret, raw);
    if (!timingSafeEqual(signature.toLowerCase(), expected)) return reply(401);

    const payload = JSON.parse(raw) as { event?: string; data?: Data };
    const event = String(payload.event ?? "");
    const data = payload.data ?? {};

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const key = eventKey(event, data);
    const { data: seen } = await admin.from("payment_events").select("id").eq("id", key).maybeSingle();
    if (seen) return reply(200);

    const customerCode = String(data.customer?.customer_code ?? "");
    const resolveUser = async (): Promise<string | null> => {
      const metadataUser = readMetadata(data.metadata).user_id;
      if (typeof metadataUser === "string" && /^[0-9a-f-]{36}$/i.test(metadataUser)) return metadataUser;
      if (customerCode) {
        const { data: row } = await admin
          .from("account_plans")
          .select("user_id")
          .eq("customer_code", customerCode)
          .maybeSingle();
        if (row?.user_id) return row.user_id;
      }
      const email = data.customer?.email;
      if (typeof email === "string" && email) {
        const { data: id } = await admin.rpc("user_id_for_email", { p_email: email });
        if (typeof id === "string") return id;
      }
      return null;
    };

    const subscription = (data.subscription ?? {}) as Data;
    const eventPlan = planCodeOf(data.plan) || planCodeOf(subscription.plan);
    const relevant = eventPlan === planCode || (!eventPlan && event.startsWith("subscription."));

    if (relevant) {
      const userId = await resolveUser();
      if (userId) {
        const base = { user_id: userId, updated_at: new Date().toISOString() } as Data;
        if (customerCode) base.customer_code = customerCode;
        let patch: Data | null = null;

        if (event === "charge.success" && data.status === "success") {
          patch = { ...base, plan: "pro", status: "active", current_period_end: monthAfter(data.paid_at) };
        } else if (event === "subscription.create") {
          patch = {
            ...base,
            plan: "pro",
            status: "active",
            subscription_code: data.subscription_code ?? null,
            email_token: data.email_token ?? null,
            current_period_end: data.next_payment_date ?? monthAfter(null),
          };
        } else if (event === "invoice.update" && data.paid) {
          patch = {
            ...base,
            plan: "pro",
            status: "active",
            current_period_end: subscription.next_payment_date ?? monthAfter(data.paid_at),
          };
        } else if (event === "invoice.payment_failed") {
          patch = { ...base, status: "attention" };
        } else if (event === "subscription.not_renew") {
          patch = { ...base, status: "non_renewing" };
        } else if (event === "subscription.disable") {
          patch = { ...base, status: "cancelled" };
        }

        if (patch) {
          const { error } = await admin.from("account_plans").upsert(patch, { onConflict: "user_id" });
          if (error) throw error;
        }
      } else {
        console.warn(`No account found for Paystack event ${event}`);
      }
    }

    await admin.from("payment_events").insert({ id: key, event });
    return reply(200);
  } catch (error) {
    console.error(error);
    return reply(500);
  }
});
