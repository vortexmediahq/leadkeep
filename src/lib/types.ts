import type { LinkKind, QuoteState } from "@/lib/quote-flow";
export const STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

export type LeadStatus = (typeof STATUSES)[number]["id"];

export type Business = {
  name: string;
  trade: string;
  city: string;
  phone: string;
  email: string;
  currency: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  notes: string;
};

export type LeadLink = {
  id: string;
  slug: string;
  source: string;
  questionnaireId: string | null;
  createdAt: string;
  kind: LinkKind;
  serviceId: string | null;
  headline: string;
  intro: string;
  mediaPath: string;
  mediaUrl: string;
  ctaText: string;
  autoSend: boolean;
};

export const QUESTION_TYPES = [
  { id: "short", label: "Short answer" },
  { id: "long", label: "Paragraph" },
  { id: "choice", label: "Pick one" },
  { id: "multi", label: "Pick any" },
  { id: "date", label: "Date" },
  { id: "number", label: "Number" },
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number]["id"];

export type Question = {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options: string[];
  help: string;
};

export type Questionnaire = {
  id: string;
  name: string;
  intro: string;
  questions: Question[];
  updatedAt: string;
};

/** One answered question, stored on the lead so it reads the same even if the questionnaire changes later. */
export type LeadResponse = { question: string; answer: string };

export type QuoteTemplate = {
  tone: string;
  structure: string;
  paymentTerms: string;
  warranty: string;
  extra: string;
};

export type Lead = {
  id: string;
  linkId: string;
  source: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  jobType: string;
  description: string;
  urgency: string;
  preferredTime: string;
  propertyType: string;
  budget: string;
  accessNotes: string;
  responses: LeadResponse[];
  status: LeadStatus;
  createdAt: string;
  quote: string | null;
  quoteUpdatedAt: string | null;
  serviceName: string;
  quoteToken: string | null;
  quoteState: QuoteState;
  quoteSentAt: string | null;
  quoteViewedAt: string | null;
  quoteAcceptedAt: string | null;
  quoteExpiresAt: string | null;
};

export type LeadInput = Omit<
  Lead,
  | "id" | "status" | "createdAt" | "quote" | "quoteUpdatedAt" | "serviceName" | "quoteToken" | "quoteState"
  | "quoteSentAt" | "quoteViewedAt" | "quoteAcceptedAt" | "quoteExpiresAt"
>;
