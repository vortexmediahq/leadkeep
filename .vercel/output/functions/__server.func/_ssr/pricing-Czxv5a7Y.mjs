import { i as __toESM } from "../_runtime.mjs";
import { m as quotesLeft } from "./data-CeVsywp6.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Check, i as Sparkles, u as ChevronLeft } from "../_libs/lucide-react.mjs";
import { n as cn } from "./mark-BsAhVuvo.mjs";
import { t as Button } from "./button-BhX55BEi.mjs";
import { n as useLeakKeep, t as AppShell } from "./app-shell-B60iWQsn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pricing-Czxv5a7Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function PricingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pricing, {}) });
}
function Pricing() {
	const allowance = useLeakKeep((state) => state.allowance);
	const current = allowance?.plan ?? "free";
	const [notice, setNotice] = (0, import_react.useState)(false);
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
								}) : featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "w-full",
									onClick: () => setNotice(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
										className: "size-4",
										"aria-hidden": "true"
									}), "Upgrade to Pro"]
								}) : null
							})
						]
					}, plan.id);
				})
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft",
				children: "Online payment is coming soon. Pro isn't available to buy yet, and your free quotes reset on the 1st of each month."
			}) : null
		]
	});
}
//#endregion
export { PricingPage as component };
