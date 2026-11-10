import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import { effectiveTier, FREE_LEAD_LIMIT, lockedCount, testerReminderDays } from "@/lib/entitlements";
import { useAccess, useGatedLeads } from "@/lib/use-access";
import { useLeakKeep } from "@/lib/store";
import { cn } from "@/lib/utils";

const TIER_NAME = { free: "Free", care: "Care", growth: "Growth" } as const;

function usePlanView() {
  const entitlements = useLeakKeep((state) => state.entitlements);
  const access = useAccess();
  const leads = useGatedLeads();
  return useMemo(
    () => ({
      ready: entitlements.ready,
      tier: effectiveTier(entitlements),
      admin: entitlements.admin,
      trial: entitlements.tier === "free" && effectiveTier(entitlements) !== "free" && !entitlements.admin,
      founding: entitlements.founding,
      total: leads.length,
      hidden: lockedCount(leads),
      limited: Number.isFinite(access.leadLimit),
    }),
    [entitlements, access, leads],
  );
}

export function PlanCard() {
  const view = usePlanView();
  if (!view.ready) return null;

  if (!view.limited) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-primary">
        <Sparkles className="size-4" aria-hidden="true" />
        {view.admin ? "Owner · full access" : view.trial ? "Early access · full" : `${TIER_NAME[view.tier]} plan`}
        {view.founding ? " · Founding" : ""}
      </div>
    );
  }

  const used = Math.min(view.total, FREE_LEAD_LIMIT);
  const full = view.hidden > 0;
  return (
    <div className="rounded-xl border border-line bg-mist p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Free plan</p>
        <p className="text-xs text-muted tabular-nums">
          {used}/{FREE_LEAD_LIMIT} leads
        </p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Free leads used"
        aria-valuemin={0}
        aria-valuemax={FREE_LEAD_LIMIT}
        aria-valuenow={used}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", full ? "bg-lost" : "bg-primary")}
          style={{ width: `${(used / FREE_LEAD_LIMIT) * 100}%` }}
        />
      </div>
      {full ? (
        <p className="mt-2 text-xs text-lost">
          {view.hidden} {view.hidden === 1 ? "lead is" : "leads are"} waiting, hidden
        </p>
      ) : null}
      <Link
        to="/pricing"
        className="press mt-3 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-paper text-sm font-medium text-primary ring-1 ring-line hover:ring-primary"
      >
        <Sparkles className="size-4" aria-hidden="true" />
        {full ? "Unlock my leads" : "Upgrade"}
      </Link>
    </div>
  );
}

export function PlanPill() {
  const view = usePlanView();
  if (!view.ready || !view.limited) return null;
  const left = Math.max(0, FREE_LEAD_LIMIT - view.total);
  return (
    <Link
      to="/pricing"
      className={cn(
        "press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
        view.hidden > 0 ? "bg-lost-soft text-lost" : "bg-primary-soft text-primary",
      )}
    >
      <Sparkles className="size-3.5" aria-hidden="true" />
      {view.hidden > 0 ? `${view.hidden} hidden` : `${left} free left`}
    </Link>
  );
}

/** A friendly heads-up in the last week of early (tester) access. */
export function TesterReminder() {
  const entitlements = useLeakKeep((state) => state.entitlements);
  const days = testerReminderDays(entitlements);
  if (days === null) return null;
  return (
    <div role="status" className="mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3 text-sm">
      <p className="text-ink">
        Your early access ends in {days <= 1 ? "a day" : `${days} days`}. After that you move to the Free plan and keep every lead.
        Founding members get Care from $29 a month for a year.
      </p>
      <Link to="/pricing" className="press shrink-0 font-medium text-primary">
        See plans
      </Link>
    </div>
  );
}
