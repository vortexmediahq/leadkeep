import { cn } from "@/lib/utils";

/** Square LeadKeep icon (navy tile, orange arrow). */
export function Mark({ className }: { className?: string }) {
  return <img src="/favicon.svg" alt="" aria-hidden="true" className={cn("size-9 rounded-lg", className)} />;
}

/** Full LeadKeep wordmark. The file has a white background, so use it on light areas only. */
export function Logo({ className }: { className?: string }) {
  return <img src="/KCAAo.jpg" alt="LeadKeep" className={cn("h-auto w-36 object-contain", className)} />;
}
