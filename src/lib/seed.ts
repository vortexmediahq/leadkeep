import type { Business, Lead, LeadLink, QuoteTemplate, Service } from "@/lib/types";

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

export const seedServices: Service[] = [
  {
    id: "svc-leak",
    name: "Emergency leak repair",
    description: "Isolate and stop an active leak, then repair the fitting or the pipe section.",
    price: "R850–R2,400",
    notes: "After-hours call-out from R450.",
  },
  {
    id: "svc-drain",
    name: "Blocked drain",
    description: "Clear a kitchen, bathroom, or main line blockage.",
    price: "R650–R1,800",
    notes: "Camera inspection is quoted separately.",
  },
  {
    id: "svc-geyser",
    name: "Geyser replacement",
    description: "Supply and fit a standard 150L electric geyser, including drip tray and vacuum breaker.",
    price: "R6,800–R11,500",
    notes: "Removal of the old unit is included.",
  },
  {
    id: "svc-tap",
    name: "Tap and toilet repair",
    description: "Fix leaking mixers, cisterns, and running toilets.",
    price: "R450–R1,350",
    notes: "Non-standard parts are extra and confirmed before fitting.",
  },
  {
    id: "svc-detect",
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

const sampleQuote = `Ayesha — dripping mixer and a running toilet at the Greenside house.

What we will do
Replace the mixer cartridge and the cistern flush washer, then test both fittings. We will check the pan seal while we are there.

Price
R780–R1,350. Standard washers are included. If the mixer needs a non-standard cartridge, we will confirm that price before fitting it.

Included
Labour on both fittings and standard washers.

Not included
A full mixer replacement, or repairs to the wall behind the cistern.

Timing
A morning visit this week. We will phone to lock the day.

How to accept
Reply to this message or call us. Half the estimate holds the booking. The balance is due when the job is done. Card, EFT, or cash.

Workmanship is guaranteed for 6 months. Parts we supply carry the manufacturer warranty.

Northline Plumbing
We will confirm an arrival window by phone.`;

export function seedLeads(): Lead[] {
  return [
    {
      id: "lead-thandi",
      linkId: "facebook",
      source: "Facebook Ad",
      name: "Thandi Mokoena",
      phone: "082 555 0148",
      email: "thandi.mokoena@example.com",
      address: "14 West Road, Sandton",
      jobType: "Geyser replacement",
      description: "No hot water since last night. The geyser is about 8 years old and there is a small puddle in the drip tray.",
      urgency: "Emergency",
      preferredTime: "Morning",
      propertyType: "House",
      budget: "Around R8,000 if it needs replacing",
      accessNotes: "Dog in the back yard. Ring the street bell.",
      status: "new",
      createdAt: hoursAgo(1),
      quote: null,
      quoteUpdatedAt: null,
    },
    {
      id: "lead-sipho",
      linkId: "instagram",
      source: "Instagram",
      name: "Sipho Dlamini",
      phone: "073 555 0194",
      email: "",
      address: "Roodepoort",
      jobType: "Tap and toilet repair",
      description: "Outside tap at the braai drips constantly. Started after we had a new mixer fitted last year.",
      urgency: "Flexible",
      preferredTime: "Afternoon",
      propertyType: "House",
      budget: "",
      accessNotes: "",
      status: "new",
      createdAt: hoursAgo(5),
      quote: null,
      quoteUpdatedAt: null,
    },
    {
      id: "lead-pieter",
      linkId: "google",
      source: "Google Business",
      name: "Pieter van Wyk",
      phone: "083 555 0117",
      email: "pieter.vanwyk@example.com",
      address: "8 Rider Haggard, Randburg",
      jobType: "Blocked drain",
      description: "Kitchen sink drains very slowly and smells. Bathroom is fine. Tried a plunger already.",
      urgency: "This week",
      preferredTime: "Morning",
      propertyType: "House",
      budget: "",
      accessNotes: "Complex gate code 1942#. Park in visitor bay 3.",
      status: "contacted",
      createdAt: hoursAgo(26),
      quote: null,
      quoteUpdatedAt: null,
    },
    {
      id: "lead-ayesha",
      linkId: "website",
      source: "Website",
      name: "Ayesha Patel",
      phone: "071 555 0160",
      email: "ayesha.patel@example.com",
      address: "22 Green Way, Greenside",
      jobType: "Tap and toilet repair",
      description: "Basin mixer drips and the guest toilet keeps running. Both on the ground floor.",
      urgency: "Flexible",
      preferredTime: "Anytime",
      propertyType: "House",
      budget: "Under R1,500 if possible",
      accessNotes: "Someone is home from 9.",
      status: "quoted",
      createdAt: hoursAgo(50),
      quote: sampleQuote,
      quoteUpdatedAt: hoursAgo(49),
    },
    {
      id: "lead-james",
      linkId: "instagram",
      source: "Instagram",
      name: "James Okonkwo",
      phone: "084 555 0188",
      email: "james.okonkwo@example.com",
      address: "Bryanston",
      jobType: "Emergency leak repair",
      description: "Pipe under the kitchen sink burst this morning. Water is isolated at the stopcock.",
      urgency: "Emergency",
      preferredTime: "Morning",
      propertyType: "House",
      budget: "",
      accessNotes: "Call when you arrive. The intercom is broken.",
      status: "won",
      createdAt: hoursAgo(24 * 5),
      quote: null,
      quoteUpdatedAt: null,
    },
    {
      id: "lead-lena",
      linkId: "facebook",
      source: "Facebook Ad",
      name: "Lena Botha",
      phone: "082 555 0133",
      email: "",
      address: "Fourways",
      jobType: "Leak detection",
      description: "Brown stain spreading on the lounge ceiling. No drip yet. Upstairs bathroom is directly above.",
      urgency: "This week",
      preferredTime: "Evening",
      propertyType: "Apartment",
      budget: "",
      accessNotes: "Body corporate must be told before any ceiling is opened.",
      status: "lost",
      createdAt: hoursAgo(24 * 9),
      quote: null,
      quoteUpdatedAt: null,
    },
  ];
}
