import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PAYSTACK = "https://api.paystack.co";
const PRO_AMOUNT_CENTS = 19900;

type PaystackSubscription = {
  subscription_code?: string;
  email_token?: string;
  status?: string;
  next_payment_date?: string | null;
  plan?: { plan_code?: string } | string | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function paystack(secret: string, path: string, init?: RequestInit) {
  const response = await fetch(`${PAYSTACK}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.status) {
    throw new Error(`Paystack ${path.split("?")[0]} failed (${response.status})`);
  }
  return body.data;
}

function planCodeOf(plan: unknown) {
  if (!plan) return "";
  if (typeof plan === "string") return plan;
  if (typeof plan === "object" && "plan_code" in plan) return String((plan as { plan_code?: string }).plan_code ?? "");
  return "";
}

function readMetadata(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
}

function safeReturnUrl(raw: unknown) {
  if (typeof raw !== "string") return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
      return null;
    }
    if (!url.pathname.endsWith("/pricing")) return null;
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

function monthFromNow() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

async function findSubscription(secret: string, customerCode: string, planCode: string) {
  const customer = await paystack(secret, `/customer/${encodeURIComponent(customerCode)}`);
  const subscriptions = (customer?.subscriptions ?? []) as PaystackSubscription[];
  return (
    subscriptions.find((item) => planCodeOf(item.plan) === planCode && item.status === "active") ??
    subscriptions.find((item) => planCodeOf(item.plan) === planCode) ??
    null
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    const planCode = Deno.env.get("PAYSTACK_PLAN_CODE");
    if (!secret || !planCode) return json({ error: "not_configured" }, 503);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user?.email) return json({ error: "auth" }, 401);
    const user = auth.user;

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    const { data: current } = await admin
      .from("account_plans")
      .select("plan, status, current_period_end, customer_code, subscription_code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (action === "checkout") {
      const callbackUrl = safeReturnUrl(body.returnUrl);
      if (!callbackUrl) return json({ error: "bad_return_url" }, 400);
      const periodEnd = current?.current_period_end ? new Date(current.current_period_end).getTime() : 0;
      if (current?.plan === "pro" && current.status === "active" && periodEnd > Date.now()) {
        return json({ error: "already_pro" }, 409);
      }
      const data = await paystack(secret, "/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          amount: PRO_AMOUNT_CENTS,
          currency: "ZAR",
          plan: planCode,
          callback_url: callbackUrl,
          metadata: { user_id: user.id, purpose: "leakkeep_pro" },
        }),
      });
      if (typeof data?.authorization_url !== "string") return json({ error: "checkout_failed" }, 502);
      return json({ url: data.authorization_url });
    }

    if (action === "verify") {
      const reference = typeof body.reference === "string" ? body.reference.slice(0, 120) : "";
      if (!/^[A-Za-z0-9._=-]+$/.test(reference)) return json({ error: "bad_reference" }, 400);
      const txn = await paystack(secret, `/transaction/verify/${encodeURIComponent(reference)}`);
      const metadata = readMetadata(txn?.metadata);
      const paidPlan = planCodeOf(txn?.plan) || planCodeOf(txn?.plan_object);
      if (txn?.status !== "success" || metadata.user_id !== user.id) return json({ error: "not_paid" }, 402);
      if (paidPlan && paidPlan !== planCode) return json({ error: "not_paid" }, 402);

      const customerCode = String(txn?.customer?.customer_code ?? "");
      let subscription: PaystackSubscription | null = null;
      if (customerCode) {
        subscription = await findSubscription(secret, customerCode, planCode).catch(() => null);
      }
      const { error } = await admin.from("account_plans").upsert(
        {
          user_id: user.id,
          plan: "pro",
          status: "active",
          customer_code: customerCode || null,
          subscription_code: subscription?.subscription_code ?? current?.subscription_code ?? null,
          email_token: subscription?.email_token ?? null,
          current_period_end: subscription?.next_payment_date ?? monthFromNow(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
      return json({ plan: "pro" });
    }

    if (action === "manage") {
      let code = current?.subscription_code ?? "";
      if (!code && current?.customer_code) {
        const found = await findSubscription(secret, current.customer_code, planCode).catch(() => null);
        code = found?.subscription_code ?? "";
        if (code) {
          await admin
            .from("account_plans")
            .update({ subscription_code: code, email_token: found?.email_token ?? null })
            .eq("user_id", user.id);
        }
      }
      if (!code) return json({ error: "no_subscription" }, 404);
      const data = await paystack(secret, `/subscription/${encodeURIComponent(code)}/manage/link`);
      if (typeof data?.link !== "string") return json({ error: "manage_failed" }, 502);
      return json({ url: data.link });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error(error);
    return json({ error: "server_error" }, 500);
  }
});
