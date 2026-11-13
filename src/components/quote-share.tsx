import { format } from "date-fns";
import { Check, Copy, Link2, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { newQuoteToken, quoteExpiry, quotePath, quoteStateLabel } from "@/lib/quote-flow";
import { useLeakKeep } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { Lead } from "@/lib/types";

/** Owner-side panel on the lead page: make the private customer link, copy it, or email it. */
export function QuoteShare({ lead, hasText }: { lead: Lead; hasText: boolean }) {
  const updateLead = useLeakKeep((state) => state.updateLead);
  const setStatus = useLeakKeep((state) => state.setStatus);
  const validDays = useLeakKeep((state) => state.branding.quoteValidDays);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const link = lead.quoteToken ? `${window.location.origin}${quotePath(lead.quoteToken)}` : "";
  const state = lead.quoteState;

  const make = () => {
    const now = new Date();
    updateLead(lead.id, {
      quoteToken: lead.quoteToken ?? newQuoteToken(),
      quoteState: "sent",
      quoteSentAt: now.toISOString(),
      quoteExpiresAt: quoteExpiry(validDays, now),
    });
    if (lead.status === "new" || lead.status === "contacted") setStatus(lead.id, "quoted");
    setNote("");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNote("Couldn't copy. Select the link and copy it by hand.");
    }
  };

  const email = async () => {
    setBusy(true);
    setNote("");
    try {
      const { data, error } = await supabase.functions.invoke("send-quote", { body: { leadId: lead.id } });
      const sent = !error && (data as { sent?: boolean } | null)?.sent === true;
      setNote(sent ? "Quote emailed to your customer." : "Emailing isn't switched on yet. Copy the link and send it yourself for now.");
    } catch {
      setNote("Emailing isn't switched on yet. Copy the link and send it yourself for now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-line bg-mist p-3" aria-label="Customer quote link">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Link2 className="size-4" aria-hidden="true" /> Customer quote link
        {state ? <span className="ml-auto rounded-full bg-paper px-2 py-0.5 text-xs font-medium">{quoteStateLabel(state)}</span> : null}
      </p>
      {state === "review" ? (
        <p className="mt-1 text-sm text-ink-soft">
          This price needs your check first. Look over the quote, then send it.
        </p>
      ) : null}
      {!link ? (
        <>
          <p className="mt-1 text-sm text-ink-soft">
            Make a private page your customer can open, print or save as PDF, and accept.
          </p>
          <Button className="mt-3 w-full" onClick={make} disabled={!hasText}>
            {state === "review" ? "Approve and make link" : "Make customer link"}
          </Button>
        </>
      ) : (
        <>
          <input
            readOnly
            aria-label="Customer quote link"
            value={link}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => void copy()} aria-live="polite">
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button variant="secondary" onClick={() => void email()} disabled={busy || !lead.email.trim()}>
              <Mail className="size-4" aria-hidden="true" /> Email it
            </Button>
          </div>
          <ul className="mt-2 space-y-0.5 text-xs text-muted">
            {lead.quoteSentAt ? <li>Sent {format(new Date(lead.quoteSentAt), "d MMM, HH:mm")}</li> : null}
            {lead.quoteViewedAt ? <li>Viewed {format(new Date(lead.quoteViewedAt), "d MMM, HH:mm")}</li> : null}
            {lead.quoteAcceptedAt ? <li className="font-medium text-won">Accepted {format(new Date(lead.quoteAcceptedAt), "d MMM, HH:mm")}</li> : null}
            {lead.quoteExpiresAt ? <li>Expires {format(new Date(lead.quoteExpiresAt), "d MMM yyyy")}</li> : null}
          </ul>
        </>
      )}
      {note ? (
        <p role="status" className="mt-2 text-sm text-ink-soft">
          {note}
        </p>
      ) : null}
    </div>
  );
}
