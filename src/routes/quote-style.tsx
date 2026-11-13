import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Field, TextArea } from "@/components/ui/fields";
import { useLeakKeep } from "@/lib/store";

export const Route = createFileRoute("/quote-style")({
  head: () => ({ meta: [{ title: "Quote style · LeadKeep" }] }),
  component: QuoteStylePage,
});

function QuoteStylePage() {
  return (
    <AppShell>
      <QuoteStyle />
    </AppShell>
  );
}

function QuoteStyle() {
  const template = useLeakKeep((state) => state.template);
  const updateTemplate = useLeakKeep((state) => state.updateTemplate);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Quote style</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Paste how you like quotes to sound. Every generated quote follows this, along with the job and your services.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <Field id="tone" label="Tone" hint="How you speak to a customer.">
          <TextArea
            id="tone"
            value={template.tone}
            onChange={(event) => updateTemplate({ tone: event.target.value })}
          />
        </Field>
        <Field id="structure" label="Structure" hint="The sections, in the order you want them.">
          <TextArea
            id="structure"
            className="min-h-40"
            value={template.structure}
            onChange={(event) => updateTemplate({ structure: event.target.value })}
          />
        </Field>
        <Field id="payment" label="Payment terms">
          <TextArea
            id="payment"
            value={template.paymentTerms}
            onChange={(event) => updateTemplate({ paymentTerms: event.target.value })}
          />
        </Field>
        <Field id="warranty" label="Warranty language" hint="Optional. Leave blank to leave it out of quotes.">
          <TextArea
            id="warranty"
            placeholder="e.g. All work is guaranteed for 12 months. Refunds within 7 days if you cancel before we start."
            value={template.warranty}
            onChange={(event) => updateTemplate({ warranty: event.target.value })}
          />
        </Field>
        <Field id="extra" label="Closing and anything else" hint="Optional. Leave blank to leave it out of quotes.">
          <TextArea
            id="extra"
            placeholder="e.g. Thanks for choosing us. We will confirm the details by phone."
            value={template.extra}
            onChange={(event) => updateTemplate({ extra: event.target.value })}
          />
        </Field>
      </div>
      <p className="text-sm text-muted">Saved automatically as you type.</p>
    </div>
  );
}
