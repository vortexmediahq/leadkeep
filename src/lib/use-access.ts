import { useMemo } from "react";
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
