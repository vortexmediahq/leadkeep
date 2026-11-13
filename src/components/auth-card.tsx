import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth-shell";

export function AuthCard({ title, lead, children, footer }: { title: string; lead: string; children?: ReactNode; footer?: ReactNode }) {
  return (
    <AuthShell>
      <div className="rounded-3xl border border-white/10 bg-paper p-4 shadow-panel sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{lead}</p>
        <div className="mt-5">{children}</div>
      </div>
      {footer ? <div className="mt-4 text-center text-sm text-white/70">{footer}</div> : null}
    </AuthShell>
  );
}
