import { Link, useRouterState } from "@tanstack/react-router";
import { Inbox, Link2, LogOut, ScrollText, Wrench } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ClientGate } from "@/components/client-gate";
import { Mark } from "@/components/mark";
import { signOut, useSession } from "@/lib/session";
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
  { to: "/links", label: "Links", icon: Link2, match: (path: string) => path.startsWith("/links") },
] as const;

function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-paper px-4 py-4">
        <p className="text-base font-semibold tracking-tight">LeakKeep</p>
        <p className="text-sm text-muted">Loading your lead desk</p>
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

function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const business = useLeakKeep((state) => state.business);
  const fresh = useLeakKeep((state) => state.leads.filter((lead) => lead.status === "new").length);
  const saveError = useLeakKeep((state) => state.saveError);
  const email = useSession((state) => state.user?.email ?? "");
  const clearSaveError = useLeakKeep((state) => state.clearSaveError);

  return (
    <div className="min-h-screen bg-mist md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper md:flex">
        <div className="flex items-center gap-3 px-4 py-5">
          <Mark />
          <div>
            <p className="text-base font-semibold tracking-tight">LeakKeep</p>
            <p className="text-sm text-muted">Lead desk</p>
          </div>
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
        </nav>
        <div className="mt-auto border-t border-line px-3 py-4">
          <div className="px-1">
            <p className="truncate text-sm font-medium">{business.name}</p>
            <p className="truncate text-sm text-muted" title={email}>
              {email}
            </p>
          </div>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-line bg-paper px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <Mark className="size-8" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold tracking-tight">LeakKeep</p>
              <p className="truncate text-sm text-muted">{business.name}</p>
            </div>
            <LogoutButton compact />
          </div>
        </header>
        <main className="px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-10">
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
          {children}
        </main>
      </div>

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
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ClientGate fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </ClientGate>
  );
}
