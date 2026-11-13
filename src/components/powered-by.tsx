import { cn } from "@/lib/utils";

/** A small, quiet mark. Sit it under the client's own name or logo when one is shown. */
export function PoweredBy({ className, light }: { className?: string; light?: boolean }) {
  return (
    <p className={cn("text-center text-[11px] tracking-wide", light ? "text-white/45" : "text-faint", className)}>
      Powered by LeadKeep
    </p>
  );
}
