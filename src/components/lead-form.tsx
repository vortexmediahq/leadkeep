import { Check } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { BrandTheme } from "@/components/brand-theme";
import { Mark } from "@/components/mark";
import { PoweredBy } from "@/components/powered-by";
import { Button } from "@/components/ui/button";
import { hasBranding } from "@/lib/branding";
import { Field, TextArea, TextInput } from "@/components/ui/fields";
import { submitLeadViaLink, type PublicForm } from "@/lib/data";
import { DEFAULT_PUBLIC_QUESTIONNAIRE, summarise } from "@/lib/question-templates";
import type { Question } from "@/lib/types";
import { cn, firstName } from "@/lib/utils";

export function Capture({
  slug,
  form,
  onAnother,
  preview,
}: {
  slug: string;
  form: PublicForm;
  onAnother: () => void;
  /** Owner preview: shows a banner with a way back, and never sends anything. */
  preview?: { onBack: () => void };
}) {
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
    if (preview) {
      setSendError("This is a preview, so nothing was sent. Your customer will see a thank-you screen here.");
      return;
    }
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
      {preview ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3">
          <p className="text-sm font-medium text-ink">Preview: this is how your customer sees it</p>
          <Button size="sm" variant="secondary" type="button" onClick={preview.onBack}>
            Back to edit
          </Button>
        </div>
      ) : null}
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
