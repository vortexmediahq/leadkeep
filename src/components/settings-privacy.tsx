import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import { useAlerts } from "@/lib/alert-store";
import { deleteMyAccount, downloadJson, downloadLeadsCsv, type AccountExport } from "@/lib/security";
import { signOut, useSession } from "@/lib/session";
import { useLeakKeep } from "@/lib/store";

export function SettingsPrivacy() {
  const email = useSession((state) => state.user?.email ?? "");
  const business = useLeakKeep((state) => state.business);
  const branding = useLeakKeep((state) => state.branding);
  const services = useLeakKeep((state) => state.services);
  const links = useLeakKeep((state) => state.links);
  const questionnaires = useLeakKeep((state) => state.questionnaires);
  const template = useLeakKeep((state) => state.template);
  const leads = useLeakKeep((state) => state.leads);
  const channel = useAlerts((state) => state.channel);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const download = () => {
    const payload: AccountExport = {
      exportedAt: new Date().toISOString(),
      business,
      branding,
      services,
      links,
      questionnaires,
      quoteStyle: {
        tone: template.tone,
        structure: template.structure,
        paymentTerms: template.paymentTerms,
        warranty: template.warranty,
        extra: template.extra,
      },
      leads,
      alertChannel: channel,
    };
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(`leadkeep-data-${stamp}.json`, payload);
    downloadLeadsCsv(`leadkeep-leads-${stamp}.csv`, leads);
  };

  const destroy = async () => {
    if (confirm.trim().toLowerCase() !== "delete") return;
    setPending(true);
    setError("");
    try {
      await deleteMyAccount();
      await signOut();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't delete your account just yet.");
      setPending(false);
    }
  };

  return (
    <section id="privacy" className="scroll-mt-20 flex flex-col gap-4">
      <div className="rounded-3xl border border-line bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">Your data</h2>
        <p className="mt-1 text-sm text-muted">
          Under POPIA you can get a copy of the information we hold for you, or ask us to delete your account.
        </p>
        <Button type="button" variant="secondary" className="mt-3" onClick={download}>
          Download my data
        </Button>
        <p className="mt-2 text-sm text-muted">You'll get a JSON file of your settings, questionnaires and leads, plus a CSV of your leads.</p>
      </div>

      <div className="rounded-3xl border border-lost/30 bg-paper p-4 shadow-panel">
        <h2 className="text-lg font-semibold tracking-tight">Delete my account and data</h2>
        <p className="mt-1 text-sm text-muted">
          This permanently removes your account, leads, questionnaires, branding and settings. It cannot be undone.
          Your enquiry links will stop working.
        </p>
        <Field
          id="confirm-delete"
          label={`Type delete to confirm${email ? ` for ${email}` : ""}`}
          error={error}
        >
          <TextInput id="confirm-delete" value={confirm} autoComplete="off" onChange={(event) => setConfirm(event.target.value)} />
        </Field>
        <Button
          type="button"
          className="mt-3 bg-lost text-white hover:bg-lost/90"
          disabled={pending || confirm.trim().toLowerCase() !== "delete"}
          onClick={() => void destroy()}
        >
          {pending ? "Deleting…" : "Delete my account and data"}
        </Button>
      </div>

      <p className="text-sm text-muted">
        Read our{" "}
        <Link to="/privacy" className="font-medium text-primary">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link to="/terms" className="font-medium text-primary">
          Terms
        </Link>
        . These pages are a draft for review, not legal advice.
      </p>
    </section>
  );
}
