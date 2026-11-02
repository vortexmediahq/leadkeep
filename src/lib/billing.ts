import { supabase } from "@/lib/supabase";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-billing`;

const MESSAGES: Record<string, string> = {
  not_configured: "Online payments aren't switched on yet. Please check back soon.",
  auth: "Your session has expired. Please sign in again.",
  already_pro: "You're already on Pro.",
  not_paid: "We couldn't confirm that payment. If you were charged, it will show here within a few minutes.",
  no_subscription: "We couldn't find an active subscription for your account.",
};

const FALLBACK = "Something went wrong talking to our payment provider. Please try again.";

export class BillingError extends Error {
  constructor(readonly code: string) {
    super(MESSAGES[code] ?? FALLBACK);
  }
}

async function call(body: Record<string, string>): Promise<Record<string, unknown>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new BillingError("auth");

  let response: Response;
  try {
    response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new BillingError("network");
  }

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !payload) {
    throw new BillingError(typeof payload?.error === "string" ? payload.error : "unknown");
  }
  return payload;
}

async function urlFrom(body: Record<string, string>) {
  const payload = await call(body);
  if (typeof payload.url !== "string" || !payload.url.startsWith("https://")) throw new BillingError("unknown");
  return payload.url;
}

export function startCheckout() {
  return urlFrom({ action: "checkout", returnUrl: `${window.location.origin}${window.location.pathname}` });
}

export function manageSubscription() {
  return urlFrom({ action: "manage" });
}

export async function verifyPayment(reference: string) {
  const payload = await call({ action: "verify", reference });
  if (payload.plan !== "pro") throw new BillingError("not_paid");
}
