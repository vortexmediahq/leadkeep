import type { Question, QuestionType, Questionnaire } from "@/lib/types";

/**
 * Starter questionnaires. Kept generic on purpose: they work for any small business
 * (salon, coach, caterer, photographer, cleaner, shop, studio, agency…).
 * The name, email and phone fields are always asked by the form itself.
 */
type Draft = { label: string; type: QuestionType; required?: boolean; options?: string[]; help?: string };

export type QuestionTemplate = { key: string; name: string; blurb: string; intro: string; questions: Draft[] };

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    key: "enquiry",
    name: "Quick enquiry",
    blurb: "Three short questions. Best for social posts.",
    intro: "Tell us what you're after and we'll get back to you shortly.",
    questions: [
      { label: "What can we help you with?", type: "long", required: true },
      { label: "When would you like this?", type: "choice", options: ["As soon as possible", "Within a month", "Just looking for now"] },
      { label: "How would you like us to contact you?", type: "choice", options: ["Phone call", "WhatsApp", "Email"] },
    ],
  },
  {
    key: "callback",
    name: "Book a call back",
    blurb: "Get a good time to call. Best for adverts.",
    intro: "Leave your details and pick a time. We'll call you back.",
    questions: [
      { label: "What would you like to chat about?", type: "short", required: true },
      { label: "Best day for a call", type: "date" },
      { label: "Best time to call", type: "choice", required: true, options: ["Morning", "Afternoon", "Evening", "Any time"] },
    ],
  },
  {
    key: "quote",
    name: "Quote request",
    blurb: "Enough detail to price the work.",
    intro: "A few details help us send you an accurate price.",
    questions: [
      { label: "What do you need?", type: "long", required: true, help: "A sentence or two is enough." },
      { label: "Where are you based?", type: "short" },
      { label: "Rough budget", type: "choice", options: ["Under 1,000", "1,000 – 5,000", "5,000 – 20,000", "Over 20,000", "Not sure yet"] },
      { label: "When do you need it by?", type: "date" },
    ],
  },
  {
    key: "booking",
    name: "Booking or appointment",
    blurb: "Date, people and preferences.",
    intro: "Tell us when and what you'd like, and we'll confirm your booking.",
    questions: [
      { label: "Preferred date", type: "date", required: true },
      { label: "How many people?", type: "number" },
      { label: "Which of these interest you?", type: "multi", options: ["Option 1", "Option 2", "Option 3"], help: "Rename these to your own services." },
      { label: "Anything else we should know?", type: "long" },
    ],
  },
  {
    key: "blank",
    name: "Start from scratch",
    blurb: "One question. Build the rest yourself.",
    intro: "Tell us a little about what you need.",
    questions: [{ label: "What can we help you with?", type: "long", required: true }],
  },
];

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export function blankQuestion(type: QuestionType = "short"): Question {
  return {
    id: newId(),
    label: "",
    type,
    required: false,
    options: type === "choice" || type === "multi" ? ["Option 1", "Option 2"] : [],
    help: "",
  };
}

export function fromTemplate(template: QuestionTemplate): Omit<Questionnaire, "id" | "updatedAt"> {
  return {
    name: template.name,
    intro: template.intro,
    questions: template.questions.map((draft) => ({
      id: newId(),
      label: draft.label,
      type: draft.type,
      required: draft.required ?? false,
      options: draft.options ?? [],
      help: draft.help ?? "",
    })),
  };
}

/** Copy with fresh ids so the copy can be edited without touching the original. */
export function duplicateQuestionnaire(source: Questionnaire): Omit<Questionnaire, "id" | "updatedAt"> {
  return {
    name: `${source.name} (copy)`.slice(0, 120),
    intro: source.intro,
    questions: source.questions.map((question) => ({ ...question, id: newId(), options: [...question.options] })),
  };
}

/** Used when a link has no questionnaire picked (or the database update isn't applied yet). */
export const DEFAULT_PUBLIC_QUESTIONNAIRE = {
  ...fromTemplate(QUESTION_TEMPLATES[0]),
  name: QUESTION_TEMPLATES[0].name,
};

/** Where a link gets shared. Picked when creating a link; the lead is tagged with it. */
export const SOURCE_OPTIONS = [
  "Facebook post",
  "Facebook ad",
  "Instagram",
  "TikTok",
  "WhatsApp",
  "Google Business",
  "Website",
  "LinkedIn",
  "Email",
  "Flyer or QR code",
] as const;

const clip = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");
const TYPES = new Set<string>(["short", "long", "choice", "multi", "date", "number"]);

/** Defensive parse of questions coming from the database or a public RPC. */
export function parseQuestions(value: unknown): Question[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      id: clip(item.id, 64) || newId(),
      label: clip(item.label, 300),
      type: (TYPES.has(String(item.type)) ? item.type : "short") as QuestionType,
      required: item.required === true,
      options: Array.isArray(item.options) ? item.options.map((option) => clip(option, 120)).filter(Boolean).slice(0, 20) : [],
      help: clip(item.help, 300),
    }))
    .filter((question) => question.label.trim().length > 0)
    .slice(0, 30);
}

/** Readable text version of the answers, kept in the lead's description so it shows everywhere. */
export function summarise(responses: { question: string; answer: string }[]): string {
  return responses
    .filter((item) => item.answer.trim())
    .map((item) => `${item.question}\n${item.answer}`)
    .join("\n\n")
    .slice(0, 4000);
}
