import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth-shell";

/** Shared glass panel for log in, sign up and the other auth cards on the navy shell. */
export const AUTH_PANEL =
  "auth-glass rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] p-4 shadow-none backdrop-blur-xl sm:p-6";

export function AuthCard({ title, lead, children, footer }: { title: string; lead: string; children?: ReactNode; footer?: ReactNode }) {
  return (
    <AuthShell>
      <div className={AUTH_PANEL}>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-1 text-sm text-[#c5d0de]">{lead}</p>
        <div className="mt-5">{children}</div>
      </div>
      {footer ? <div className="mt-4 w-full text-center text-sm text-white/70">{footer}</div> : null}
      <p className="mt-3 w-full text-center text-xs text-white/50">
        <Link to="/privacy" className="hover:text-white/80">
          Privacy Policy
        </Link>
        {" · "}
        <Link to="/terms" className="hover:text-white/80">
          Terms
        </Link>
      </p>
    </AuthShell>
  );
}
