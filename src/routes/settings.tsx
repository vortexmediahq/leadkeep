import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ALERT_CHANNELS } from "@/lib/alerts";
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
  const { channel, load, setChannel } = useAlerts();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userId) void load(userId);
  }, [userId, load]);

  const sendTo = businessEmail.trim() || loginEmail;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Choose how LeadKeep tells you about new leads.</p>
      </header>

      <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">New lead alerts</h2>
        <fieldset className="mt-3 flex flex-col gap-2">
          <legend className="sr-only">How should we tell you about new leads?</legend>
          {ALERT_CHANNELS.map((option) => (
            <label
              key={option.id}
              className={cn(
                "press flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3",
                channel === option.id ? "border-accent bg-accent-soft" : "border-line",
              )}
            >
              <input
                type="radio"
                name="alert-channel"
                className="mt-1 size-4 accent-[#FF5F03]"
                checked={channel === option.id}
                onChange={() => {
                  void setChannel(option.id).then(() => {
                    setSaved(true);
                    window.setTimeout(() => setSaved(false), 2000);
                  });
                }}
              />
              <span>
                <span className="block font-medium">{option.label}</span>
                <span className="block text-sm text-muted">{option.help}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="mt-3 text-sm text-muted" aria-live="polite">
          {saved ? "Saved." : channel !== "app" ? `Emails go to ${sendTo || "your login email"}.` : "\u00a0"}
        </p>
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
