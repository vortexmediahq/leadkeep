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
};

export const blankBranding: Branding = {
  logoPath: "",
  primaryColor: "",
  accentColor: "",
  font: "sans",
  showOnQuote: true,
  showOnForm: true,
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
