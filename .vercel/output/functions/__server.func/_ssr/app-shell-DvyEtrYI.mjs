import { S as require_jsx_runtime, b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Inbox, i as Link2, r as ScrollText, t as Wrench } from "../_libs/lucide-react.mjs";
import { d as useLeakKeep, r as Mark, s as cn, t as ClientGate } from "./fields-9FC-irLv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-DvyEtrYI.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
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
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base font-semibold tracking-tight",
				children: "LeakKeep"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Loading your lead desk"
			})]
		})
	});
}
function NavItem({ to, label, icon: Icon, active, count, stacked }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		"aria-current": active ? "page" : void 0,
		className: cn("press flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium", stacked && "min-h-16 flex-1 flex-col justify-center gap-1 px-1 text-xs", active ? "bg-primary-soft text-primary" : "text-muted hover:bg-mist hover:text-ink", stacked && active && "bg-transparent"),
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
function Shell({ children }) {
	const path = useRouterState({ select: (state) => state.location.pathname });
	const business = useLeakKeep((state) => state.business);
	const fresh = useLeakKeep((state) => state.leads.filter((lead) => lead.status === "new").length);
	const saveError = useLeakKeep((state) => state.saveError);
	const clearSaveError = useLeakKeep((state) => state.clearSaveError);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-mist md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 px-4 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-base font-semibold tracking-tight",
							children: "LeakKeep"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Lead desk"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-col gap-1 px-3",
						"aria-label": "Desk",
						children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
							...item,
							active: item.match(path),
							count: item.to === "/" ? fresh : void 0
						}, item.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto border-t border-line px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: business.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-muted",
							children: business.city || "Your service area"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "sticky top-0 z-10 border-b border-line bg-paper px-4 py-3 md:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold tracking-tight",
								children: "LeakKeep"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-muted",
								children: business.name
							})]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-10",
					children: [saveError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "alert",
						className: "mx-auto mb-5 flex max-w-5xl items-start justify-between gap-3 rounded-2xl border border-lost/30 bg-paper px-4 py-3 text-sm text-lost",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [saveError, " Your last change may not be saved."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: clearSaveError,
							className: "press shrink-0 font-medium",
							children: "Dismiss"
						})]
					}) : null, children]
				})]
			}),
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
export { AppShell as t };
