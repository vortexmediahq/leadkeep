import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedBusiness, seedLeads, seedLinks, seedServices, seedTemplate } from "@/lib/seed";
import type {
  Business,
  Lead,
  LeadInput,
  LeadLink,
  LeadStatus,
  QuoteTemplate,
  Service,
} from "@/lib/types";

type LeakState = {
  business: Business;
  services: Service[];
  links: LeadLink[];
  template: QuoteTemplate;
  leads: Lead[];
  updateBusiness: (patch: Partial<Business>) => void;
  updateTemplate: (patch: Partial<QuoteTemplate>) => void;
  addService: () => void;
  updateService: (id: string, patch: Partial<Omit<Service, "id">>) => void;
  removeService: (id: string) => void;
  importServices: (items: Omit<Service, "id">[]) => number;
  addLink: (source: string, id: string) => void;
  updateLink: (id: string, source: string) => void;
  removeLink: (id: string) => void;
  addLead: (input: LeadInput) => string;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  setStatus: (id: string, status: LeadStatus) => void;
};

export const useLeakKeep = create<LeakState>()(
  persist(
    (set) => ({
      business: seedBusiness,
      services: seedServices,
      links: seedLinks,
      template: seedTemplate,
      leads: seedLeads(),
      updateBusiness: (patch) =>
        set((state) => ({ business: { ...state.business, ...patch } })),
      updateTemplate: (patch) =>
        set((state) => ({ template: { ...state.template, ...patch } })),
      addService: () =>
        set((state) => ({
          services: [
            {
              id: crypto.randomUUID(),
              name: "",
              description: "",
              price: "",
              notes: "",
            },
            ...state.services,
          ],
        })),
      updateService: (id, patch) =>
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, ...patch } : service,
          ),
        })),
      removeService: (id) =>
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        })),
      importServices: (items) => {
        const next = items.filter((item) => item.name.trim());
        if (!next.length) return 0;
        set((state) => ({
          services: [
            ...next.map((item) => ({ ...item, id: crypto.randomUUID() })),
            ...state.services,
          ],
        }));
        return next.length;
      },
      addLink: (source, id) =>
        set((state) => ({
          links: [{ id, source, createdAt: new Date().toISOString() }, ...state.links],
        })),
      updateLink: (id, source) =>
        set((state) => ({
          links: state.links.map((link) => (link.id === id ? { ...link, source } : link)),
        })),
      removeLink: (id) =>
        set((state) => ({ links: state.links.filter((link) => link.id !== id) })),
      addLead: (input) => {
        const id = crypto.randomUUID();
        const lead: Lead = {
          ...input,
          id,
          status: "new",
          createdAt: new Date().toISOString(),
          quote: null,
          quoteUpdatedAt: null,
        };
        set((state) => ({ leads: [lead, ...state.leads] }));
        return id;
      },
      updateLead: (id, patch) =>
        set((state) => ({
          leads: state.leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)),
        })),
      setStatus: (id, status) =>
        set((state) => ({
          leads: state.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
        })),
    }),
    {
      name: "leakkeep.v1",
      skipHydration: true,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<
          Pick<LeakState, "business" | "services" | "links" | "template" | "leads">
        >;
        return {
          ...current,
          business: { ...current.business, ...saved.business },
          template: { ...current.template, ...saved.template },
          services: Array.isArray(saved.services) ? saved.services : current.services,
          links: Array.isArray(saved.links) ? saved.links : current.links,
          leads: Array.isArray(saved.leads) ? saved.leads : current.leads,
        };
      },
    },
  ),
);
