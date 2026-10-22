import type { Business, LeadLink, QuoteTemplate, Service } from "@/lib/types";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const seedBusiness: Business = {
  name: "Northline Plumbing",
  trade: "Plumbing, geysers, and leak repair",
  city: "Johannesburg",
  phone: "011 555 0142",
  email: "quotes@northline.example",
  currency: "R",
};

export const starterServices: Omit<Service, "id">[] = [
  {
    name: "Emergency leak repair",
    description: "Isolate and stop an active leak, then repair the fitting or the pipe section.",
    price: "R850–R2,400",
    notes: "After-hours call-out from R450.",
  },
  {
    name: "Blocked drain",
    description: "Clear a kitchen, bathroom, or main line blockage.",
    price: "R650–R1,800",
    notes: "Camera inspection is quoted separately.",
  },
  {
    name: "Geyser replacement",
    description: "Supply and fit a standard 150L electric geyser, including drip tray and vacuum breaker.",
    price: "R6,800–R11,500",
    notes: "Removal of the old unit is included.",
  },
  {
    name: "Tap and toilet repair",
    description: "Fix leaking mixers, cisterns, and running toilets.",
    price: "R450–R1,350",
    notes: "Non-standard parts are extra and confirmed before fitting.",
  },
  {
    name: "Leak detection",
    description: "Find a hidden leak with moisture and acoustic tracing.",
    price: "R950–R2,200",
    notes: "The repair is quoted once the source is found.",
  },
];

export const seedLinks: LeadLink[] = [
  { id: "facebook", source: "Facebook Ad", createdAt: hoursAgo(24 * 20) },
  { id: "google", source: "Google Business", createdAt: hoursAgo(24 * 18) },
  { id: "website", source: "Website", createdAt: hoursAgo(24 * 12) },
  { id: "instagram", source: "Instagram", createdAt: hoursAgo(24 * 8) },
];

export const seedTemplate: QuoteTemplate = {
  tone: "Direct, calm, and specific. Sound like the owner, not a call centre. Use the customer's first name once. No hype and no exclamation marks.",
  structure:
    "One-line summary of the job\nWhat we will do\nPrice, and what would change it\nWhat is included and what is not\nWhen we can come\nHow to accept",
  paymentTerms:
    "50% to book the job, balance when the work is finished. Card, EFT, or cash. Emergency call-outs are paid on the day.",
  warranty:
    "Workmanship guaranteed for 6 months. Manufacturer warranties are passed on for parts we supply. Existing pipework we did not replace is not covered.",
  extra: "Close with the business name and one line: we will confirm an arrival window by phone.",
};
