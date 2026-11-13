import { useMemo } from "react";
import { effectiveBranding, type Branding } from "@/lib/branding";
import { accessFor, gateLeads, type Access, type GatedLead } from "@/lib/entitlements";
import { useLeakKeep } from "@/lib/store";

export function useAccess(): Access {
  const entitlements = useLeakKeep((state) => state.entitlements);
  return useMemo(() => accessFor(entitlements), [entitlements]);
}

/** The owner's leads with details hidden on any lead beyond what their plan includes. */
export function useGatedLeads(): GatedLead[] {
  const leads = useLeakKeep((state) => state.leads);
  const access = useAccess();
  return useMemo(() => gateLeads(leads, access), [leads, access]);
}

/** The client's branding if their plan includes it, otherwise LeadKeep's defaults. */
export function useEffectiveBranding(): Branding {
  const branding = useLeakKeep((state) => state.branding);
  const allowed = useAccess().features.customBranding;
  return useMemo(() => effectiveBranding(branding, allowed), [branding, allowed]);
}
