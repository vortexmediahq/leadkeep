import { QuoteDocument } from "@/components/quote-document";
import { hasBranding, type Branding } from "@/lib/branding";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BrandedQuote({
  businessName,
  branding,
  text,
  customer,
  service,
  contact,
}: {
  businessName: string;
  branding: Branding;
  text: string;
  customer?: string;
  service?: string;
  contact?: { phone: string; email: string };
}) {
  if (!branding.showOnQuote || !hasBranding(branding) || !text.trim()) return null;
  return (
    <QuoteDocument
      className="mt-4"
      style={branding.quoteStyle}
      businessName={businessName}
      contact={contact}
      branding={branding}
      logoPath={branding.logoOnQuote ? branding.logoPath : ""}
      backgroundPath={branding.quoteBgPath}
      customer={customer}
      service={service}
      text={text}
    />
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
  customer,
  service,
  contact,
}: {
  businessName: string;
  branding: Branding;
  text: string;
  onBack: () => void;
  customer?: string;
  service?: string;
  contact?: { phone: string; email: string };
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
        <BrandedQuote businessName={businessName} branding={branding} text={text} customer={customer} service={service} contact={contact} />
      ) : (
        <QuoteDocument
          className="mt-4"
          style="clean"
          businessName={businessName}
          contact={contact}
          branding={null}
          logoPath=""
          customer={customer}
          service={service}
          text={text}
        />
      )}
    </div>
  );
}
