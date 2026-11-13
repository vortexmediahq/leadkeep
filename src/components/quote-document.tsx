import { format } from "date-fns";
import type { CSSProperties } from "react";
import { BrandMark } from "@/components/brand-mark";
import { PoweredBy } from "@/components/powered-by";
import { brandCssVars, fontFamily, type Branding } from "@/lib/branding";
import { publicLogoUrl } from "@/lib/data";
import type { QuoteStyle } from "@/lib/quote-flow";
import { cn } from "@/lib/utils";

export type QuoteDocumentProps = {
  style: QuoteStyle;
  businessName: string;
  contact?: { phone: string; email: string };
  /** Pass null for a plain, unbranded quote. */
  branding: Branding | null;
  /** Empty hides the logo (tick box off, or plan without branding). */
  logoPath: string;
  backgroundPath?: string;
  customer?: string;
  service?: string;
  text: string;
  expiresAt?: string | null;
  className?: string;
};

const PRINT_EXACT = { printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as CSSProperties;

/** The quote itself: three looks, the customer's name, the owner's logo and an optional background. */
export function QuoteDocument(props: QuoteDocumentProps) {
  const { style, businessName, contact, branding, logoPath, backgroundPath, customer, service, text, expiresAt, className } = props;
  const bg = backgroundPath ? publicLogoUrl(backgroundPath) : "";
  const vars = branding ? (brandCssVars(branding) as CSSProperties) : undefined;
  const classic = style === "classic";
  const bodyFont = classic ? "Georgia, 'Times New Roman', serif" : branding ? fontFamily(branding.font) : undefined;
  const contactLine = [contact?.phone, contact?.email].filter((part) => part && part.trim()).join(" · ");
  const meta = (
    <dl className={cn("grid gap-0.5 text-sm", classic ? "justify-items-center text-center" : "sm:text-right")}>
      {customer ? (
        <div>
          <dt className="sr-only">Prepared for</dt>
          <dd>
            Prepared for <strong>{customer}</strong>
          </dd>
        </div>
      ) : null}
      {service ? (
        <div>
          <dt className="sr-only">Service</dt>
          <dd>{service}</dd>
        </div>
      ) : null}
      {expiresAt ? (
        <div>
          <dt className="sr-only">Valid until</dt>
          <dd className="opacity-80">Valid until {format(new Date(expiresAt), "d MMM yyyy")}</dd>
        </div>
      ) : null}
    </dl>
  );
  const identity = (
    <div className={cn("min-w-0", classic && "flex flex-col items-center text-center")}>
      {logoPath ? <BrandMark path={logoPath} name={businessName} heightClass={style === "bold" ? "h-14" : "h-12"} className={classic ? "justify-center" : undefined} /> : null}
      {businessName ? <p className={cn("font-semibold tracking-tight", logoPath ? "mt-2 text-base" : "text-xl")}>{businessName}</p> : null}
      {contactLine ? <p className="text-sm opacity-80">{contactLine}</p> : null}
    </div>
  );

  return (
    <article
      className={cn("quote-doc relative overflow-hidden rounded-2xl border border-line bg-paper text-ink", className)}
      style={{ ...vars, ...PRINT_EXACT, fontFamily: bodyFont }}
      data-style={style}
    >
      {bg ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url("${bg}")`, ...PRINT_EXACT }}
        />
      ) : null}
      <div className="relative">
        {style === "bold" ? (
          <header
            className="flex flex-wrap items-start justify-between gap-4 px-5 py-6"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-ink)", ...PRINT_EXACT }}
          >
            {identity}
            {meta}
          </header>
        ) : style === "classic" ? (
          <header className="flex flex-col items-center gap-3 border-b-4 border-double px-5 py-6" style={{ borderColor: "var(--color-primary)" }}>
            {identity}
            {meta}
          </header>
        ) : (
          <header className="border-t-4 px-5 pt-5" style={{ borderColor: "var(--color-primary)" }}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
              {identity}
              {meta}
            </div>
          </header>
        )}
        <pre
          className={cn("px-5 py-5 text-sm leading-relaxed whitespace-pre-wrap sm:text-base", classic && "text-center sm:text-left")}
          style={{ fontFamily: "inherit" }}
        >
          {text}
        </pre>
        <PoweredBy compact className="px-5 pb-4" />
      </div>
    </article>
  );
}
