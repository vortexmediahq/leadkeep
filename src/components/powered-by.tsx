import { cn } from "@/lib/utils";

/** A small, quiet mark. Sit it under the client's own name or logo when one is shown. */
export function PoweredBy({ className, light, compact }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <p
      className={cn(
        "text-center tracking-wide",
        compact ? "text-[10px]" : "text-[11px]",
        light ? "text-white/45" : compact ? "text-faint/80" : "text-faint",
        className,
      )}
    >
      Powered by LeadKeep
    </p>
  );
}
