import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Download, Lock, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { TextInput } from "@/components/ui/fields";
import { needsFollowUp } from "@/lib/alerts";
import { LOCKED_PLACEHOLDER, leadsToCsv, lockedCount } from "@/lib/entitlements";
import { useAccess, useGatedLeads } from "@/lib/use-access";
import { STATUSES, type LeadStatus } from "@/lib/types";
import { cn, oneLine } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Leads · LeadKeep" }] }),
  component: DashboardPage,
});

type Filter = "all" | LeadStatus;

function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const leads = useGatedLeads();
  const access = useAccess();
  const hidden = lockedCount(leads);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const base = { all: leads.length, new: 0, contacted: 0, quoted: 0, won: 0, lost: 0 };
    for (const lead of leads) base[lead.status] += 1;
    return base;
  }, [leads]);

  const needle = query.trim().toLowerCase();
  const visible = leads
    .filter((lead) => filter === "all" || lead.status === filter)
    .filter((lead) => {
      if (!needle) return true;
      if (lead.locked) return false;
      return `${lead.name} ${lead.jobType} ${lead.description} ${lead.source} ${lead.phone}`
        .toLowerCase()
        .includes(needle);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const fresh = counts.new;

  const exportCsv = () => {
    const blob = new Blob([leadsToCsv(leads)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leadkeep-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const overdue = leads.filter((lead) => needsFollowUp(lead)).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header className="flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
            {access.features.csvExport ? (
              <Button size="sm" variant="secondary" onClick={exportCsv} disabled={leads.length === 0}>
                <Download className="size-4" aria-hidden="true" />
                Export CSV
              </Button>
            ) : (
              <Button asChild size="sm" variant="secondary">
                <Link to="/pricing" aria-label="Export CSV is on Care and Growth">
                  <Lock className="size-4" aria-hidden="true" />
                  Export CSV
                </Link>
              </Button>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {fresh > 0 ? `${fresh} new · ${counts.all} total` : `${counts.all} in your inbox`}
          </p>
          {overdue ? (
            <p className="mt-2 rounded-xl bg-accent/10 px-3 py-2 text-sm">
              {overdue === 1 ? "1 lead has" : `${overdue} leads have`} waited over a day. Give them a call or WhatsApp today.
            </p>
          ) : null}
        </div>
        {hidden > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3">
            <p className="text-sm text-ink">
              <span className="font-semibold">
                {hidden} {hidden === 1 ? "lead is" : "leads are"} saved and waiting.
              </span>{" "}
              Your Free plan shows the details of your first 10 leads. Upgrade to see who {hidden === 1 ? "this is" : "they are"} and reply.
            </p>
            <Button asChild size="sm">
              <Link to="/pricing">
                <Sparkles className="size-4" aria-hidden="true" />
                Unlock my leads
              </Link>
            </Button>
          </div>
        ) : null}
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, answers, or source"
          aria-label="Search leads"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          <FilterChip label="All" count={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
          {STATUSES.map((status) => (
            <FilterChip
              key={status.id}
              label={status.label}
              count={counts[status.id]}
              active={filter === status.id}
              onClick={() => setFilter(status.id)}
            />
          ))}
        </div>
      </header>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-line bg-paper px-4 py-8 text-center">
          <p className="font-medium">
            {leads.length === 0 ? "No leads yet" : "Nothing matches this view"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            {leads.length === 0
              ? "Share your questionnaire link to get your first one. New leads show up here the moment someone answers."
              : "Try another status, or clear the search."}
          </p>
          {leads.length === 0 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link to="/links">Get your link</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/questions">Edit your questions</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-3xl border border-line bg-paper shadow-panel">
          {visible.map((lead) => (
            <li key={lead.id} className="border-b border-line last:border-b-0">
              <Link
                to="/leads/$leadId"
                params={{ leadId: lead.id }}
                className="block px-4 py-4 transition-colors duration-150 hover:bg-mist"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    {lead.locked ? <Lock className="size-4 shrink-0 text-accent-strong" aria-label="Hidden until you upgrade" /> : null}
                    <span className={cn("truncate", lead.locked && "select-none blur-[5px]")} aria-hidden={lead.locked}>
                      {lead.locked ? "Jordan Example" : lead.name}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {needsFollowUp(lead) ? (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-strong">
                        Follow up
                      </span>
                    ) : null}
                    <StatusBadge status={lead.status} />
                  </span>
                </span>
                {lead.locked ? (
                  <span className="mt-1 block truncate text-sm text-ink-soft">
                    <span className="select-none blur-[5px]" aria-hidden="true">
                      Wants a quote for their wedding in March
                    </span>
                    <span className="sr-only">{LOCKED_PLACEHOLDER.line}</span>
                  </span>
                ) : (
                  <span className="mt-1 block truncate text-sm text-ink-soft">
                    {lead.jobType || "General enquiry"}
                    {lead.description ? ` — ${oneLine(lead.description, 80)}` : ""}
                  </span>
                )}
                <span className="mt-1 block text-sm text-muted">
                  {lead.source} · {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press h-10 shrink-0 rounded-full px-3 text-sm font-medium",
        active ? "bg-ink text-paper" : "border border-line bg-paper text-ink-soft",
      )}
    >
      {label}
      <span className="ml-2 tabular-nums">{count}</span>
    </button>
  );
}
