import { STATUSES, type LeadStatus } from "@/lib/types";
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
