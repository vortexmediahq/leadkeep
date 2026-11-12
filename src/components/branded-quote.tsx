import { BrandMark } from "@/components/brand-mark";
import { PoweredBy } from "@/components/powered-by";
import { brandCssVars, fontFamily, hasBranding, type Branding } from "@/lib/branding";
import type { CSSProperties } from "react";

export function BrandedQuote({
  businessName,
  branding,
  text,
}: {
  businessName: string;
  branding: Branding;
  text: string;
}) {
  if (!branding.showOnQuote || !hasBranding(branding) || !text.trim()) return null;
  return (
    <div
      className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper"
      style={brandCssVars(branding) as CSSProperties}
    >
      <div className="border-b border-line px-4 py-3" style={{ background: branding.primaryColor || undefined, color: branding.primaryColor ? "var(--color-primary-ink)" : undefined }}>
        {branding.logoPath ? <BrandMark path={branding.logoPath} name={businessName} heightClass="h-10" /> : null}
        {businessName ? <p className="mt-2 text-sm font-semibold tracking-tight">{businessName}</p> : null}
      </div>
      <pre className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed" style={{ fontFamily: fontFamily(branding.font) }}>
        {text}
      </pre>
      <PoweredBy compact className="px-4 pb-3" />
    </div>
  );
}

export function brandedQuotePlainText(businessName: string, text: string) {
  const parts = [businessName.trim(), text.trim()].filter(Boolean);
  return parts.join("\n\n");
}
