import type { Business, QuoteTemplate, Service } from "@/lib/types";

export const blankBusiness: Business = {
  name: "",
  trade: "",
  city: "",
  phone: "",
  email: "",
  currency: "R",
};

export const starterServices: Omit<Service, "id">[] = [
  {
    name: "Consultation",
    description: "A first chat to understand what the customer needs.",
    price: "",
    notes: "Edit or delete this example.",
  },
  {
    name: "Standard package",
    description: "Your most popular service or product. Rename it and add your price.",
    price: "",
    notes: "",
  },
];

export const starterLinkSources = ["Facebook post", "Instagram", "Website"];

export const seedTemplate: QuoteTemplate = {
  tone: "Direct, calm, and specific. Sound like the owner, not a call centre. Use the customer's first name once. No hype and no exclamation marks.",
  structure:
    "One-line summary of what they asked for\nWhat we will do or supply\nPrice, and what would change it\nWhat is included and what is not\nWhen we can start\nHow to accept",
  paymentTerms:
    "50% to book, balance on completion. Card or EFT.",
  warranty:
    "Tell customers about any guarantee, refund or cancellation terms here.",
  extra: "Close with the business name and one line: we will confirm the details by phone.",
};
