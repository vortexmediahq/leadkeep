import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, Plus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/fields";
import { SOURCE_OPTIONS } from "@/lib/question-templates";
import { useLeakKeep } from "@/lib/store";
import type { LeadLink } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/links")({
  head: () => ({ meta: [{ title: "Lead links · LeadKeep" }] }),
  component: LinksPage,
});

const SOURCE_HINT = "Where you'll share this link, so you can see which channel brings leads.";

function LinksPage() {
  return (
    <AppShell>
      <LinksDesk />
    </AppShell>
  );
}

function LinksDesk() {
  const business = useLeakKeep((state) => state.business);
  const updateBusiness = useLeakKeep((state) => state.updateBusiness);
  const links = useLeakKeep((state) => state.links);
  const addLink = useLeakKeep((state) => state.addLink);
  const updateLink = useLeakKeep((state) => state.updateLink);
  const removeLink = useLeakKeep((state) => state.removeLink);
  const questionnaires = useLeakKeep((state) => state.questionnaires);
  const questionnairesReady = useLeakKeep((state) => state.questionnairesReady);
  const setLinkQuestionnaire = useLeakKeep((state) => state.setLinkQuestionnaire);
  const [preset, setPreset] = useState<string>(SOURCE_OPTIONS[0]);
  const [custom, setCustom] = useState("");
  const [questionnaireId, setQuestionnaireId] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [adding, setAdding] = useState(true);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (links.length === 0) setAdding(true);
  }, [links.length]);

  async function create(event: FormEvent) {
    event.preventDefault();
    const name = (preset === "other" ? custom : preset).trim();
    if (!name) {
      setFormError("Name the place you'll share it, like a poster or newsletter.");
      return;
    }
    setCreating(true);
    setFormError("");
    try {
      await addLink(name.slice(0, 120), questionnaireId || null);
      setCustom("");
      setPreset(SOURCE_OPTIONS[0]);
      setAdding(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Couldn't create the link. Check your connection and try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function copy(link: LeadLink) {
    try {
      await navigator.clipboard.writeText(`${origin}/l/${link.slug}`);
      setCopyError("");
      setCopied(link.id);
      window.setTimeout(() => setCopied((current) => (current === link.id ? null : current)), 2000);
    } catch {
      setCopied(null);
      setCopyError("Couldn't copy. Select the link and copy it manually.");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Lead links</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Make one link for each place you share it: a social post, an advert, your website or a QR flyer. People answer
          your questions and the lead lands in your inbox tagged with where it came from.
        </p>
      </header>

      {adding ? (
        <section id="new-link" className="scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel">
          <h2 className="text-lg font-semibold tracking-tight">Add your social page</h2>
          <p className="mt-1 text-sm text-muted">{SOURCE_HINT}</p>
          <form onSubmit={(event) => void create(event)} className="mt-4 flex flex-col gap-3">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink">Where will you share it?</legend>
              <div className="flex flex-wrap gap-2">
                {SOURCE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setPreset(option);
                      setFormError("");
                    }}
                    aria-pressed={preset === option}
                    className={cn(
                      "press h-10 rounded-full px-3 text-sm font-medium",
                      preset === option ? "bg-ink text-paper" : "border border-line bg-paper text-ink-soft",
                    )}
                  >
                    {option}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPreset("other")}
                  aria-pressed={preset === "other"}
                  className={cn(
                    "press h-10 rounded-full px-3 text-sm font-medium",
                    preset === "other" ? "bg-ink text-paper" : "border border-line bg-paper text-ink-soft",
                  )}
                >
                  Something else…
                </button>
              </div>
            </fieldset>
            {preset === "other" ? (
              <Field id="new-source-custom" label="Name this page" error={formError}>
                <TextInput
                  id="new-source-custom"
                  value={custom}
                  maxLength={120}
                  placeholder="e.g. Market stall poster, LinkedIn, newsletter"
                  onChange={(event) => setCustom(event.target.value)}
                />
              </Field>
            ) : formError ? (
              <p className="text-sm text-lost" role="alert">
                {formError}
              </p>
            ) : null}
            <Field
              id="new-questionnaire"
              label="Questions to ask"
              hint={questionnairesReady && questionnaires.length === 0 ? "Build your own on the Questions page." : undefined}
            >
              <SelectInput
                id="new-questionnaire"
                value={questionnaireId}
                disabled={!questionnairesReady}
                onChange={(event) => setQuestionnaireId(event.target.value)}
              >
                <option value="">Standard (Quick enquiry)</option>
                {questionnaires.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || "Untitled questionnaire"}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <div>
              <Button type="submit" disabled={creating}>
                <Plus className="size-4" aria-hidden="true" />
                {creating ? "Adding…" : "Add your social page"}
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <div id="new-link" className="scroll-mt-20">
          <Button onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Add another
          </Button>
        </div>
      )}

      {copyError ? (
        <p className="text-sm text-lost" role="alert">
          {copyError}
        </p>
      ) : null}

      {links.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-paper px-4 py-10 text-center">
          <p className="font-medium text-ink">No links yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Pick where you'll share it above and press Add your social page. Then paste the link into your post or
            advert.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {links.map((link) => {
            const path = `/l/${link.slug}`;
            const url = origin ? `${origin}${path}` : path;
            return (
              <li key={link.id} className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
                <Field id={`source-${link.id}`} label="Source" hint={SOURCE_HINT}>
                  <TextInput
                    id={`source-${link.id}`}
                    value={link.source}
                    maxLength={120}
                    onChange={(event) => updateLink(link.id, event.target.value)}
                  />
                </Field>
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-mist p-1 pl-3">
                  <p className="min-w-0 flex-1 truncate text-sm text-ink-soft select-all" title={url}>
                    {url}
                  </p>
                  <Button size="sm" onClick={() => void copy(link)} aria-label={`Copy ${link.source || "lead"} link`}>
                    {copied === link.id ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                    {copied === link.id ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-muted">Renaming changes the tag on new leads. The link stays the same.</p>
                {questionnairesReady ? (
                  <div className="mt-3">
                    <Field id={`questions-${link.id}`} label="Questions on this link">
                      <SelectInput
                        id={`questions-${link.id}`}
                        value={link.questionnaireId ?? ""}
                        onChange={(event) => setLinkQuestionnaire(link.id, event.target.value || null)}
                      >
                        <option value="">Standard (Quick enquiry)</option>
                        {questionnaires.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name || "Untitled questionnaire"}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <Link to="/l/$linkId" params={{ linkId: link.slug }} target="_blank">
                      Open form
                    </Link>
                  </Button>
                  {confirming === link.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setConfirming(null);
                          removeLink(link.id);
                        }}
                      >
                        Yes, turn off link
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setConfirming(null)}>
                        Keep it
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="danger" onClick={() => setConfirming(link.id)}>
                      Remove
                    </Button>
                  )}
                </div>
                {confirming === link.id ? (
                  <p className="mt-2 text-sm text-muted">
                    Anyone with this link will no longer be able to reach you through it. Existing leads stay.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <section id="business" className="scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">Your business</h2>
        <p className="mt-1 text-sm text-muted">Shown at the top of your form, and used when a quote is written. Saved automatically.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="biz-name" label="Business name">
            <TextInput
              id="biz-name"
              value={business.name}
              onChange={(event) => updateBusiness({ name: event.target.value })}
            />
          </Field>
          <Field id="biz-trade" label="Type of business">
            <TextInput
              id="biz-trade"
              placeholder="e.g. Hair salon, Photographer, Coach"
              value={business.trade}
              onChange={(event) => updateBusiness({ trade: event.target.value })}
            />
          </Field>
          <Field id="biz-city" label="City">
            <TextInput
              id="biz-city"
              value={business.city}
              onChange={(event) => updateBusiness({ city: event.target.value })}
            />
          </Field>
          <Field id="biz-currency" label="Currency">
            <TextInput
              id="biz-currency"
              value={business.currency}
              maxLength={8}
              onChange={(event) => updateBusiness({ currency: event.target.value })}
            />
          </Field>
          <Field id="biz-phone" label="Phone">
            <TextInput
              id="biz-phone"
              value={business.phone}
              onChange={(event) => updateBusiness({ phone: event.target.value })}
            />
          </Field>
          <Field id="biz-email" label="Email">
            <TextInput
              id="biz-email"
              value={business.email}
              onChange={(event) => updateBusiness({ email: event.target.value })}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
