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
  source: string;
  createdAt: string;
};

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
  status: LeadStatus;
  createdAt: string;
  quote: string | null;
  quoteUpdatedAt: string | null;
};

export type LeadInput = Omit<Lead, "id" | "status" | "createdAt" | "quote" | "quoteUpdatedAt">;
