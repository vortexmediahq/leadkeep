import { createFileRoute, Link } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { Check, ChevronLeft, Copy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BrandedQuote, CustomerQuotePreview, brandedQuotePlainText } from "@/components/branded-quote";
import { ContactButtons } from "@/components/contact-buttons";
import { QuoteShare } from "@/components/quote-share";
import { LeadBadge } from "@/components/status-badge";
import { quoteReminder } from "@/lib/quote-flow";
import { needsFollowUp } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { SelectInput, TextArea } from "@/components/ui/fields";
import { generateQuote } from "@/lib/quote.functions";
import { quotesLeft } from "@/lib/plan";
import { useLeakKeep } from "@/lib/store";
import { useAccess, useEffectiveBranding, useGatedLeads } from "@/lib/use-access";
import { supabase } from "@/lib/supabase";
import { STATUSES, type LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leads/$leadId")({
  head: () => ({ meta: [{ title: "Lead · LeadKeep" }] }),
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
  const businessName = useLeakKeep((state) => state.business.name);
  const businessPhone = useLeakKeep((state) => state.business.phone);
  const businessEmail = useLeakKeep((state) => state.business.email);
  const branding = useEffectiveBranding();
  const [previewing, setPreviewing] = useState(false);
  const leads = useGatedLeads();
  const lead = leads.find((item) => item.id === leadId);
  const access = useAccess();
  const hasServices = useLeakKeep((state) => state.services.some((service) => service.name.trim()));
  const hasStyle = useLeakKeep((state) =>
    [state.template.tone, state.template.structure, state.template.paymentTerms].some((part) => part.trim()),
  );
  const flushSaves = useLeakKeep((state) => state.flushSaves);
  const allowance = useLeakKeep((state) => state.allowance);
  const setAllowance = useLeakKeep((state) => state.setAllowance);
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

  if (lead.locked) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Link to="/" className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-muted">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Leads
        </Link>
        <div className="rounded-3xl border border-accent/40 bg-accent-soft p-6">
          <h1 className="text-2xl font-semibold tracking-tight">This lead is saved for you</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Someone got in touch {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })} through {lead.source || "your link"}.
            Your Free plan shows the details of your first 10 leads. Upgrade to see their name, number and answers, and reply while
            they're still interested.
          </p>
          <p className="mt-4 select-none text-sm text-ink-soft blur-[5px]" aria-hidden="true">
            Jordan Example · 082 000 0000 · jordan@example.com
          </p>
          <Button asChild className="mt-4">
            <Link to="/pricing">
              <Sparkles className="size-4" aria-hidden="true" />
              Unlock my leads
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const current = lead;
  const aiOn = access.features.aiQuotes;
  const outOfQuotes = !aiOn || (allowance?.plan === "free" && quotesLeft(allowance) === 0);

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
      if (result.allowance) setAllowance(result.allowance);
      if (!result.ok) {
        if (result.limitReached) return;
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
      const payload = branding.showOnQuote ? brandedQuotePlainText(businessName, text) : text;
      await navigator.clipboard.writeText(payload);
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
    ["Form", lead.jobType],
    ["Urgency", lead.urgency],
    ["Preferred time", lead.preferredTime],
    ["Property", lead.propertyType],
    ["Budget", lead.budget],
    ["Access", lead.accessNotes],
  ] as const;

  if (previewing) {
    return <CustomerQuotePreview businessName={businessName} branding={branding} text={text} customer={lead.name} service={lead.serviceName || lead.jobType} contact={{ phone: businessPhone, email: businessEmail }} onBack={() => setPreviewing(false)} />;
  }

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
        <LeadBadge lead={lead} />
      </header>

      {quoteReminder(lead) ? (
        <p role="status" className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-ink">
          <strong>Follow up.</strong> {quoteReminder(lead)?.text}
        </p>
      ) : null}

      {needsFollowUp(lead) ? (
        <p role="status" className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-ink">
          <strong>Follow up today.</strong> This lead came in over a day ago and isn't marked as contacted yet.
        </p>
      ) : null}

      <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel" aria-label="Get in touch">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Get in touch</h2>
        <ContactButtons
          name={lead.name}
          phone={lead.phone}
          email={lead.email}
          business={businessName}
          onContact={() => {
            if (current.status === "new") setStatus(current.id, "contacted");
          }}
        />
        {lead.status === "new" ? (
          <p className="mt-2 text-xs text-muted">Tapping a button marks this lead as contacted.</p>
        ) : null}
      </section>

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
            {lead.responses.length ? (
              lead.responses.map((item, index) => (
                <div key={`${index}-${item.question}`} className="border-b border-line py-3 last:border-b-0">
                  <dt className="text-sm text-muted">{item.question}</dt>
                  <dd className="mt-1 text-base break-words whitespace-pre-wrap text-ink">{item.answer || "—"}</dd>
                </div>
              ))
            ) : lead.description.trim() ? (
              <div className="border-b border-line py-3 last:border-b-0">
                <dt className="text-sm text-muted">Their answers</dt>
                <dd className="mt-1 text-base break-words whitespace-pre-wrap text-ink">{lead.description}</dd>
              </div>
            ) : null}
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
            Uses these answers, your{" "}
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
          {outOfQuotes ? (
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary-soft p-3">
              <p className="text-sm font-medium text-ink">AI-written quotes are on Care and Growth</p>
              <p className="mt-1 text-sm text-ink-soft">
                You can still write and edit this quote yourself. Upgrade for unlimited AI quotes.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/pricing">
                  <Sparkles className="size-4" aria-hidden="true" />
                  See plans
                </Link>
              </Button>
            </div>
          ) : confirmReplace ? (
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
          {aiOn && allowance?.plan === "free" && allowance.limit > 0 && !outOfQuotes ? (
            <p className="mt-2 text-center text-xs text-muted">
              {quotesLeft(allowance)} of {allowance.limit} free AI quotes left this month ·{" "}
              <Link to="/pricing" className="font-medium text-primary">
                Upgrade
              </Link>
            </p>
          ) : null}
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
            placeholder="Your quote will land here, built from these answers, your prices and your quote style."
          />
          <BrandedQuote businessName={businessName} branding={branding} text={text} customer={lead.name} service={lead.serviceName || lead.jobType} contact={{ phone: businessPhone, email: businessEmail }} />
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
          <Button className="mt-2 w-full" variant="secondary" onClick={() => setPreviewing(true)} disabled={!text.trim() || pending}>
            Preview as customer
          </Button>
          <QuoteShare lead={lead} hasText={!!text.trim()} />
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
