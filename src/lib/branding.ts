import type { QuoteStyle } from "@/lib/quote-flow";

export const BRAND_FONTS = [
  { id: "sans", label: "Clean and modern", family: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { id: "serif", label: "Classic serif", family: '"Source Serif 4", Georgia, "Times New Roman", serif' },
  { id: "system", label: "The device's own font", family: "ui-sans-serif, system-ui, sans-serif" },
] as const;

export type BrandFont = (typeof BRAND_FONTS)[number]["id"];

export type Branding = {
  logoPath: string;
  primaryColor: string;
  accentColor: string;
  font: BrandFont;
  showOnQuote: boolean;
  showOnForm: boolean;
  logoOnQuote: boolean;
  logoOnForm: boolean;
  quoteStyle: QuoteStyle;
  quoteBgPath: string;
  quoteValidDays: number;
};

export const blankBranding: Branding = {
  logoPath: "",
  primaryColor: "",
  accentColor: "",
  font: "sans",
  showOnQuote: true,
  showOnForm: true,
  logoOnQuote: true,
  logoOnForm: true,
  quoteStyle: "clean",
  quoteBgPath: "",
  quoteValidDays: 14,
};

export const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function parseFont(value: unknown): BrandFont {
  return value === "serif" || value === "system" || value === "sans" ? value : "sans";
}

export function parseHexColor(value: unknown): string {
  return typeof value === "string" && HEX_COLOR.test(value) ? value.toUpperCase() : "";
}

/** A client has added branding once they upload a logo or pick a colour. */
export function hasBranding(branding: Pick<Branding, "logoPath" | "primaryColor" | "accentColor">): boolean {
  return Boolean(branding.logoPath.trim() || branding.primaryColor.trim() || branding.accentColor.trim());
}

export function fontFamily(font: BrandFont): string {
  return BRAND_FONTS.find((item) => item.id === font)?.family ?? BRAND_FONTS[0].family;
}

export function logoUrl(logoPath: string, supabaseUrl: string): string {
  const path = logoPath.trim();
  if (!path || !supabaseUrl) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/brand-assets/${path}`;
}

export function inkOn(hex: string): string {
  const value = parseHexColor(hex);
  if (!value) return "#ffffff";
  const r = parseInt(value.slice(1, 3), 16);
  const g = parseInt(value.slice(3, 5), 16);
  const b = parseInt(value.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#0B1F3B" : "#ffffff";
}

export function softTint(hex: string, amount = 0.88): string {
  const value = parseHexColor(hex);
  if (!value) return "";
  const mix = (start: number) => Math.round(start + (255 - start) * amount);
  const r = mix(parseInt(value.slice(1, 3), 16));
  const g = mix(parseInt(value.slice(3, 5), 16));
  const b = mix(parseInt(value.slice(5, 7), 16));
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

export function brandCssVars(branding: Pick<Branding, "primaryColor" | "accentColor" | "font">): Record<string, string> {
  const vars: Record<string, string> = { fontFamily: fontFamily(branding.font) };
  if (branding.primaryColor) {
    vars["--color-primary"] = branding.primaryColor;
    vars["--color-primary-ink"] = inkOn(branding.primaryColor);
    const soft = softTint(branding.primaryColor);
    if (soft) vars["--color-primary-soft"] = soft;
  }
  if (branding.accentColor) {
    vars["--color-accent"] = branding.accentColor;
    vars["--color-accent-ink"] = inkOn(branding.accentColor);
    const soft = softTint(branding.accentColor);
    if (soft) vars["--color-accent-soft"] = soft;
  }
  return vars;
}

export const LOGO_MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/** Some computers send an empty or odd file type (SVG and "image/jpg" most often), so fall back to the file ending. */
export function logoMimeType(file: { type: string; name: string }): string {
  const type = (file.type || "").toLowerCase();
  if (type === "image/jpg" || type === "image/pjpeg") return "image/jpeg";
  if (type === "image/png" || type === "image/jpeg" || type === "image/webp" || type === "image/svg+xml") return type;
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return LOGO_MIME_BY_EXT[ext] ?? "";
}

export const BRANDING_SETUP_MESSAGE =
  "Your branding database update hasn't been applied yet, so this can't be saved. Ask Avery for the branding update (20261112120000) and run it once.";

type ErrorLike = { code?: unknown; message?: unknown; statusCode?: unknown; status?: unknown };

/** True when the branding columns do not exist yet in the live database (the batch 2 SQL has not been run). */
export function isMissingBrandingColumns(error: ErrorLike | null | undefined): boolean {
  if (!error) return false;
  const code = String(error.code ?? "");
  const message = String(error.message ?? "").toLowerCase();
  return code === "42703" || code === "PGRST204" || (message.includes("column") && (message.includes("does not exist") || message.includes("schema cache")));
}

/** A plain-words reason for a failed logo upload, so the real cause is not hidden. */
export function logoUploadMessage(error: ErrorLike | null | undefined): string {
  const message = String(error?.message ?? "").toLowerCase();
  const status = String(error?.statusCode ?? error?.status ?? "");
  if (message.includes("bucket not found") || (status === "404" && message.includes("bucket"))) {
    return "Logo storage isn't switched on yet: the branding database update hasn't been applied. Ask Avery for the branding update (20261112120000) and run it once.";
  }
  if (message.includes("row-level security") || message.includes("not authorized") || status === "403" || status === "401") {
    return "We couldn't confirm it's you. Log out, log back in and try the logo again.";
  }
  if (message.includes("exceeded") || message.includes("too large") || status === "413") {
    return "That logo is too big. Please keep it under 2 MB.";
  }
  if (message.includes("mime") || message.includes("not supported") || message.includes("invalid file")) {
    return "That file type isn't allowed. Please use a PNG, JPG, WEBP or SVG image.";
  }
  return "We couldn't upload that logo. Check your connection and try again, or try a different image.";
}

/** Branding only applies on plans that include it. Saved branding is kept, just not shown, if a plan drops to Free. */
export function effectiveBranding(branding: Branding, allowed: boolean): Branding {
  return allowed ? branding : { ...blankBranding };
}

/** The value of the "Don't see your questions? Create new" choice in the questions dropdown. */
export const CREATE_NEW_QUESTIONS = "__create_new__";
