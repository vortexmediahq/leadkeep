import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { TextInput } from "@/components/ui/fields";
import { useLeakKeep } from "@/lib/store";
import { STATUSES, type LeadStatus } from "@/lib/types";
import { cn, oneLine } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Leads · LeakKeep" }] }),
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
  const leads = useLeakKeep((state) => state.leads);
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
      return `${lead.name} ${lead.jobType} ${lead.description} ${lead.source} ${lead.phone}`
        .toLowerCase()
        .includes(needle);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const fresh = counts.new;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted">
            {fresh > 0 ? `${fresh} new · ${counts.all} total` : `${counts.all} on your desk`}
          </p>
        </div>
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, job, or source"
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
          <p className="mt-2 text-sm text-muted">
            {leads.length === 0
              ? "Share a lead link. New jobs show up here as soon as someone sends the form."
              : "Try another status, or clear the search."}
          </p>
          {leads.length === 0 ? (
            <Link to="/links" className="mt-4 inline-flex text-sm font-medium text-primary">
              Get a lead link
            </Link>
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
                  <span className="min-w-0 font-medium">{lead.name}</span>
                  <StatusBadge status={lead.status} />
                </span>
                <span className="mt-1 block truncate text-sm text-ink-soft">
                  {lead.jobType || "General enquiry"}
                  {lead.description ? ` — ${oneLine(lead.description, 80)}` : ""}
                </span>
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
