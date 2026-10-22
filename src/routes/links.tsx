import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import { useSession } from "@/lib/session";
import { useLeakKeep } from "@/lib/store";
import { slugify } from "@/lib/utils";

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
  const ownerId = useSession((state) => state.user?.id ?? "");
  const [source, setSource] = useState("");
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function create(event: FormEvent) {
    event.preventDefault();
    const name = source.trim();
    if (!name) {
      setFormError("Name the place you'll share it, like Facebook Ad.");
      return;
    }
    const taken = new Set(links.map((link) => link.id));
    const base = slugify(name);
    let id = base;
    let n = 2;
    while (taken.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    addLink(name, id);
    setSource("");
    setFormError("");
  }

  async function copy(id: string) {
    const url = `${origin}/l/${id}?u=${ownerId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 2000);
    } catch {
      setCopied(null);
      setFormError("Couldn't copy. Select the link and copy it manually.");
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
        <p className="mt-1 text-sm text-muted">Shown on the form, and used when a quote is written.</p>
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
        <form onSubmit={create} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Field id="new-source" label="Source name" error={formError}>
              <TextInput
                id="new-source"
                value={source}
                placeholder="Facebook Ad"
                onChange={(event) => setSource(event.target.value)}
              />
            </Field>
          </div>
          <Button type="submit">Create link</Button>
        </form>
      </section>

      {links.length === 0 ? (
        <p className="rounded-3xl border border-line bg-paper px-4 py-8 text-center text-sm text-muted">
          No links yet. Create one to start collecting jobs.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {links.map((link) => {
            const path = `/l/${link.id}?u=${ownerId}`;
            const url = origin ? `${origin}${path}` : path;
            return (
              <li key={link.id} className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
                <Field id={`source-${link.id}`} label="Source">
                  <TextInput
                    id={`source-${link.id}`}
                    value={link.source}
                    onChange={(event) => updateLink(link.id, event.target.value)}
                  />
                </Field>
                <p className="mt-3 text-sm break-all text-muted">{url}</p>
                <p className="mt-1 text-sm text-muted">Renaming the source does not change the link.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void copy(link.id)}>
                    {copied === link.id ? "Copied" : "Copy link"}
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <Link to="/l/$linkId" params={{ linkId: link.id }} search={{ u: ownerId }}>
                      Open form
                    </Link>
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => removeLink(link.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
