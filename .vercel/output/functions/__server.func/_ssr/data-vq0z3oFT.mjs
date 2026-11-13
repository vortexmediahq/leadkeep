import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/data-vq0z3oFT.js
var NONE = {
	emailAlerts: false,
	csvExport: false,
	customBranding: false,
	aiQuotes: false,
	sourceDashboard: false,
	monthlyReport: false
};
var ACCESS = {
	free: {
		tier: "free",
		leadLimit: 10,
		questionnaireLimit: 1,
		features: { ...NONE }
	},
	care: {
		tier: "care",
		leadLimit: Infinity,
		questionnaireLimit: 3,
		features: {
			...NONE,
			emailAlerts: true,
			csvExport: true,
			customBranding: true,
			aiQuotes: true
		}
	},
	growth: {
		tier: "growth",
		leadLimit: Infinity,
		questionnaireLimit: 10,
		features: {
			emailAlerts: true,
			csvExport: true,
			customBranding: true,
			aiQuotes: true,
			sourceDashboard: true,
			monthlyReport: true
		}
	}
};
/** What the owner sees on the pricing page. `soon` marks things that are promised but not built yet. */
var PRICES = {
	care: {
		normal: 49,
		founding: 29
	},
	growth: {
		normal: 99,
		founding: 69
	}
};
var NO_LIMITS = {
	ready: false,
	tier: "growth",
	founding: false,
	admin: false,
	fullAccessUntil: null,
	status: "none",
	periodEnd: null
};
var TIERS = [
	"free",
	"care",
	"growth"
];
var STATUSES$1 = [
	"active",
	"cancelling",
	"attention",
	"none"
];
function toEntitlements(raw) {
	if (!raw || typeof raw !== "object") return null;
	const value = raw;
	return {
		ready: true,
		tier: TIERS.includes(value.tier) ? value.tier : "free",
		founding: value.founding === true,
		admin: value.admin === true,
		fullAccessUntil: typeof value.fullAccessUntil === "string" ? value.fullAccessUntil : null,
		status: STATUSES$1.includes(value.status) ? value.status : "none",
		periodEnd: typeof value.periodEnd === "string" ? value.periodEnd : null
	};
}
function hasTesterAccess(e, now = /* @__PURE__ */ new Date()) {
	if (!e.fullAccessUntil) return false;
	const until = Date.parse(e.fullAccessUntil);
	return !Number.isNaN(until) && until > now.getTime();
}
/** The tier that actually applies right now: the owner (admin) and testers get everything. */
function effectiveTier(e, now = /* @__PURE__ */ new Date()) {
	if (!e.ready || e.admin || hasTesterAccess(e, now)) return "growth";
	return e.tier;
}
function accessFor(e, now = /* @__PURE__ */ new Date()) {
	return ACCESS[effectiveTier(e, now)];
}
/** Days left of tester access if the reminder should show (inside the last week), otherwise null. */
function testerReminderDays(e, now = /* @__PURE__ */ new Date()) {
	if (e.admin || e.tier !== "free" || !hasTesterAccess(e, now)) return null;
	const left = Math.ceil((Date.parse(e.fullAccessUntil) - now.getTime()) / 864e5);
	return left <= 7 ? left : null;
}
function foundingOpen(spotsLeft) {
	return spotsLeft === null || spotsLeft > 0;
}
/** Shown (blurred) in place of a locked lead's details. Never real data. */
var LOCKED_PLACEHOLDER = {
	name: "Hidden lead",
	line: "Upgrade to see who this is and how to reach them"
};
function maskLead(lead) {
	return {
		...lead,
		locked: true,
		name: LOCKED_PLACEHOLDER.name,
		phone: "",
		email: "",
		address: "",
		jobType: "",
		description: "",
		urgency: "",
		preferredTime: "",
		propertyType: "",
		budget: "",
		accessNotes: "",
		responses: [],
		quote: null,
		quoteUpdatedAt: null
	};
}
/**
* The first `leadLimit` leads (oldest first) keep their details. Every newer lead is still saved
* and counted, but its details stay hidden until the owner upgrades. Order of the input is kept.
*/
function gateLeads(leads, access) {
	if (!Number.isFinite(access.leadLimit)) return leads.map((lead) => ({
		...lead,
		locked: false
	}));
	const open = new Set([...leads].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)).slice(0, access.leadLimit).map((lead) => lead.id));
	return leads.map((lead) => open.has(lead.id) ? {
		...lead,
		locked: false
	} : maskLead(lead));
}
var lockedCount = (leads) => leads.filter((lead) => lead.locked).length;
function canAddQuestionnaire(access, count) {
	return count < access.questionnaireLimit;
}
var csvCell = (value) => /[",\n\r]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
/** Leads as CSV text. Locked leads are never included. A leading apostrophe stops spreadsheet formulas. */
function leadsToCsv(leads) {
	const safe = (value) => /^[=+\-@]/.test(value) ? `'${value}` : value;
	const header = [
		"Received",
		"Name",
		"Phone",
		"Email",
		"Source",
		"Status",
		"Job",
		"Details"
	];
	const rows = leads.filter((lead) => !lead.locked).map((lead) => [
		lead.createdAt,
		lead.name,
		lead.phone,
		lead.email,
		lead.source,
		lead.status,
		lead.jobType,
		lead.description
	].map((cell) => csvCell(safe(cell))).join(","));
	return `\uFEFF${[header.join(","), ...rows].join("\r\n")}`;
}
/** The slim top-right plans button: "View plans" on Free (and for testers), "Update my plan" once paying. Hidden for the owner. */
function plansButton(e) {
	if (!e.ready || e.admin) return {
		show: false,
		paid: false,
		label: ""
	};
	const paid = e.tier !== "free";
	return {
		show: true,
		paid,
		label: paid ? "Update my plan" : "View plans"
	};
}
/** Banner text on each plan card. */
var PLAN_BANNER = {
	free: {
		text: "Free",
		tone: "blue"
	},
	care: {
		text: "Care - Most popular",
		tone: "orange"
	},
	growth: {
		text: "Growth",
		tone: "blue"
	}
};
var STATUSES = [
	"active",
	"non_renewing",
	"attention",
	"cancelled"
];
function toAllowance(raw) {
	if (!raw || typeof raw !== "object") return null;
	const value = raw;
	if (typeof value.used !== "number") return null;
	return {
		plan: value.plan === "pro" ? "pro" : "free",
		status: STATUSES.includes(value.status) ? value.status : "active",
		periodEnd: typeof value.periodEnd === "string" ? value.periodEnd : null,
		used: value.used,
		limit: typeof value.limit === "number" ? value.limit : 5
	};
}
function quotesLeft(allowance) {
	return Math.max(0, allowance.limit - allowance.used);
}
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
	"VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYWlhamtmbHhqaG5zdmh2aXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MDY2MjIsImV4cCI6MjEwOTE4MjYyMn0.w46cPRAnutugwioKqbaKjUAoBW7sAU4bfmFq5oO87YU",
	"VITE_SUPABASE_URL": "https://ncaiajkflxjhnsvhviue.supabase.co"
};
var url = env.VITE_SUPABASE_URL;
var anonKey = env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.");
var supabase = createClient(url, anonKey, { auth: { experimental: { passkey: true } } });
function createUserClient(accessToken) {
	return createClient(url, anonKey, {
		global: { headers: { Authorization: `Bearer ${accessToken}` } },
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			experimental: { passkey: true }
		}
	});
}
var QUESTION_TEMPLATES = [
	{
		key: "enquiry",
		name: "Quick enquiry",
		blurb: "Three short questions. Best for social posts.",
		intro: "Tell us what you're after and we'll get back to you shortly.",
		questions: [
			{
				label: "What can we help you with?",
				type: "long",
				required: true
			},
			{
				label: "When would you like this?",
				type: "choice",
				options: [
					"As soon as possible",
					"Within a month",
					"Just looking for now"
				]
			},
			{
				label: "How would you like us to contact you?",
				type: "choice",
				options: [
					"Phone call",
					"WhatsApp",
					"Email"
				]
			}
		]
	},
	{
		key: "callback",
		name: "Book a call back",
		blurb: "Get a good time to call. Best for adverts.",
		intro: "Leave your details and pick a time. We'll call you back.",
		questions: [
			{
				label: "What would you like to chat about?",
				type: "short",
				required: true
			},
			{
				label: "Best day for a call",
				type: "date"
			},
			{
				label: "Best time to call",
				type: "choice",
				required: true,
				options: [
					"Morning",
					"Afternoon",
					"Evening",
					"Any time"
				]
			}
		]
	},
	{
		key: "quote",
		name: "Quote request",
		blurb: "Enough detail to price the work.",
		intro: "A few details help us send you an accurate price.",
		questions: [
			{
				label: "What do you need?",
				type: "long",
				required: true,
				help: "A sentence or two is enough."
			},
			{
				label: "Where are you based?",
				type: "short"
			},
			{
				label: "Rough budget",
				type: "choice",
				options: [
					"Under 1,000",
					"1,000 – 5,000",
					"5,000 – 20,000",
					"Over 20,000",
					"Not sure yet"
				]
			},
			{
				label: "When do you need it by?",
				type: "date"
			}
		]
	},
	{
		key: "booking",
		name: "Booking or appointment",
		blurb: "Date, people and preferences.",
		intro: "Tell us when and what you'd like, and we'll confirm your booking.",
		questions: [
			{
				label: "Preferred date",
				type: "date",
				required: true
			},
			{
				label: "How many people?",
				type: "number"
			},
			{
				label: "Which of these interest you?",
				type: "multi",
				options: [
					"Option 1",
					"Option 2",
					"Option 3"
				],
				help: "Rename these to your own services."
			},
			{
				label: "Anything else we should know?",
				type: "long"
			}
		]
	},
	{
		key: "blank",
		name: "Start from scratch",
		blurb: "One question. Build the rest yourself.",
		intro: "Tell us a little about what you need.",
		questions: [{
			label: "What can we help you with?",
			type: "long",
			required: true
		}]
	}
];
var newId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
function blankQuestion(type = "short") {
	return {
		id: newId(),
		label: "",
		type,
		required: false,
		options: type === "choice" || type === "multi" ? ["Option 1", "Option 2"] : [],
		help: ""
	};
}
function fromTemplate(template) {
	return {
		name: template.name,
		intro: template.intro,
		questions: template.questions.map((draft) => ({
			id: newId(),
			label: draft.label,
			type: draft.type,
			required: draft.required ?? false,
			options: draft.options ?? [],
			help: draft.help ?? ""
		}))
	};
}
/** Copy with fresh ids so the copy can be edited without touching the original. */
function duplicateQuestionnaire(source) {
	return {
		name: `${source.name} (copy)`.slice(0, 120),
		intro: source.intro,
		questions: source.questions.map((question) => ({
			...question,
			id: newId(),
			options: [...question.options]
		}))
	};
}
/** Used when a link has no questionnaire picked (or the database update isn't applied yet). */
var DEFAULT_PUBLIC_QUESTIONNAIRE = {
	...fromTemplate(QUESTION_TEMPLATES[0]),
	name: QUESTION_TEMPLATES[0].name
};
/** Where a link gets shared. Picked when creating a link; the lead is tagged with it. */
var SOURCE_OPTIONS = [
	"Facebook post",
	"Facebook ad",
	"Instagram",
	"TikTok",
	"WhatsApp",
	"Google Business",
	"Website",
	"LinkedIn",
	"Email",
	"Flyer or QR code"
];
var clip = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
var TYPES = /* @__PURE__ */ new Set([
	"short",
	"long",
	"choice",
	"multi",
	"date",
	"number"
]);
/** Defensive parse of questions coming from the database or a public RPC. */
function parseQuestions(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((item) => !!item && typeof item === "object").map((item) => ({
		id: clip(item.id, 64) || newId(),
		label: clip(item.label, 300),
		type: TYPES.has(String(item.type)) ? item.type : "short",
		required: item.required === true,
		options: Array.isArray(item.options) ? item.options.map((option) => clip(option, 120)).filter(Boolean).slice(0, 20) : [],
		help: clip(item.help, 300)
	})).filter((question) => question.label.trim().length > 0).slice(0, 30);
}
/** Readable text version of the answers, kept in the lead's description so it shows everywhere. */
function summarise(responses) {
	return responses.filter((item) => item.answer.trim()).map((item) => `${item.question}\n${item.answer}`).join("\n\n").slice(0, 4e3);
}
var QUOTE_STYLES = [
	{
		id: "clean",
		label: "Clean",
		help: "Light and simple, with a thin colour line."
	},
	{
		id: "bold",
		label: "Bold",
		help: "A strong colour header with your logo."
	},
	{
		id: "classic",
		label: "Classic",
		help: "Centred and traditional, with a serif look."
	}
];
var CTA_PRESETS = [
	"Send me more info",
	"Call me back",
	"Get my quote",
	"Book a time"
];
var QUOTE_CTA_PRESETS = ["Send me this quote", "Get my quote"];
function parseQuoteStyle(value) {
	return value === "bold" || value === "classic" || value === "clean" ? value : "clean";
}
function parseQuoteState(value) {
	return value === "review" || value === "sent" || value === "viewed" || value === "accepted" ? value : "";
}
function parseLinkKind(value) {
	return value === "simple" || value === "quote" ? value : "questionnaire";
}
/** Same rule the database uses: only a clear single price (R650, $1,200) may be quoted automatically. */
function isFixedPrice(price) {
	return /^[A-Za-z$€£]{0,3} ?[0-9][0-9 ,.]*$/.test(price.trim());
}
/** What will happen to a quote link, in plain words, for the owner's settings screen. */
function priceCheck(price, autoSend) {
	if (!price.trim()) return {
		auto: false,
		note: "Add a price on the Services page so the quote can be built. Until then you'll check each one first."
	};
	if (!isFixedPrice(price)) return {
		auto: false,
		note: "This price is a range or starts 'from', so you'll check each quote before it goes out."
	};
	return autoSend ? {
		auto: true,
		note: "A single clear price: the quote goes out straight away."
	} : {
		auto: false,
		note: "Auto-send is off, so you'll check each quote first."
	};
}
/** Turns a pasted YouTube or Vimeo link into a safe embed address. Anything else returns null. */
function parseVideoUrl(input) {
	let url;
	try {
		url = new URL(input.trim());
	} catch {
		return null;
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") return null;
	const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
	let id = "";
	if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
	else if (host === "youtube.com" || host === "youtube-nocookie.com") {
		if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
		else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? "";
	}
	if (/^[A-Za-z0-9_-]{6,20}$/.test(id)) return {
		provider: "youtube",
		embedUrl: `https://www.youtube-nocookie.com/embed/${id}`
	};
	if (host === "vimeo.com" || host === "player.vimeo.com") {
		const match = url.pathname.match(/\/(?:video\/)?(\d{5,12})(?:\/|$)/);
		if (match) return {
			provider: "vimeo",
			embedUrl: `https://player.vimeo.com/video/${match[1]}`
		};
	}
	return null;
}
function quoteStateLabel(state) {
	switch (state) {
		case "review": return "Check quote";
		case "sent": return "Quote sent – awaiting reply";
		case "viewed": return "Viewed";
		case "accepted": return "Accepted";
		default: return "";
	}
}
/** An in-app nudge once a sent quote has had no answer for 2 days, then 5. Accepted or unsent quotes never nudge. */
function quoteReminder(lead, now = /* @__PURE__ */ new Date()) {
	if (lead.quoteState !== "sent" && lead.quoteState !== "viewed") return null;
	const sent = lead.quoteSentAt ? Date.parse(lead.quoteSentAt) : NaN;
	if (Number.isNaN(sent)) return null;
	const days = (now.getTime() - sent) / 864e5;
	if (days >= 5) return {
		day: 5,
		text: "No reply in 5 days. A last friendly nudge is worth it."
	};
	if (days >= 2) return {
		day: 2,
		text: "No reply in 2 days. Follow up while it's fresh."
	};
	return null;
}
/** Random private token for owner-made quote links (the customer-link database function makes its own). */
function newQuoteToken() {
	const bytes = /* @__PURE__ */ new Uint8Array(20);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function quotePath(token) {
	return `/q/${token}`;
}
function quoteExpiry(days, from = /* @__PURE__ */ new Date()) {
	return new Date(from.getTime() + Math.max(1, Math.min(90, days)) * 864e5).toISOString();
}
var BRAND_FONTS = [
	{
		id: "sans",
		label: "Clean and modern",
		family: "Inter, ui-sans-serif, system-ui, sans-serif"
	},
	{
		id: "serif",
		label: "Classic serif",
		family: "\"Source Serif 4\", Georgia, \"Times New Roman\", serif"
	},
	{
		id: "system",
		label: "The device's own font",
		family: "ui-sans-serif, system-ui, sans-serif"
	}
];
var blankBranding = {
	logoPath: "",
	primaryColor: "",
	accentColor: "",
	font: "sans",
	showOnQuote: true,
	showOnForm: true,
	logoOnQuote: true,
	logoOnForm: true,
	quoteStyle: "clean",
	quoteBgPath: "",
	quoteValidDays: 14
};
var HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
function parseFont(value) {
	return value === "serif" || value === "system" || value === "sans" ? value : "sans";
}
function parseHexColor(value) {
	return typeof value === "string" && HEX_COLOR.test(value) ? value.toUpperCase() : "";
}
/** A client has added branding once they upload a logo or pick a colour. */
function hasBranding(branding) {
	return Boolean(branding.logoPath.trim() || branding.primaryColor.trim() || branding.accentColor.trim());
}
function fontFamily(font) {
	return BRAND_FONTS.find((item) => item.id === font)?.family ?? BRAND_FONTS[0].family;
}
function logoUrl(logoPath, supabaseUrl) {
	const path = logoPath.trim();
	if (!path || !supabaseUrl) return "";
	if (/^https?:\/\//i.test(path)) return path;
	return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/brand-assets/${path}`;
}
function inkOn(hex) {
	const value = parseHexColor(hex);
	if (!value) return "#ffffff";
	const r = parseInt(value.slice(1, 3), 16);
	const g = parseInt(value.slice(3, 5), 16);
	const b = parseInt(value.slice(5, 7), 16);
	return (.299 * r + .587 * g + .114 * b) / 255 > .62 ? "#0B1F3B" : "#ffffff";
}
function softTint(hex, amount = .88) {
	const value = parseHexColor(hex);
	if (!value) return "";
	const mix = (start) => Math.round(start + (255 - start) * amount);
	return `#${[
		mix(parseInt(value.slice(1, 3), 16)),
		mix(parseInt(value.slice(3, 5), 16)),
		mix(parseInt(value.slice(5, 7), 16))
	].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}
function brandCssVars(branding) {
	const vars = { fontFamily: fontFamily(branding.font) };
	if (branding.primaryColor) {
		vars["--color-primary"] = branding.primaryColor;
		vars["--color-primary-ink"] = inkOn(branding.primaryColor);
		const soft = softTint(branding.primaryColor);
		if (soft) vars["--color-primary-soft"] = soft;
	}
	if (branding.accentColor) {
		vars["--color-accent"] = branding.accentColor;
		vars["--color-accent-ink"] = inkOn(branding.accentColor);
		const soft = softTint(branding.accentColor);
		if (soft) vars["--color-accent-soft"] = soft;
	}
	return vars;
}
var LOGO_MIME_BY_EXT = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp",
	svg: "image/svg+xml"
};
/** Some computers send an empty or odd file type (SVG and "image/jpg" most often), so fall back to the file ending. */
function logoMimeType(file) {
	const type = (file.type || "").toLowerCase();
	if (type === "image/jpg" || type === "image/pjpeg") return "image/jpeg";
	if (type === "image/png" || type === "image/jpeg" || type === "image/webp" || type === "image/svg+xml") return type;
	return LOGO_MIME_BY_EXT[file.name.toLowerCase().split(".").pop() ?? ""] ?? "";
}
var BRANDING_SETUP_MESSAGE = "Your branding database update hasn't been applied yet, so this can't be saved. Ask Avery for the branding update (20261112120000) and run it once.";
/** True when the branding columns do not exist yet in the live database (the batch 2 SQL has not been run). */
function isMissingBrandingColumns(error) {
	if (!error) return false;
	const code = String(error.code ?? "");
	const message = String(error.message ?? "").toLowerCase();
	return code === "42703" || code === "PGRST204" || message.includes("column") && (message.includes("does not exist") || message.includes("schema cache"));
}
/** A plain-words reason for a failed logo upload, so the real cause is not hidden. */
function logoUploadMessage(error) {
	const message = String(error?.message ?? "").toLowerCase();
	const status = String(error?.statusCode ?? error?.status ?? "");
	if (message.includes("bucket not found") || status === "404" && message.includes("bucket")) return "Logo storage isn't switched on yet: the branding database update hasn't been applied. Ask Avery for the branding update (20261112120000) and run it once.";
	if (message.includes("row-level security") || message.includes("not authorized") || status === "403" || status === "401") return "We couldn't confirm it's you. Log out, log back in and try the logo again.";
	if (message.includes("exceeded") || message.includes("too large") || status === "413") return "That logo is too big. Please keep it under 2 MB.";
	if (message.includes("mime") || message.includes("not supported") || message.includes("invalid file")) return "That file type isn't allowed. Please use a PNG, JPG, WEBP or SVG image.";
	return "We couldn't upload that logo. Check your connection and try again, or try a different image.";
}
/** Branding only applies on plans that include it. Saved branding is kept, just not shown, if a plan drops to Free. */
function effectiveBranding(branding, allowed) {
	return allowed ? branding : { ...blankBranding };
}
/** The value of the "Don't see your questions? Create new" choice in the questions dropdown. */
var CREATE_NEW_QUESTIONS = "__create_new__";
function toResponses(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((item) => !!item && typeof item === "object").map((item) => ({
		question: text(item.question),
		answer: text(item.answer)
	})).filter((item) => item.question || item.answer);
}
var LEAD_COLUMNS = "id, link_id, source, customer_name, phone, email, address, answers, status, quote, quote_updated_at, created_at";
/** Added by the quote-flow database update. Until it is applied the app reads the base columns only. */
var LEAD_QUOTE_COLUMNS = "service_name, quote_token, quote_state, quote_sent_at, quote_viewed_at, quote_accepted_at, quote_expires_at";
var quoteFlowLeads = null;
var text = (value) => typeof value === "string" ? value : "";
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
		responses: toResponses(answers.responses),
		status: row.status,
		createdAt: row.created_at,
		quote: row.quote,
		quoteUpdatedAt: row.quote_updated_at,
		serviceName: row.service_name ?? "",
		quoteToken: row.quote_token ?? null,
		quoteState: parseQuoteState(row.quote_state),
		quoteSentAt: row.quote_sent_at ?? null,
		quoteViewedAt: row.quote_viewed_at ?? null,
		quoteAcceptedAt: row.quote_accepted_at ?? null,
		quoteExpiresAt: row.quote_expires_at ?? null
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
	if (quoteFlowLeads !== false) {
		const full = await supabase.from("leads").select(`${LEAD_COLUMNS}, ${LEAD_QUOTE_COLUMNS}`).order("created_at", { ascending: false });
		if (!full.error && full.data) {
			quoteFlowLeads = true;
			return full.data.map(toLead);
		}
		quoteFlowLeads = false;
	}
	const { data, error } = await supabase.from("leads").select(LEAD_COLUMNS).order("created_at", { ascending: false });
	if (error || !data) fail("load leads", error);
	return data.map(toLead);
}
function toPublicBranding(value) {
	if (!value || typeof value !== "object") return null;
	const row = value;
	return {
		logoPath: text(row.logo_path),
		primaryColor: parseHexColor(row.primary_color),
		accentColor: parseHexColor(row.accent_color),
		font: parseFont(row.font),
		showOnQuote: true,
		showOnForm: true,
		logoOnQuote: true,
		logoOnForm: true,
		quoteStyle: "clean",
		quoteBgPath: "",
		quoteValidDays: 14
	};
}
async function fetchPublicForm(slug) {
	const { data, error } = await supabase.rpc("public_lead_form", { p_slug: slug });
	if (error) fail("load this form", error);
	if (!data || typeof data !== "object") return null;
	const form = data;
	const business = form.business ?? {};
	const raw = form.questionnaire && typeof form.questionnaire === "object" ? form.questionnaire : null;
	const questions = raw ? parseQuestions(raw.questions) : [];
	return {
		questionnaire: raw && questions.length ? {
			name: text(raw.name),
			intro: text(raw.intro),
			questions
		} : null,
		source: text(form.source),
		business: {
			name: text(business.name),
			trade: text(business.trade),
			city: text(business.city)
		},
		services: Array.isArray(form.services) ? form.services.filter((name) => typeof name === "string") : [],
		branding: toPublicBranding(form.branding),
		kind: parseLinkKind(form.kind),
		landing: {
			headline: text(form.landing?.headline),
			intro: text(form.landing?.intro),
			mediaPath: text(form.landing?.media_path),
			mediaUrl: text(form.landing?.media_url),
			ctaText: text(form.landing?.cta_text),
			serviceName: text(form.landing?.service_name)
		}
	};
}
async function submitLeadViaLink(slug, input) {
	const answers = {
		jobType: input.jobType,
		description: input.description,
		urgency: input.urgency,
		preferredTime: input.preferredTime,
		propertyType: input.propertyType,
		budget: input.budget,
		accessNotes: input.accessNotes,
		responses: input.responses
	};
	const { data, error } = await supabase.rpc("submit_lead_via_link", {
		p_slug: slug,
		p_name: input.name,
		p_phone: input.phone,
		p_email: input.email,
		p_address: input.address,
		p_answers: answers
	});
	if (error || typeof data !== "string") fail("send your request", error);
	return data;
}
async function fetchLeadById(id) {
	const { data, error } = await supabase.from("leads").select(quoteFlowLeads === false ? LEAD_COLUMNS : `${LEAD_COLUMNS}, ${LEAD_QUOTE_COLUMNS}`).eq("id", id).maybeSingle();
	if (error) fail("load the new lead", error);
	return data ? toLead(data) : null;
}
function subscribeToNewLeads(userId, onLead) {
	const channel = supabase.channel(`leads:${userId}`).on("postgres_changes", {
		event: "INSERT",
		schema: "public",
		table: "leads",
		filter: `user_id=eq.${userId}`
	}, (payload) => {
		const id = payload.new.id;
		if (typeof id === "string") onLead(id);
	}).subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}
var PROFILE_COLUMNS = "name, trade, city, phone, email, currency";
var BRANDING_COLUMNS = "logo_path, primary_color, accent_color, font, show_on_quote, show_on_form";
/** Added by the quote-flow database update. */
var QUOTE_OPTION_COLUMNS = "logo_on_quote, logo_on_form, quote_style, quote_bg_path, quote_valid_days";
function toBranding(row) {
	if (!row) return { ...blankBranding };
	const days = Number(row.quote_valid_days);
	return {
		logoPath: text(row.logo_path),
		primaryColor: parseHexColor(row.primary_color),
		accentColor: parseHexColor(row.accent_color),
		font: parseFont(row.font),
		showOnQuote: row.show_on_quote !== false,
		showOnForm: row.show_on_form !== false,
		logoOnQuote: row.logo_on_quote !== false,
		logoOnForm: row.logo_on_form !== false,
		quoteStyle: parseQuoteStyle(row.quote_style),
		quoteBgPath: text(row.quote_bg_path),
		quoteValidDays: Number.isFinite(days) && days >= 1 && days <= 90 ? Math.round(days) : 14
	};
}
function brandingColumns(branding) {
	return {
		logo_path: branding.logoPath.slice(0, 300),
		primary_color: branding.primaryColor,
		accent_color: branding.accentColor,
		font: branding.font,
		show_on_quote: branding.showOnQuote,
		show_on_form: branding.showOnForm
	};
}
function quoteOptionColumns(branding) {
	return {
		logo_on_quote: branding.logoOnQuote,
		logo_on_form: branding.logoOnForm,
		quote_style: branding.quoteStyle,
		quote_bg_path: branding.quoteBgPath.slice(0, 300),
		quote_valid_days: branding.quoteValidDays
	};
}
function publicLogoUrl(logoPath) {
	return logoUrl(logoPath, {
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
		"VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYWlhamtmbHhqaG5zdmh2aXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MDY2MjIsImV4cCI6MjEwOTE4MjYyMn0.w46cPRAnutugwioKqbaKjUAoBW7sAU4bfmFq5oO87YU",
		"VITE_SUPABASE_URL": "https://ncaiajkflxjhnsvhviue.supabase.co"
	}.VITE_SUPABASE_URL ?? "");
}
async function fetchProfile() {
	for (const columns of [`${PROFILE_COLUMNS}, ${BRANDING_COLUMNS}, ${QUOTE_OPTION_COLUMNS}`, `${PROFILE_COLUMNS}, ${BRANDING_COLUMNS}`]) {
		const result = await supabase.from("business_profiles").select(columns).maybeSingle();
		if (result.error) continue;
		if (!result.data) return null;
		const { name, trade, city, phone, email, currency, ...brand } = result.data;
		return {
			business: {
				name,
				trade,
				city,
				phone,
				email,
				currency
			},
			branding: toBranding(brand)
		};
	}
	const { data, error } = await supabase.from("business_profiles").select(PROFILE_COLUMNS).maybeSingle();
	if (error) fail("load your business details", error);
	return data ? {
		business: data,
		branding: { ...blankBranding }
	} : null;
}
async function saveProfile(business, branding) {
	const base = {
		...business,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	const wantsBranding = !!branding && (hasBranding(branding) || branding.font !== "sans" || !branding.showOnQuote || !branding.showOnForm);
	const wantsQuoteOptions = !!branding && (!branding.logoOnQuote || !branding.logoOnForm || branding.quoteStyle !== "clean" || !!branding.quoteBgPath || branding.quoteValidDays !== 14);
	let brandingError = null;
	let quoteMissing = false;
	if (branding) {
		const full = await supabase.from("business_profiles").upsert({
			...base,
			...brandingColumns(branding),
			...quoteOptionColumns(branding)
		}, { onConflict: "user_id" });
		if (!full.error) return;
		const older = await supabase.from("business_profiles").upsert({
			...base,
			...brandingColumns(branding)
		}, { onConflict: "user_id" });
		if (!older.error) {
			if (wantsQuoteOptions) throw new Error("Your quote options (style, logo tick boxes, background) can't be saved yet. The quote database update 20261113120000_quote_flow.sql still needs to be applied.");
			return;
		}
		brandingError = older.error;
		quoteMissing = isMissingBrandingColumns(full.error);
	}
	const { error } = await supabase.from("business_profiles").upsert(base, { onConflict: "user_id" });
	if (error) fail("save your business details", error);
	if (wantsBranding || wantsQuoteOptions && quoteMissing) throw new Error(isMissingBrandingColumns(brandingError) ? BRANDING_SETUP_MESSAGE : `We couldn't save your branding. ${brandingError?.message ?? ""}`.trim());
}
var LOGO_EXT = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp",
	"image/svg+xml": "svg"
};
/** Uploads a picture into the owner's own folder of the public `brand-assets` bucket and returns its path. */
async function uploadBrandImage(userId, file, name) {
	const mime = logoMimeType(file);
	const ext = LOGO_EXT[mime];
	if (!ext) throw new Error("Please use a PNG, JPG, WEBP or SVG image.");
	if (file.size > 2097152) throw new Error("Please keep the image under 2 MB.");
	const path = `${userId}/${name}.${ext}`;
	const { error } = await supabase.storage.from("brand-assets").upload(path, file, {
		upsert: true,
		contentType: mime
	});
	if (error) throw new Error(logoUploadMessage(error));
	return path;
}
var uploadLogo = (userId, file) => uploadBrandImage(userId, file, "logo");
async function removeLogo(logoPath) {
	if (!logoPath.trim()) return;
	await supabase.storage.from("brand-assets").remove([logoPath]);
}
var toLink = (row) => ({
	id: row.id,
	slug: row.slug,
	source: row.source,
	questionnaireId: row.questionnaire_id ?? null,
	createdAt: row.created_at,
	kind: parseLinkKind(row.kind),
	serviceId: row.service_id ?? null,
	headline: row.headline ?? "",
	intro: row.intro ?? "",
	mediaPath: row.media_path ?? "",
	mediaUrl: row.media_url ?? "",
	ctaText: row.cta_text ?? "",
	autoSend: row.auto_send !== false
});
var LINK_COLUMNS = "id, slug, source, created_at";
var LINK_QUOTE_COLUMNS = "kind, service_id, headline, intro, media_path, media_url, cta_text, auto_send";
var quoteFlowLinks = null;
/**
* Questionnaires need the database update in supabase/proposed/. Until it's applied,
* every questionnaire call fails softly and links use the default questions.
*/
var questionnairesReady = null;
var questionnairesAvailable = () => questionnairesReady !== false;
var quoteFlowAvailable = () => quoteFlowLinks === true;
async function fetchLinks() {
	if (questionnairesReady !== false) {
		if (quoteFlowLinks !== false) {
			const full = await supabase.from("lead_links").select(`${LINK_COLUMNS}, questionnaire_id, ${LINK_QUOTE_COLUMNS}`).order("created_at", { ascending: false });
			if (!full.error && full.data) {
				questionnairesReady = true;
				quoteFlowLinks = true;
				return full.data.map(toLink);
			}
			quoteFlowLinks = false;
		}
		const { data, error } = await supabase.from("lead_links").select(`${LINK_COLUMNS}, questionnaire_id`).order("created_at", { ascending: false });
		if (!error && data) {
			questionnairesReady = true;
			return data.map(toLink);
		}
		questionnairesReady = false;
	}
	const { data, error } = await supabase.from("lead_links").select(LINK_COLUMNS).order("created_at", { ascending: false });
	if (error || !data) fail("load your links", error);
	return data.map(toLink);
}
async function insertLinks(sources, questionnaireId = null, options = {}) {
	const withQuestions = questionnairesReady === true && questionnaireId;
	const kind = options.kind ?? "questionnaire";
	if (kind !== "questionnaire" && quoteFlowLinks !== true) throw new Error("Quote and simple links need the quote database update (20261113120000_quote_flow.sql) to be applied first.");
	const extra = quoteFlowLinks === true && kind !== "questionnaire" ? {
		kind,
		service_id: options.serviceId ?? null,
		cta_text: options.ctaText ?? "",
		headline: options.headline ?? ""
	} : {};
	const { data, error } = await supabase.from("lead_links").insert(sources.map((source) => ({
		source,
		...withQuestions ? { questionnaire_id: questionnaireId } : {},
		...extra
	}))).select(quoteFlowLinks === true ? `${LINK_COLUMNS}, questionnaire_id, ${LINK_QUOTE_COLUMNS}` : questionnairesReady === true ? `${LINK_COLUMNS}, questionnaire_id` : LINK_COLUMNS);
	if (error || !data) fail("create the link", error);
	return data.map(toLink);
}
async function updateLinkLanding(id, patch) {
	const columns = {};
	if (patch.headline !== void 0) columns.headline = patch.headline.slice(0, 120);
	if (patch.intro !== void 0) columns.intro = patch.intro.slice(0, 600);
	if (patch.mediaPath !== void 0) columns.media_path = patch.mediaPath.slice(0, 300);
	if (patch.mediaUrl !== void 0) columns.media_url = patch.mediaUrl.slice(0, 300);
	if (patch.ctaText !== void 0) columns.cta_text = patch.ctaText.slice(0, 40);
	if (patch.autoSend !== void 0) columns.auto_send = patch.autoSend;
	if (patch.serviceId !== void 0) columns.service_id = patch.serviceId;
	const { error } = await supabase.from("lead_links").update(columns).eq("id", id);
	if (error) fail("save the link", error);
}
async function updateLinkQuestionnaire(id, questionnaireId) {
	const { error } = await supabase.from("lead_links").update({ questionnaire_id: questionnaireId }).eq("id", id);
	if (error) fail("change the link's questions", error);
}
var toQuestionnaire = (row) => ({
	id: row.id,
	name: row.name,
	intro: row.intro,
	questions: parseQuestions(row.questions),
	updatedAt: row.updated_at
});
async function fetchQuestionnaires() {
	const { data, error } = await supabase.from("questionnaires").select("id, name, intro, questions, updated_at").order("updated_at", { ascending: false });
	if (error || !data) fail("load your questionnaires", error);
	return data.map(toQuestionnaire);
}
async function insertQuestionnaire(item) {
	const { error } = await supabase.from("questionnaires").insert({
		id: item.id,
		name: item.name,
		intro: item.intro,
		questions: item.questions
	});
	if (error) fail("save the questionnaire", error);
}
async function updateQuestionnaireRow(item) {
	const { error } = await supabase.from("questionnaires").update({
		name: item.name,
		intro: item.intro,
		questions: item.questions,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", item.id);
	if (error) fail("save the questionnaire", error);
}
async function deleteQuestionnaireRow(id) {
	const { error } = await supabase.from("questionnaires").delete().eq("id", id);
	if (error) fail("remove the questionnaire", error);
}
async function updateLinkSource(id, source) {
	const { error } = await supabase.from("lead_links").update({ source }).eq("id", id);
	if (error) fail("rename the link", error);
}
async function deleteLinkRow(id) {
	const { error } = await supabase.from("lead_links").delete().eq("id", id);
	if (error) fail("remove the link", error);
}
async function updateLeadRow(id, patch) {
	const columns = {};
	if (patch.status !== void 0) columns.status = patch.status;
	if (patch.quote !== void 0) columns.quote = patch.quote;
	if (patch.quoteUpdatedAt !== void 0) columns.quote_updated_at = patch.quoteUpdatedAt;
	if (patch.quoteToken !== void 0) columns.quote_token = patch.quoteToken;
	if (patch.quoteState !== void 0) columns.quote_state = patch.quoteState;
	if (patch.quoteSentAt !== void 0) columns.quote_sent_at = patch.quoteSentAt;
	if (patch.quoteExpiresAt !== void 0) columns.quote_expires_at = patch.quoteExpiresAt;
	const { error } = await supabase.from("leads").update(columns).eq("id", id);
	if (error) fail("save the lead", error);
}
async function submitLandingRequest(slug, input) {
	const { data, error } = await supabase.rpc("submit_landing_request", {
		p_slug: slug,
		p_name: input.name,
		p_email: input.email,
		p_phone: input.phone,
		p_website: input.website,
		p_consent: input.consent
	});
	if (error || !data || typeof data !== "object") fail("send your request", error);
	const row = data;
	return {
		ok: row.ok === true,
		state: parseQuoteState(row.state),
		token: typeof row.token === "string" ? row.token : null,
		leadId: typeof row.lead_id === "string" ? row.lead_id : null
	};
}
async function fetchQuoteView(token, track = true) {
	const { data, error } = await supabase.rpc("view_quote", {
		p_token: token,
		p_track: track
	});
	if (error) fail("load this quote", error);
	if (!data || typeof data !== "object") return null;
	const row = data;
	const business = row.business ?? {};
	const branding = toPublicBranding(row.branding);
	return {
		text: text(row.text),
		customer: text(row.customer),
		service: text(row.service),
		state: parseQuoteState(row.state),
		expired: row.expired === true,
		expiresAt: typeof row.expires_at === "string" ? row.expires_at : null,
		acceptedAt: typeof row.accepted_at === "string" ? row.accepted_at : null,
		business: {
			name: text(business.name),
			phone: text(business.phone),
			email: text(business.email)
		},
		style: parseQuoteStyle(row.style),
		backgroundPath: text(row.background_path),
		branding
	};
}
async function acceptQuoteRpc(token) {
	const { data, error } = await supabase.rpc("accept_quote", { p_token: token });
	if (error) fail("accept this quote", error);
	return data === true;
}
async function fetchAllowance() {
	const { data, error } = await supabase.rpc("quote_allowance");
	if (error) fail("load your plan", error);
	return toAllowance(data);
}
/** Needs supabase/proposed/20261110090000_plans_whop.sql. Returns null until that update is applied. */
async function fetchEntitlements() {
	const { data, error } = await supabase.rpc("my_entitlements");
	if (error) return null;
	return toEntitlements(data);
}
async function fetchFoundingSpotsLeft() {
	const { data, error } = await supabase.rpc("founding_spots_left");
	if (error || typeof data !== "number") return null;
	return data;
}
//#endregion
export { newQuoteToken as $, fetchFoundingSpotsLeft as A, uploadBrandImage as At, fontFamily as B, deleteQuestionnaireRow as C, toTemplate as Ct, effectiveTier as D, updateLinkSource as Dt, effectiveBranding as E, updateLinkQuestionnaire as Et, fetchPublicForm as F, hasTesterAccess as G, fromTemplate as H, fetchQuestionnaires as I, insertServices as J, insertLinks as K, fetchQuoteView as L, fetchLeads as M, fetchLinks as N, fetchAllowance as O, updateQuestionnaireRow as Ot, fetchProfile as P, newId as Q, fetchServices as R, deleteLinkRow as S, toLead as St, duplicateQuestionnaire as T, updateLinkLanding as Tt, gateLeads as U, foundingOpen as V, hasBranding as W, leadsToCsv as X, isFixedPrice as Y, lockedCount as Z, blankBranding as _, subscribeToNewLeads as _t, HEX_COLOR as a, questionnairesAvailable as at, canAddQuestionnaire as b, testerReminderDays as bt, NO_LIMITS as c, quotePath as ct, QUESTION_TEMPLATES as d, quotesLeft as dt, parseHexColor as et, QUOTE_CTA_PRESETS as f, removeLogo as ft, accessFor as g, submitLeadViaLink as gt, acceptQuoteRpc as h, submitLandingRequest as ht, DEFAULT_PUBLIC_QUESTIONNAIRE as i, publicLogoUrl as it, fetchLeadById as j, uploadLogo as jt, fetchEntitlements as k, updateServiceRow as kt, PLAN_BANNER as l, quoteReminder as lt, SOURCE_OPTIONS as m, saveTemplate as mt, CREATE_NEW_QUESTIONS as n, plansButton as nt, LEAD_COLUMNS as o, quoteExpiry as ot, QUOTE_STYLES as p, saveProfile as pt, insertQuestionnaire as q, CTA_PRESETS as r, priceCheck as rt, LOCKED_PLACEHOLDER as s, quoteFlowAvailable as st, BRAND_FONTS as t, parseVideoUrl as tt, PRICES as u, quoteStateLabel as ut, blankQuestion as v, summarise as vt, deleteServiceRow as w, updateLeadRow as wt, createUserClient as x, toAllowance as xt, brandCssVars as y, supabase as yt, fetchTemplate as z };
