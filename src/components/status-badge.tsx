import { quoteStateLabel, type QuoteState } from "@/lib/quote-flow";
import { STATUSES, type Lead, type LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const tones: Record<LeadStatus, string> = {
  new: "bg-primary-soft text-primary",
  contacted: "bg-mist text-ink-soft",
  quoted: "border border-line bg-paper text-ink",
  won: "bg-won-soft text-won",
  lost: "bg-lost-soft text-lost",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const label = STATUSES.find((item) => item.id === status)?.label ?? status;
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-medium",
        tones[status],
      )}
    >
      {label}
    </span>
  );
}

const quoteTones: Record<Exclude<QuoteState, "">, string> = {
  review: "bg-primary-soft text-primary",
  sent: "border border-line bg-paper text-ink",
  viewed: "bg-mist text-ink",
  accepted: "bg-won-soft text-won",
};

/** The badge a lead shows in lists: a live quote step wins over the plain status, except won and lost. */
export function LeadBadge({ lead }: { lead: Pick<Lead, "status" | "quoteState"> }) {
  const state = lead.quoteState;
  if (state && lead.status !== "won" && lead.status !== "lost") {
    return (
      <span className={cn("inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-medium", quoteTones[state])}>
        {quoteStateLabel(state)}
      </span>
    );
  }
  return <StatusBadge status={lead.status} />;
}
