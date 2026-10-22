import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fields-9FC-irLv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var env = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_AUTH_ENABLED": "false",
	"VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaWZoaWpnZGh4cXpkbHV3cGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MzkzOTYsImV4cCI6MjEwODIxNTM5Nn0.tKJkTC7OsW0E7lTwNikQnlw9QdSiBdkZkNrWxAH4Iy8",
	"VITE_SUPABASE_URL": "https://dqifhijgdhxqzdluwpdd.supabase.co"
};
var url = env.VITE_SUPABASE_URL;
var anonKey = env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.");
var supabase = createClient(url, anonKey);
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
async function insertLead(id, input) {
	const answers = {
		jobType: input.jobType,
		description: input.description,
		urgency: input.urgency,
		preferredTime: input.preferredTime,
		propertyType: input.propertyType,
		budget: input.budget,
		accessNotes: input.accessNotes
	};
	const { error } = await supabase.from("leads").insert({
		id,
		link_id: input.linkId,
		source: input.source,
		customer_name: input.name,
		phone: input.phone,
		email: input.email,
		address: input.address,
		answers
	});
	if (error) fail("send your request", error);
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
	return {
		business: seedBusiness,
		services: [],
		links: seedLinks,
		template: {
			...seedTemplate,
			id: null
		},
		leads: [],
		loadError: "",
		saveError: "",
		load: async () => {
			try {
				const [services, template, leads] = await Promise.all([
					fetchServices(),
					fetchTemplate(),
					fetchLeads()
				]);
				set({
					services,
					leads,
					loadError: "",
					...template ? { template } : {}
				});
			} catch (error) {
				set({ loadError: message(error) });
			}
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
		addLead: async (input) => {
			const id = crypto.randomUUID();
			await insertLead(id, input);
			const lead = {
				...input,
				id,
				status: "new",
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				quote: null,
				quoteUpdatedAt: null
			};
			set((state) => ({ leads: [lead, ...state.leads] }));
			return id;
		},
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
var loaded = false;
var pending = null;
function ensureStore() {
	if (pending) return pending;
	const next = Promise.resolve(useLeakKeep.persist.rehydrate()).catch(() => void 0).then(() => useLeakKeep.getState().load()).then(() => {
		loaded = !useLeakKeep.getState().loadError;
		if (!loaded) pending = null;
	});
	pending = next;
	return next;
}
function ClientGate({ children, fallback }) {
	const [ready, setReady] = (0, import_react.useState)(loaded);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const loadError = useLeakKeep((state) => state.loadError);
	(0, import_react.useEffect)(() => {
		let live = true;
		ensureStore().finally(() => {
			if (live) setReady(true);
		});
		return () => {
			live = false;
		};
	}, [attempt]);
	if (!ready) return fallback;
	if (loadError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "We couldn't load your data"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: loadError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					setReady(false);
					setAttempt((value) => value + 1);
				},
				className: "press mt-6 inline-flex h-11 items-center justify-center self-start rounded-lg bg-primary px-4 text-sm font-medium text-paper",
				children: "Try again"
			})
		]
	});
	return children;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function oneLine(value, max = 96) {
	const flat = value.replace(/\s+/g, " ").trim();
	if (flat.length <= max) return flat;
	return `${flat.slice(0, max - 1).trimEnd()}…`;
}
function firstName(name) {
	return name.trim().split(/\s+/)[0] || name;
}
function slugify(value) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "link";
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("size-9 text-ink", className),
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			width: "32",
			height: "32",
			rx: "8",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			className: "fill-primary-ink",
			d: "M16 7c3.2 4.4 6.5 8.2 6.5 12.1A6.5 6.5 0 0 1 16 25.6a6.5 6.5 0 0 1-6.5-6.5C9.5 15.2 12.8 11.4 16 7z"
		})]
	});
}
var control = "w-full rounded-lg border border-line bg-paper px-3 text-base text-ink placeholder:text-faint";
function Field({ id, label, hint, error, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: "mb-2 block text-sm font-medium text-ink",
			children: label
		}),
		children,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-lost",
			children: error
		}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: hint
		}) : null
	] });
}
function TextInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn(control, "h-11", className),
		...props
	});
}
function TextArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn(control, "min-h-28 py-3", className),
		...props
	});
}
function SelectInput({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn(control, "h-11", className),
		...props,
		children
	});
}
//#endregion
export { TextArea as a, firstName as c, useLeakKeep as d, SelectInput as i, oneLine as l, Field as n, TextInput as o, Mark as r, cn as s, ClientGate as t, slugify as u };
