import { createFileRoute } from "@tanstack/react-router";
import { Check, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandTheme } from "@/components/brand-theme";
import { PoweredBy } from "@/components/powered-by";
import { QuoteDocument } from "@/components/quote-document";
import { Button } from "@/components/ui/button";
import { acceptQuoteRpc, fetchQuoteView, type QuoteView } from "@/lib/data";
import { format } from "date-fns";

export const Route = createFileRoute("/q/$token")({
  head: () => ({ meta: [{ title: "Your quote" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: QuotePage,
});

const TOKEN = /^[a-z0-9]{24,64}$/;

type Loaded = { state: "loading" } | { state: "missing" } | { state: "failed" } | { state: "ready"; quote: QuoteView };

function Message({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-line bg-paper p-6 shadow-panel">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-base text-ink-soft">{body}</p>
      </div>
      <PoweredBy className="mt-6" />
    </main>
  );
}

function QuotePage() {
  const { token } = Route.useParams();
  const valid = TOKEN.test(token);
  const [loaded, setLoaded] = useState<Loaded>({ state: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!valid) return;
    let live = true;
    fetchQuoteView(token)
      .then((quote) => live && setLoaded(quote ? { state: "ready", quote } : { state: "missing" }))
      .catch(() => live && setLoaded({ state: "failed" }));
    return () => {
      live = false;
    };
  }, [token, valid]);

  if (!valid || loaded.state === "missing") {
    return <Message title="This quote isn't available" body="The link may be wrong. Ask the business to send it again." />;
  }
  if (loaded.state === "failed") return <Message title="The quote couldn't load" body="Check your connection and refresh the page." />;
  if (loaded.state === "loading") return <Message title="Loading your quote…" body="One moment." />;

  const quote = loaded.quote;
  const accepted = quote.state === "accepted";
  const branded = quote.branding;

  const accept = async () => {
    setBusy(true);
    setError("");
    try {
      const ok = await acceptQuoteRpc(token);
      if (!ok) throw new Error("expired");
      const next = await fetchQuoteView(token, false);
      if (next) setLoaded({ state: "ready", quote: next });
    } catch {
      setError("We couldn't record that. The quote may have expired. Please contact the business.");
    } finally {
      setBusy(false);
    }
  };

  const page = (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:py-10 print:max-w-none print:p-0">
      <QuoteDocument
        style={quote.style}
        businessName={quote.business.name}
        contact={{ phone: quote.business.phone, email: quote.business.email }}
        branding={branded}
        logoPath={branded?.logoPath ?? ""}
        backgroundPath={quote.backgroundPath}
        customer={quote.customer}
        service={quote.service}
        text={quote.text}
        expiresAt={quote.expiresAt}
      />
      <section className="rounded-3xl border border-line bg-paper p-4 shadow-panel print:hidden" aria-label="Respond to this quote">
        {accepted ? (
          <p role="status" className="flex items-center gap-2 font-medium text-won">
            <Check className="size-5" aria-hidden="true" />
            Accepted{quote.acceptedAt ? ` on ${format(new Date(quote.acceptedAt), "d MMM yyyy")}` : ""}. {quote.business.name || "The business"} will be in touch.
          </p>
        ) : quote.expired ? (
          <p role="status" className="font-medium text-lost">
            This quote has expired. Please contact {quote.business.name || "the business"} for a fresh one.
          </p>
        ) : (
          <Button className="w-full" onClick={() => void accept()} disabled={busy}>
            <Check className="size-4" aria-hidden="true" />
            {busy ? "Saving…" : "Accept this quote"}
          </Button>
        )}
        {error ? (
          <p role="alert" className="mt-2 text-sm text-lost">
            {error}
          </p>
        ) : null}
        <Button className="mt-2 w-full" variant="secondary" onClick={() => window.print()}>
          <Download className="size-4" aria-hidden="true" />
          Print or save as PDF
        </Button>
      </section>
    </main>
  );
  return branded ? (
    <BrandTheme branding={branded} className="min-h-screen">
      {page}
    </BrandTheme>
  ) : (
    page
  );
}
