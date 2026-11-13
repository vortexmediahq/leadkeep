import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ExternalLink, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { MANAGE_URL, startCheckout } from "@/lib/billing";
import {
  effectiveTier,
  FOUNDING_SPOTS,
  foundingOpen,
  FREE_LEAD_LIMIT,
  hasTesterAccess,
  lockedCount,
  PRICES,
  type Entitlements,
  type Tier,
} from "@/lib/entitlements";
import { useSession } from "@/lib/session";
import { useLeakKeep } from "@/lib/store";
import { useGatedLeads } from "@/lib/use-access";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Plans · LeadKeep" }] }),
  component: PricingPage,
});

type Feature = { text: string; soon?: boolean };

const PLANS: { id: Tier; name: string; blurb: string; features: Feature[] }[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Try LeadKeep with your first customers.",
    features: [
      { text: `Full details for your first ${FREE_LEAD_LIMIT} leads` },
      { text: "Every new lead is still saved after that" },
      { text: "1 questionnaire and shareable links" },
      { text: "New-lead bell in the app" },
      { text: "Call, WhatsApp and email buttons" },
    ],
  },
  {
    id: "care",
    name: "Care",
    blurb: "Never miss a lead, and reply fast.",
    features: [
      { text: "Everything in Free" },
      { text: "Every lead unlocked, no limit" },
      { text: "Email alerts for new leads" },
      { text: "AI-written quotes" },
      { text: "Export your leads to CSV" },
      { text: "3 questionnaires" },
      { text: "Your own logo and colours", soon: true },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    blurb: "See which posts bring in your best leads.",
    features: [
      { text: "Everything in Care" },
      { text: "10 questionnaires" },
      { text: "Lead-source dashboard", soon: true },
      { text: "Suggestions on what's working", soon: true },
      { text: "Monthly 'your leads' report email", soon: true },
    ],
  },
];

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
  const entitlements = useLeakKeep((state) => state.entitlements);
  const spotsLeft = useLeakKeep((state) => state.foundingSpotsLeft);
  const refreshPlan = useLeakKeep((state) => state.refreshPlan);
  const email = useSession((state) => state.user?.email ?? null);
  const leads = useGatedLeads();
  const hidden = lockedCount(leads);
  const tier = effectiveTier(entitlements);
  const paid = entitlements.tier !== "free" && !entitlements.admin;
  const founding = foundingOpen(spotsLeft) || entitlements.founding;
  const [thanks, setThanks] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const checked = useRef(false);

  // Whop sends buyers back here after paying. The webhook can take a moment, so check a few times.
  useEffect(() => {
    if (checked.current || new URLSearchParams(window.location.search).get("thanks") !== "1") return;
    checked.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    setThanks(true);
    setWaiting(true);
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      void refreshPlan();
      if (tries >= 8) {
        window.clearInterval(timer);
        setWaiting(false);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [refreshPlan]);

  useEffect(() => {
    if (paid && thanks) setWaiting(false);
  }, [paid, thanks]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link to="/" className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-muted">
        <ChevronLeft className="size-4" aria-hidden="true" />
        Leads
      </Link>

      <header className="max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="mt-1 text-sm text-muted">
          No setup fee. Cancel any time. Every lead is always saved, even on Free.
        </p>
        {hidden > 0 ? (
          <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-sm text-ink">
            {hidden} {hidden === 1 ? "lead is" : "leads are"} saved and waiting. Upgrade to see who {hidden === 1 ? "it is" : "they are"}.
          </p>
        ) : null}
      </header>

      {entitlements.admin ? (
        <p role="status" className="rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          You're the owner of this LeadKeep, so everything is switched on for you. Customers see the plans below.
        </p>
      ) : null}

      {hasTesterAccess(entitlements) && !entitlements.admin && entitlements.tier === "free" ? (
        <p role="status" className="rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-ink">
          You have full early access until {formatDate(entitlements.fullAccessUntil)}. After that you move to Free and keep every lead.
        </p>
      ) : null}

      {thanks ? (
        <div role="status" className="flex items-start gap-3 rounded-3xl border border-primary bg-primary-soft p-5">
          {waiting && !paid ? (
            <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
          ) : (
            <PartyPopper className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold text-ink">{paid ? `Welcome to ${entitlements.tier === "growth" ? "Growth" : "Care"}` : "Thank you!"}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {paid
                ? "Your leads are unlocked."
                : waiting
                  ? "We're switching your plan on now. This takes a few seconds."
                  : "Your payment is in. If your leads still look hidden in a few minutes, tell us under 'Tell us what you think' and we'll fix it right away."}
            </p>
          </div>
        </div>
      ) : null}

      {paid ? <Subscription entitlements={entitlements} /> : null}

      {!paid && !entitlements.admin ? <FoundingBanner spotsLeft={spotsLeft} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === tier && !entitlements.admin && (plan.id === "free" ? !hasTesterAccess(entitlements) : true);
          const featured = plan.id === "care";
          const price = plan.id === "free" ? null : PRICES[plan.id];
          const useFounding = founding && price !== null && !paid;
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
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">Most popular</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
              <p className="mt-4 flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-3xl font-semibold tracking-tight tabular-nums">
                  {price === null ? "$0" : `$${useFounding ? price.founding : price.normal}`}
                </span>
                <span className="text-sm text-muted">{price === null ? "forever" : "per month"}</span>
                {price && useFounding ? (
                  <span className="text-sm text-muted line-through tabular-nums">${price.normal}</span>
                ) : null}
              </p>
              {price && useFounding ? (
                <p className="mt-1 text-xs font-medium text-accent-strong">Founding price, locked for 12 months</p>
              ) : null}
              <ul className="mt-4 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="mt-0.5 size-4 shrink-0 text-won" aria-hidden="true" />
                    <span>
                      {feature.text}
                      {feature.soon ? <span className="ml-1.5 rounded-full bg-mist px-2 py-0.5 text-xs text-muted">coming soon</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {plan.id === "free" ? (
                  <Button variant="secondary" className="w-full" disabled>
                    {isCurrent ? "You're on Free" : "Free forever"}
                  </Button>
                ) : entitlements.admin ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Owner access
                  </Button>
                ) : isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    You're on {plan.name}
                  </Button>
                ) : paid && entitlements.tier === "growth" ? null : (
                  <Button asChild className="w-full" variant={featured ? "primary" : "secondary"}>
                    <a href={startCheckout(plan.id, useFounding, email)} rel="noopener">
                      <Sparkles className="size-4" aria-hidden="true" />
                      {paid ? `Switch to ${plan.name}` : useFounding ? `Join as a founding ${plan.name}` : `Choose ${plan.name}`}
                    </a>
                  </Button>
                )}
                {plan.id !== "free" && !isCurrent && !entitlements.admin ? (
                  <p className="mt-2 text-center text-xs text-muted">Secure checkout with Whop. Cancel any time.</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted">
        Checkout opens on Whop. Use the same email as your LeadKeep login so your plan switches on by itself.
      </p>
    </div>
  );
}

function FoundingBanner({ spotsLeft }: { spotsLeft: number | null }) {
  if (spotsLeft !== null && spotsLeft <= 0) {
    return (
      <p className="rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
        All {FOUNDING_SPOTS} founding spots are taken. Thank you to everyone who joined early.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3">
      <p className="text-sm text-ink">
        <span className="font-semibold">Founding member prices: Care $29, Growth $69 a month,</span> locked for a year.
        Only for our first {FOUNDING_SPOTS} members.
      </p>
      {spotsLeft !== null ? (
        <p className="rounded-full bg-paper px-3 py-1 text-sm font-semibold tabular-nums text-accent-strong" aria-live="polite">
          {spotsLeft} of {FOUNDING_SPOTS} spots left
        </p>
      ) : null}
    </div>
  );
}

function Subscription({ entitlements }: { entitlements: Entitlements }) {
  const date = formatDate(entitlements.periodEnd);
  const name = entitlements.tier === "growth" ? "Growth" : "Care";
  const note =
    entitlements.status === "attention"
      ? { warn: true, text: `Your last payment didn't go through. Update your card to keep ${name}.` }
      : entitlements.status === "cancelling"
        ? { warn: false, text: date ? `Cancelled. ${name} stays on until ${date}.` : `Cancelled. ${name} stays on until the end of your paid month.` }
        : { warn: false, text: date ? `Renews on ${date}.` : "Renews monthly." };
  return (
    <section aria-labelledby="your-subscription" className="rounded-3xl border border-line bg-paper p-5 shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="your-subscription" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            {name} plan
            {entitlements.founding ? (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-strong">Founding member</span>
            ) : null}
          </h2>
          <p className={cn("mt-1 text-sm", note.warn ? "text-lost" : "text-ink-soft")}>{note.text}</p>
        </div>
        <Button asChild variant="secondary" className="shrink-0">
          <a href={MANAGE_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" aria-hidden="true" />
            {entitlements.status === "attention" ? "Update card" : "Manage or cancel"}
          </a>
        </Button>
      </div>
    </section>
  );
}
