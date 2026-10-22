import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/fields";
import { parseServiceList } from "@/lib/parse-services";
import { useLeakKeep } from "@/lib/store";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Services · LeakKeep" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <AppShell>
      <Services />
    </AppShell>
  );
}

function Services() {
  const services = useLeakKeep((state) => state.services);
  const currency = useLeakKeep((state) => state.business.currency) || "R";
  const addService = useLeakKeep((state) => state.addService);
  const updateService = useLeakKeep((state) => state.updateService);
  const removeService = useLeakKeep((state) => state.removeService);
  const importServices = useLeakKeep((state) => state.importServices);
  const [paste, setPaste] = useState("");
  const [notice, setNotice] = useState("");

  function onImport() {
    const parsed = parseServiceList(paste);
    const count = importServices(parsed);
    setNotice(count ? `Added ${count} ${count === 1 ? "service" : "services"}.` : "No services found. Use one service per line.");
    if (count) setPaste("");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Name, a short description, and a typical price. Quotes use this list instead of inventing rates.
          </p>
        </div>
        <Button onClick={addService}>Add service</Button>
      </header>

      {services.length === 0 ? (
        <p className="rounded-3xl border border-line bg-paper px-4 py-8 text-center text-sm text-muted">
          No services yet. Add one, or paste a list below.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {services.map((service) => (
            <li key={service.id} className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id={`name-${service.id}`} label="Name">
                  <TextInput
                    id={`name-${service.id}`}
                    value={service.name}
                    placeholder="Blocked drain"
                    onChange={(event) => updateService(service.id, { name: event.target.value })}
                  />
                </Field>
                <Field id={`price-${service.id}`} label="Typical price">
                  <TextInput
                    id={`price-${service.id}`}
                    value={service.price}
                    placeholder={`${currency}650–${currency}1,200`}
                    onChange={(event) => updateService(service.id, { price: event.target.value })}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field id={`desc-${service.id}`} label="Description">
                  <TextArea
                    id={`desc-${service.id}`}
                    value={service.description}
                    placeholder="What the visit usually includes"
                    onChange={(event) => updateService(service.id, { description: event.target.value })}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field id={`notes-${service.id}`} label="Notes" hint="Call-out fees, exclusions, or parts.">
                  <TextArea
                    id={`notes-${service.id}`}
                    className="min-h-20"
                    value={service.notes}
                    onChange={(event) => updateService(service.id, { notes: event.target.value })}
                  />
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="danger" size="sm" onClick={() => removeService(service.id)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">Paste a list</h2>
        <p className="mt-1 text-sm text-muted">One service per line. This adds to your list. It does not replace it.</p>
        <TextArea
          className="mt-4 min-h-36"
          value={paste}
          onChange={(event) => setPaste(event.target.value)}
          aria-label="Paste services"
          placeholder={`Blocked drain | Kitchen and bath lines | ${currency}650–${currency}1,800 | Camera extra\nGeyser replacement — ${currency}6,800–${currency}11,500\nLeak detection: find a hidden leak, from ${currency}950`}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={onImport} disabled={!paste.trim()}>
            Add these services
          </Button>
          {notice ? <p className="text-sm text-muted">{notice}</p> : null}
        </div>
      </section>
    </div>
  );
}
