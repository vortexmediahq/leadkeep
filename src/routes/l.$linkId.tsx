import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { BrandTheme } from "@/components/brand-theme";
import { Mark } from "@/components/mark";
import { PoweredBy } from "@/components/powered-by";
import { Button } from "@/components/ui/button";
import { hasBranding } from "@/lib/branding";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/fields";
import { fetchPublicForm, submitLeadViaLink, type PublicForm } from "@/lib/data";
import { DEFAULT_PUBLIC_QUESTIONNAIRE, summarise } from "@/lib/question-templates";
import type { Question } from "@/lib/types";
import { cn, firstName } from "@/lib/utils";

export const Route = createFileRoute("/l/$linkId")({
  head: () => ({ meta: [{ title: "Get in touch · LeadKeep" }] }),
  component: PublicPage,
});

const SLUG = /^[a-z0-9]{6,32}$/;

function FormSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8" aria-busy="true">
      <div className="mb-6 flex items-center gap-3">
        <span className="size-10 animate-pulse rounded-xl bg-line" />
        <div className="flex flex-col gap-2">
          <span className="h-4 w-40 animate-pulse rounded bg-line" />
          <span className="h-3 w-28 animate-pulse rounded bg-line" />
        </div>
      </div>
      <div className="h-96 animate-pulse rounded-3xl border border-line bg-paper" />
      <p className="sr-only">Loading the form</p>
    </main>
  );
}

function FormMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-line bg-paper p-6 shadow-panel">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-base text-ink-soft">{body}</p>
      </div>
      <PoweredBy className="mt-6" />
    </main>
  );
}

type Loaded = { state: "loading" } | { state: "missing" } | { state: "failed" } | { state: "ready"; form: PublicForm };

function PublicPage() {
  const { linkId } = Route.useParams();
  const slug = linkId.toLowerCase();
  const valid = SLUG.test(slug);
  const [loaded, setLoaded] = useState<Loaded>({ state: "loading" });
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!valid) return;
    let live = true;
    setLoaded({ state: "loading" });
    fetchPublicForm(slug)
      .then((form) => live && setLoaded(form ? { state: "ready", form } : { state: "missing" }))
      .catch(() => live && setLoaded({ state: "failed" }));
    return () => {
      live = false;
    };
  }, [slug, valid]);

  if (!valid || loaded.state === "missing") {
    return <FormMessage title="This link isn't active" body="Ask the business for a fresh link to get in touch." />;
  }
  if (loaded.state === "failed") {
    return <FormMessage title="The form couldn't load" body="Check your connection and refresh the page to try again." />;
  }
  if (loaded.state === "loading") return <FormSkeleton />;
  return <Capture key={round} slug={slug} form={loaded.form} onAnother={() => setRound((value) => value + 1)} />;
}

function Capture({ slug, form, onAnother }: { slug: string; form: PublicForm; onAnother: () => void }) {
  const { business } = form;
  const questionnaire = form.questionnaire ?? DEFAULT_PUBLIC_QUESTIONNAIRE;
  const questions = questionnaire.questions;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const tradeLine = [business.trade, business.city].filter(Boolean).join(" · ");
  const answerText = (question: Question) => {
    const value = answers[question.id];
    return Array.isArray(value) ? value.join(", ") : (value ?? "").trim();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next["cust-name"] = "Add your name.";
    if (phone.replace(/[^0-9]/g, "").length < 7) next["cust-phone"] = "Add a phone number we can reach you on.";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) next["cust-email"] = "Check your email address.";
    for (const question of questions) {
      if (question.required && !answerText(question)) next[`q-${question.id}`] = "Please answer this one.";
    }
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      const target = document.getElementById(first);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        target.focus({ preventScroll: true });
      }
      return;
    }

    const responses = questions.map((question) => ({ question: question.label, answer: answerText(question) }));
    const firstChoice = questions.find((question) => question.type === "choice" && answerText(question));
    setSending(true);
    setSendError("");
    try {
      await submitLeadViaLink(slug, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: "",
        jobType: (questionnaire.name || "Enquiry").slice(0, 200),
        description: summarise(responses),
        urgency: firstChoice ? answerText(firstChoice).slice(0, 60) : "",
        preferredTime: "",
        propertyType: "",
        budget: "",
        accessNotes: "",
        responses,
      });
      setDone(name.trim());
    } catch (error) {
      const busy = error instanceof Error && error.message.includes("Too many requests");
      setSendError(
        busy
          ? "This form is getting a lot of requests right now. Wait a few minutes and try again."
          : "Your answers didn't go through. Check your connection and try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const branding = form.branding;
  const branded = Boolean(branding && hasBranding(branding));
  const wrap = (node: ReactNode) =>
    branding ? (
      <BrandTheme branding={branding} className="min-h-screen">
        {node}
      </BrandTheme>
    ) : (
      node
    );

  if (done) {
    return wrap(
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-line bg-paper p-6 shadow-panel">
          {branded && branding?.logoPath ? (
            <BrandMark path={branding.logoPath} name={business.name} heightClass="h-12" className="mb-4" />
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent-strong">
              <Check className="size-6" aria-hidden="true" />
            </span>
          )}
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Thanks, we've got it</h1>
          <p className="mt-2 text-base text-ink-soft">
            Thanks {firstName(done)}. {business.name || "The business"} has your details and will be in touch soon.
          </p>
          <Button variant="secondary" className="mt-6 w-full" onClick={onAnother}>
            Send another response
          </Button>
        </div>
        <PoweredBy compact={branded} className="mt-6" />
      </main>
    );
  }

  return wrap(
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 sm:py-10">
      <header className="mb-6 flex items-center gap-3">
        {branded && branding?.logoPath ? (
          <BrandMark path={branding.logoPath} name={business.name} heightClass="h-12" />
        ) : (
          <Mark />
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight">{business.name || "Get in touch"}</p>
          {tradeLine ? <p className="truncate text-sm text-muted">{tradeLine}</p> : null}
          {branded && branding?.logoPath ? <PoweredBy compact className="mt-1 text-left" /> : null}
        </div>
      </header>

      <form onSubmit={(event) => void submit(event)} className="rounded-3xl border border-line bg-paper p-4 shadow-panel sm:p-6" noValidate>
        <h1 className="text-2xl font-semibold tracking-tight">Get in touch</h1>
        <p className="mt-1 text-sm text-muted">{questionnaire.intro || "Answer a few quick questions and we'll get back to you."}</p>

        <div className="mt-5 flex flex-col gap-5">
          <Field id="cust-name" label="Your name" error={errors["cust-name"]}>
            <TextInput id="cust-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field id="cust-phone" label="Phone or WhatsApp" error={errors["cust-phone"]}>
            <TextInput
              id="cust-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          <Field id="cust-email" label="Email (optional)" error={errors["cust-email"]}>
            <TextInput
              id="cust-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          {questions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              value={answers[question.id]}
              error={errors[`q-${question.id}`]}
              onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
            />
          ))}

          {sendError ? (
            <p className="text-sm text-lost" role="alert">
              {sendError}
            </p>
          ) : null}
          <Button type="submit" variant="accent" className="w-full" disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </form>
      {branded && branding?.logoPath ? null : (
        <a href="https://leadkeep.whop.site" target="_blank" rel="noreferrer" className="mt-6 block">
          <PoweredBy compact={branded} />
        </a>
      )}
    </main>
  );
}

function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: Question;
  value: string | string[] | undefined;
  error?: string;
  onChange: (value: string | string[]) => void;
}) {
  const id = `q-${question.id}`;
  const label = question.required ? question.label : `${question.label} (optional)`;
  const options = question.options.filter((option) => option.trim());
  const text = typeof value === "string" ? value : "";

  if (question.type === "choice" || question.type === "multi") {
    const picked = Array.isArray(value) ? value : text ? [text] : [];
    const multi = question.type === "multi";
    return (
      <fieldset id={id} tabIndex={-1}>
        <legend className="mb-2 text-sm font-medium text-ink">{label}</legend>
        {question.help ? <p className="-mt-1 mb-2 text-sm text-muted">{question.help}</p> : null}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((option) => {
            const on = picked.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  multi ? onChange(on ? picked.filter((item) => item !== option) : [...picked, option]) : onChange(on ? "" : option)
                }
                className={cn(
                  "press min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-medium",
                  on ? "border-accent bg-accent-soft text-ink" : "border-line bg-paper text-ink",
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

  return (
    <Field id={id} label={label} error={error} hint={question.help || undefined}>
      {question.type === "long" ? (
        <TextArea id={id} rows={4} maxLength={2000} value={text} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <TextInput
          id={id}
          type={question.type === "date" ? "date" : question.type === "number" ? "number" : "text"}
          inputMode={question.type === "number" ? "numeric" : undefined}
          maxLength={500}
          value={text}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}
