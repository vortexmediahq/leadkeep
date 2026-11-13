import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { InstallApp } from "@/components/install-app";
import { SetupRing } from "@/components/setup-ring";
import { Field, TextInput } from "@/components/ui/fields";
import { useAlerts } from "@/lib/alert-store";
import {
  AVG_VALUE_KEY,
  automationScore,
  averageServicePrice,
  dashboardStats,
  money,
  moneyLeft,
  monthlyCounts,
} from "@/lib/dashboard";
import { useLeakKeep } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · LeadKeep" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function readAvg(): string {
  try {
    return window.localStorage.getItem(AVG_VALUE_KEY) ?? "";
  } catch {
    return "";
  }
}

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4 shadow-panel">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </div>
  );
}

function Dashboard() {
  const leads = useLeakKeep((state) => state.leads);
  const services = useLeakKeep((state) => state.services);
  const links = useLeakKeep((state) => state.links);
  const currency = useLeakKeep((state) => state.business.currency) || "R";
  const channel = useAlerts((state) => state.channel);
  const [avgText, setAvgText] = useState("");
  const [view, setView] = useState<"month" | "year">("month");

  useEffect(() => setAvgText(readAvg()), []);

  const fromServices = useMemo(() => averageServicePrice(services), [services]);
  const typed = Number(avgText.replace(/[^\d.]/g, ""));
  const avg = typed > 0 ? typed : fromServices;
  const left = useMemo(() => moneyLeft(leads, avg), [leads, avg]);
  const stats = useMemo(() => dashboardStats(leads), [leads]);
  const months = useMemo(() => monthlyCounts(leads, view === "month" ? 6 : 12), [leads, view]);
  const peak = Math.max(1, ...months.map((month) => month.leads));
  const automation = useMemo(
    () => automationScore({ leads, links, services, emailAlerts: channel === "email" || channel === "both" }),
    [leads, links, services, channel],
  );

  const onAvg = (value: string) => {
    setAvgText(value);
    try {
      window.localStorage.setItem(AVG_VALUE_KEY, value);
    } catch {
      /* private mode: the number just won't be remembered */
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">How your leads are doing, and what needs you today.</p>
      </header>

      <SetupRing />
      <InstallApp />

      <section aria-label="Money left on the table" className="rounded-3xl border border-accent/40 bg-accent-soft p-4 shadow-panel">
        <p className="text-sm font-medium text-ink">Money left on the table</p>
        {left.amount !== null ? (
          <>
            <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">{money(currency, left.amount)}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {left.count === 0
                ? "Nothing waiting. Every lead has had a follow-up."
                : `${left.count} ${left.count === 1 ? "lead is" : "leads are"} waiting for a follow-up, at about ${money(currency, avg ?? 0)} a job.`}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-ink-soft">
            Add a price to a service, or type your average job value below, and LeadKeep will show what's waiting.
          </p>
        )}
        {left.count > 0 ? (
          <Link to="/" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary">
            Open my leads and follow up →
          </Link>
        ) : null}
        <div className="mt-3 max-w-xs">
          <Field
            id="avg-job"
            label={`Average job value (${currency})`}
            hint={fromServices && !typed ? `Using the average of your service prices (${money(currency, fromServices)}).` : "Saved on this device."}
          >
            <TextInput
              id="avg-job"
              inputMode="decimal"
              value={avgText}
              placeholder={fromServices ? String(fromServices) : "e.g. 1500"}
              onChange={(event) => onAvg(event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section aria-label="Your numbers" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Leads this month"
          value={stats.thisMonth}
          note={stats.lastMonth ? `${stats.lastMonth} last month` : undefined}
        />
        <Stat label="Leads this year" value={stats.thisYear} />
        <Stat label="Won" value={stats.won} note={stats.winRate !== null ? `${stats.winRate}% of all leads` : undefined} />
        <Stat label="All leads" value={stats.total} />
      </section>

      <section aria-label="Quotes" className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">Your quotes</h2>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
          {[
            ["Sent", stats.quotesSent],
            ["Viewed", stats.quotesViewed],
            ["Accepted", stats.quotesAccepted],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-mist px-2 py-3">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Leads over time" className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Leads over time</h2>
          <div className="flex gap-1" role="group" aria-label="Time range">
            {(["month", "year"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={cn(
                  "press h-9 rounded-full px-3 text-sm font-medium",
                  view === option ? "bg-ink text-paper" : "border border-line text-ink-soft",
                )}
              >
                {option === "month" ? "6 months" : "12 months"}
              </button>
            ))}
          </div>
        </div>
        <ol className="mt-4 flex h-40 items-end gap-2" aria-label="Leads per month">
          {months.map((month) => (
            <li key={month.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs tabular-nums text-muted">{month.leads}</span>
              <span
                className="w-full rounded-t-md bg-primary"
                style={{ height: `${Math.max(month.leads ? 6 : 2, (month.leads / peak) * 100)}%`, opacity: month.leads ? 1 : 0.25 }}
                title={`${month.label}: ${month.leads} leads, ${month.won} won`}
              />
              <span className="text-xs text-muted">{month.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Automation score" className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Automation score</h2>
          <p className="text-2xl font-semibold tabular-nums">{automation.score}/100</p>
        </div>
        <p className="mt-1 text-sm text-muted">How much of the work LeadKeep does for you, and what would raise it.</p>
        <ul className="mt-3 flex flex-col gap-3">
          {automation.reasons.map((reason) => (
            <li key={reason.id} className="flex items-start gap-3">
              {reason.points >= reason.max ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-won" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="font-medium">
                  {reason.label} <span className="font-normal text-muted">· {reason.points}/{reason.max}</span>
                </p>
                <p className="text-sm text-ink-soft">{reason.tip}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
