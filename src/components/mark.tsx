import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-9 text-ink", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        className="fill-primary-ink"
        d="M16 7c3.2 4.4 6.5 8.2 6.5 12.1A6.5 6.5 0 0 1 16 25.6a6.5 6.5 0 0 1-6.5-6.5C9.5 15.2 12.8 11.4 16 7z"
      />
    </svg>
  );
}
