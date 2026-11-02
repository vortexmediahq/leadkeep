import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check, ChevronLeft, ExternalLink, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { BillingError, manageSubscription, startCheckout, verifyPayment } from "@/lib/billing";
import { fetchAllowance } from "@/lib/data";
import { type Allowance, FREE_QUOTE_LIMIT, quotesLeft } from "@/lib/plan";
import { useLeakKeep } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing · LeakKeep" }] }),
  component: PricingPage,
});

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "R0",
    period: "forever",
    blurb: "Everything you need to catch every lead.",
    features: [
      "Unlimited leads and lead links",
      "Live new-lead alerts",
      "Saved services and quote style",
      `${FREE_QUOTE_LIMIT} AI-written quotes a month`,
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R199",
    period: "per month",
    blurb: "For busy trades sending quotes every day.",
    features: [
      "Everything in Free",
      "Unlimited AI-written quotes",
      "Priority quote writing",
      "Cancel any time",
    ],
  },
] as const;

type Busy = "checkout" | "manage" | "verify" | null;

function messageOf(error: unknown) {
  return error instanceof BillingError ? error.message : new BillingError("unknown").message;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

function PricingPage() {
  return (
    <AppShell>
      <Pricing />
    </AppShell>
  );
}

function Pricing() {
  const allowance = useLeakKeep((state) => state.allowance);
  const setAllowance = useLeakKeep((state) => state.setAllowance);
  const current = allowance?.plan ?? "free";
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [welcome, setWelcome] = useState(false);
  const verified = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference || verified.current) return;
    verified.current = true;
    window.history.replaceState(null, "", window.location.pathname);

    setBusy("verify");
    verifyPayment(reference)
      .then(async () => {
        const fresh = await fetchAllowance().catch(() => null);
        if (fresh) setAllowance(fresh);
        setWelcome(true);
      })
      .catch((reason) => setError(messageOf(reason)))
      .finally(() => setBusy(null));
  }, [setAllowance]);

  const redirectTo = async (kind: "checkout" | "manage") => {
    setError(null);
    setBusy(kind);
    try {
      const url = kind === "checkout" ? await startCheckout() : await manageSubscription();
      window.location.assign(url);
    } catch (reason) {
      setError(messageOf(reason));
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Link to="/" className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-muted">
        <ChevronLeft className="size-4" aria-hidden="true" />
        Leads
      </Link>

      <header className="max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="mt-1 text-sm text-muted">
          Leads are always free. Upgrade when you want LeakKeep to write more of your quotes.
        </p>
        {allowance && allowance.plan === "free" ? (
          <p className="mt-3 text-sm text-ink-soft">
            You have <span className="font-medium tabular-nums">{quotesLeft(allowance)}</span> of {allowance.limit} free
            AI quotes left this month. They reset on the 1st.
          </p>
        ) : null}
      </header>

      {busy === "verify" ? (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
          Confirming your payment...
        </p>
      ) : null}

      {welcome ? (
        <div role="status" className="flex items-start gap-3 rounded-3xl border border-primary bg-primary-soft p-5">
          <PartyPopper className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">Welcome to Pro</p>
            <p className="mt-1 text-sm text-ink-soft">
              Your AI quotes are now unlimited. Thanks for backing LeakKeep.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-2xl bg-lost-soft px-4 py-3 text-sm text-lost">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {allowance && allowance.plan === "pro" ? (
        <Subscription allowance={allowance} busy={busy === "manage"} onManage={() => redirectTo("manage")} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === current;
          const featured = plan.id === "pro";
          return (
            <section
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className={cn(
                "flex flex-col rounded-3xl border bg-paper p-5 shadow-panel",
                featured ? "border-primary ring-1 ring-primary" : "border-line",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 id={`plan-${plan.id}`} className="text-lg font-semibold tracking-tight">
                  {plan.name}
                </h2>
                {isCurrent ? (
                  <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-muted">Current plan</span>
                ) : featured ? (
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight tabular-nums">{plan.price}</span>
                <span className="text-sm text-muted">{plan.period}</span>
              </p>
              <ul className="mt-4 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="mt-0.5 size-4 shrink-0 text-won" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    You're on {plan.name}
                  </Button>
                ) : featured ? (
                  <>
                    <Button className="w-full" disabled={busy !== null} onClick={() => redirectTo("checkout")}>
                      {busy === "checkout" ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Sparkles className="size-4" aria-hidden="true" />
                      )}
                      {busy === "checkout" ? "Opening secure checkout..." : "Upgrade to Pro"}
                    </Button>
                    <p className="mt-2 text-center text-xs text-muted">Secure card payment in rand via Paystack.</p>
                  </>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Subscription({ allowance, busy, onManage }: { allowance: Allowance; busy: boolean; onManage: () => void }) {
  const date = formatDate(allowance.periodEnd);
  const note =
    allowance.status === "attention"
      ? { tone: "warn", text: "Your last payment didn't go through. Update your card to keep Pro." }
      : allowance.status === "non_renewing" || allowance.status === "cancelled"
        ? { tone: "info", text: date ? `Cancelled. Pro stays on until ${date}.` : "Cancelled. Pro stays on until the end of your paid month." }
        : { tone: "info", text: date ? `Renews on ${date}.` : "Renews monthly." };

  return (
    <section aria-labelledby="your-subscription" className="rounded-3xl border border-line bg-paper p-5 shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="your-subscription" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Pro plan
            <span className="text-sm font-normal text-muted">R199 / month</span>
          </h2>
          <p className={cn("mt-1 text-sm", note.tone === "warn" ? "text-lost" : "text-ink-soft")}>{note.text}</p>
        </div>
        <Button variant="secondary" onClick={onManage} disabled={busy} className="shrink-0">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ExternalLink className="size-4" aria-hidden="true" />}
          {allowance.status === "attention" ? "Update card" : "Manage or cancel"}
        </Button>
      </div>
    </section>
  );
}
