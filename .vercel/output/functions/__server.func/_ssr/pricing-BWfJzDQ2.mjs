import { i as __toESM } from "../_runtime.mjs";
import { n as supabase } from "./supabase-DVps23Si.mjs";
import { i as fetchAllowance, m as quotesLeft } from "./data-CXsf9KMr.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as LoaderCircle, d as ExternalLink, i as Sparkles, m as Check, o as PartyPopper, p as ChevronLeft, r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as cn } from "./mark-BsAhVuvo.mjs";
import { t as Button } from "./button-BhX55BEi.mjs";
import { n as useLeakKeep, t as AppShell } from "./app-shell-C-uOWtEG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pricing-BWfJzDQ2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FUNCTION_URL = `https://dqifhijgdhxqzdluwpdd.supabase.co/functions/v1/paystack-billing`;
var MESSAGES = {
	not_configured: "Online payments aren't switched on yet. Please check back soon.",
	auth: "Your session has expired. Please sign in again.",
	already_pro: "You're already on Pro.",
	not_paid: "We couldn't confirm that payment. If you were charged, it will show here within a few minutes.",
	no_subscription: "We couldn't find an active subscription for your account."
};
var FALLBACK = "Something went wrong talking to our payment provider. Please try again.";
var BillingError = class extends Error {
	code;
	constructor(code) {
		super(MESSAGES[code] ?? FALLBACK);
		this.code = code;
	}
};
async function call(body) {
	const { data } = await supabase.auth.getSession();
	const token = data.session?.access_token;
	if (!token) throw new BillingError("auth");
	let response;
	try {
		response = await fetch(FUNCTION_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaWZoaWpnZGh4cXpkbHV3cGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MzkzOTYsImV4cCI6MjEwODIxNTM5Nn0.tKJkTC7OsW0E7lTwNikQnlw9QdSiBdkZkNrWxAH4Iy8",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		});
	} catch {
		throw new BillingError("network");
	}
	const payload = await response.json().catch(() => null);
	if (!response.ok || !payload) throw new BillingError(typeof payload?.error === "string" ? payload.error : "unknown");
	return payload;
}
async function urlFrom(body) {
	const payload = await call(body);
	if (typeof payload.url !== "string" || !payload.url.startsWith("https://")) throw new BillingError("unknown");
	return payload.url;
}
function startCheckout() {
	return urlFrom({
		action: "checkout",
		returnUrl: `${window.location.origin}${window.location.pathname}`
	});
}
function manageSubscription() {
	return urlFrom({ action: "manage" });
}
async function verifyPayment(reference) {
	if ((await call({
		action: "verify",
		reference
	})).plan !== "pro") throw new BillingError("not_paid");
}
var PLANS = [{
	id: "free",
	name: "Free",
	price: "R0",
	period: "forever",
	blurb: "Everything you need to catch every lead.",
	features: [
		"Unlimited leads and lead links",
		"Live new-lead alerts",
		"Saved services and quote style",
		`5 AI-written quotes a month`
	]
}, {
	id: "pro",
	name: "Pro",
	price: "R199",
	period: "per month",
	blurb: "For busy trades sending quotes every day.",
	features: [
		"Everything in Free",
		"Unlimited AI-written quotes",
		"Priority quote writing",
		"Cancel any time"
	]
}];
function messageOf(error) {
	return error instanceof BillingError ? error.message : new BillingError("unknown").message;
}
function formatDate(iso) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-ZA", {
		day: "numeric",
		month: "long",
		year: "numeric"
	});
}
function PricingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pricing, {}) });
}
function Pricing() {
	const allowance = useLeakKeep((state) => state.allowance);
	const setAllowance = useLeakKeep((state) => state.setAllowance);
	const current = allowance?.plan ?? "free";
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [welcome, setWelcome] = (0, import_react.useState)(false);
	const verified = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const reference = params.get("reference") ?? params.get("trxref");
		if (!reference || verified.current) return;
		verified.current = true;
		window.history.replaceState(null, "", window.location.pathname);
		setBusy("verify");
		verifyPayment(reference).then(async () => {
			const fresh = await fetchAllowance().catch(() => null);
			if (fresh) setAllowance(fresh);
			setWelcome(true);
		}).catch((reason) => setError(messageOf(reason))).finally(() => setBusy(null));
	}, [setAllowance]);
	const redirectTo = async (kind) => {
		setError(null);
		setBusy(kind);
		try {
			const url = kind === "checkout" ? await startCheckout() : await manageSubscription();
			window.location.assign(url);
		} catch (reason) {
			setError(messageOf(reason));
			setBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-4xl flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-4",
					"aria-hidden": "true"
				}), "Leads"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "max-w-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: "Plans"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Leads are always free. Upgrade when you want LeakKeep to write more of your quotes."
					}),
					allowance && allowance.plan === "free" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-ink-soft",
						children: [
							"You have ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium tabular-nums",
								children: quotesLeft(allowance)
							}),
							" of ",
							allowance.limit,
							" free AI quotes left this month. They reset on the 1st."
						]
					}) : null
				]
			}),
			busy === "verify" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "flex items-center gap-2 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-4 animate-spin text-primary",
					"aria-hidden": "true"
				}), "Confirming your payment..."]
			}) : null,
			welcome ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				className: "flex items-start gap-3 rounded-3xl border border-primary bg-primary-soft p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyPopper, {
					className: "mt-0.5 size-5 shrink-0 text-primary",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-ink",
					children: "Welcome to Pro"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-ink-soft",
					children: "Your AI quotes are now unlimited. Thanks for backing LeakKeep."
				})] })]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "flex items-start gap-2 rounded-2xl bg-lost-soft px-4 py-3 text-sm text-lost",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "mt-0.5 size-4 shrink-0",
					"aria-hidden": "true"
				}), error]
			}) : null,
			allowance && allowance.plan === "pro" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subscription, {
				allowance,
				busy: busy === "manage",
				onManage: () => redirectTo("manage")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: PLANS.map((plan) => {
					const isCurrent = plan.id === current;
					const featured = plan.id === "pro";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-labelledby": `plan-${plan.id}`,
						className: cn("flex flex-col rounded-3xl border bg-paper p-5 shadow-panel", featured ? "border-primary ring-1 ring-primary" : "border-line"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: `plan-${plan.id}`,
									className: "text-lg font-semibold tracking-tight",
									children: plan.name
								}), isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-muted",
									children: "Current plan"
								}) : featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary",
									children: "Most popular"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: plan.blurb
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 flex items-baseline gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl font-semibold tracking-tight tabular-nums",
									children: plan.price
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted",
									children: plan.period
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 flex flex-1 flex-col gap-2.5",
								children: plan.features.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-2 text-sm text-ink-soft",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "mt-0.5 size-4 shrink-0 text-won",
										"aria-hidden": "true"
									}), feature]
								}, feature))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5",
								children: isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "w-full",
									disabled: true,
									children: ["You're on ", plan.name]
								}) : featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "w-full",
									disabled: busy !== null,
									onClick: () => redirectTo("checkout"),
									children: [busy === "checkout" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										className: "size-4 animate-spin",
										"aria-hidden": "true"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
										className: "size-4",
										"aria-hidden": "true"
									}), busy === "checkout" ? "Opening secure checkout..." : "Upgrade to Pro"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-center text-xs text-muted",
									children: "Secure card payment in rand via Paystack."
								})] }) : null
							})
						]
					}, plan.id);
				})
			})
		]
	});
}
function Subscription({ allowance, busy, onManage }) {
	const date = formatDate(allowance.periodEnd);
	const note = allowance.status === "attention" ? {
		tone: "warn",
		text: "Your last payment didn't go through. Update your card to keep Pro."
	} : allowance.status === "non_renewing" || allowance.status === "cancelled" ? {
		tone: "info",
		text: date ? `Cancelled. Pro stays on until ${date}.` : "Cancelled. Pro stays on until the end of your paid month."
	} : {
		tone: "info",
		text: date ? `Renews on ${date}.` : "Renews monthly."
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"aria-labelledby": "your-subscription",
		className: "rounded-3xl border border-line bg-paper p-5 shadow-panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				id: "your-subscription",
				className: "flex items-center gap-2 text-lg font-semibold tracking-tight",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						className: "size-4 text-primary",
						"aria-hidden": "true"
					}),
					"Pro plan",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-normal text-muted",
						children: "R199 / month"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 text-sm", note.tone === "warn" ? "text-lost" : "text-ink-soft"),
				children: note.text
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				onClick: onManage,
				disabled: busy,
				className: "shrink-0",
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-4 animate-spin",
					"aria-hidden": "true"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
					className: "size-4",
					"aria-hidden": "true"
				}), allowance.status === "attention" ? "Update card" : "Manage or cancel"]
			})]
		})
	});
}
//#endregion
export { PricingPage as component };
