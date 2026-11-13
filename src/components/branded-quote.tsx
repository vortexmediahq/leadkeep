import { BrandMark } from "@/components/brand-mark";
import { PoweredBy } from "@/components/powered-by";
import { brandCssVars, fontFamily, hasBranding, type Branding } from "@/lib/branding";
import type { CSSProperties } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

/** What the customer sees: the branded quote (or a plain one if no branding is on), with a way back to editing. */
export function CustomerQuotePreview({
  businessName,
  branding,
  text,
  onBack,
}: {
  businessName: string;
  branding: Branding;
  text: string;
  onBack: () => void;
}) {
  const branded = branding.showOnQuote && hasBranding(branding);
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3">
        <p className="text-sm font-medium text-ink">Preview: this is how your customer sees the quote</p>
        <Button size="sm" variant="secondary" onClick={onBack}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to edit
        </Button>
      </div>
      {branded ? (
        <BrandedQuote businessName={businessName} branding={branding} text={text} />
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper">
          {businessName ? <p className="border-b border-line px-4 py-3 text-sm font-semibold tracking-tight">{businessName}</p> : null}
          <pre className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed">{text}</pre>
          <PoweredBy compact className="px-4 pb-3" />
        </div>
      )}
    </div>
  );
}
