import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Mark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/fields";
import { fetchPublicServiceNames, submitLead } from "@/lib/data";
import { useLeakKeep } from "@/lib/store";
import { cn, firstName } from "@/lib/utils";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/l/$linkId")({
  head: () => ({ meta: [{ title: "Request a quote · LeakKeep" }] }),
  validateSearch: (search: Record<string, unknown>): { u?: string } =>
    typeof search.u === "string" && UUID.test(search.u) ? { u: search.u } : {},
  component: PublicPage,
});

const URGENCY = ["Emergency", "This week", "Flexible"];
const PROPERTY = ["House", "Apartment", "Business"];
const TIMES = ["Morning", "Afternoon", "Evening", "Anytime"];

function FormSkeleton() {
  return (
    <div className="min-h-screen bg-mist px-4 py-8">
      <p className="text-base font-semibold tracking-tight">Request a quote</p>
      <p className="mt-1 text-sm text-muted">Loading the form</p>
    </div>
  );
}

function FormMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-base text-ink-soft">{body}</p>
      </div>
    </main>
  );
}

function PublicPage() {
  const { linkId } = Route.useParams();
  const { u: owner } = Route.useSearch();
  const [services, setServices] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void useLeakKeep.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!owner) return;
    let live = true;
    fetchPublicServiceNames(owner)
      .then((names) => live && setServices(names))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [owner]);

  if (!owner) {
    return (
      <FormMessage
        title="This link isn't active"
        body="Ask the business for a fresh link to request a quote."
      />
    );
  }
  if (failed) {
    return (
      <FormMessage
        title="The form couldn't load"
        body="Check your connection and refresh the page to try again."
      />
    );
  }
  if (!services) return <FormSkeleton />;
  return <Capture linkId={linkId} owner={owner} serviceNames={services} />;
}

function Capture({ linkId, owner, serviceNames }: { linkId: string; owner: string; serviceNames: string[] }) {
  const link = useLeakKeep((state) => state.links.find((item) => item.id === linkId));
  const business = useLeakKeep((state) => state.business);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [jobType, setJobType] = useState("");
  const [customJob, setCustomJob] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");
  const [accessNotes, setAccessNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const tradeLine = [business.trade, business.city].filter(Boolean).join(" · ");

  // Customers open this page on their own device, which has no saved link list.
  const active = link ?? { id: linkId, source: linkId.charAt(0).toUpperCase() + linkId.slice(1) };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Add your name.";
    if (phone.trim().length < 7) next.phone = "Add a phone number we can reach you on.";
    if (!jobType) next.job = "Choose the kind of job.";
    if (jobType === "Something else" && !customJob.trim()) next.customJob = "Tell us what you need.";
    if (description.trim().length < 8) next.description = "A sentence or two is enough.";
    if (!urgency) next.urgency = "Choose how soon you need someone.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    setSendError("");
    try {
      await submitLead(owner, {
        linkId: active.id,
        source: active.source,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        jobType: jobType === "Something else" ? customJob.trim() : jobType,
        description: description.trim(),
        urgency,
        preferredTime,
        propertyType,
        budget: budget.trim(),
        accessNotes: accessNotes.trim(),
      });
      setDone(name.trim());
    } catch {
      setSendError("Your request didn't go through. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
          <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
            <Check className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Request received</h1>
          <p className="mt-2 text-base text-ink-soft">
            {firstName(done)}, {business.name || "the business"} has the details and will be in touch.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Mark />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight">{business.name || "Request a quote"}</p>
          {tradeLine ? <p className="truncate text-sm text-muted">{tradeLine}</p> : null}
        </div>
      </header>

      <form onSubmit={(event) => void submit(event)} className="rounded-3xl border border-line bg-paper p-4 shadow-panel" noValidate>
        <h1 className="text-2xl font-semibold tracking-tight">Request a quote</h1>
        <p className="mt-1 text-sm text-muted">Tell us about the job. {business.name || "We"} will come back with a price.</p>

        <div className="mt-5 flex flex-col gap-5">
          <Field id="cust-name" label="Your name" error={errors.name}>
            <TextInput
              id="cust-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="cust-phone" label="Phone" error={errors.phone}>
              <TextInput
                id="cust-phone"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </Field>
            <Field id="cust-email" label="Email" hint="Optional">
              <TextInput
                id="cust-email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
          </div>
          <Field id="cust-address" label="Address or suburb" hint="Optional, but it helps with timing.">
            <TextInput
              id="cust-address"
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </Field>
          <Field id="cust-job" label="What do you need?" error={errors.job}>
            <SelectInput id="cust-job" value={jobType} onChange={(event) => setJobType(event.target.value)}>
              <option value="">Choose a service</option>
              {serviceNames.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
              <option value="Something else">Something else</option>
            </SelectInput>
          </Field>
          {jobType === "Something else" ? (
            <Field id="cust-custom" label="Describe the job type" error={errors.customJob}>
              <TextInput id="cust-custom" value={customJob} onChange={(event) => setCustomJob(event.target.value)} />
            </Field>
          ) : null}
          <Field id="cust-desc" label="What's going on?" error={errors.description}>
            <TextArea
              id="cust-desc"
              value={description}
              placeholder="Where it is, and what you've already noticed."
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <ChoiceGroup label="How soon?" options={URGENCY} value={urgency} onChange={setUrgency} error={errors.urgency} />
          <ChoiceGroup label="Property" options={PROPERTY} value={propertyType} onChange={setPropertyType} />
          <ChoiceGroup label="Best time to come" options={TIMES} value={preferredTime} onChange={setPreferredTime} />
          <Field id="cust-budget" label="Budget, if you have one" hint="Optional.">
            <TextInput id="cust-budget" value={budget} onChange={(event) => setBudget(event.target.value)} />
          </Field>
          <Field id="cust-access" label="Access notes" hint="Gate code, pets, parking, complex rules. Optional.">
            <TextArea
              id="cust-access"
              className="min-h-20"
              value={accessNotes}
              onChange={(event) => setAccessNotes(event.target.value)}
            />
          </Field>
          {sendError ? <p className="text-sm text-lost" role="alert">{sendError}</p> : null}
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? "Sending…" : "Send job details"}
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-muted">No account needed · LeakKeep</p>
    </main>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">{label}</legend>
      <div className={cn("grid gap-2", options.length === 4 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((option) => {
          const on = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option)}
              className={cn(
                "press h-11 rounded-lg border px-2 text-sm font-medium",
                on ? "border-primary bg-primary-soft text-primary" : "border-line bg-paper text-ink",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-lost">{error}</p> : null}
    </fieldset>
  );
}
