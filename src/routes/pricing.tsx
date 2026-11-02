import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FREE_QUOTE_LIMIT, quotesLeft } from "@/lib/plan";
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

function PricingPage() {
  return (
    <AppShell>
      <Pricing />
    </AppShell>
  );
}

function Pricing() {
  const allowance = useLeakKeep((state) => state.allowance);
  const current = allowance?.plan ?? "free";
  const [notice, setNotice] = useState(false);

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
                  <Button className="w-full" onClick={() => setNotice(true)}>
                    <Sparkles className="size-4" aria-hidden="true" />
                    Upgrade to Pro
                  </Button>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {notice ? (
        <p role="status" className="rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          Online payment is coming soon. Pro isn't available to buy yet, and your free quotes reset on the 1st of
          each month.
        </p>
      ) : null}
    </div>
  );
}
