import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  deleteServiceRow,
  fetchLeads,
  fetchServices,
  fetchTemplate,
  insertLead,
  insertServices,
  saveTemplate,
  updateLeadRow,
  updateServiceRow,
  type StoredTemplate,
} from "@/lib/data";
import { seedBusiness, seedLinks, seedTemplate } from "@/lib/seed";
import type { Business, Lead, LeadInput, LeadLink, LeadStatus, QuoteTemplate, Service } from "@/lib/types";

const SAVE_DELAY_MS = 600;

type LeakState = {
  business: Business;
  services: Service[];
  links: LeadLink[];
  template: StoredTemplate;
  leads: Lead[];
  loadError: string;
  saveError: string;
  load: () => Promise<void>;
  clearSaveError: () => void;
  updateBusiness: (patch: Partial<Business>) => void;
  updateTemplate: (patch: Partial<QuoteTemplate>) => void;
  addService: () => void;
  updateService: (id: string, patch: Partial<Omit<Service, "id">>) => void;
  removeService: (id: string) => void;
  importServices: (items: Omit<Service, "id">[]) => number;
  addLink: (source: string, id: string) => void;
  updateLink: (id: string, source: string) => void;
  removeLink: (id: string) => void;
  addLead: (input: LeadInput) => Promise<string>;
  updateLead: (id: string, patch: Pick<Lead, "quote" | "quoteUpdatedAt">) => void;
  setStatus: (id: string, status: LeadStatus) => void;
};

const message = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong saving.");

export const useLeakKeep = create<LeakState>()(
  persist(
    (set, get) => {
      const timers = new Map<string, ReturnType<typeof setTimeout>>();

      const run = (task: () => Promise<unknown>) => {
        task().then(
          () => set({ saveError: "" }),
          (error) => set({ saveError: message(error) }),
        );
      };

      const later = (key: string, task: () => Promise<unknown>) => {
        const pending = timers.get(key);
        if (pending) clearTimeout(pending);
        timers.set(
          key,
          setTimeout(() => {
            timers.delete(key);
            run(task);
          }, SAVE_DELAY_MS),
        );
      };

      return {
        business: seedBusiness,
        services: [],
        links: seedLinks,
        template: { ...seedTemplate, id: null },
        leads: [],
        loadError: "",
        saveError: "",
        load: async () => {
          try {
            const [services, template, leads] = await Promise.all([fetchServices(), fetchTemplate(), fetchLeads()]);
            set({ services, leads, loadError: "", ...(template ? { template } : {}) });
          } catch (error) {
            set({ loadError: message(error) });
          }
        },
        clearSaveError: () => set({ saveError: "" }),
        updateBusiness: (patch) => set((state) => ({ business: { ...state.business, ...patch } })),
        updateTemplate: (patch) => {
          set((state) => ({ template: { ...state.template, ...patch } }));
          later("template", async () => {
            const id = await saveTemplate(get().template);
            set((state) => ({ template: { ...state.template, id } }));
          });
        },
        addService: () => {
          const service: Service = { id: crypto.randomUUID(), name: "", description: "", price: "", notes: "" };
          set((state) => ({ services: [service, ...state.services] }));
          run(() => insertServices([service]));
        },
        updateService: (id, patch) => {
          set((state) => ({
            services: state.services.map((service) => (service.id === id ? { ...service, ...patch } : service)),
          }));
          later(`service:${id}`, () => {
            const current = get().services.find((service) => service.id === id);
            if (!current) return Promise.resolve();
            const { name, description, price, notes } = current;
            return updateServiceRow(id, { name, description, price, notes });
          });
        },
        removeService: (id) => {
          const pending = timers.get(`service:${id}`);
          if (pending) clearTimeout(pending);
          set((state) => ({ services: state.services.filter((service) => service.id !== id) }));
          run(() => deleteServiceRow(id));
        },
        importServices: (items) => {
          const next = items
            .filter((item) => item.name.trim())
            .map((item) => ({ ...item, id: crypto.randomUUID() }));
          if (!next.length) return 0;
          set((state) => ({ services: [...next, ...state.services] }));
          run(() => insertServices(next));
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
        removeLink: (id) => set((state) => ({ links: state.links.filter((link) => link.id !== id) })),
        addLead: async (input) => {
          const id = crypto.randomUUID();
          await insertLead(id, input);
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
        updateLead: (id, patch) => {
          set((state) => ({
            leads: state.leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)),
          }));
          later(`lead:${id}`, () => updateLeadRow(id, patch));
        },
        setStatus: (id, status) => {
          set((state) => ({
            leads: state.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
          }));
          run(() => updateLeadRow(id, { status }));
        },
      };
    },
    {
      name: "leakkeep.v1",
      skipHydration: true,
      partialize: (state) => ({ business: state.business, links: state.links }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Pick<LeakState, "business" | "links">>;
        return {
          ...current,
          business: { ...current.business, ...saved.business },
          links: Array.isArray(saved.links) ? saved.links : current.links,
        };
      },
    },
  ),
);
