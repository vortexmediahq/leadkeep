import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ALERT_CHANNELS, wantsEmail } from "@/lib/alerts";
import { effectiveTier } from "@/lib/entitlements";
import { NOTIFY_SETUP_KEY } from "@/lib/setup-progress";
import { useAccess } from "@/lib/use-access";
import { useAlerts } from "@/lib/alert-store";
import { useSession } from "@/lib/session";
import { useLeakKeep } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · LeadKeep" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}

function Settings() {
  const userId = useSession((state) => state.user?.id ?? null);
  const loginEmail = useSession((state) => state.user?.email ?? "");
  const businessEmail = useLeakKeep((state) => state.business.email);
  const entitlements = useLeakKeep((state) => state.entitlements);
  const { channel, load, setChannel } = useAlerts();
  const [saved, setSaved] = useState(false);
  const emailOk = useAccess().features.emailAlerts;
  const tier = effectiveTier(entitlements);
  const planName = entitlements.admin
    ? "Owner access (no limits)"
    : entitlements.tier === "free" && tier !== "free" && !entitlements.admin
      ? "early access (full, for now)"
      : {"free": "the Free plan", "care": "the Care plan", "growth": "the Growth plan"}[tier] +
        (entitlements.founding ? ", at the founding price" : "");
  const canUpgrade = !entitlements.admin && tier !== "growth";

  useEffect(() => {
    if (userId) void load(userId);
  }, [userId, load]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTIFY_SETUP_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const sendTo = businessEmail.trim() || loginEmail;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Choose how LeadKeep tells you about new leads.</p>
      </header>

      <section id="plan" className="scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">Your plan</h2>
        <p className="mt-1 text-sm text-muted">
          You're on <span className="font-medium text-ink">{planName}</span>.
          {entitlements.periodEnd ? " Renews or ends on the date shown on the pricing page." : ""}
        </p>
        <Button asChild className="mt-3" variant={canUpgrade ? "accent" : "secondary"}>
          <Link to="/pricing">{canUpgrade ? "Upgrade" : "See plans"}</Link>
        </Button>
      </section>

      <section id="alerts" className="scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">New lead alerts</h2>
        <fieldset className="mt-3 flex flex-col gap-2">
          <legend className="sr-only">How should we tell you about new leads?</legend>
          {ALERT_CHANNELS.map((option) => {
            const locked = !emailOk && wantsEmail(option.id);
            return (
            <label
              key={option.id}
              className={cn(
                "press flex items-start gap-3 rounded-2xl border px-4 py-3",
                locked ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                channel === option.id && !locked ? "border-accent bg-accent-soft" : "border-line",
              )}
            >
              <input
                type="radio"
                name="alert-channel"
                className="mt-1 size-4 accent-[#FF5F03]"
                checked={locked ? false : emailOk ? channel === option.id : option.id === "app"}
                disabled={locked}
                onChange={() => {
                  void setChannel(option.id).then(() => {
                    setSaved(true);
                    window.setTimeout(() => setSaved(false), 2000);
                  });
                }}
              />
              <span>
                <span className="block font-medium">{option.label}</span>
                <span className="block text-sm text-muted">
                  {locked ? "Email alerts come with Care and Growth." : option.help}
                </span>
              </span>
            </label>
            );
          })}
        </fieldset>
        <p className="mt-3 text-sm text-muted" aria-live="polite">
          {saved ? "Saved." : emailOk && channel !== "app" ? `Emails go to ${sendTo || "your login email"}.` : "\u00a0"}
        </p>
        {!emailOk ? (
          <p className="mt-3 text-sm text-ink-soft">
            On the Free plan new leads show up under the bell.{" "}
            <Link to="/pricing" className="font-medium text-primary">
              Upgrade for email alerts
            </Link>
            .
          </p>
        ) : null}
        <p className="mt-1 text-sm text-muted">
          Want emails sent somewhere else? Change the email in your business details on the{" "}
          <Link to="/links" className="font-medium text-primary">
            Links
          </Link>{" "}
          page.
        </p>
      </section>

      <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">Follow-up reminders</h2>
        <p className="mt-1 text-sm text-muted">
          Leads still marked "New" after 24 hours get an orange "Follow up" tag, so nobody slips through the cracks.
        </p>
      </section>

      <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">Tell us what you think</h2>
        <p className="mt-1 text-sm text-muted">Ideas, problems or praise. We read every message.</p>
        <Button asChild variant="accent" className="mt-3">
          <Link to="/feedback">Send feedback</Link>
        </Button>
      </section>
    </div>
  );
}
