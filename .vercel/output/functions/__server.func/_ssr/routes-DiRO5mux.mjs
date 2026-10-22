import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as useLeakKeep, l as oneLine, o as TextInput, s as cn } from "./fields-CleTNQx1.mjs";
import { t as AppShell } from "./app-shell-DZys6Ba0.mjs";
import { n as StatusBadge, t as STATUSES } from "./status-badge-BnZ9r74a.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DiRO5mux.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
}
function Dashboard() {
	const leads = useLeakKeep((state) => state.leads);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const counts = (0, import_react.useMemo)(() => {
		const base = {
			all: leads.length,
			new: 0,
			contacted: 0,
			quoted: 0,
			won: 0,
			lost: 0
		};
		for (const lead of leads) base[lead.status] += 1;
		return base;
	}, [leads]);
	const needle = query.trim().toLowerCase();
	const visible = leads.filter((lead) => filter === "all" || lead.status === filter).filter((lead) => {
		if (!needle) return true;
		return `${lead.name} ${lead.jobType} ${lead.description} ${lead.source} ${lead.phone}`.toLowerCase().includes(needle);
	}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	const fresh = counts.new;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Leads"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: fresh > 0 ? `${fresh} new · ${counts.all} total` : `${counts.all} on your desk`
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Search name, job, or source",
					"aria-label": "Search leads"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					role: "group",
					"aria-label": "Filter by status",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						label: "All",
						count: counts.all,
						active: filter === "all",
						onClick: () => setFilter("all")
					}), STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						label: status.label,
						count: counts[status.id],
						active: filter === status.id,
						onClick: () => setFilter(status.id)
					}, status.id))]
				})
			]
		}), visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-line bg-paper px-4 py-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: leads.length === 0 ? "No leads yet" : "Nothing matches this view"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: leads.length === 0 ? "Share a lead link. New jobs show up here as soon as someone sends the form." : "Try another status, or clear the search."
				}),
				leads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/links",
					className: "mt-4 inline-flex text-sm font-medium text-primary",
					children: "Get a lead link"
				}) : null
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "overflow-hidden rounded-3xl border border-line bg-paper shadow-panel",
			children: visible.map((lead) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "border-b border-line last:border-b-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/leads/$leadId",
					params: { leadId: lead.id },
					className: "block px-4 py-4 transition-colors duration-150 hover:bg-mist",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 font-medium",
								children: lead.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: lead.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block truncate text-sm text-ink-soft",
							children: [lead.jobType || "General enquiry", lead.description ? ` — ${oneLine(lead.description, 80)}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block text-sm text-muted",
							children: [
								lead.source,
								" · ",
								formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
							]
						})
					]
				})
			}, lead.id))
		})]
	});
}
function FilterChip({ label, count, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": active,
		onClick,
		className: cn("press h-10 shrink-0 rounded-full px-3 text-sm font-medium", active ? "bg-ink text-paper" : "border border-line bg-paper text-ink-soft"),
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-2 tabular-nums",
			children: count
		})]
	});
}
//#endregion
export { DashboardPage as component };
