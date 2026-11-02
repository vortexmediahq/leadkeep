import { createFileRoute, Link } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { Check, ChevronLeft, Copy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { SelectInput, TextArea } from "@/components/ui/fields";
import { generateQuote } from "@/lib/quote.functions";
import { useLeakKeep } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { STATUSES, type LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leads/$leadId")({
  head: () => ({ meta: [{ title: "Lead · LeakKeep" }] }),
  component: LeadPage,
});

function LeadPage() {
  const { leadId } = Route.useParams();
  return (
    <AppShell>
      <LeadDetail leadId={leadId} />
    </AppShell>
  );
}

function LeadDetail({ leadId }: { leadId: string }) {
  const lead = useLeakKeep((state) => state.leads.find((item) => item.id === leadId));
  const hasServices = useLeakKeep((state) => state.services.some((service) => service.name.trim()));
  const hasStyle = useLeakKeep((state) =>
    [state.template.tone, state.template.structure, state.template.paymentTerms].some((part) => part.trim()),
  );
  const flushSaves = useLeakKeep((state) => state.flushSaves);
  const updateLead = useLeakKeep((state) => state.updateLead);
  const setStatus = useLeakKeep((state) => state.setStatus);
  const [text, setText] = useState(lead?.quote ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  useEffect(() => {
    setText(lead?.quote ?? "");
    setError("");
    setCopied(false);
    setConfirmReplace(false);
  }, [lead?.id]);

  if (!lead) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">We couldn't find this lead</h1>
        <p className="mt-2 text-sm text-muted">The link may be out of date.</p>
        <Link to="/" className="mt-4 inline-flex text-sm font-medium text-primary">
          Back to leads
        </Link>
      </div>
    );
  }

  const current = lead;

  const saveText = (value: string) => {
    setText(value);
    updateLead(current.id, { quote: value, quoteUpdatedAt: new Date().toISOString() });
  };

  const onGenerate = async () => {
    setConfirmReplace(false);
    setPending(true);
    setError("");
    try {
      await flushSaves().catch(() => undefined);
      const { data: auth } = await supabase.auth.getSession();
      const accessToken = auth.session?.access_token;
      if (!accessToken) {
        setError("Your session has expired. Log in again to write quotes.");
        return;
      }
      const result = await generateQuote({ data: { leadId: current.id, accessToken } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      saveText(result.text);
      if (current.status === "new" || current.status === "contacted") {
        setStatus(current.id, "quoted");
      }
    } catch {
      setError("The quote didn't come back. Try again.");
    } finally {
      setPending(false);
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Select the quote and copy it manually.");
    }
  };

  const rows = [
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Address", lead.address],
    ["Job", lead.jobType],
    ["Urgency", lead.urgency],
    ["Preferred time", lead.preferredTime],
    ["Property", lead.propertyType],
    ["Budget", lead.budget],
    ["Access", lead.accessNotes],
  ] as const;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link to="/" className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-muted">
        <ChevronLeft className="size-4" aria-hidden="true" />
        Leads
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {lead.source} · {format(new Date(lead.createdAt), "d MMM yyyy, HH:mm")} ·{" "}
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </p>
        </div>
        <StatusBadge status={lead.status} />
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
          <h2 className="text-lg font-semibold tracking-tight">Questionnaire</h2>
          <dl className="mt-2">
            {rows.map(([label, value]) =>
              value.trim() ? (
                <div
                  key={label}
                  className="grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"
                >
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="text-base break-words text-ink">{value}</dd>
                </div>
              ) : null,
            )}
            <div className="border-b border-line py-3 last:border-b-0">
              <dt className="text-sm text-muted">What they told you</dt>
              <dd className="mt-1 text-base break-words whitespace-pre-wrap text-ink">{lead.description}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Status</p>
            <div className="sm:hidden">
              <SelectInput
                aria-label="Status"
                value={lead.status}
                onChange={(event) => setStatus(lead.id, event.target.value as LeadStatus)}
              >
                {STATUSES.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </SelectInput>
            </div>
            <div className="hidden gap-2 sm:grid sm:grid-cols-5" role="group" aria-label="Status">
              {STATUSES.map((status) => {
                const on = lead.status === status.id;
                return (
                  <button
                    key={status.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setStatus(lead.id, status.id)}
                    className={cn(
                      "press h-11 rounded-lg border text-sm font-medium",
                      on ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft",
                    )}
                  >
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-line bg-paper p-4 shadow-panel lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold tracking-tight">Quote</h2>
          <p className="mt-1 text-sm text-muted">
            Uses this job, your{" "}
            <Link to="/services" className="font-medium text-primary">
              services
            </Link>
            , and your{" "}
            <Link to="/quote-style" className="font-medium text-primary">
              quote style
            </Link>
            .
          </p>
          {!hasServices || !hasStyle ? (
            <p className="mt-3 rounded-xl bg-primary-soft px-3 py-2 text-sm text-ink-soft">
              {!hasServices ? (
                <>
                  Add your{" "}
                  <Link to="/services" className="font-medium text-primary">
                    services and prices
                  </Link>{" "}
                  so quotes show real numbers.{" "}
                </>
              ) : null}
              {!hasStyle ? (
                <>
                  Set your{" "}
                  <Link to="/quote-style" className="font-medium text-primary">
                    quote style
                  </Link>{" "}
                  so quotes sound like you.
                </>
              ) : null}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mt-3 text-sm text-lost">
              {error}
            </p>
          ) : null}
          {confirmReplace ? (
            <div className="mt-4 rounded-xl border border-line bg-mist p-3">
              <p className="text-sm text-ink">Replace the current quote and your edits with a fresh one?</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => void onGenerate()}>
                  Replace quote
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setConfirmReplace(false)}>
                  Keep current
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="mt-4 w-full"
              onClick={() => (text.trim() ? setConfirmReplace(true) : void onGenerate())}
              disabled={pending}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {pending ? "Writing quote…" : text.trim() ? "Regenerate quote" : "Generate quote"}
            </Button>
          )}
          <label htmlFor="quote-text" className="mt-4 block text-sm font-medium">
            Quote text
            <span className="font-normal text-muted"> · edit anything before you send</span>
          </label>
          <TextArea
            id="quote-text"
            className={cn("mt-2 min-h-96 font-serif leading-relaxed", pending && "animate-pulse opacity-60")}
            value={text}
            onChange={(event) => saveText(event.target.value)}
            readOnly={pending}
            placeholder="Your quote will land here, built from this job, your prices and your quote style."
          />
          <Button
            className="mt-3 w-full"
            variant={text.trim() && !pending ? "primary" : "secondary"}
            onClick={() => void onCopy()}
            disabled={!text.trim() || pending}
            aria-live="polite"
          >
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
            {copied ? "Copied to clipboard" : "Copy Quote"}
          </Button>
          {lead.quoteUpdatedAt ? (
            <p className="mt-2 text-sm text-muted">
              Saved {formatDistanceToNow(new Date(lead.quoteUpdatedAt), { addSuffix: true })}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
