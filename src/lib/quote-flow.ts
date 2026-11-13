/** Pure helpers for quote links, simple links and the customer quote page. */

export type LinkKind = "questionnaire" | "simple" | "quote";
export type QuoteState = "" | "review" | "sent" | "viewed" | "accepted";
export type QuoteStyle = "clean" | "bold" | "classic";

export const QUOTE_STYLES: { id: QuoteStyle; label: string; help: string }[] = [
  { id: "clean", label: "Clean", help: "Light and simple, with a thin colour line." },
  { id: "bold", label: "Bold", help: "A strong colour header with your logo." },
  { id: "classic", label: "Classic", help: "Centred and traditional, with a serif look." },
];

export const CTA_PRESETS = ["Send me more info", "Call me back", "Get my quote", "Book a time"] as const;
export const QUOTE_CTA_PRESETS = ["Send me this quote", "Get my quote"] as const;

export function parseQuoteStyle(value: unknown): QuoteStyle {
  return value === "bold" || value === "classic" || value === "clean" ? value : "clean";
}

export function parseQuoteState(value: unknown): QuoteState {
  return value === "review" || value === "sent" || value === "viewed" || value === "accepted" ? value : "";
}

export function parseLinkKind(value: unknown): LinkKind {
  return value === "simple" || value === "quote" ? value : "questionnaire";
}

/** Same rule the database uses: only a clear single price (R650, $1,200) may be quoted automatically. */
export function isFixedPrice(price: string): boolean {
  return /^[A-Za-z$€£]{0,3} ?[0-9][0-9 ,.]*$/.test(price.trim());
}

/** What will happen to a quote link, in plain words, for the owner's settings screen. */
export function priceCheck(price: string, autoSend: boolean): { auto: boolean; note: string } {
  if (!price.trim()) return { auto: false, note: "Add a price on the Services page so the quote can be built. Until then you'll check each one first." };
  if (!isFixedPrice(price)) return { auto: false, note: "This price is a range or starts 'from', so you'll check each quote before it goes out." };
  return autoSend
    ? { auto: true, note: "A single clear price: the quote goes out straight away." }
    : { auto: false, note: "Auto-send is off, so you'll check each quote first." };
}

/** Turns a pasted YouTube or Vimeo link into a safe embed address. Anything else returns null. */
export function parseVideoUrl(input: string): { provider: "youtube" | "vimeo"; embedUrl: string } | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  let id = "";
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
    else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
      id = match?.[1] ?? "";
    }
  }
  if (/^[A-Za-z0-9_-]{6,20}$/.test(id)) {
    return { provider: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = url.pathname.match(/\/(?:video\/)?(\d{5,12})(?:\/|$)/);
    if (match) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
  }
  return null;
}

export function quoteStateLabel(state: QuoteState): string {
  switch (state) {
    case "review":
      return "Check quote";
    case "sent":
      return "Quote sent – awaiting reply";
    case "viewed":
      return "Viewed";
    case "accepted":
      return "Accepted";
    default:
      return "";
  }
}

export const REMINDER_DAYS = [2, 5] as const;

/** An in-app nudge once a sent quote has had no answer for 2 days, then 5. Accepted or unsent quotes never nudge. */
export function quoteReminder(
  lead: { quoteState: QuoteState; quoteSentAt: string | null },
  now: Date = new Date(),
): { day: 2 | 5; text: string } | null {
  if (lead.quoteState !== "sent" && lead.quoteState !== "viewed") return null;
  const sent = lead.quoteSentAt ? Date.parse(lead.quoteSentAt) : Number.NaN;
  if (Number.isNaN(sent)) return null;
  const days = (now.getTime() - sent) / 86_400_000;
  if (days >= 5) return { day: 5, text: "No reply in 5 days. A last friendly nudge is worth it." };
  if (days >= 2) return { day: 2, text: "No reply in 2 days. Follow up while it's fresh." };
  return null;
}

/** Random private token for owner-made quote links (the customer-link database function makes its own). */
export function newQuoteToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function quotePath(token: string): string {
  return `/q/${token}`;
}

export function quoteExpiry(days: number, from: Date = new Date()): string {
  return new Date(from.getTime() + Math.max(1, Math.min(90, days)) * 86_400_000).toISOString();
}

/** Starter wording older accounts still have saved in Quote style. It is a hint for the owner, never text for a customer. */
export const PLACEHOLDER_STYLE_HINTS = [
  "Tell customers about any guarantee, refund or cancellation terms here.",
  "Close with the business name and one line: we will confirm the details by phone.",
];

const norm = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase();

export function isPlaceholderStyle(text: string): boolean {
  const value = norm(text);
  return PLACEHOLDER_STYLE_HINTS.some((hint) => norm(hint) === value);
}

/** The owner's own wording for a style field, or "" when it is empty or still the starter hint. */
export function styleInstruction(text: string): string {
  return !text.trim() || isPlaceholderStyle(text) ? "" : text.trim();
}
