import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/fields";
import { blankQuestion, fromTemplate, QUESTION_TEMPLATES } from "@/lib/question-templates";
import { canAddQuestionnaire } from "@/lib/entitlements";
import { useAccess } from "@/lib/use-access";
import { useLeakKeep } from "@/lib/store";
import { QUESTION_TYPES, type Question, type QuestionType, type Questionnaire } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/questions")({
  head: () => ({ meta: [{ title: "Questions · LeadKeep" }] }),
  component: QuestionsPage,
});

function QuestionsPage() {
  return (
    <AppShell>
      <Questions />
    </AppShell>
  );
}

function Questions() {
  const ready = useLeakKeep((state) => state.questionnairesReady);
  const questionnaires = useLeakKeep((state) => state.questionnaires);
  const create = useLeakKeep((state) => state.createQuestionnaire);
  const duplicate = useLeakKeep((state) => state.duplicateQuestionnaire);
  const access = useAccess();
  const canAdd = canAddQuestionnaire(access, questionnaires.length);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function withBusy(task: () => Promise<string | null>) {
    setBusy(true);
    setError("");
    try {
      const id = await task();
      if (id) setOpenId(id);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const open = questionnaires.find((item) => item.id === openId) ?? null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Questions</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Build the questionnaire people fill in from your links. Name, email and phone are always asked for you.
          </p>
        </div>
        {ready ? (
          <Button
            onClick={() => {
              document.getElementById("templates")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            New questionnaire
          </Button>
        ) : null}
      </header>

      {!ready ? (
        <div className="rounded-3xl border border-accent/40 bg-accent-soft p-4 text-sm text-ink" role="status">
          <p className="font-medium">One database update is needed before you can save questionnaires.</p>
          <p className="mt-1 text-ink-soft">
            Until then, every link uses the standard &ldquo;Quick enquiry&rdquo; questions, and answers still reach your inbox.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-lost" role="alert">
          {error}
        </p>
      ) : null}

      {ready ? (
        <section id="templates" className="scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel">
          <h2 className="text-lg font-semibold tracking-tight">
            {questionnaires.length === 0 ? "Start with a template" : "Start another from a template"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {canAdd
              ? "You can change every question afterwards. Templates stay here whenever you want a new questionnaire."
              : "You've reached the number of questionnaires on your plan. Upgrade to add another, or edit one you already have."}
          </p>
          {!canAdd ? (
            <Button asChild variant="secondary" className="mt-3">
              <Link to="/pricing">More questionnaires on Care</Link>
            </Button>
          ) : null}
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {QUESTION_TEMPLATES.map((template) => (
              <li key={template.key}>
                <button
                  type="button"
                  disabled={busy || !canAdd}
                  onClick={() => {
                    if (!canAdd) return;
                    void withBusy(() => create(fromTemplate(template)));
                  }}
                  className="press flex h-full w-full flex-col items-start rounded-2xl border border-line bg-mist p-4 text-left hover:border-accent disabled:opacity-50"
                >
                  <span className="font-medium text-ink">{template.name}</span>
                  <span className="mt-1 text-sm text-muted">{template.blurb}</span>
                  <span className="mt-2 text-sm text-faint">
                    {template.questions.length} {template.questions.length === 1 ? "question" : "questions"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {questionnaires.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {questionnaires.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-paper p-4 shadow-panel">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name || "Untitled questionnaire"}</p>
                <p className="text-sm text-muted">
                  {item.questions.length} {item.questions.length === 1 ? "question" : "questions"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                  {openId === item.id ? "Close" : "Edit"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void withBusy(() => duplicate(item.id))}
                  disabled={busy || !canAdd}
                  aria-label={`Duplicate ${item.name}`}
                >
                  <Copy className="size-4" aria-hidden="true" />
                  Duplicate
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? <Editor key={open.id} item={open} onClosed={() => setOpenId(null)} /> : null}

      {ready && questionnaires.length > 0 ? (
        <p className="text-sm text-muted">
          Next: pick a questionnaire for each link on the{" "}
          <Link to="/links" className="font-medium text-primary underline-offset-2 hover:text-accent hover:underline">
            Links page
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

function Editor({ item, onClosed }: { item: Questionnaire; onClosed: () => void }) {
  const save = useLeakKeep((state) => state.saveQuestionnaire);
  const remove = useLeakKeep((state) => state.removeQuestionnaire);
  const usedBy = useLeakKeep((state) => state.links.filter((link) => link.questionnaireId === item.id).length);
  const [confirming, setConfirming] = useState(false);

  const update = (patch: Partial<Questionnaire>) => save({ ...item, ...patch });
  const setQuestions = (questions: Question[]) => update({ questions });
  const patchQuestion = (id: string, patch: Partial<Question>) =>
    setQuestions(item.questions.map((question) => (question.id === id ? { ...question, ...patch } : question)));
  const move = (index: number, by: number) => {
    const next = [...item.questions];
    const [moved] = next.splice(index, 1);
    next.splice(index + by, 0, moved);
    setQuestions(next);
  };

  return (
    <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel" aria-label="Edit questionnaire">
      <div className="grid gap-4">
        <Field id="q-name" label="Questionnaire name" hint="Only you see this.">
          <TextInput id="q-name" value={item.name} maxLength={120} onChange={(event) => update({ name: event.target.value })} />
        </Field>
        <Field id="q-intro" label="Intro line" hint="Shown at the top of the form.">
          <TextArea id="q-intro" rows={2} value={item.intro} maxLength={600} onChange={(event) => update({ intro: event.target.value })} />
        </Field>
      </div>

      <h3 className="mt-6 text-base font-semibold">Questions</h3>
      {item.questions.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          No questions yet. Add your first one below.
        </p>
      ) : (
        <ol className="mt-3 flex flex-col gap-3">
          {item.questions.map((question, index) => (
            <li key={question.id} className="rounded-2xl border border-line bg-mist p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
                <Field id={`ql-${question.id}`} label={`Question ${index + 1}`}>
                  <TextInput
                    id={`ql-${question.id}`}
                    value={question.label}
                    maxLength={300}
                    placeholder="Type your question"
                    onChange={(event) => patchQuestion(question.id, { label: event.target.value })}
                  />
                </Field>
                <Field id={`qt-${question.id}`} label="Answer type">
                  <SelectInput
                    id={`qt-${question.id}`}
                    value={question.type}
                    onChange={(event) => {
                      const type = event.target.value as QuestionType;
                      const needsOptions = (type === "choice" || type === "multi") && question.options.length === 0;
                      patchQuestion(question.id, { type, options: needsOptions ? ["Option 1", "Option 2"] : question.options });
                    }}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
              </div>
              {question.type === "choice" || question.type === "multi" ? (
                <div className="mt-3">
                  <Field id={`qo-${question.id}`} label="Choices" hint="One per line.">
                    <TextArea
                      id={`qo-${question.id}`}
                      rows={3}
                      value={question.options.join("\n")}
                      onChange={(event) => patchQuestion(question.id, { options: event.target.value.split("\n").slice(0, 20) })}
                    />
                  </Field>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="mr-auto flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    className="size-4 accent-[#0b1f3b]"
                    checked={question.required}
                    onChange={(event) => patchQuestion(question.id, { required: event.target.checked })}
                  />
                  Required
                </label>
                <IconButton label="Move up" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp className="size-4" aria-hidden="true" />
                </IconButton>
                <IconButton label="Move down" disabled={index === item.questions.length - 1} onClick={() => move(index, 1)}>
                  <ArrowDown className="size-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label="Duplicate question"
                  onClick={() => {
                    const next = [...item.questions];
                    next.splice(index + 1, 0, { ...question, id: crypto.randomUUID(), options: [...question.options] });
                    setQuestions(next);
                  }}
                >
                  <Copy className="size-4" aria-hidden="true" />
                </IconButton>
                <IconButton label="Delete question" onClick={() => setQuestions(item.questions.filter((q) => q.id !== question.id))}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={item.questions.length >= 30}
          onClick={() => setQuestions([...item.questions, blankQuestion()])}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add question
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <p className="mr-auto text-sm text-muted">Saved automatically.</p>
        {confirming ? (
          <>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                remove(item.id);
                onClosed();
              }}
            >
              Yes, delete
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
          </>
        ) : (
          <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
            Delete questionnaire
          </Button>
        )}
      </div>
      {confirming && usedBy > 0 ? (
        <p className="mt-2 text-sm text-muted">
          {usedBy} {usedBy === 1 ? "link uses" : "links use"} this. They'll switch to the standard questions. Existing leads keep their answers.
        </p>
      ) : null}
    </section>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn("press grid size-10 place-items-center rounded-lg border border-line bg-paper text-ink-soft hover:text-ink disabled:opacity-40")}
    >
      {children}
    </button>
  );
}
