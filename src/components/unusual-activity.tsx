import { Link } from "@tanstack/react-router";
import { ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUnseenLoginEvents, markLoginEventsSeen, UNUSUAL_COPY, type LoginEvent } from "@/lib/security";

export function UnusualActivityBanner() {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    void fetchUnseenLoginEvents().then(setEvents);
  }, []);

  if (hidden || events.length === 0) return null;
  const first = events[0];
  const copy = first.reason ? UNUSUAL_COPY[first.reason] : null;
  if (!copy) return null;

  const dismiss = () => {
    setHidden(true);
    void markLoginEventsSeen();
  };

  return (
    <div
      role="status"
      className="mx-auto mb-5 flex max-w-5xl items-start gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm"
    >
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{copy.title}</p>
        <p className="mt-1 text-ink-soft">
          {copy.body}
          {first.deviceLabel ? ` Device: ${first.deviceLabel}.` : ""}
        </p>
        <Link to="/settings" hash="security" className="mt-2 inline-block font-medium text-primary">
          Review sign-in security
        </Link>
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="press grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper">
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
