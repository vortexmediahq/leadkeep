import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Bell, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { needsFollowUp, unreadLeads, wantsApp } from "@/lib/alerts";
import { useAlerts } from "@/lib/alert-store";
import { useSession } from "@/lib/session";
import { useGatedLeads } from "@/lib/use-access";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const userId = useSession((state) => state.user?.id ?? null);
  const leads = useGatedLeads();
  const { channel, lastSeenAt, load, markSeen } = useAlerts();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) void load(userId);
  }, [userId, load]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const unread = useMemo(() => (wantsApp(channel) ? unreadLeads(leads, lastSeenAt) : []), [leads, lastSeenAt, channel]);
  const overdue = useMemo(() => leads.filter((lead) => needsFollowUp(lead)), [leads]);
  const recent = leads.slice(0, 8);
  const count = unread.length;

  return (
    <div ref={box} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={count ? `Notifications, ${count} new` : "Notifications"}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          if (!open && count) markSeen();
        }}
        className="press relative grid size-11 place-items-center rounded-lg text-muted hover:bg-mist hover:text-ink"
      >
        <Bell className="size-5" strokeWidth={1.75} aria-hidden="true" />
        {count ? (
          <span className="absolute top-1.5 right-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-ink tabular-nums">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-paper shadow-panel md:left-0 md:right-auto">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-semibold">Notifications</p>
            <Link to="/settings" className="text-sm font-medium text-primary" onClick={() => setOpen(false)}>
              Settings
            </Link>
          </div>
          {overdue.length ? (
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 border-b border-line bg-accent/10 px-4 py-3 text-sm"
            >
              <Clock className="size-4 shrink-0 text-accent" aria-hidden="true" />
              {overdue.length === 1 ? "1 lead is" : `${overdue.length} leads are`} waiting over a day for a reply
            </Link>
          ) : null}
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">No leads yet. New ones will show up here.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {recent.map((lead) => {
                const isNew = unread.some((item) => item.id === lead.id);
                return (
                  <li key={lead.id} className="border-b border-line last:border-b-0">
                    <Link
                      to="/leads/$leadId"
                      params={{ leadId: lead.id }}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 px-4 py-3 hover:bg-mist"
                    >
                      <span
                        className={cn("mt-1.5 size-2 shrink-0 rounded-full", isNew ? "bg-accent" : "bg-transparent")}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">New lead: {lead.name}</span>
                        <span className="block truncate text-sm text-muted">
                          {lead.source} · {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
