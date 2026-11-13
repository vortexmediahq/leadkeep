import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { BrandTheme } from "@/components/brand-theme";
import { Mark } from "@/components/mark";
import { PoweredBy } from "@/components/powered-by";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import { publicLogoUrl, submitLandingRequest, type PublicForm } from "@/lib/data";
import { parseVideoUrl } from "@/lib/quote-flow";
import { supabase } from "@/lib/supabase";

/** Image or video shown above the form: an uploaded picture, or a YouTube/Vimeo link. */
export function LandingMedia({ mediaPath, mediaUrl, title }: { mediaPath: string; mediaUrl: string; title: string }) {
  const video = mediaUrl ? parseVideoUrl(mediaUrl) : null;
  if (video) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-mist">
        <iframe
          src={video.embedUrl}
          title={title || "Video"}
          className="size-full"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }
  const src = mediaPath ? publicLogoUrl(mediaPath) : "";
  if (!src) return null;
  return <img src={src} alt={title || "Business"} className="max-h-80 w-full rounded-2xl border border-line object-cover" />;
}

/** Landing page for quote links and simple call-to-action links. */
export function Landing({
  slug,
  form,
  preview,
}: {
  slug: string;
  form: PublicForm;
  preview?: { onBack: () => void };
}) {
  const navigate = useNavigate();
  const { business, landing, branding } = form;
  const isQuote = form.kind === "quote";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<"review" | "simple" | null>(null);

  const headline = landing.headline.trim() || (isQuote && landing.serviceName ? `Get your ${landing.serviceName} quote` : business.name || "Get in touch");
  const cta = landing.ctaText.trim() || (isQuote ? "Send me this quote" : "Send me more info");
  const logoPath = branding?.logoPath ?? "";

  const wrap = (node: ReactNode) => (branding ? <BrandTheme branding={branding} className="min-h-screen">{node}</BrandTheme> : node);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    if (isQuote && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please add a valid email address.");
    if (!isQuote && !email.trim() && !phone.trim()) return setError("Please add an email address or a phone number.");
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("That email address doesn't look right.");
    if (!consent) return setError("Please tick the box so we can contact you about this.");
    if (preview) return setError("This is a preview, so nothing was sent.");
    setSending(true);
    try {
      const result = await submitLandingRequest(slug, { name: name.trim(), email: email.trim(), phone: phone.trim(), website, consent });
      if (!result.ok) throw new Error("not ok");
      if (result.token && result.state === "sent") {
        // Best effort: email them the link too. Not set up yet means they simply see the quote on screen.
        void supabase.functions.invoke("send-quote", { body: { token: result.token } }).catch(() => undefined);
        void navigate({ to: "/q/$token", params: { token: result.token } });
        return;
      }
      setDone(isQuote ? "review" : "simple");
    } catch {
      setError("We couldn't send that. Please check your details and try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return wrap(
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-line bg-paper p-6 shadow-panel">
          <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent-strong">
            <Check className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Thanks, we've got it</h1>
          <p className="mt-2 text-base text-ink-soft">
            Thanks {name.trim().split(/\s+/)[0]}.{" "}
            {done === "review"
              ? `${business.name || "The business"} will check the details and send your quote soon.`
              : `${business.name || "The business"} has your details and will be in touch soon.`}
          </p>
        </div>
        <PoweredBy compact={!!logoPath} className="mt-6" />
      </main>,
    );
  }

  return wrap(
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-5 px-4 py-6 sm:py-10">
      {preview ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3">
          <p className="text-sm font-medium text-ink">Preview: this is how your customer sees it</p>
          <Button size="sm" variant="secondary" type="button" onClick={preview.onBack}>
            Back
          </Button>
        </div>
      ) : null}
      <header className="flex items-center gap-3">
        {logoPath ? <BrandMark path={logoPath} name={business.name} heightClass="h-12" /> : <Mark />}
        <p className="min-w-0 truncate text-lg font-semibold tracking-tight">{business.name || "Get in touch"}</p>
      </header>
      <LandingMedia mediaPath={landing.mediaPath} mediaUrl={landing.mediaUrl} title={headline} />
      <form onSubmit={(event) => void submit(event)} className="rounded-3xl border border-line bg-paper p-4 shadow-panel sm:p-6" noValidate>
        <h1 className="text-2xl font-semibold tracking-tight">{headline}</h1>
        {landing.intro.trim() ? <p className="mt-2 text-base whitespace-pre-line text-ink-soft">{landing.intro}</p> : null}
        <div className="mt-5 flex flex-col gap-4">
          <Field label="Your name" id="landing-name">
            <TextInput id="landing-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </Field>
          <Field label={isQuote ? "Email (we'll send your quote here)" : "Email"} id="landing-email">
            <TextInput id="landing-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
          </Field>
          <Field label={isQuote ? "Phone (optional)" : "Phone"} id="landing-phone">
            <TextInput id="landing-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
          </Field>
          {/* Honeypot: people never see this, spam bots fill it in. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>
          <label className="flex items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" className="mt-1 size-5 shrink-0" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I agree that {business.name || "this business"} may contact me about my request and keep my details for that
              purpose.
            </span>
          </label>
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-lost">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-5 w-full" disabled={sending}>
          {sending ? "Sending…" : cta}
        </Button>
      </form>
      <PoweredBy compact={!!logoPath} />
    </main>,
  );
}
