import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/mark";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:py-12">
      <Link to="/login" className="inline-block">
        <Logo className="w-36" />
      </Link>
      <p className="mt-6 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-ink">
        This is a draft template for LeadKeep. It needs to be reviewed before you rely on it, and it is not legal advice.
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="legal-copy mt-6 flex flex-col gap-4 text-sm leading-relaxed text-ink-soft">{children}</div>
      <p className="mt-8 text-sm text-muted">
        <Link to="/login" className="font-medium text-primary">
          Back to log in
        </Link>
        {" · "}
        <Link to="/privacy" className="font-medium text-primary">
          Privacy Policy
        </Link>
        {" · "}
        <Link to="/terms" className="font-medium text-primary">
          Terms
        </Link>
      </p>
    </main>
  );
}
