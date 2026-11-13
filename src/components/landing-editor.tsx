import { useState, type ChangeEvent } from "react";
import { LandingMedia } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/fields";
import { uploadBrandImage } from "@/lib/data";
import { CTA_PRESETS, parseVideoUrl, priceCheck, QUOTE_CTA_PRESETS } from "@/lib/quote-flow";
import { useSession } from "@/lib/session";
import { useLeakKeep } from "@/lib/store";
import type { LeadLink } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Owner settings for a quote link or a simple call-to-action link. */
export function LandingEditor({ link }: { link: LeadLink }) {
  const userId = useSession((state) => state.user?.id ?? "");
  const services = useLeakKeep((state) => state.services);
  const update = useLeakKeep((state) => state.updateLinkLanding);
  const isQuote = link.kind === "quote";
  const service = services.find((item) => item.id === link.serviceId);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const presets = isQuote ? QUOTE_CTA_PRESETS : CTA_PRESETS;
  const videoProblem = link.mediaUrl.trim() && !parseVideoUrl(link.mediaUrl) ? "Use a YouTube or Vimeo link." : "";

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !userId) return;
    setUploading(true);
    setError("");
    try {
      update(link.id, { mediaPath: await uploadBrandImage(userId, file, `link-${link.slug}`), mediaUrl: "" });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't upload that picture.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-line bg-mist p-3">
      <p className="text-sm font-semibold">{isQuote ? "Quote link page" : "Simple link page"}</p>
      {isQuote ? (
        <Field id={`svc-${link.id}`} label="Service this link quotes">
          <SelectInput
            id={`svc-${link.id}`}
            value={link.serviceId ?? ""}
            onChange={(event) => update(link.id, { serviceId: event.target.value || null })}
          >
            <option value="">Choose a service…</option>
            {services
              .filter((item) => item.name.trim())
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.price ? ` · ${item.price}` : ""}
                </option>
              ))}
          </SelectInput>
        </Field>
      ) : null}
      <Field id={`headline-${link.id}`} label="Headline">
        <TextInput
          id={`headline-${link.id}`}
          value={link.headline}
          maxLength={120}
          placeholder={isQuote && service ? `Get your ${service.name} quote` : "e.g. See what we can do for you"}
          onChange={(event) => update(link.id, { headline: event.target.value })}
        />
      </Field>
      <Field id={`intro-${link.id}`} label="A few words (optional)">
        <TextArea
          id={`intro-${link.id}`}
          value={link.intro}
          maxLength={600}
          rows={3}
          onChange={(event) => update(link.id, { intro: event.target.value })}
        />
      </Field>
      <div>
        <p className="text-sm font-medium">Picture or video (optional)</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <label className="cursor-pointer">
              {uploading ? "Uploading…" : link.mediaPath ? "Replace picture" : "Upload a picture"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void onFile(event)} disabled={uploading} />
            </label>
          </Button>
          {link.mediaPath ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => update(link.id, { mediaPath: "" })}>
              Remove picture
            </Button>
          ) : null}
        </div>
        {error ? <p className="mt-2 text-sm text-lost">{error}</p> : null}
        <Field id={`video-${link.id}`} label="…or paste a YouTube or Vimeo link" error={videoProblem}>
          <TextInput
            id={`video-${link.id}`}
            value={link.mediaUrl}
            maxLength={300}
            placeholder="https://www.youtube.com/watch?v=…"
            onChange={(event) => update(link.id, { mediaUrl: event.target.value })}
          />
        </Field>
        {link.mediaPath || (link.mediaUrl && !videoProblem) ? (
          <div className="mt-2 max-w-xs">
            <LandingMedia mediaPath={link.mediaPath} mediaUrl={videoProblem ? "" : link.mediaUrl} title="Preview" />
          </div>
        ) : null}
      </div>
      <div>
        <p className="text-sm font-medium">Button text</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={link.ctaText === preset}
              onClick={() => update(link.id, { ctaText: preset })}
              className={cn(
                "press h-10 rounded-full px-3 text-sm font-medium",
                link.ctaText === preset ? "bg-ink text-paper" : "border border-line bg-paper text-ink-soft",
              )}
            >
              {preset}
            </button>
          ))}
        </div>
        <TextInput
          aria-label="Button text"
          className="mt-2"
          value={link.ctaText}
          maxLength={40}
          placeholder="Or write your own"
          onChange={(event) => update(link.id, { ctaText: event.target.value })}
        />
      </div>
      {isQuote ? (
        <div>
          {(() => {
            const check = priceCheck(service?.price ?? "", link.autoSend);
            return (
              <>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-accent"
                    checked={link.autoSend}
                    onChange={(event) => update(link.id, { autoSend: event.target.checked })}
                  />
                  <span>
                    <span className="block font-medium">Send the quote straight away</span>
                    <span className="block text-sm text-muted">Turn off to check every quote first ("let me check first").</span>
                  </span>
                </label>
                <p className="mt-2 text-sm text-ink-soft" role="status">
                  {check.note}
                </p>
              </>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}
