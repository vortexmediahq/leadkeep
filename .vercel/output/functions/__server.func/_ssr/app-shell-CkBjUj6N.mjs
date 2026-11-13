import { i as __toESM } from "../_runtime.mjs";
import { A as fetchFoundingSpotsLeft, C as deleteQuestionnaireRow, D as effectiveTier, Dt as updateLinkSource, E as effectiveBranding, Et as updateLinkQuestionnaire, I as fetchQuestionnaires, J as insertServices, K as insertLinks, M as fetchLeads, N as fetchLinks, O as fetchAllowance, Ot as updateQuestionnaireRow, P as fetchProfile, Q as newId, R as fetchServices, S as deleteLinkRow, T as duplicateQuestionnaire, Tt as updateLinkLanding, U as gateLeads, W as hasBranding, Z as lockedCount, _ as blankBranding, _t as subscribeToNewLeads, at as questionnairesAvailable, bt as testerReminderDays, c as NO_LIMITS, ft as removeLogo, g as accessFor, j as fetchLeadById, jt as uploadLogo, k as fetchEntitlements, kt as updateServiceRow, lt as quoteReminder, mt as saveTemplate, nt as plansButton, pt as saveProfile, q as insertQuestionnaire, w as deleteServiceRow, wt as updateLeadRow, yt as supabase, z as fetchTemplate } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Clock, M as Bell, a as Sparkles, b as LayoutDashboard, c as ScrollText, f as MessageSquareHeart, h as LogOut, n as Wrench, o as ShieldAlert, s as Settings, t as X, v as ListChecks, x as Inbox, y as Link2 } from "../_libs/lucide-react.mjs";
import { i as starterServices, n as seedTemplate, r as starterLinkSources, t as blankBusiness } from "./seed-CAm2-Dwv.mjs";
import { n as BrandTheme, r as PoweredBy, t as BrandMark } from "./brand-mark-CkcOvvyS.mjs";
import { t as Logo } from "./mark-I_x-2mlQ.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { E as useSession, S as startSessionListener, b as signOut, d as fetchUnseenLoginEvents, i as UNUSUAL_COPY, m as markLoginEventsSeen } from "./session-CpXzyFkR.mjs";
import { t as MfaChallenge } from "./mfa-challenge-B0DKDHYU.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-CkBjUj6N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SAVE_DELAY_MS = 600;
var LEGACY_KEY = "leakkeep.v1";
var message = (error) => error instanceof Error ? error.message : "Something went wrong saving.";
function readLegacy() {
	try {
		const raw = window.localStorage.getItem(LEGACY_KEY);
		const state = raw ? JSON.parse(raw).state : void 0;
		return {
			business: state?.business && typeof state.business === "object" ? state.business : {},
			sources: Array.isArray(state?.links) ? state.links.map((link) => link && typeof link === "object" ? link.source : "").filter((source) => typeof source === "string" && source.trim().length > 0) : []
		};
	} catch {
		return {
			business: {},
			sources: []
		};
	}
}
var useLeakKeep = create()((set, get) => {
	const timers = /* @__PURE__ */ new Map();
	const queued = /* @__PURE__ */ new Map();
	let unsubscribe = null;
	const run = (task) => {
		task().then(() => set({ saveError: "" }), (error) => set({ saveError: message(error) }));
	};
	const later = (key, task) => {
		const pending = timers.get(key);
		if (pending) clearTimeout(pending);
		queued.set(key, task);
		timers.set(key, setTimeout(() => {
			timers.delete(key);
			queued.delete(key);
			run(task);
		}, SAVE_DELAY_MS));
	};
	const cancel = (key) => {
		const pending = timers.get(key);
		if (pending) clearTimeout(pending);
		timers.delete(key);
		queued.delete(key);
	};
	const mergeNew = (incoming) => {
		const known = new Set(get().leads.map((lead) => lead.id));
		const fresh = incoming.filter((lead) => !known.has(lead.id));
		if (!fresh.length) return;
		set((state) => ({
			leads: [...fresh, ...state.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
			incoming: fresh[0]
		}));
	};
	const blank = {
		...seedTemplate,
		id: null
	};
	return {
		business: blankBusiness,
		branding: blankBranding,
		services: [],
		links: [],
		questionnaires: [],
		questionnairesReady: false,
		template: blank,
		leads: [],
		incoming: null,
		allowance: null,
		entitlements: NO_LIMITS,
		foundingSpotsLeft: null,
		loadedFor: null,
		loadError: "",
		saveError: "",
		load: async (userId) => {
			try {
				const [loadedServices, loadedTemplate, leads, loadedProfile, loadedLinks, allowance, entitlements, foundingSpotsLeft] = await Promise.all([
					fetchServices(),
					fetchTemplate(),
					fetchLeads(),
					fetchProfile(),
					fetchLinks(),
					fetchAllowance().catch(() => null),
					fetchEntitlements().catch(() => null),
					fetchFoundingSpotsLeft().catch(() => null)
				]);
				let services = loadedServices;
				let template = loadedTemplate;
				let profile = loadedProfile;
				let links = loadedLinks;
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
				if (!profile) {
					const legacy = readLegacy();
					profile = {
						business: {
							...blankBusiness,
							...legacy.business
						},
						branding: { ...blankBranding }
					};
					await saveProfile(profile.business, profile.branding);
					if (links.length === 0) links = await insertLinks(legacy.sources.length ? legacy.sources : starterLinkSources);
				}
				const questionnairesReady = questionnairesAvailable();
				const questionnaires = questionnairesReady ? await fetchQuestionnaires().catch(() => []) : [];
				set({
					services,
					leads,
					links,
					questionnaires,
					questionnairesReady,
					business: profile.business,
					branding: profile.branding,
					template: template ?? blank,
					allowance,
					entitlements: entitlements ?? NO_LIMITS,
					foundingSpotsLeft,
					loadedFor: userId,
					loadError: ""
				});
				unsubscribe?.();
				unsubscribe = subscribeToNewLeads(userId, (id) => {
					fetchLeadById(id).then((lead) => lead && mergeNew([lead]), () => void 0);
				});
			} catch (error) {
				set({ loadError: message(error) });
			}
		},
		refreshLeads: async () => {
			if (!get().loadedFor) return;
			try {
				mergeNew(await fetchLeads());
			} catch {}
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
				branding: blankBranding,
				services: [],
				links: [],
				questionnaires: [],
				questionnairesReady: false,
				leads: [],
				incoming: null,
				allowance: null,
				entitlements: NO_LIMITS,
				foundingSpotsLeft: null,
				template: blank,
				loadedFor: null,
				loadError: "",
				saveError: ""
			});
		},
		clearSaveError: () => set({ saveError: "" }),
		dismissIncoming: () => set({ incoming: null }),
		setAllowance: (allowance) => set({ allowance }),
		refreshPlan: async () => {
			const [entitlements, foundingSpotsLeft, allowance] = await Promise.all([
				fetchEntitlements().catch(() => null),
				fetchFoundingSpotsLeft().catch(() => null),
				fetchAllowance().catch(() => null)
			]);
			set((state) => ({
				entitlements: entitlements ?? state.entitlements,
				foundingSpotsLeft: foundingSpotsLeft ?? state.foundingSpotsLeft,
				allowance: allowance ?? state.allowance
			}));
		},
		updateBusiness: (patch) => {
			set((state) => ({ business: {
				...state.business,
				...patch
			} }));
			later("business", () => saveProfile(get().business, get().branding));
		},
		updateBranding: (patch) => {
			set((state) => ({ branding: {
				...state.branding,
				...patch
			} }));
			later("business", () => saveProfile(get().business, get().branding));
		},
		setLogo: async (file, userId) => {
			const path = await uploadLogo(userId, file);
			const previous = get().branding.logoPath;
			set((state) => ({ branding: {
				...state.branding,
				logoPath: path
			} }));
			await saveProfile(get().business, get().branding);
			if (previous && previous !== path) await removeLogo(previous).catch(() => void 0);
		},
		clearLogo: async () => {
			const previous = get().branding.logoPath;
			set((state) => ({ branding: {
				...state.branding,
				logoPath: ""
			} }));
			await saveProfile(get().business, get().branding);
			if (previous) await removeLogo(previous).catch(() => void 0);
		},
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
			cancel(`service:${id}`);
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
		addLink: async (source, questionnaireId = null, options = {}) => {
			const [link] = await insertLinks([source], questionnaireId, options);
			if (link) set((state) => ({ links: [link, ...state.links] }));
		},
		updateLinkLanding: (id, patch) => {
			set((state) => ({ links: state.links.map((link) => link.id === id ? {
				...link,
				...patch
			} : link) }));
			later(`landing:${id}`, () => {
				const current = get().links.find((link) => link.id === id);
				if (!current) return Promise.resolve();
				return updateLinkLanding(id, {
					headline: current.headline,
					intro: current.intro,
					mediaPath: current.mediaPath,
					mediaUrl: current.mediaUrl,
					ctaText: current.ctaText,
					autoSend: current.autoSend,
					serviceId: current.serviceId
				});
			});
		},
		setLinkQuestionnaire: (id, questionnaireId) => {
			set((state) => ({ links: state.links.map((link) => link.id === id ? {
				...link,
				questionnaireId
			} : link) }));
			run(() => updateLinkQuestionnaire(id, questionnaireId));
		},
		createQuestionnaire: async (draft) => {
			const item = {
				...draft,
				id: newId(),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			await insertQuestionnaire(item);
			set((state) => ({ questionnaires: [item, ...state.questionnaires] }));
			return item.id;
		},
		saveQuestionnaire: (item) => {
			const next = {
				...item,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			set((state) => ({ questionnaires: state.questionnaires.map((q) => q.id === item.id ? next : q) }));
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
				links: state.links.map((link) => link.questionnaireId === id ? {
					...link,
					questionnaireId: null
				} : link)
			}));
			run(() => deleteQuestionnaireRow(id));
		},
		updateLink: (id, source) => {
			set((state) => ({ links: state.links.map((link) => link.id === id ? {
				...link,
				source
			} : link) }));
			later(`link:${id}`, () => updateLinkSource(id, source));
		},
		removeLink: (id) => {
			cancel(`link:${id}`);
			set((state) => ({ links: state.links.filter((link) => link.id !== id) }));
			run(() => deleteLinkRow(id));
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
});
function ClientGate({ children, fallback }) {
	const navigate = useNavigate();
	const status = useSession((state) => state.status);
	const userId = useSession((state) => state.user?.id ?? null);
	const loadedFor = useLeakKeep((state) => state.loadedFor);
	const loadError = useLeakKeep((state) => state.loadError);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		startSessionListener();
	}, []);
	(0, import_react.useEffect)(() => {
		if (status === "signed-out") {
			useLeakKeep.getState().reset();
			navigate({ to: "/login" });
		}
	}, [status, navigate]);
	(0, import_react.useEffect)(() => {
		if (!userId || loadedFor === userId) return;
		let live = true;
		setLoading(true);
		useLeakKeep.getState().reset();
		useLeakKeep.getState().load(userId).finally(() => {
			if (live) setLoading(false);
		});
		return () => {
			live = false;
		};
	}, [
		userId,
		loadedFor,
		attempt
	]);
	(0, import_react.useEffect)(() => {
		const refresh = () => {
			if (document.visibilityState === "visible") useLeakKeep.getState().refreshLeads();
		};
		document.addEventListener("visibilitychange", refresh);
		window.addEventListener("focus", refresh);
		return () => {
			document.removeEventListener("visibilitychange", refresh);
			window.removeEventListener("focus", refresh);
		};
	}, []);
	if (status === "needs-mfa") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MfaChallenge, {});
	if (loadError && !loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
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
				onClick: () => setAttempt((value) => value + 1),
				className: "press mt-6 inline-flex h-11 items-center justify-center self-start rounded-lg bg-primary px-4 text-sm font-medium text-paper",
				children: "Try again"
			})
		]
	});
	if (!userId || loadedFor !== userId) return fallback;
	return children;
}
var ALERT_CHANNELS = [
	{
		id: "both",
		label: "In the app and by email",
		help: "Recommended. You won't miss a lead."
	},
	{
		id: "app",
		label: "In the app only",
		help: "See new leads under the bell."
	},
	{
		id: "email",
		label: "By email only",
		help: "We email you each new lead."
	}
];
var DEFAULT_CHANNEL = "both";
function parseChannel(value) {
	return value === "app" || value === "email" || value === "both" ? value : DEFAULT_CHANNEL;
}
var wantsApp = (channel) => channel !== "email";
var wantsEmail = (channel) => channel !== "app";
/** Digits only, with a local leading 0 turned into the country code (default 27, South Africa). */
function internationalNumber(phone, countryCode = "27") {
	const trimmed = phone.trim();
	let digits = trimmed.replace(/\D/g, "");
	if (!digits) return "";
	if (trimmed.startsWith("+")) return digits;
	if (digits.startsWith("00")) return digits.slice(2);
	if (digits.startsWith("0")) digits = countryCode + digits.slice(1);
	return digits;
}
function callHref(phone) {
	const digits = phone.replace(/[^\d+]/g, "");
	return digits.replace(/\D/g, "").length >= 6 ? `tel:${digits}` : null;
}
function whatsappHref(phone, message = "", countryCode = "27") {
	const number = internationalNumber(phone, countryCode);
	if (number.length < 8) return null;
	return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
function emailHref(email, subject = "", body = "") {
	const address = email.trim();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return null;
	const params = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean);
	return `mailto:${address}${params.length ? `?${params.join("&")}` : ""}`;
}
function greeting(name, business) {
	return `Hi ${name.trim().split(/\s+/)[0] || "there"}, thanks for getting in touch${business.trim() ? ` with ${business.trim()}` : ""}. `;
}
/** A lead still marked "New" a day after it came in needs a nudge. */
function needsFollowUp(lead, now = /* @__PURE__ */ new Date()) {
	if (lead.status !== "new") return false;
	const created = Date.parse(lead.createdAt);
	if (Number.isNaN(created)) return false;
	return now.getTime() - created >= 864e5;
}
/** Leads that arrived after the owner last opened the bell. */
function unreadLeads(leads, lastSeenAt) {
	const seen = lastSeenAt ? Date.parse(lastSeenAt) : 0;
	return leads.filter((lead) => Date.parse(lead.createdAt) > (Number.isNaN(seen) ? 0 : seen));
}
var FEEDBACK_KINDS = [
	{
		id: "idea",
		label: "An idea"
	},
	{
		id: "problem",
		label: "Something isn't working"
	},
	{
		id: "praise",
		label: "Something I like"
	},
	{
		id: "other",
		label: "Other"
	}
];
var FEEDBACK_MAX = 2e3;
function validateFeedback(message) {
	const text = message.trim();
	if (text.length < 3) return "Please write a few words so we know what you mean.";
	if (text.length > 2e3) return `Please keep it under ${FEEDBACK_MAX} characters.`;
	return null;
}
var LOCAL_KEY = "leadkeep.alerts.v1";
function readLocal(userId) {
	try {
		const raw = window.localStorage.getItem(`${LOCAL_KEY}.${userId}`);
		const parsed = raw ? JSON.parse(raw) : {};
		return {
			channel: parseChannel(parsed.channel),
			lastSeenAt: typeof parsed.lastSeenAt === "string" ? parsed.lastSeenAt : null
		};
	} catch {
		return {
			channel: DEFAULT_CHANNEL,
			lastSeenAt: null
		};
	}
}
function writeLocal(userId, settings) {
	try {
		window.localStorage.setItem(`${LOCAL_KEY}.${userId}`, JSON.stringify(settings));
	} catch {}
}
async function fetchAlertSettings(userId) {
	const local = readLocal(userId);
	const { data, error } = await supabase.from("alert_settings").select("channel, last_seen_at").maybeSingle();
	if (error || !data) return local;
	const row = data;
	const remote = {
		channel: parseChannel(row.channel),
		lastSeenAt: row.last_seen_at
	};
	if (local.lastSeenAt && (!remote.lastSeenAt || local.lastSeenAt > remote.lastSeenAt)) remote.lastSeenAt = local.lastSeenAt;
	return remote;
}
async function saveAlertSettings(userId, settings) {
	writeLocal(userId, settings);
	await supabase.from("alert_settings").upsert({
		channel: settings.channel,
		last_seen_at: settings.lastSeenAt,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id" });
}
async function sendFeedback(input) {
	const { error } = await supabase.from("feedback").insert({
		kind: input.kind,
		message: input.message.trim(),
		page: input.page.slice(0, 200),
		email: input.email.slice(0, 200)
	});
	if (error) throw new Error("We couldn't send that just yet. Please try again a bit later.");
}
/** Owners see their own messages; the admin sees everyone's (enforced by the database). */
async function fetchFeedback() {
	const { data, error } = await supabase.from("feedback").select("id, kind, message, page, email, created_at").order("created_at", { ascending: false }).limit(200);
	if (error || !data) return [];
	return data.map((row) => ({
		...row,
		createdAt: row.created_at
	}));
}
async function isFeedbackAdmin() {
	const { data, error } = await supabase.rpc("is_leadkeep_admin");
	return !error && data === true;
}
var useAlerts = create()((set, get) => ({
	userId: null,
	channel: DEFAULT_CHANNEL,
	lastSeenAt: null,
	load: async (userId) => {
		if (get().userId === userId) return;
		set({ userId });
		set(await fetchAlertSettings(userId));
	},
	setChannel: async (channel) => {
		set({ channel });
		const { userId, lastSeenAt } = get();
		if (userId) await saveAlertSettings(userId, {
			channel,
			lastSeenAt
		});
	},
	markSeen: () => {
		const lastSeenAt = (/* @__PURE__ */ new Date()).toISOString();
		set({ lastSeenAt });
		const { userId, channel } = get();
		if (userId) saveAlertSettings(userId, {
			channel,
			lastSeenAt
		});
	}
}));
function useAccess() {
	const entitlements = useLeakKeep((state) => state.entitlements);
	return (0, import_react.useMemo)(() => accessFor(entitlements), [entitlements]);
}
/** The owner's leads with details hidden on any lead beyond what their plan includes. */
function useGatedLeads() {
	const leads = useLeakKeep((state) => state.leads);
	const access = useAccess();
	return (0, import_react.useMemo)(() => gateLeads(leads, access), [leads, access]);
}
/** The client's branding if their plan includes it, otherwise LeadKeep's defaults. */
function useEffectiveBranding() {
	const branding = useLeakKeep((state) => state.branding);
	const allowed = useAccess().features.customBranding;
	return (0, import_react.useMemo)(() => effectiveBranding(branding, allowed), [branding, allowed]);
}
function NotificationBell({ className }) {
	const userId = useSession((state) => state.user?.id ?? null);
	const leads = useGatedLeads();
	const { channel, lastSeenAt, load, markSeen } = useAlerts();
	const [open, setOpen] = (0, import_react.useState)(false);
	const box = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (userId) load(userId);
	}, [userId, load]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const close = (event) => {
			if (box.current && !box.current.contains(event.target)) setOpen(false);
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, [open]);
	const unread = (0, import_react.useMemo)(() => wantsApp(channel) ? unreadLeads(leads, lastSeenAt) : [], [
		leads,
		lastSeenAt,
		channel
	]);
	const overdue = (0, import_react.useMemo)(() => leads.filter((lead) => needsFollowUp(lead) || quoteReminder(lead)), [leads]);
	const recent = leads.slice(0, 8);
	const count = unread.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: box,
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-label": count ? `Notifications, ${count} new` : "Notifications",
			"aria-expanded": open,
			onClick: () => {
				setOpen((value) => !value);
				if (!open && count) markSeen();
			},
			className: "press relative grid size-11 place-items-center rounded-lg text-muted hover:bg-mist hover:text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
				className: "size-5",
				strokeWidth: 1.75,
				"aria-hidden": "true"
			}), count ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1.5 right-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-ink tabular-nums",
				children: count > 9 ? "9+" : count
			}) : null]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-paper shadow-panel md:left-0 md:right-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-line px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Notifications"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/settings",
						className: "text-sm font-medium text-primary",
						onClick: () => setOpen(false),
						children: "Settings"
					})]
				}),
				overdue.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					onClick: () => setOpen(false),
					className: "flex items-center gap-2 border-b border-line bg-accent/10 px-4 py-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
							className: "size-4 shrink-0 text-accent",
							"aria-hidden": "true"
						}),
						overdue.length === 1 ? "1 lead is" : `${overdue.length} leads are`,
						" waiting for a follow-up"
					]
				}) : null,
				recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-6 text-center text-sm text-muted",
					children: "No leads yet. New ones will show up here."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-80 overflow-y-auto",
					children: recent.map((lead) => {
						const isNew = unread.some((item) => item.id === lead.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-b border-line last:border-b-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/leads/$leadId",
								params: { leadId: lead.id },
								onClick: () => setOpen(false),
								className: "flex gap-3 px-4 py-3 hover:bg-mist",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("mt-1.5 size-2 shrink-0 rounded-full", isNew ? "bg-accent" : "bg-transparent"),
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-sm font-medium",
										children: ["New lead: ", lead.name]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-sm text-muted",
										children: [
											lead.source,
											" · ",
											formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
										]
									})]
								})]
							})
						}, lead.id);
					})
				})
			]
		}) : null]
	});
}
function UnusualActivityBanner() {
	const [events, setEvents] = (0, import_react.useState)([]);
	const [hidden, setHidden] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		fetchUnseenLoginEvents().then(setEvents);
	}, []);
	if (hidden || events.length === 0) return null;
	const first = events[0];
	const copy = first.reason ? UNUSUAL_COPY[first.reason] : null;
	if (!copy) return null;
	const dismiss = () => {
		setHidden(true);
		markLoginEventsSeen();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: "mx-auto mb-5 flex max-w-5xl items-start gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
				className: "mt-0.5 size-5 shrink-0 text-accent",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-ink",
						children: copy.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-ink-soft",
						children: [copy.body, first.deviceLabel ? ` Device: ${first.deviceLabel}.` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/settings",
						hash: "security",
						className: "mt-2 inline-block font-medium text-primary",
						children: "Review sign-in security"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: dismiss,
				"aria-label": "Dismiss",
				className: "press grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					className: "size-4",
					"aria-hidden": "true"
				})
			})
		]
	});
}
var TIER_NAME = {
	free: "Free",
	care: "Care",
	growth: "Growth"
};
function usePlanView() {
	const entitlements = useLeakKeep((state) => state.entitlements);
	const access = useAccess();
	const leads = useGatedLeads();
	return (0, import_react.useMemo)(() => ({
		ready: entitlements.ready,
		tier: effectiveTier(entitlements),
		admin: entitlements.admin,
		trial: entitlements.tier === "free" && effectiveTier(entitlements) !== "free" && !entitlements.admin,
		founding: entitlements.founding,
		total: leads.length,
		hidden: lockedCount(leads),
		limited: Number.isFinite(access.leadLimit)
	}), [
		entitlements,
		access,
		leads
	]);
}
function PlanCard() {
	const view = usePlanView();
	if (!view.ready) return null;
	if (!view.limited) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-primary",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
				className: "size-4",
				"aria-hidden": "true"
			}),
			view.admin ? "Owner · full access" : view.trial ? "Early access · full" : `${TIER_NAME[view.tier]} plan`,
			view.founding ? " · Founding" : ""
		]
	});
	const used = Math.min(view.total, 10);
	const full = view.hidden > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-mist p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Free plan"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted tabular-nums",
					children: [
						used,
						"/",
						10,
						" leads"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-1.5 overflow-hidden rounded-full bg-line",
				role: "progressbar",
				"aria-label": "Free leads used",
				"aria-valuemin": 0,
				"aria-valuemax": 10,
				"aria-valuenow": used,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("h-full rounded-full transition-[width] duration-500", full ? "bg-lost" : "bg-primary"),
					style: { width: `${used / 10 * 100}%` }
				})
			}),
			full ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-lost",
				children: [
					view.hidden,
					" ",
					view.hidden === 1 ? "lead is" : "leads are",
					" waiting, hidden"
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/pricing",
				className: "press mt-3 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-paper text-sm font-medium text-primary ring-1 ring-line hover:ring-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					className: "size-4",
					"aria-hidden": "true"
				}), full ? "Unlock my leads" : "Upgrade"]
			})
		]
	});
}
function PlanPill() {
	const view = usePlanView();
	if (!view.ready || !view.limited) return null;
	const left = Math.max(0, 10 - view.total);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/pricing",
		className: cn("press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium", view.hidden > 0 ? "bg-lost-soft text-lost" : "bg-primary-soft text-primary"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			className: "size-3.5",
			"aria-hidden": "true"
		}), view.hidden > 0 ? `${view.hidden} hidden` : `${left} free left`]
	});
}
/** A friendly heads-up in the last week of early (tester) access. */
function TesterReminder() {
	const entitlements = useLeakKeep((state) => state.entitlements);
	const days = testerReminderDays(entitlements);
	if (days === null) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: "mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-ink",
			children: [
				"Your early access ends in ",
				days <= 1 ? "a day" : `${days} days`,
				". After that you move to the Free plan and keep every lead. Founding members get Care from $29 a month for a year."
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/pricing",
			className: "press shrink-0 font-medium text-primary",
			children: "See plans"
		})]
	});
}
/** Slim "View plans" / "Update my plan" button. `compact` is the short phone version. Never shown on the plans page itself. */
function PlansButton({ compact }) {
	const entitlements = useLeakKeep((state) => state.entitlements);
	const path = useRouterState({ select: (state) => state.location.pathname });
	const button = plansButton(entitlements);
	if (!button.show || path.startsWith("/pricing")) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/pricing",
		className: cn("press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white", button.paid ? "bg-blue-700 hover:bg-blue-800" : "bg-[#D94F00] hover:bg-[#BF4500]"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			className: "size-3.5",
			"aria-hidden": "true"
		}), compact ? button.paid ? "My plan" : "Plans" : button.label]
	});
}
var NAV = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		match: (path) => path.startsWith("/dashboard")
	},
	{
		to: "/",
		label: "Leads",
		icon: Inbox,
		match: (path) => path === "/" || path.startsWith("/leads")
	},
	{
		to: "/services",
		label: "Services",
		icon: Wrench,
		match: (path) => path.startsWith("/services")
	},
	{
		to: "/quote-style",
		label: "Quote style",
		icon: ScrollText,
		match: (path) => path.startsWith("/quote-style")
	},
	{
		to: "/questions",
		label: "Questions",
		icon: ListChecks,
		match: (path) => path.startsWith("/questions")
	},
	{
		to: "/links",
		label: "Links",
		icon: Link2,
		match: (path) => path.startsWith("/links")
	}
];
function ShellSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-mist",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-line bg-paper px-4 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "w-36" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Loading your lead inbox"
			})]
		})
	});
}
function NavItem({ to, label, icon: Icon, active, count, stacked }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		"aria-current": active ? "page" : void 0,
		className: cn("press flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium", stacked && "min-h-16 min-w-0 flex-1 flex-col justify-center gap-1 px-0.5 text-[11px]", active ? "bg-primary-soft text-primary" : "text-muted hover:bg-mist hover:text-ink", stacked && active && "bg-transparent"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-5",
			strokeWidth: 1.75,
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: cn("flex items-center gap-2 whitespace-nowrap", stacked && "gap-1"),
			children: [label, count ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular-nums",
				children: count
			}) : null]
		})]
	});
}
function LogoutButton({ compact }) {
	const [pending, setPending] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled: pending,
		onClick: () => {
			setPending(true);
			signOut().finally(() => setPending(false));
		},
		"aria-label": "Log out",
		className: cn("press inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-muted hover:bg-mist hover:text-ink disabled:opacity-60", compact ? "min-w-11 justify-center px-2" : "w-full px-3"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
			className: "size-5",
			strokeWidth: 1.75,
			"aria-hidden": "true"
		}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: pending ? "Logging out…" : "Log out" })]
	});
}
function IncomingLead() {
	const incoming = useLeakKeep((state) => state.incoming);
	const dismiss = useLeakKeep((state) => state.dismissIncoming);
	(0, import_react.useEffect)(() => {
		if (!incoming) return;
		const timer = window.setTimeout(dismiss, 8e3);
		return () => window.clearTimeout(timer);
	}, [incoming, dismiss]);
	if (!incoming) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: "fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 shadow-panel md:inset-x-auto md:right-6 md:bottom-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-2 shrink-0 animate-pulse rounded-full bg-primary",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "truncate text-sm font-medium",
					children: ["New lead from ", incoming.source || "a lead link"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "truncate text-sm text-muted",
					children: [incoming.name, incoming.jobType ? ` · ${incoming.jobType}` : ""]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/leads/$leadId",
				params: { leadId: incoming.id },
				onClick: dismiss,
				className: "press shrink-0 rounded-lg px-2 py-2 text-sm font-medium text-primary hover:bg-mist",
				children: "View"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: dismiss,
				"aria-label": "Dismiss",
				className: "press grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-mist hover:text-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					className: "size-4",
					"aria-hidden": "true"
				})
			})
		]
	});
}
function Shell({ children }) {
	const path = useRouterState({ select: (state) => state.location.pathname });
	const business = useLeakKeep((state) => state.business);
	const branding = useEffectiveBranding();
	const branded = hasBranding(branding);
	const entitlements = useLeakKeep((state) => state.entitlements);
	const fresh = useLeakKeep((state) => state.leads.filter((lead) => lead.status === "new").length);
	const saveError = useLeakKeep((state) => state.saveError);
	const email = useSession((state) => state.user?.email ?? "");
	const clearSaveError = useLeakKeep((state) => state.clearSaveError);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BrandTheme, {
		branding,
		className: "min-h-screen bg-mist md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [branding.logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
								path: branding.logoPath,
								name: business.name,
								heightClass: "h-10",
								className: "min-w-0 flex-1"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "w-36" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Lead inbox"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex flex-col gap-1 px-3",
						"aria-label": "Desk",
						children: [
							NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
								...item,
								active: item.match(path),
								count: item.to === "/" ? fresh : void 0
							}, item.to)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/settings",
								className: cn("press flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium", path.startsWith("/settings") ? "bg-primary-soft text-primary" : "text-muted hover:bg-mist hover:text-ink"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
									className: "size-5",
									strokeWidth: 1.75,
									"aria-hidden": "true"
								}), "Settings"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/feedback",
								className: cn("press flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium", path.startsWith("/feedback") ? "bg-primary-soft text-primary" : "text-muted hover:bg-mist hover:text-ink"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareHeart, {
									className: "size-5",
									strokeWidth: 1.75,
									"aria-hidden": "true"
								}), "Tell us what you think"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto border-t border-line px-3 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanCard, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: business.name || "Your business"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm text-muted",
									title: email,
									children: email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoutButton, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, {
								compact: branded,
								className: "mt-3"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					plansButton(entitlements).show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sticky top-0 z-10 hidden items-center justify-end border-b border-line bg-paper/95 px-8 py-1.5 backdrop-blur md:flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlansButton, {})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
						className: "sticky top-0 z-10 border-b border-line bg-paper px-4 py-3 md:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [branding.logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
										path: branding.logoPath,
										name: business.name,
										heightClass: "h-7"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-7 w-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm text-muted",
										children: business.name || email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanPill, {}),
								entitlements.tier !== "free" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlansButton, { compact: true }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/settings",
									"aria-label": "Settings and feedback",
									className: "press grid size-11 place-items-center rounded-lg text-muted hover:bg-mist hover:text-ink",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
										className: "size-5",
										strokeWidth: 1.75,
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoutButton, { compact: true })
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "px-4 py-6 pb-36 md:px-8 md:py-8 md:pb-10",
						children: [
							saveError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								role: "alert",
								className: "mx-auto mb-5 flex max-w-5xl items-start justify-between gap-3 rounded-2xl border border-lost/30 bg-paper px-4 py-3 text-sm text-lost",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [saveError, " Your last change may not be saved."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: clearSaveError,
									className: "press shrink-0 font-medium",
									children: "Dismiss"
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnusualActivityBanner, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TesterReminder, {}),
							children,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, {
								compact: branded,
								className: "mx-auto mt-10 max-w-3xl md:mt-12"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mx-auto mt-3 max-w-3xl text-center text-xs text-faint",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/privacy",
										className: "hover:text-muted",
										children: "Privacy Policy"
									}),
									" · ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/terms",
										className: "hover:text-muted",
										children: "Terms"
									})
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IncomingLead, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper md:hidden",
				"aria-label": "Desk",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						...item,
						stacked: true,
						active: item.match(path),
						count: item.to === "/" ? fresh : void 0
					}, item.to))
				})
			})
		]
	});
}
function AppShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientGate, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children })
	});
}
//#endregion
export { validateFeedback as _, callHref as a, greeting as c, sendFeedback as d, useAccess as f, useLeakKeep as g, useGatedLeads as h, FEEDBACK_MAX as i, isFeedbackAdmin as l, useEffectiveBranding as m, AppShell as n, emailHref as o, useAlerts as p, FEEDBACK_KINDS as r, fetchFeedback as s, ALERT_CHANNELS as t, needsFollowUp as u, wantsEmail as v, whatsappHref as y };
