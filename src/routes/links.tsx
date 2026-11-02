import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import { useLeakKeep } from "@/lib/store";
import type { LeadLink } from "@/lib/types";

export const Route = createFileRoute("/links")({
  head: () => ({ meta: [{ title: "Lead links · LeakKeep" }] }),
  component: LinksPage,
});

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
  const [source, setSource] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    const name = source.trim();
    if (!name) {
      setFormError("Name the place you'll share it, like Facebook Ad.");
      return;
    }
    setCreating(true);
    setFormError("");
    try {
      await addLink(name.slice(0, 120));
      setSource("");
    } catch {
      setFormError("Couldn't create the link. Check your connection and try again.");
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
          Put a link on a Facebook ad, your website, Google Business, or Instagram. The person fills in the job. It lands here tagged with the source.
        </p>
      </header>

      <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
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
          <Field id="biz-trade" label="Trade">
            <TextInput
              id="biz-trade"
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

      <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">New link</h2>
        <p className="mt-1 text-sm text-muted">Every lead that comes through it is tagged with this source.</p>
        <form onSubmit={create} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Field id="new-source" label="Source name" error={formError}>
              <TextInput
                id="new-source"
                value={source}
                maxLength={120}
                placeholder="Facebook Ad"
                onChange={(event) => setSource(event.target.value)}
              />
            </Field>
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create link"}
          </Button>
        </form>
      </section>

      {copyError ? (
        <p className="text-sm text-lost" role="alert">
          {copyError}
        </p>
      ) : null}

      {links.length === 0 ? (
        <p className="rounded-3xl border border-line bg-paper px-4 py-8 text-center text-sm text-muted">
          No links yet. Create one to start collecting jobs.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {links.map((link) => {
            const path = `/l/${link.slug}`;
            const url = origin ? `${origin}${path}` : path;
            return (
              <li key={link.id} className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
                <Field id={`source-${link.id}`} label="Source">
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
                  <p className="mt-2 text-sm text-muted">Anyone with this link will no longer be able to send you jobs. Existing leads stay.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
