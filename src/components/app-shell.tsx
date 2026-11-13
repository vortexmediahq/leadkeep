import { Link, useRouterState } from "@tanstack/react-router";
import { Inbox, Link2, ListChecks, LogOut, MessageSquareHeart, ScrollText, Settings, Wrench, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrandTheme } from "@/components/brand-theme";
import { ClientGate } from "@/components/client-gate";
import { Logo } from "@/components/mark";
import { PoweredBy } from "@/components/powered-by";
import { NotificationBell } from "@/components/notification-bell";
import { UnusualActivityBanner } from "@/components/unusual-activity";
import { PlanCard, PlanPill, PlansButton, TesterReminder } from "@/components/plan-card";
import { signOut, useSession } from "@/lib/session";
import { BrandMark } from "@/components/brand-mark";
import { hasBranding } from "@/lib/branding";
import { plansButton } from "@/lib/entitlements";
import { useEffectiveBranding } from "@/lib/use-access";
import { useLeakKeep } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Leads", icon: Inbox, match: (path: string) => path === "/" || path.startsWith("/leads") },
  { to: "/services", label: "Services", icon: Wrench, match: (path: string) => path.startsWith("/services") },
  {
    to: "/quote-style",
    label: "Quote style",
    icon: ScrollText,
    match: (path: string) => path.startsWith("/quote-style"),
  },
  { to: "/questions", label: "Questions", icon: ListChecks, match: (path: string) => path.startsWith("/questions") },
  { to: "/links", label: "Links", icon: Link2, match: (path: string) => path.startsWith("/links") },
] as const;

function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-paper px-4 py-4">
        <Logo className="w-36" />
        <p className="mt-1 text-sm text-muted">Loading your lead inbox</p>
      </header>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  count,
  stacked,
}: {
  to: (typeof NAV)[number]["to"];
  label: string;
  icon: (typeof NAV)[number]["icon"];
  active: boolean;
  count?: number;
  stacked?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "press flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
        stacked && "min-h-16 flex-1 flex-col justify-center gap-1 px-1 text-xs",
        active ? "bg-primary-soft text-primary" : "text-muted hover:bg-mist hover:text-ink",
        stacked && active && "bg-transparent",
      )}
    >
      <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      <span className={cn("flex items-center gap-2 whitespace-nowrap", stacked && "gap-1")}>
        {label}
        {count ? <span className="tabular-nums">{count}</span> : null}
      </span>
    </Link>
  );
}

function LogoutButton({ compact }: { compact?: boolean }) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signOut().finally(() => setPending(false));
      }}
      aria-label="Log out"
      className={cn(
        "press inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-muted hover:bg-mist hover:text-ink disabled:opacity-60",
        compact ? "min-w-11 justify-center px-2" : "w-full px-3",
      )}
    >
      <LogOut className="size-5" strokeWidth={1.75} aria-hidden="true" />
      {compact ? null : <span>{pending ? "Logging out…" : "Log out"}</span>}
    </button>
  );
}

function IncomingLead() {
  const incoming = useLeakKeep((state) => state.incoming);
  const dismiss = useLeakKeep((state) => state.dismissIncoming);

  useEffect(() => {
    if (!incoming) return;
    const timer = window.setTimeout(dismiss, 8000);
    return () => window.clearTimeout(timer);
  }, [incoming, dismiss]);

  if (!incoming) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 shadow-panel md:inset-x-auto md:right-6 md:bottom-6"
    >
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">New lead from {incoming.source || "a lead link"}</p>
        <p className="truncate text-sm text-muted">
          {incoming.name}
          {incoming.jobType ? ` · ${incoming.jobType}` : ""}
        </p>
      </div>
      <Link
        to="/leads/$leadId"
        params={{ leadId: incoming.id }}
        onClick={dismiss}
        className="press shrink-0 rounded-lg px-2 py-2 text-sm font-medium text-primary hover:bg-mist"
      >
        View
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="press grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-mist hover:text-ink"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const business = useLeakKeep((state) => state.business);
  const branding = useEffectiveBranding();
  const branded = hasBranding(branding);
  const entitlements = useLeakKeep((state) => state.entitlements);
  const fresh = useLeakKeep((state) => state.leads.filter((lead) => lead.status === "new").length);
  const saveError = useLeakKeep((state) => state.saveError);
  const email = useSession((state) => state.user?.email ?? "");
  const clearSaveError = useLeakKeep((state) => state.clearSaveError);

  return (
    <BrandTheme branding={branding} className="min-h-screen bg-mist md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper md:flex">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between gap-2">
            {branding.logoPath ? (
              <BrandMark path={branding.logoPath} name={business.name} heightClass="h-10" className="min-w-0 flex-1" />
            ) : (
              <Logo className="w-36" />
            )}
            <NotificationBell />
          </div>
          <p className="mt-1 text-sm text-muted">Lead inbox</p>
        </div>
        <nav className="flex flex-col gap-1 px-3" aria-label="Desk">
          {NAV.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              active={item.match(path)}
              count={item.to === "/" ? fresh : undefined}
            />
          ))}
          <Link
            to="/settings"
            className={cn(
              "press flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
              path.startsWith("/settings") ? "bg-primary-soft text-primary" : "text-muted hover:bg-mist hover:text-ink",
            )}
          >
            <Settings className="size-5" strokeWidth={1.75} aria-hidden="true" />
            Settings
          </Link>
          <Link
            to="/feedback"
            className={cn(
              "press flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
              path.startsWith("/feedback") ? "bg-primary-soft text-primary" : "text-muted hover:bg-mist hover:text-ink",
            )}
          >
            <MessageSquareHeart className="size-5" strokeWidth={1.75} aria-hidden="true" />
            Tell us what you think
          </Link>
        </nav>
        <div className="mt-auto border-t border-line px-3 py-4">
          <div className="mb-4">
            <PlanCard />
          </div>
          <div className="px-1">
            <p className="truncate text-sm font-medium">{business.name || "Your business"}</p>
            <p className="truncate text-sm text-muted" title={email}>
              {email}
            </p>
          </div>
          <div className="mt-3">
            <LogoutButton />
          </div>
          <PoweredBy compact={branded} className="mt-3" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {plansButton(entitlements).show ? (
          <div className="sticky top-0 z-10 hidden items-center justify-end border-b border-line bg-paper/95 px-8 py-1.5 backdrop-blur md:flex">
            <PlansButton />
          </div>
        ) : null}
        <header className="sticky top-0 z-10 border-b border-line bg-paper px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              {branding.logoPath ? (
                <BrandMark path={branding.logoPath} name={business.name} heightClass="h-7" />
              ) : (
                <Logo className="h-7 w-auto" />
              )}
              <p className="truncate text-sm text-muted">{business.name || email}</p>
            </div>
            <PlanPill />
            {/* Free accounts already have the plans pill above; paying accounts get a short "My plan" link. */}
            {entitlements.tier !== "free" ? <PlansButton compact /> : null}
            <NotificationBell />
            <Link
              to="/settings"
              aria-label="Settings and feedback"
              className="press grid size-11 place-items-center rounded-lg text-muted hover:bg-mist hover:text-ink"
            >
              <Settings className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <LogoutButton compact />
          </div>
        </header>
        <main className="px-4 py-6 pb-36 md:px-8 md:py-8 md:pb-10">
          {saveError ? (
            <div
              role="alert"
              className="mx-auto mb-5 flex max-w-5xl items-start justify-between gap-3 rounded-2xl border border-lost/30 bg-paper px-4 py-3 text-sm text-lost"
            >
              <p>{saveError} Your last change may not be saved.</p>
              <button type="button" onClick={clearSaveError} className="press shrink-0 font-medium">
                Dismiss
              </button>
            </div>
          ) : null}
          <UnusualActivityBanner />
          <TesterReminder />
          {children}
          <PoweredBy compact={branded} className="mx-auto mt-10 max-w-3xl md:mt-12" />
          <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-faint">
            <Link to="/privacy" className="hover:text-muted">
              Privacy Policy
            </Link>
            {" · "}
            <Link to="/terms" className="hover:text-muted">
              Terms
            </Link>
          </p>
        </main>
      </div>

      <IncomingLead />

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper md:hidden"
        aria-label="Desk"
      >
        <div className="flex">
          {NAV.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              stacked
              active={item.match(path)}
              count={item.to === "/" ? fresh : undefined}
            />
          ))}
        </div>
      </nav>
    </BrandTheme>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ClientGate fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </ClientGate>
  );
}
