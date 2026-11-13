import { i as __toESM } from "../_runtime.mjs";
import { D as effectiveTier, G as hasTesterAccess, V as foundingOpen, Z as lockedCount, l as PLAN_BANNER, u as PRICES } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ChevronLeft, _ as LoaderCircle, a as Sparkles, d as PartyPopper, j as Check, w as ExternalLink } from "../_libs/lucide-react.mjs";
import { E as useSession } from "./session-CpXzyFkR.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
import { g as useLeakKeep, h as useGatedLeads, n as AppShell } from "./app-shell-CkBjUj6N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pricing-B4cvH9Ba.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var plan = (tier, founding, productId, planId, price) => ({
	tier,
	founding,
	productId,
	planId,
	price,
	checkoutUrl: `https://whop.com/checkout/${planId}`
});
var WHOP_PLANS = [
	plan("care", false, "prod_Sekd1ChkFqqK6", "plan_8tnneDa1AiqYi", 49),
	plan("care", true, "prod_Sekd1ChkFqqK6", "plan_83fVGMKdf3J9r", 29),
	plan("growth", false, "prod_kyxjs9MLL5H96", "plan_0bF14CSmRXbQg", 99),
	plan("growth", true, "prod_kyxjs9MLL5H96", "plan_GV13tzo4oC1Ph", 69)
];
function findPlan(tier, founding) {
	const found = WHOP_PLANS.find((item) => item.tier === tier && item.founding === founding);
	if (!found) throw new Error(`No Whop plan for ${tier}${founding ? " (founding)" : ""}`);
	return found;
}
/** The checkout link, with the buyer's login email filled in so the payment can be matched to their account. */
function checkoutHref(tier, founding, email) {
	const url = new URL(findPlan(tier, founding).checkoutUrl);
	if (email) url.searchParams.set("email", email);
	return url.toString();
}
/** Where a paying customer manages or cancels their Whop subscription. */
var WHOP_MANAGE_URL = "https://whop.com/hub/";
/**
* Payments go through Whop. The checkout link carries the buyer's login email so the
* Whop webhook (supabase/proposed/functions/whop-webhook) can match the payment to the account.
*/
function startCheckout(tier, founding, email) {
	return checkoutHref(tier, founding, email);
}
var PLANS = [
	{
		id: "free",
		name: "Free",
		blurb: "Try LeadKeep with your first customers.",
		features: [
			{ text: `Full details for your first 10 leads` },
			{ text: "Every new lead is still saved after that" },
			{ text: "1 questionnaire and shareable links" },
			{ text: "New-lead bell in the app" },
			{ text: "Call, WhatsApp and email buttons" }
		]
	},
	{
		id: "care",
		name: "Care",
		blurb: "Never miss a lead, and reply fast.",
		features: [
			{ text: "Everything in Free" },
			{ text: "Every lead unlocked, no limit" },
			{ text: "Email alerts for new leads" },
			{ text: "AI-written quotes" },
			{ text: "Export your leads to CSV" },
			{ text: "3 questionnaires" },
			{
				text: "Your own logo and colours",
				soon: true
			}
		]
	},
	{
		id: "growth",
		name: "Growth",
		blurb: "See which posts bring in your best leads.",
		features: [
			{ text: "Everything in Care" },
			{ text: "10 questionnaires" },
			{
				text: "Lead-source dashboard",
				soon: true
			},
			{
				text: "Suggestions on what's working",
				soon: true
			},
			{
				text: "Monthly 'your leads' report email",
				soon: true
			}
		]
	}
];
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
	const entitlements = useLeakKeep((state) => state.entitlements);
	const spotsLeft = useLeakKeep((state) => state.foundingSpotsLeft);
	const refreshPlan = useLeakKeep((state) => state.refreshPlan);
	const email = useSession((state) => state.user?.email ?? null);
	const leads = useGatedLeads();
	const hidden = lockedCount(leads);
	const tier = effectiveTier(entitlements);
	const paid = entitlements.tier !== "free" && !entitlements.admin;
	const founding = foundingOpen(spotsLeft) || entitlements.founding;
	const [thanks, setThanks] = (0, import_react.useState)(false);
	const [waiting, setWaiting] = (0, import_react.useState)(false);
	const checked = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (checked.current || new URLSearchParams(window.location.search).get("thanks") !== "1") return;
		checked.current = true;
		window.history.replaceState(null, "", window.location.pathname);
		setThanks(true);
		setWaiting(true);
		let tries = 0;
		const timer = window.setInterval(() => {
			tries += 1;
			refreshPlan();
			if (tries >= 8) {
				window.clearInterval(timer);
				setWaiting(false);
			}
		}, 3e3);
		return () => window.clearInterval(timer);
	}, [refreshPlan]);
	(0, import_react.useEffect)(() => {
		if (paid && thanks) setWaiting(false);
	}, [paid, thanks]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-5xl flex-col gap-6",
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
						children: "No setup fee. Cancel any time. Every lead is always saved, even on Free."
					}),
					hidden > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 rounded-xl bg-accent-soft px-3 py-2 text-sm text-ink",
						children: [
							hidden,
							" ",
							hidden === 1 ? "lead is" : "leads are",
							" saved and waiting. Upgrade to see who ",
							hidden === 1 ? "it is" : "they are",
							"."
						]
					}) : null
				]
			}),
			entitlements.admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft",
				children: "You're the owner of this LeadKeep, so everything is switched on for you. Customers see the plans below."
			}) : null,
			hasTesterAccess(entitlements) && !entitlements.admin && entitlements.tier === "free" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-ink",
				children: [
					"You have full early access until ",
					formatDate(entitlements.fullAccessUntil),
					". After that you move to Free and keep every lead."
				]
			}) : null,
			thanks ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				className: "flex items-start gap-3 rounded-3xl border border-primary bg-primary-soft p-5",
				children: [waiting && !paid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "mt-0.5 size-5 shrink-0 animate-spin text-primary",
					"aria-hidden": "true"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyPopper, {
					className: "mt-0.5 size-5 shrink-0 text-primary",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-ink",
					children: paid ? `Welcome to ${entitlements.tier === "growth" ? "Growth" : "Care"}` : "Thank you!"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-ink-soft",
					children: paid ? "Your leads are unlocked." : waiting ? "We're switching your plan on now. This takes a few seconds." : "Your payment is in. If your leads still look hidden in a few minutes, tell us under 'Tell us what you think' and we'll fix it right away."
				})] })]
			}) : null,
			paid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subscription, { entitlements }) : null,
			!paid && !entitlements.admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoundingBanner, { spotsLeft }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: PLANS.map((plan) => {
					const isCurrent = plan.id === tier && !entitlements.admin && (plan.id === "free" ? !hasTesterAccess(entitlements) : true);
					const featured = plan.id === "care";
					const price = plan.id === "free" ? null : PRICES[plan.id];
					const useFounding = founding && price !== null && !paid;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-labelledby": `plan-${plan.id}`,
						className: cn("flex flex-col rounded-3xl border bg-paper p-5 shadow-panel", featured ? "border-[#FF5F03] ring-1 ring-[#FF5F03]" : "border-line"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("-mx-5 -mt-5 mb-4 rounded-t-3xl px-5 py-2.5 text-center text-sm font-semibold tracking-tight text-white", PLAN_BANNER[plan.id].tone === "orange" ? "bg-[#FF5F03]" : "bg-blue-700"),
								children: PLAN_BANNER[plan.id].text
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: `plan-${plan.id}`,
									className: "text-lg font-semibold tracking-tight",
									children: plan.name
								}), isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-muted",
									children: "Current plan"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: plan.blurb
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 flex flex-wrap items-baseline gap-x-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-3xl font-semibold tracking-tight tabular-nums",
										children: price === null ? "$0" : `$${useFounding ? price.founding : price.normal}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted",
										children: price === null ? "forever" : "per month"
									}),
									price && useFounding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm text-muted line-through tabular-nums",
										children: ["$", price.normal]
									}) : null
								]
							}),
							price && useFounding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs font-medium text-accent-strong",
								children: "Founding price, locked for 12 months"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 flex flex-1 flex-col gap-2.5",
								children: plan.features.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-2 text-sm text-ink-soft",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "mt-0.5 size-4 shrink-0 text-won",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [feature.text, feature.soon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1.5 rounded-full bg-mist px-2 py-0.5 text-xs text-muted",
										children: "coming soon"
									}) : null] })]
								}, feature.text))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5",
								children: [plan.id === "free" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									className: "w-full",
									disabled: true,
									children: isCurrent ? "You're on Free" : "Free forever"
								}) : entitlements.admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									className: "w-full",
									disabled: true,
									children: "Owner access"
								}) : isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "w-full",
									disabled: true,
									children: ["You're on ", plan.name]
								}) : paid && entitlements.tier === "growth" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "w-full",
									variant: featured ? "primary" : "secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: startCheckout(plan.id, useFounding, email),
										rel: "noopener",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
											className: "size-4",
											"aria-hidden": "true"
										}), paid ? `Switch to ${plan.name}` : useFounding ? `Join as a founding ${plan.name}` : `Choose ${plan.name}`]
									})
								}), plan.id !== "free" && !isCurrent && !entitlements.admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-center text-xs text-muted",
									children: "Secure checkout with Whop. Cancel any time."
								}) : null]
							})
						]
					}, plan.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs text-muted",
				children: "Checkout opens on Whop. Use the same email as your LeadKeep login so your plan switches on by itself."
			})
		]
	});
}
function FoundingBanner({ spotsLeft }) {
	if (spotsLeft !== null && spotsLeft <= 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft",
		children: [
			"All ",
			20,
			" founding spots are taken. Thank you to everyone who joined early."
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: "Founding member prices: Care $29, Growth $69 a month,"
				}),
				" locked for a year. Only for our first ",
				20,
				" members."
			]
		}), spotsLeft !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "rounded-full bg-paper px-3 py-1 text-sm font-semibold tabular-nums text-accent-strong",
			"aria-live": "polite",
			children: [
				spotsLeft,
				" of ",
				20,
				" spots left"
			]
		}) : null]
	});
}
function Subscription({ entitlements }) {
	const date = formatDate(entitlements.periodEnd);
	const name = entitlements.tier === "growth" ? "Growth" : "Care";
	const note = entitlements.status === "attention" ? {
		warn: true,
		text: `Your last payment didn't go through. Update your card to keep ${name}.`
	} : entitlements.status === "cancelling" ? {
		warn: false,
		text: date ? `Cancelled. ${name} stays on until ${date}.` : `Cancelled. ${name} stays on until the end of your paid month.`
	} : {
		warn: false,
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
					name,
					" plan",
					entitlements.founding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-strong",
						children: "Founding member"
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 text-sm", note.warn ? "text-lost" : "text-ink-soft"),
				children: note.text
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "secondary",
				className: "shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: WHOP_MANAGE_URL,
					target: "_blank",
					rel: "noopener noreferrer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
						className: "size-4",
						"aria-hidden": "true"
					}), entitlements.status === "attention" ? "Update card" : "Manage or cancel"]
				})
			})]
		})
	});
}
//#endregion
export { PricingPage as component };
