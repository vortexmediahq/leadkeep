import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { NOTIFY_SETUP_KEY, setupProgress } from "@/lib/setup-progress";
import { useLeakKeep } from "@/lib/store";
import { cn } from "@/lib/utils";

function notificationsChosen(): boolean {
  try {
    return window.localStorage.getItem(NOTIFY_SETUP_KEY) === "1";
  } catch {
    return false;
  }
}

export function SetupRing() {
  const business = useLeakKeep((state) => state.business);
  const linksCount = useLeakKeep((state) => state.links.length);
  const questionnairesReady = useLeakKeep((state) => state.questionnairesReady);
  const questionnairesCount = useLeakKeep((state) => state.questionnaires.length);
  const namedServices = useLeakKeep((state) => state.services.filter((service) => service.name.trim()).length);
  const [chosen] = useState(notificationsChosen);

  const progress = useMemo(
    () =>
      setupProgress({
        business,
        linksCount,
        questionnairesReady,
        questionnairesCount,
        namedServices,
        notificationsChosen: chosen,
      }),
    [business, linksCount, questionnairesReady, questionnairesCount, namedServices, chosen],
  );

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress.percent / 100);

  return (
    <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0" aria-hidden="true">
          <svg viewBox="0 0 44 44" className="size-16 -rotate-90">
            <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-accent transition-[stroke-dashoffset] duration-500"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-xs font-semibold tabular-nums text-ink">
            {progress.percent}%
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Your setup</h2>
          <p className="text-sm text-muted">
            {progress.percent === 100
              ? "You're set up. You can still change any of this later."
              : `${progress.done} of ${progress.total} important steps done.`}
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-1.5">
        {progress.steps.map((step) => (
          <li key={step.id}>
            <Link
              to={step.to}
              hash={step.hash}
              className="press flex items-start gap-3 rounded-2xl px-2 py-2 hover:bg-mist"
            >
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                  step.done ? "border-won bg-won text-paper" : "border-line bg-paper text-transparent",
                )}
                aria-hidden="true"
              >
                <Check className="size-3" />
              </span>
              <span className="min-w-0">
                <span className={cn("block text-sm font-medium", step.done ? "text-ink-soft" : "text-ink")}>
                  {step.label}
                </span>
                {step.note ? <span className="block text-xs text-muted">{step.note}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
