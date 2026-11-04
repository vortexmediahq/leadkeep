import type { ReactNode } from "react";
import { Logo } from "@/components/mark";

export function AuthCard({ title, lead, children, footer }: { title: string; lead: string; children?: ReactNode; footer?: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo className="w-40" />
        </div>
        <div className="rounded-3xl border border-line bg-paper p-4 shadow-panel sm:p-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted">{lead}</p>
          <div className="mt-5">{children}</div>
        </div>
        {footer ? <div className="mt-4 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </main>
  );
}
