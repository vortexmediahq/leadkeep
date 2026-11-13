import { i as __toESM } from "../_runtime.mjs";
import { W as hasBranding, Y as isFixedPrice, lt as quoteReminder } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as CircleCheck, j as Check, k as CircleAlert } from "../_libs/lucide-react.mjs";
import { a as TextInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { g as useLeakKeep, n as AppShell, p as useAlerts, u as needsFollowUp } from "./app-shell-CkBjUj6N.mjs";
import { n as setupProgress, t as NOTIFY_SETUP_KEY } from "./setup-progress-wfvHHY4f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-aMvYWiuo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function notificationsChosen() {
	try {
		return window.localStorage.getItem(NOTIFY_SETUP_KEY) === "1";
	} catch {
		return false;
	}
}
function SetupRing() {
	const business = useLeakKeep((state) => state.business);
	const branding = useLeakKeep((state) => state.branding);
	const linksCount = useLeakKeep((state) => state.links.length);
	const questionnairesReady = useLeakKeep((state) => state.questionnairesReady);
	const questionnairesCount = useLeakKeep((state) => state.questionnaires.length);
	const namedServices = useLeakKeep((state) => state.services.filter((service) => service.name.trim()).length);
	const [chosen] = (0, import_react.useState)(notificationsChosen);
	const progress = (0, import_react.useMemo)(() => setupProgress({
		business,
		linksCount,
		questionnairesReady,
		questionnairesCount,
		namedServices,
		notificationsChosen: chosen,
		brandingReady: hasBranding(branding)
	}), [
		business,
		branding,
		linksCount,
		questionnairesReady,
		questionnairesCount,
		namedServices,
		chosen
	]);
	const radius = 18;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference * (1 - progress.percent / 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative size-16 shrink-0",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 44 44",
					className: "size-16 -rotate-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "22",
						cy: "22",
						r: radius,
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "4",
						className: "text-line"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "22",
						cy: "22",
						r: radius,
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "4",
						strokeLinecap: "round",
						strokeDasharray: circumference,
						strokeDashoffset: offset,
						className: "text-accent transition-[stroke-dashoffset] duration-500"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "absolute inset-0 grid place-items-center text-xs font-semibold tabular-nums text-ink",
					children: [progress.percent, "%"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold tracking-tight",
					children: "Your setup"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: progress.percent === 100 ? "You're set up. You can still change any of this later." : `${progress.done} of ${progress.total} important steps done.`
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 flex flex-col gap-1.5",
			children: progress.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: step.to,
				hash: step.hash,
				className: "press flex items-start gap-3 rounded-2xl px-2 py-2 hover:bg-mist",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border", step.done ? "border-won bg-won text-paper" : "border-line bg-paper text-transparent"),
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("block text-sm font-medium", step.done ? "text-ink-soft" : "text-ink"),
						children: step.label
					}), step.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted",
						children: step.note
					}) : null]
				})]
			}) }, step.id))
		})]
	});
}
var AVG_VALUE_KEY = "leadkeep.avgJobValue";
/** First number in a price like "R650", "R650–R1,200" or "from R500". Null when there isn't one. */
function priceNumber(price) {
	const match = price.replace(/\s(?=\d{3}\b)/g, "").match(/\d[\d,]*(?:\.\d+)?/);
	if (!match) return null;
	const value = Number(match[0].replace(/,/g, ""));
	return Number.isFinite(value) && value > 0 ? value : null;
}
/** Average of the saved service prices (the first number of each). Null when no service has a price. */
function averageServicePrice(services) {
	const values = services.map((service) => priceNumber(service.price)).filter((value) => value !== null);
	if (!values.length) return null;
	return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
/** A lead is "left on the table" when it still needs a follow-up: new for a day, or a quote with no reply in 2+ days. */
function leadsWithoutFollowUp(leads, now = /* @__PURE__ */ new Date()) {
	return leads.filter((lead) => lead.status !== "won" && lead.status !== "lost" && lead.quoteState !== "accepted" && (needsFollowUp(lead, now) || quoteReminder(lead, now)));
}
function moneyLeft(leads, avgValue, now = /* @__PURE__ */ new Date()) {
	const count = leadsWithoutFollowUp(leads, now).length;
	return {
		count,
		amount: avgValue && avgValue > 0 ? Math.round(avgValue * count) : null
	};
}
function money(currency, amount) {
	return `${currency || "R"}${Math.round(amount).toLocaleString("en-US")}`;
}
var monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
/** Leads per calendar month for the last `months` months, oldest first. */
function monthlyCounts(leads, months = 6, now = /* @__PURE__ */ new Date()) {
	const slots = [];
	for (let i = months - 1; i >= 0; i -= 1) {
		const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
		slots.push({
			key: monthKey(date),
			label: date.toLocaleString("en-US", { month: "short" }),
			leads: 0,
			won: 0
		});
	}
	for (const lead of leads) {
		const created = new Date(lead.createdAt);
		if (Number.isNaN(created.getTime())) continue;
		const slot = slots.find((item) => item.key === monthKey(created));
		if (!slot) continue;
		slot.leads += 1;
		if (lead.status === "won") slot.won += 1;
	}
	return slots;
}
function dashboardStats(leads, now = /* @__PURE__ */ new Date()) {
	const thisKey = monthKey(now);
	const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
	let thisMonth = 0;
	let lastMonth = 0;
	let thisYear = 0;
	for (const lead of leads) {
		const created = new Date(lead.createdAt);
		if (Number.isNaN(created.getTime())) continue;
		const key = monthKey(created);
		if (key === thisKey) thisMonth += 1;
		if (key === lastKey) lastMonth += 1;
		if (created.getFullYear() === now.getFullYear()) thisYear += 1;
	}
	const won = leads.filter((lead) => lead.status === "won" || lead.quoteState === "accepted").length;
	const quoted = leads.filter((lead) => lead.quoteState === "sent" || lead.quoteState === "viewed" || lead.quoteState === "accepted" || lead.status === "quoted");
	return {
		thisMonth,
		lastMonth,
		thisYear,
		total: leads.length,
		won,
		winRate: leads.length ? Math.round(won / leads.length * 100) : null,
		quotesSent: quoted.length,
		quotesViewed: leads.filter((lead) => lead.quoteState === "viewed" || lead.quoteState === "accepted").length,
		quotesAccepted: leads.filter((lead) => lead.quoteState === "accepted").length
	};
}
var INSTANT_MS = 3e5;
/**
* Honest 0-100 score, with the reasons shown:
* 40 for having an auto-send quote link on a clear price, 40 for the share of leads that actually got an instant quote
* (within 5 minutes, no owner work), 20 for email alerts being on.
*/
function automationScore(input) {
	const ready = input.links.some((link) => {
		if (link.kind !== "quote" || !link.autoSend || !link.serviceId) return false;
		const service = input.services.find((item) => item.id === link.serviceId);
		return !!service && isFixedPrice(service.price);
	});
	const instant = input.leads.filter((lead) => {
		if (!lead.quoteSentAt || !lead.quoteState) return false;
		const gap = Date.parse(lead.quoteSentAt) - Date.parse(lead.createdAt);
		return Number.isFinite(gap) && gap >= -6e4 && gap <= INSTANT_MS;
	}).length;
	const share = input.leads.length ? instant / input.leads.length : 0;
	const reasons = [
		{
			id: "link",
			label: "A quote link that sends by itself",
			points: ready ? 40 : 0,
			max: 40,
			tip: ready ? "Done. Your quote link goes out on its own." : "Make a quote link for a service with one clear price and leave 'Send straight away' on."
		},
		{
			id: "instant",
			label: "Leads that got an instant quote",
			points: Math.round(share * 40),
			max: 40,
			tip: input.leads.length ? `${instant} of ${input.leads.length} leads got a quote within 5 minutes.` : "Fills in as leads arrive."
		},
		{
			id: "alerts",
			label: "Email alerts for new leads",
			points: input.emailAlerts ? 20 : 0,
			max: 20,
			tip: input.emailAlerts ? "On." : "Turn on email alerts in Settings."
		}
	];
	return {
		score: reasons.reduce((sum, reason) => sum + reason.points, 0),
		reasons
	};
}
function DashboardPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
}
function readAvg() {
	try {
		return window.localStorage.getItem("leadkeep.avgJobValue") ?? "";
	} catch {
		return "";
	}
}
function Stat({ label, value, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line bg-paper p-4 shadow-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-3xl font-semibold tracking-tight tabular-nums",
				children: value
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: note
			}) : null
		]
	});
}
function Dashboard() {
	const leads = useLeakKeep((state) => state.leads);
	const services = useLeakKeep((state) => state.services);
	const links = useLeakKeep((state) => state.links);
	const currency = useLeakKeep((state) => state.business.currency) || "R";
	const channel = useAlerts((state) => state.channel);
	const [avgText, setAvgText] = (0, import_react.useState)("");
	const [view, setView] = (0, import_react.useState)("month");
	(0, import_react.useEffect)(() => setAvgText(readAvg()), []);
	const fromServices = (0, import_react.useMemo)(() => averageServicePrice(services), [services]);
	const typed = Number(avgText.replace(/[^\d.]/g, ""));
	const avg = typed > 0 ? typed : fromServices;
	const left = (0, import_react.useMemo)(() => moneyLeft(leads, avg), [leads, avg]);
	const stats = (0, import_react.useMemo)(() => dashboardStats(leads), [leads]);
	const months = (0, import_react.useMemo)(() => monthlyCounts(leads, view === "month" ? 6 : 12), [leads, view]);
	const peak = Math.max(1, ...months.map((month) => month.leads));
	const automation = (0, import_react.useMemo)(() => automationScore({
		leads,
		links,
		services,
		emailAlerts: channel === "email" || channel === "both"
	}), [
		leads,
		links,
		services,
		channel
	]);
	const onAvg = (value) => {
		setAvgText(value);
		try {
			window.localStorage.setItem(AVG_VALUE_KEY, value);
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "How your leads are doing, and what needs you today."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupRing, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Money left on the table",
				className: "rounded-3xl border border-accent/40 bg-accent-soft p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-ink",
						children: "Money left on the table"
					}),
					left.amount !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-4xl font-semibold tracking-tight tabular-nums",
						children: money(currency, left.amount)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-ink-soft",
						children: left.count === 0 ? "Nothing waiting. Every lead has had a follow-up." : `${left.count} ${left.count === 1 ? "lead is" : "leads are"} waiting for a follow-up, at about ${money(currency, avg ?? 0)} a job.`
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-ink-soft",
						children: "Add a price to a service, or type your average job value below, and LeadKeep will show what's waiting."
					}),
					left.count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary",
						children: "Open my leads and follow up →"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 max-w-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							id: "avg-job",
							label: `Average job value (${currency})`,
							hint: fromServices && !typed ? `Using the average of your service prices (${money(currency, fromServices)}).` : "Saved on this device.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								id: "avg-job",
								inputMode: "decimal",
								value: avgText,
								placeholder: fromServices ? String(fromServices) : "e.g. 1500",
								onChange: (event) => onAvg(event.target.value)
							})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Your numbers",
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Leads this month",
						value: stats.thisMonth,
						note: stats.lastMonth ? `${stats.lastMonth} last month` : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Leads this year",
						value: stats.thisYear
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Won",
						value: stats.won,
						note: stats.winRate !== null ? `${stats.winRate}% of all leads` : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "All leads",
						value: stats.total
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Quotes",
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight",
					children: "Your quotes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "mt-3 grid grid-cols-3 gap-3 text-center",
					children: [
						["Sent", stats.quotesSent],
						["Viewed", stats.quotesViewed],
						["Accepted", stats.quotesAccepted]
					].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-mist px-2 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-sm text-muted",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "text-2xl font-semibold tabular-nums",
							children: value
						})]
					}, label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Leads over time",
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Leads over time"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1",
						role: "group",
						"aria-label": "Time range",
						children: ["month", "year"].map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": view === option,
							onClick: () => setView(option),
							className: cn("press h-9 rounded-full px-3 text-sm font-medium", view === option ? "bg-ink text-paper" : "border border-line text-ink-soft"),
							children: option === "month" ? "6 months" : "12 months"
						}, option))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 flex h-40 items-end gap-2",
					"aria-label": "Leads per month",
					children: months.map((month) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs tabular-nums text-muted",
								children: month.leads
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-full rounded-t-md bg-primary",
								style: {
									height: `${Math.max(month.leads ? 6 : 2, month.leads / peak * 100)}%`,
									opacity: month.leads ? 1 : .25
								},
								title: `${month.label}: ${month.leads} leads, ${month.won} won`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: month.label
							})
						]
					}, month.key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Automation score",
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold tracking-tight",
							children: "Automation score"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-2xl font-semibold tabular-nums",
							children: [automation.score, "/100"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "How much of the work LeadKeep does for you, and what would raise it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-3",
						children: automation.reasons.map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3",
							children: [reason.points >= reason.max ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
								className: "mt-0.5 size-5 shrink-0 text-won",
								"aria-hidden": "true"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
								className: "mt-0.5 size-5 shrink-0 text-accent-strong",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [
										reason.label,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-normal text-muted",
											children: [
												"· ",
												reason.points,
												"/",
												reason.max
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-ink-soft",
									children: reason.tip
								})]
							})]
						}, reason.id))
					})
				]
			})
		]
	});
}
//#endregion
export { DashboardPage as component };
