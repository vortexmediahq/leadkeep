import { u as supabase } from "./fields-B5r7wua3.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-DKW15xVj.js
function fail(action, error) {
	throw new Error(`Couldn't ${action}. ${error?.message ?? ""}`.trim());
}
function toLead(row) {
	const answers = row.answers ?? {};
	return {
		id: row.id,
		linkId: row.link_id,
		source: row.source,
		name: row.customer_name,
		phone: row.phone,
		email: row.email,
		address: row.address,
		jobType: answers.jobType ?? "",
		description: answers.description ?? "",
		urgency: answers.urgency ?? "",
		preferredTime: answers.preferredTime ?? "",
		propertyType: answers.propertyType ?? "",
		budget: answers.budget ?? "",
		accessNotes: answers.accessNotes ?? "",
		status: row.status,
		createdAt: row.created_at,
		quote: row.quote,
		quoteUpdatedAt: row.quote_updated_at
	};
}
function toTemplate(row) {
	return {
		id: row.id,
		tone: row.tone,
		structure: row.structure,
		paymentTerms: row.payment_terms,
		warranty: row.warranty,
		extra: row.extra
	};
}
function templateColumns(template) {
	return {
		tone: template.tone,
		structure: template.structure,
		payment_terms: template.paymentTerms,
		warranty: template.warranty,
		extra: template.extra
	};
}
async function fetchServices() {
	const { data, error } = await supabase.from("services").select("id, name, description, price, notes").order("created_at", { ascending: false });
	if (error || !data) fail("load services", error);
	return data;
}
async function insertServices(items) {
	const { error } = await supabase.from("services").insert(items);
	if (error) fail("save the service", error);
}
async function updateServiceRow(id, patch) {
	const { error } = await supabase.from("services").update({
		...patch,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id);
	if (error) fail("save the service", error);
}
async function deleteServiceRow(id) {
	const { error } = await supabase.from("services").delete().eq("id", id);
	if (error) fail("remove the service", error);
}
async function fetchTemplate() {
	const { data, error } = await supabase.from("quote_templates").select("id, tone, structure, payment_terms, warranty, extra").order("updated_at", { ascending: false }).limit(1).maybeSingle();
	if (error) fail("load your quote style", error);
	return data ? toTemplate(data) : null;
}
async function saveTemplate(template) {
	const columns = {
		...templateColumns(template),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	if (template.id) {
		const { error } = await supabase.from("quote_templates").update(columns).eq("id", template.id);
		if (error) fail("save your quote style", error);
		return template.id;
	}
	const { data, error } = await supabase.from("quote_templates").insert(columns).select("id").maybeSingle();
	if (error || !data) fail("save your quote style", error);
	return data.id;
}
async function fetchLeads() {
	const { data, error } = await supabase.from("leads").select("id, link_id, source, customer_name, phone, email, address, answers, status, quote, quote_updated_at, created_at").order("created_at", { ascending: false });
	if (error || !data) fail("load leads", error);
	return data.map(toLead);
}
async function submitLead(owner, input) {
	const answers = {
		jobType: input.jobType,
		description: input.description,
		urgency: input.urgency,
		preferredTime: input.preferredTime,
		propertyType: input.propertyType,
		budget: input.budget,
		accessNotes: input.accessNotes
	};
	const { data, error } = await supabase.rpc("submit_lead", {
		p_owner: owner,
		p_link_id: input.linkId,
		p_source: input.source,
		p_name: input.name,
		p_phone: input.phone,
		p_email: input.email,
		p_address: input.address,
		p_answers: answers
	});
	if (error || typeof data !== "string") fail("send your request", error);
	return data;
}
async function fetchPublicServiceNames(owner) {
	const { data, error } = await supabase.rpc("public_service_names", { p_owner: owner });
	if (error || !Array.isArray(data)) fail("load this form", error);
	return data.filter((name) => typeof name === "string");
}
async function updateLeadRow(id, patch) {
	const columns = {};
	if (patch.status !== void 0) columns.status = patch.status;
	if (patch.quote !== void 0) columns.quote = patch.quote;
	if (patch.quoteUpdatedAt !== void 0) columns.quote_updated_at = patch.quoteUpdatedAt;
	const { error } = await supabase.from("leads").update(columns).eq("id", id);
	if (error) fail("save the lead", error);
}
function hoursAgo(hours) {
	return (/* @__PURE__ */ new Date(Date.now() - hours * 60 * 60 * 1e3)).toISOString();
}
var seedBusiness = {
	name: "Northline Plumbing",
	trade: "Plumbing, geysers, and leak repair",
	city: "Johannesburg",
	phone: "011 555 0142",
	email: "quotes@northline.example",
	currency: "R"
};
var starterServices = [
	{
		name: "Emergency leak repair",
		description: "Isolate and stop an active leak, then repair the fitting or the pipe section.",
		price: "R850–R2,400",
		notes: "After-hours call-out from R450."
	},
	{
		name: "Blocked drain",
		description: "Clear a kitchen, bathroom, or main line blockage.",
		price: "R650–R1,800",
		notes: "Camera inspection is quoted separately."
	},
	{
		name: "Geyser replacement",
		description: "Supply and fit a standard 150L electric geyser, including drip tray and vacuum breaker.",
		price: "R6,800–R11,500",
		notes: "Removal of the old unit is included."
	},
	{
		name: "Tap and toilet repair",
		description: "Fix leaking mixers, cisterns, and running toilets.",
		price: "R450–R1,350",
		notes: "Non-standard parts are extra and confirmed before fitting."
	},
	{
		name: "Leak detection",
		description: "Find a hidden leak with moisture and acoustic tracing.",
		price: "R950–R2,200",
		notes: "The repair is quoted once the source is found."
	}
];
var seedLinks = [
	{
		id: "facebook",
		source: "Facebook Ad",
		createdAt: hoursAgo(480)
	},
	{
		id: "google",
		source: "Google Business",
		createdAt: hoursAgo(432)
	},
	{
		id: "website",
		source: "Website",
		createdAt: hoursAgo(288)
	},
	{
		id: "instagram",
		source: "Instagram",
		createdAt: hoursAgo(192)
	}
];
var seedTemplate = {
	tone: "Direct, calm, and specific. Sound like the owner, not a call centre. Use the customer's first name once. No hype and no exclamation marks.",
	structure: "One-line summary of the job\nWhat we will do\nPrice, and what would change it\nWhat is included and what is not\nWhen we can come\nHow to accept",
	paymentTerms: "50% to book the job, balance when the work is finished. Card, EFT, or cash. Emergency call-outs are paid on the day.",
	warranty: "Workmanship guaranteed for 6 months. Manufacturer warranties are passed on for parts we supply. Existing pipework we did not replace is not covered.",
	extra: "Close with the business name and one line: we will confirm an arrival window by phone."
};
var SAVE_DELAY_MS = 600;
var message = (error) => error instanceof Error ? error.message : "Something went wrong saving.";
var useLeakKeep = create()(persist((set, get) => {
	const timers = /* @__PURE__ */ new Map();
	const run = (task) => {
		task().then(() => set({ saveError: "" }), (error) => set({ saveError: message(error) }));
	};
	const later = (key, task) => {
		const pending = timers.get(key);
		if (pending) clearTimeout(pending);
		timers.set(key, setTimeout(() => {
			timers.delete(key);
			run(task);
		}, SAVE_DELAY_MS));
	};
	const blank = {
		...seedTemplate,
		id: null
	};
	return {
		business: seedBusiness,
		services: [],
		links: seedLinks,
		template: blank,
		leads: [],
		loadedFor: null,
		loadError: "",
		saveError: "",
		load: async (userId) => {
			try {
				let [services, template, leads] = await Promise.all([
					fetchServices(),
					fetchTemplate(),
					fetchLeads()
				]);
				if (!template && services.length === 0) {
					services = starterServices.map((item) => ({
						...item,
						id: crypto.randomUUID()
					}));
					await insertServices(services);
					template = {
						...blank,
						id: await saveTemplate(blank)
					};
				}
				set({
					services,
					leads,
					template: template ?? blank,
					loadedFor: userId,
					loadError: ""
				});
			} catch (error) {
				set({ loadError: message(error) });
			}
		},
		reset: () => {
			timers.forEach((timer) => clearTimeout(timer));
			timers.clear();
			set({
				services: [],
				leads: [],
				template: blank,
				loadedFor: null,
				loadError: "",
				saveError: ""
			});
		},
		clearSaveError: () => set({ saveError: "" }),
		updateBusiness: (patch) => set((state) => ({ business: {
			...state.business,
			...patch
		} })),
		updateTemplate: (patch) => {
			set((state) => ({ template: {
				...state.template,
				...patch
			} }));
			later("template", async () => {
				const id = await saveTemplate(get().template);
				set((state) => ({ template: {
					...state.template,
					id
				} }));
			});
		},
		addService: () => {
			const service = {
				id: crypto.randomUUID(),
				name: "",
				description: "",
				price: "",
				notes: ""
			};
			set((state) => ({ services: [service, ...state.services] }));
			run(() => insertServices([service]));
		},
		updateService: (id, patch) => {
			set((state) => ({ services: state.services.map((service) => service.id === id ? {
				...service,
				...patch
			} : service) }));
			later(`service:${id}`, () => {
				const current = get().services.find((service) => service.id === id);
				if (!current) return Promise.resolve();
				const { name, description, price, notes } = current;
				return updateServiceRow(id, {
					name,
					description,
					price,
					notes
				});
			});
		},
		removeService: (id) => {
			const pending = timers.get(`service:${id}`);
			if (pending) clearTimeout(pending);
			set((state) => ({ services: state.services.filter((service) => service.id !== id) }));
			run(() => deleteServiceRow(id));
		},
		importServices: (items) => {
			const next = items.filter((item) => item.name.trim()).map((item) => ({
				...item,
				id: crypto.randomUUID()
			}));
			if (!next.length) return 0;
			set((state) => ({ services: [...next, ...state.services] }));
			run(() => insertServices(next));
			return next.length;
		},
		addLink: (source, id) => set((state) => ({ links: [{
			id,
			source,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}, ...state.links] })),
		updateLink: (id, source) => set((state) => ({ links: state.links.map((link) => link.id === id ? {
			...link,
			source
		} : link) })),
		removeLink: (id) => set((state) => ({ links: state.links.filter((link) => link.id !== id) })),
		updateLead: (id, patch) => {
			set((state) => ({ leads: state.leads.map((lead) => lead.id === id ? {
				...lead,
				...patch
			} : lead) }));
			later(`lead:${id}`, () => updateLeadRow(id, patch));
		},
		setStatus: (id, status) => {
			set((state) => ({ leads: state.leads.map((lead) => lead.id === id ? {
				...lead,
				status
			} : lead) }));
			run(() => updateLeadRow(id, { status }));
		}
	};
}, {
	name: "leakkeep.v1",
	skipHydration: true,
	partialize: (state) => ({
		business: state.business,
		links: state.links
	}),
	merge: (persisted, current) => {
		const saved = persisted ?? {};
		return {
			...current,
			business: {
				...current.business,
				...saved.business
			},
			links: Array.isArray(saved.links) ? saved.links : current.links
		};
	}
}));
//#endregion
export { submitLead as n, useLeakKeep as r, fetchPublicServiceNames as t };
