import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea } from "@/components/ui/fields";
import { FEEDBACK_KINDS, FEEDBACK_MAX, validateFeedback, type FeedbackKind } from "@/lib/alerts";
import { fetchFeedback, isFeedbackAdmin, sendFeedback, type FeedbackItem } from "@/lib/alerts-data";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Tell us what you think · LeadKeep" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <AppShell>
      <Feedback />
    </AppShell>
  );
}

const kindLabel = (kind: string) => FEEDBACK_KINDS.find((item) => item.id === kind)?.label ?? "Other";

function Feedback() {
  const email = useSession((state) => state.user?.email ?? "");
  const [kind, setKind] = useState<FeedbackKind>("idea");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const refresh = () => {
    void isFeedbackAdmin().then(setAdmin);
    void fetchFeedback().then(setItems);
  };
  useEffect(refresh, []);

  const onSend = async () => {
    const problem = validateFeedback(message);
    if (problem) return setError(problem);
    setPending(true);
    setError("");
    try {
      await sendFeedback({ kind, message, page: document.referrer ? new URL(document.referrer).pathname : "", email });
      setMessage("");
      setSent(true);
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tell us what you think</h1>
        <p className="mt-1 text-sm text-muted">
          Got an idea, spotted a problem, or love something? Tell us. A real person reads every message.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-3xl border border-line bg-paper p-4 shadow-panel">
        {sent ? (
          <p role="status" className="rounded-xl bg-accent-soft px-3 py-2 text-sm">
            Thank you! Your message has been sent.
          </p>
        ) : null}
        <Field id="feedback-kind" label="What is it about?">
          <SelectInput id="feedback-kind" value={kind} onChange={(event) => setKind(event.target.value as FeedbackKind)}>
            {FEEDBACK_KINDS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field id="feedback-message" label="Your message" hint={`${message.length}/${FEEDBACK_MAX}`} error={error}>
          <TextArea
            id="feedback-message"
            value={message}
            maxLength={FEEDBACK_MAX}
            placeholder="For example: It would help me if…"
            onChange={(event) => {
              setMessage(event.target.value);
              setSent(false);
            }}
          />
        </Field>
        <Button variant="accent" className="self-start" disabled={pending} onClick={() => void onSend()}>
          {pending ? "Sending…" : "Send"}
        </Button>
      </section>

      {items.length ? (
        <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
          <h2 className="text-lg font-semibold tracking-tight">{admin ? "All feedback (admin)" : "Your messages"}</h2>
          <ul className="mt-2">
            {items.map((item) => (
              <li key={item.id} className="border-b border-line py-3 last:border-b-0">
                <p className="text-sm text-muted">
                  {kindLabel(item.kind)} · {format(new Date(item.createdAt), "d MMM yyyy, HH:mm")}
                  {admin && item.email ? ` · ${item.email}` : ""}
                </p>
                <p className="mt-1 break-words whitespace-pre-wrap">{item.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
