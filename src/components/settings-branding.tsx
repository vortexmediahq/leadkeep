import { useEffect, useState, type ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/fields";
import { BRAND_FONTS, HEX_COLOR, hasBranding, parseHexColor } from "@/lib/branding";
import { useSession } from "@/lib/session";
import { useLeakKeep } from "@/lib/store";
import { useAccess } from "@/lib/use-access";
import { uploadBrandImage } from "@/lib/data";
import { QUOTE_STYLES } from "@/lib/quote-flow";
import { cn } from "@/lib/utils";

export function SettingsBranding() {
  const userId = useSession((state) => state.user?.id ?? "");
  const business = useLeakKeep((state) => state.business);
  const branding = useLeakKeep((state) => state.branding);
  const updateBusiness = useLeakKeep((state) => state.updateBusiness);
  const updateBranding = useLeakKeep((state) => state.updateBranding);
  const setLogo = useLeakKeep((state) => state.setLogo);
  const clearLogo = useLeakKeep((state) => state.clearLogo);
  const locked = !useAccess().features.customBranding;
  const [logoError, setLogoError] = useState("");
  const [uploading, setUploading] = useState(false);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !userId) return;
    setUploading(true);
    setLogoError("");
    try {
      await setLogo(file, userId);
    } catch (problem) {
      setLogoError(problem instanceof Error ? problem.message : "We couldn't upload that logo.");
    } finally {
      setUploading(false);
    }
  };

  const setColor = (key: "primaryColor" | "accentColor", value: string) => {
    const next = parseHexColor(value);
    if (next || value === "") updateBranding({ [key]: next });
  };

  return (
    <section id="branding" className="scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel">
      <h2 className="text-lg font-semibold tracking-tight">Your branding</h2>
      <p className="mt-1 text-sm text-muted">
        Add a logo and colours so your enquiry form and quotes look like you. Your logo is never stretched.
      </p>

      {locked ? (
        <div className="mt-3 rounded-2xl border border-accent/30 bg-accent-soft p-3" role="status">
          <p className="text-sm font-medium text-ink">Your own logo and colours are on Care and Growth</p>
          <p className="mt-1 text-sm text-ink-soft">
            Upgrade your plan to put your branding on your enquiry form, quotes and this app.
          </p>
          <Button asChild size="sm" variant="accent" className="mt-3">
            <Link to="/pricing">Upgrade your plan</Link>
          </Button>
        </div>
      ) : null}

      <fieldset disabled={locked} className={locked ? "mt-4 flex flex-col gap-4 opacity-50" : "mt-4 flex flex-col gap-4"} aria-disabled={locked}>
        <div>
          <p className="text-sm font-medium">Logo</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {branding.logoPath ? (
              <div className="rounded-2xl border border-line bg-mist px-4 py-3">
                <BrandMark path={branding.logoPath} name={business.name} heightClass="h-14" />
              </div>
            ) : (
              <div className="grid h-14 w-28 place-items-center rounded-2xl border border-dashed border-line text-xs text-muted">
                No logo yet
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <label className="cursor-pointer">
                  {uploading ? "Uploading…" : branding.logoPath ? "Replace logo" : "Upload logo"}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(event) => void onFile(event)} disabled={uploading} />
                </label>
              </Button>
              {branding.logoPath ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setLogoError("");
                    void clearLogo();
                  }}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
          {logoError ? <p className="mt-2 text-sm text-lost">{logoError}</p> : null}
          <p className="mt-2 text-sm text-muted">PNG, JPG, WEBP or SVG, under 2 MB.</p>
        </div>

        <Field id="brand-name" label="Business name on forms and quotes" hint="This is the same name as on the Links page.">
          <TextInput id="brand-name" value={business.name} onChange={(event) => updateBusiness({ name: event.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            id="primary-color"
            label="Main colour"
            value={branding.primaryColor}
            onChange={(value) => setColor("primaryColor", value)}
            onPicker={(value) => setColor("primaryColor", value)}
          />
          <ColorField
            id="accent-color"
            label="Accent colour"
            value={branding.accentColor}
            onChange={(value) => setColor("accentColor", value)}
            onPicker={(value) => setColor("accentColor", value)}
          />
        </div>

        <Field id="brand-font" label="Font" hint="Optional. Used on your enquiry form and quotes.">
          <SelectInput
            id="brand-font"
            value={branding.font}
            onChange={(event) => updateBranding({ font: event.target.value as typeof branding.font })}
          >
            {BRAND_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </SelectInput>
        </Field>

        <label className="flex items-start gap-3 rounded-2xl border border-line px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-accent"
            checked={branding.showOnForm}
            onChange={(event) => updateBranding({ showOnForm: event.target.checked })}
          />
          <span>
            <span className="block font-medium">Show this branding on the enquiry form</span>
            <span className="block text-sm text-muted">Customers see your logo and colours when they fill in a link.</span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-line px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-accent"
            checked={branding.showOnQuote}
            onChange={(event) => updateBranding({ showOnQuote: event.target.checked })}
          />
          <span>
            <span className="block font-medium">Show this branding on quotes</span>
            <span className="block text-sm text-muted">A preview appears on each lead so you can copy a quote that looks like you.</span>
          </span>
        </label>

        <QuoteOptions userId={userId} />

        {hasBranding(branding) ? (
          <p className="text-sm text-muted">Once your branding is on, the "Powered by LeadKeep" line stays small and sits under your logo or at the bottom.</p>
        ) : null}
      </fieldset>
    </section>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
  onPicker,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPicker: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  return (
    <Field id={id} label={label} hint="Leave blank to keep LeadKeep's colour.">
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          className="size-11 shrink-0 cursor-pointer rounded-lg border border-line bg-paper p-1"
          value={HEX_COLOR.test(value) ? value : "#0B1F3B"}
          onChange={(event) => {
            const next = event.target.value.toUpperCase();
            setDraft(next);
            onPicker(next);
          }}
        />
        <TextInput
          id={id}
          value={draft}
          placeholder="#0B1F3B"
          onChange={(event) => {
            let next = event.target.value.trim().toUpperCase();
            if (next && !next.startsWith("#")) next = `#${next}`;
            if (next.length > 7) return;
            setDraft(next);
            if (next === "" || HEX_COLOR.test(next)) onChange(next);
          }}
        />
      </div>
    </Field>
  );
}

function QuoteOptions({ userId }: { userId: string }) {
  const branding = useLeakKeep((state) => state.branding);
  const updateBranding = useLeakKeep((state) => state.updateBranding);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const onBackground = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !userId) return;
    setUploading(true);
    setError("");
    try {
      updateBranding({ quoteBgPath: await uploadBrandImage(userId, file, "quote-bg") });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't upload that picture.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      <div>
        <h3 className="font-semibold tracking-tight">Your quotes</h3>
        <p className="mt-1 text-sm text-muted">Pick how the quote your customer sees looks.</p>
      </div>
      <div role="radiogroup" aria-label="Quote style" className="grid gap-2 sm:grid-cols-3">
        {QUOTE_STYLES.map((style) => {
          const on = branding.quoteStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => updateBranding({ quoteStyle: style.id })}
              className={cn("press rounded-2xl border p-3 text-left", on ? "border-ink bg-mist" : "border-line bg-paper")}
            >
              <span className="block font-medium">{style.label}</span>
              <span className="mt-1 block text-sm text-muted">{style.help}</span>
            </button>
          );
        })}
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-line px-4 py-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-accent"
          checked={branding.logoOnQuote}
          onChange={(event) => updateBranding({ logoOnQuote: event.target.checked })}
        />
        <span>
          <span className="block font-medium">Put my logo on quotes</span>
          <span className="block text-sm text-muted">Untick to send quotes with your business name only.</span>
        </span>
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-line px-4 py-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-accent"
          checked={branding.logoOnForm}
          onChange={(event) => updateBranding({ logoOnForm: event.target.checked })}
        />
        <span>
          <span className="block font-medium">Put my logo on forms and link pages</span>
          <span className="block text-sm text-muted">What customers see before they send a request.</span>
        </span>
      </label>
      <div>
        <p className="text-sm font-medium">Quote background (optional)</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <label className="cursor-pointer">
              {uploading ? "Uploading…" : branding.quoteBgPath ? "Replace background" : "Upload background"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void onBackground(event)} disabled={uploading} />
            </label>
          </Button>
          {branding.quoteBgPath ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => updateBranding({ quoteBgPath: "" })}>
              Remove
            </Button>
          ) : null}
        </div>
        {error ? <p className="mt-2 text-sm text-lost">{error}</p> : null}
        <p className="mt-2 text-sm text-muted">Shown faintly behind the quote so the words stay easy to read. Under 2 MB.</p>
      </div>
      <Field id="quote-days" label="Quotes stay open for (days)" hint="After this, the Accept button turns off. 1 to 90 days.">
        <TextInput
          id="quote-days"
          type="number"
          inputMode="numeric"
          min={1}
          max={90}
          value={branding.quoteValidDays}
          onChange={(event) => {
            const days = Math.round(Number(event.target.value));
            if (Number.isFinite(days) && days >= 1 && days <= 90) updateBranding({ quoteValidDays: days });
          }}
        />
      </Field>
    </div>
  );
}
