import { create } from "zustand";
import {
  deleteLinkRow,
  fetchAllowance,
  deleteServiceRow,
  fetchLeadById,
  fetchLeads,
  fetchLinks,
  fetchProfile,
  fetchServices,
  fetchTemplate,
  insertLinks,
  insertQuestionnaire,
  updateQuestionnaireRow,
  deleteQuestionnaireRow,
  fetchQuestionnaires,
  questionnairesAvailable,
  updateLinkQuestionnaire,
  insertServices,
  saveProfile,
  saveTemplate,
  subscribeToNewLeads,
  updateLeadRow,
  updateLinkSource,
  updateServiceRow,
  type StoredTemplate,
} from "@/lib/data";
import type { Allowance } from "@/lib/plan";
import { blankBusiness, seedTemplate, starterLinkSources, starterServices } from "@/lib/seed";
import type { Business, Lead, LeadLink, LeadStatus, Questionnaire, QuoteTemplate, Service } from "@/lib/types";
import { duplicateQuestionnaire, newId } from "@/lib/question-templates";

export type QuestionnaireDraft = Omit<Questionnaire, "id" | "updatedAt">;

const SAVE_DELAY_MS = 600;
const LEGACY_KEY = "leakkeep.v1";

type LeakState = {
  business: Business;
  services: Service[];
  links: LeadLink[];
  questionnaires: Questionnaire[];
  questionnairesReady: boolean;
  template: StoredTemplate;
  leads: Lead[];
  incoming: Lead | null;
  allowance: Allowance | null;
  loadedFor: string | null;
  loadError: string;
  saveError: string;
  load: (userId: string) => Promise<void>;
  refreshLeads: () => Promise<void>;
  flushSaves: () => Promise<void>;
  reset: () => void;
  clearSaveError: () => void;
  dismissIncoming: () => void;
  setAllowance: (allowance: Allowance) => void;
  updateBusiness: (patch: Partial<Business>) => void;
  updateTemplate: (patch: Partial<QuoteTemplate>) => void;
  addService: () => void;
  updateService: (id: string, patch: Partial<Omit<Service, "id">>) => void;
  removeService: (id: string) => void;
  importServices: (items: Omit<Service, "id">[]) => number;
  addLink: (source: string, questionnaireId?: string | null) => Promise<void>;
  setLinkQuestionnaire: (id: string, questionnaireId: string | null) => void;
  createQuestionnaire: (draft: QuestionnaireDraft) => Promise<string>;
  saveQuestionnaire: (item: Questionnaire) => void;
  duplicateQuestionnaire: (id: string) => Promise<string | null>;
  removeQuestionnaire: (id: string) => void;
  updateLink: (id: string, source: string) => void;
  removeLink: (id: string) => void;
  updateLead: (id: string, patch: Pick<Lead, "quote" | "quoteUpdatedAt">) => void;
  setStatus: (id: string, status: LeadStatus) => void;
};

const message = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong saving.");

// Business details and link names were kept on the device before accounts existed.
function readLegacy(): { business: Partial<Business>; sources: string[] } {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    const state = raw ? (JSON.parse(raw) as { state?: { business?: unknown; links?: unknown } }).state : undefined;
    const business = state?.business && typeof state.business === "object" ? (state.business as Partial<Business>) : {};
    const sources = Array.isArray(state?.links)
      ? state.links
          .map((link) => (link && typeof link === "object" ? (link as { source?: unknown }).source : ""))
          .filter((source): source is string => typeof source === "string" && source.trim().length > 0)
      : [];
    return { business, sources };
  } catch {
    return { business: {}, sources: [] };
  }
}

export const useLeakKeep = create<LeakState>()((set, get) => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const queued = new Map<string, () => Promise<unknown>>();
  let unsubscribe: (() => void) | null = null;

  const run = (task: () => Promise<unknown>) => {
    task().then(
      () => set({ saveError: "" }),
      (error) => set({ saveError: message(error) }),
    );
  };

  const later = (key: string, task: () => Promise<unknown>) => {
    const pending = timers.get(key);
    if (pending) clearTimeout(pending);
    queued.set(key, task);
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        queued.delete(key);
        run(task);
      }, SAVE_DELAY_MS),
    );
  };

  const cancel = (key: string) => {
    const pending = timers.get(key);
    if (pending) clearTimeout(pending);
    timers.delete(key);
    queued.delete(key);
  };

  const mergeNew = (incoming: Lead[]) => {
    const known = new Set(get().leads.map((lead) => lead.id));
    const fresh = incoming.filter((lead) => !known.has(lead.id));
    if (!fresh.length) return;
    set((state) => ({
      leads: [...fresh, ...state.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      incoming: fresh[0],
    }));
  };

  const blank = { ...seedTemplate, id: null };

  return {
    business: blankBusiness,
    services: [],
    links: [],
    questionnaires: [],
    questionnairesReady: false,
    template: blank,
    leads: [],
    incoming: null,
    allowance: null,
    loadedFor: null,
    loadError: "",
    saveError: "",
    load: async (userId) => {
      try {
        let [services, template, leads, profile, links, allowance] = await Promise.all([
          fetchServices(),
          fetchTemplate(),
          fetchLeads(),
          fetchProfile(),
          fetchLinks(),
          fetchAllowance().catch(() => null),
        ]);
        if (!template && services.length === 0) {
          services = starterServices.map((item) => ({ ...item, id: crypto.randomUUID() }));
          await insertServices(services);
          template = { ...blank, id: await saveTemplate(blank) };
        }
        if (!profile) {
          const legacy = readLegacy();
          profile = { ...blankBusiness, ...legacy.business };
          await saveProfile(profile);
          if (links.length === 0) {
            links = await insertLinks(legacy.sources.length ? legacy.sources : starterLinkSources);
          }
        }
        const questionnairesReady = questionnairesAvailable();
        const questionnaires = questionnairesReady ? await fetchQuestionnaires().catch(() => []) : [];
        set({
          services,
          leads,
          links,
          questionnaires,
          questionnairesReady,
          business: profile,
          template: template ?? blank,
          allowance,
          loadedFor: userId,
          loadError: "",
        });
        unsubscribe?.();
        unsubscribe = subscribeToNewLeads(userId, (id) => {
          fetchLeadById(id).then(
            (lead) => lead && mergeNew([lead]),
            () => undefined,
          );
        });
      } catch (error) {
        set({ loadError: message(error) });
      }
    },
    refreshLeads: async () => {
      if (!get().loadedFor) return;
      try {
        mergeNew(await fetchLeads());
      } catch {
        // A missed refresh is retried on the next focus; the dashboard keeps what it has.
      }
    },
    flushSaves: async () => {
      const tasks = [...queued.values()];
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      queued.clear();
      try {
        await Promise.all(tasks.map((task) => task()));
        set({ saveError: "" });
      } catch (error) {
        set({ saveError: message(error) });
        throw error;
      }
    },
    reset: () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      queued.clear();
      unsubscribe?.();
      unsubscribe = null;
      set({
        business: blankBusiness,
        services: [],
        links: [],
        questionnaires: [],
        questionnairesReady: false,
        leads: [],
        incoming: null,
        allowance: null,
        template: blank,
        loadedFor: null,
        loadError: "",
        saveError: "",
      });
    },
    clearSaveError: () => set({ saveError: "" }),
    dismissIncoming: () => set({ incoming: null }),
    setAllowance: (allowance) => set({ allowance }),
    updateBusiness: (patch) => {
      set((state) => ({ business: { ...state.business, ...patch } }));
      later("business", () => saveProfile(get().business));
    },
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
      cancel(`service:${id}`);
      set((state) => ({ services: state.services.filter((service) => service.id !== id) }));
      run(() => deleteServiceRow(id));
    },
    importServices: (items) => {
      const next = items.filter((item) => item.name.trim()).map((item) => ({ ...item, id: crypto.randomUUID() }));
      if (!next.length) return 0;
      set((state) => ({ services: [...next, ...state.services] }));
      run(() => insertServices(next));
      return next.length;
    },
    addLink: async (source, questionnaireId = null) => {
      const [link] = await insertLinks([source], questionnaireId);
      if (link) set((state) => ({ links: [link, ...state.links] }));
    },
    setLinkQuestionnaire: (id, questionnaireId) => {
      set((state) => ({ links: state.links.map((link) => (link.id === id ? { ...link, questionnaireId } : link)) }));
      run(() => updateLinkQuestionnaire(id, questionnaireId));
    },
    createQuestionnaire: async (draft) => {
      const item: Questionnaire = { ...draft, id: newId(), updatedAt: new Date().toISOString() };
      await insertQuestionnaire(item);
      set((state) => ({ questionnaires: [item, ...state.questionnaires] }));
      return item.id;
    },
    saveQuestionnaire: (item) => {
      const next = { ...item, updatedAt: new Date().toISOString() };
      set((state) => ({ questionnaires: state.questionnaires.map((q) => (q.id === item.id ? next : q)) }));
      later(`questionnaire:${item.id}`, () => {
        const current = get().questionnaires.find((q) => q.id === item.id);
        return current ? updateQuestionnaireRow(current) : Promise.resolve();
      });
    },
    duplicateQuestionnaire: async (id) => {
      const source = get().questionnaires.find((q) => q.id === id);
      if (!source) return null;
      return get().createQuestionnaire(duplicateQuestionnaire(source));
    },
    removeQuestionnaire: (id) => {
      cancel(`questionnaire:${id}`);
      set((state) => ({
        questionnaires: state.questionnaires.filter((q) => q.id !== id),
        links: state.links.map((link) => (link.questionnaireId === id ? { ...link, questionnaireId: null } : link)),
      }));
      run(() => deleteQuestionnaireRow(id));
    },
    updateLink: (id, source) => {
      set((state) => ({ links: state.links.map((link) => (link.id === id ? { ...link, source } : link)) }));
      later(`link:${id}`, () => updateLinkSource(id, source));
    },
    removeLink: (id) => {
      cancel(`link:${id}`);
      set((state) => ({ links: state.links.filter((link) => link.id !== id) }));
      run(() => deleteLinkRow(id));
    },
    updateLead: (id, patch) => {
      set((state) => ({ leads: state.leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)) }));
      later(`lead:${id}`, () => updateLeadRow(id, patch));
    },
    setStatus: (id, status) => {
      set((state) => ({ leads: state.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead)) }));
      run(() => updateLeadRow(id, { status }));
    },
  };
});
