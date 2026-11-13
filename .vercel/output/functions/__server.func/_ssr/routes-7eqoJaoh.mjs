import { i as __toESM } from "../_runtime.mjs";
import { X as leadsToCsv, Z as lockedCount, lt as quoteReminder, s as LOCKED_PLACEHOLDER } from "./data-vq0z3oFT.mjs";
import { r as oneLine, t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as Download, a as Sparkles, g as Lock } from "../_libs/lucide-react.mjs";
import { a as TextInput } from "./fields-Zm5jyQkz.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { f as useAccess, h as useGatedLeads, n as AppShell, u as needsFollowUp } from "./app-shell-CkBjUj6N.mjs";
import { n as STATUSES } from "./types-DRh0686U.mjs";
import { t as LeadBadge } from "./status-badge-CWLT8zrl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-7eqoJaoh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
}
function Dashboard() {
	const leads = useGatedLeads();
	const access = useAccess();
	const hidden = lockedCount(leads);
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
		if (lead.locked) return false;
		return `${lead.name} ${lead.jobType} ${lead.description} ${lead.source} ${lead.phone}`.toLowerCase().includes(needle);
	}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	const fresh = counts.new;
	const exportCsv = () => {
		const blob = new Blob([leadsToCsv(leads)], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `leadkeep-leads-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	};
	const overdue = leads.filter((lead) => needsFollowUp(lead)).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold tracking-tight",
							children: "Leads"
						}), access.features.csvExport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: exportCsv,
							disabled: leads.length === 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Export CSV"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/pricing",
								"aria-label": "Export CSV is on Care and Growth",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
									className: "size-4",
									"aria-hidden": "true"
								}), "Export CSV"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: fresh > 0 ? `${fresh} new · ${counts.all} total` : `${counts.all} in your inbox`
					}),
					overdue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 rounded-xl bg-accent/10 px-3 py-2 text-sm",
						children: [overdue === 1 ? "1 lead has" : `${overdue} leads have`, " waited over a day. Give them a call or WhatsApp today."]
					}) : null
				] }),
				hidden > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-ink",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold",
								children: [
									hidden,
									" ",
									hidden === 1 ? "lead is" : "leads are",
									" saved and waiting."
								]
							}),
							" ",
							"Your Free plan shows the details of your first 10 leads. Upgrade to see who ",
							hidden === 1 ? "this is" : "they are",
							" and reply."
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/pricing",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Unlock my leads"]
						})
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Search name, answers, or source",
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
					className: "mx-auto mt-2 max-w-sm text-sm text-muted",
					children: leads.length === 0 ? "Share your questionnaire link to get your first one. New leads show up here the moment someone answers." : "Try another status, or clear the search."
				}),
				leads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/links",
							children: "Get your link"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/questions",
							children: "Edit your questions"
						})
					})]
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex min-w-0 items-center gap-2 font-medium",
								children: [lead.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
									className: "size-4 shrink-0 text-accent-strong",
									"aria-label": "Hidden until you upgrade"
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("truncate", lead.locked && "select-none blur-[5px]"),
									"aria-hidden": lead.locked,
									children: lead.locked ? "Jordan Example" : lead.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 items-center gap-2",
								children: [needsFollowUp(lead) || quoteReminder(lead) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-strong",
									children: "Follow up"
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadBadge, { lead })]
							})]
						}),
						lead.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block truncate text-sm text-ink-soft",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "select-none blur-[5px]",
								"aria-hidden": "true",
								children: "Wants a quote for their wedding in March"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: LOCKED_PLACEHOLDER.line
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
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
