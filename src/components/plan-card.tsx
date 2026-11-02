import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { quotesLeft } from "@/lib/plan";
import { useLeakKeep } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PlanCard() {
  const allowance = useLeakKeep((state) => state.allowance);
  if (!allowance) return null;

  if (allowance.plan === "pro") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-primary">
        <Sparkles className="size-4" aria-hidden="true" />
        Pro plan
      </div>
    );
  }

  const used = Math.min(allowance.used, allowance.limit);
  const out = quotesLeft(allowance) === 0;
  return (
    <div className="rounded-xl border border-line bg-mist p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Free plan</p>
        <p className="text-xs text-muted tabular-nums">
          {used}/{allowance.limit} AI quotes
        </p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="AI quotes used this month"
        aria-valuemin={0}
        aria-valuemax={allowance.limit}
        aria-valuenow={used}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", out ? "bg-lost" : "bg-primary")}
          style={{ width: `${(used / allowance.limit) * 100}%` }}
        />
      </div>
      <Link
        to="/pricing"
        className="press mt-3 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-paper text-sm font-medium text-primary ring-1 ring-line hover:ring-primary"
      >
        <Sparkles className="size-4" aria-hidden="true" />
        Upgrade
      </Link>
    </div>
  );
}

export function PlanPill() {
  const allowance = useLeakKeep((state) => state.allowance);
  if (!allowance || allowance.plan === "pro") return null;
  const left = quotesLeft(allowance);
  return (
    <Link
      to="/pricing"
      className={cn(
        "press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
        left === 0 ? "bg-lost-soft text-lost" : "bg-primary-soft text-primary",
      )}
    >
      <Sparkles className="size-3.5" aria-hidden="true" />
      {left === 0 ? "Upgrade" : `${left} left`}
    </Link>
  );
}
