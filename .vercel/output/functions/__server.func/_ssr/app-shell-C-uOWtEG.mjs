import { i as __toESM } from "../_runtime.mjs";
import { C as updateLinkSource, S as updateLeadRow, a as fetchLeadById, c as fetchProfile, d as fetchTemplate, f as insertLinks, g as saveTemplate, h as saveProfile, i as fetchAllowance, m as quotesLeft, n as deleteLinkRow, o as fetchLeads, p as insertServices, r as deleteServiceRow, s as fetchLinks, u as fetchServices, v as subscribeToNewLeads, w as updateServiceRow } from "./data-CXsf9KMr.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ScrollText, i as Sparkles, l as Link2, n as Wrench, s as LogOut, t as X, u as Inbox } from "../_libs/lucide-react.mjs";
import { n as cn, t as Mark } from "./mark-BsAhVuvo.mjs";
import { i as starterServices, n as seedTemplate, r as starterLinkSources, t as blankBusiness } from "./seed-Cl0Dr4ti.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as useSession, i as startSessionListener, n as signOut } from "./session-bk7oaULO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-C-uOWtEG.js
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
		services: [],
		links: [],
		template: blank,
		leads: [],
		incoming: null,
		allowance: null,
		loadedFor: null,
		loadError: "",
		saveError: "",
		load: async (userId) => {
			try {
				let [services, template, leads, profile, links, allowance] = await Promise.all([
					fetchServices(),
					fetchTemplate(),
					fetchLeads(),
					fetchProfile(),
					fetchLinks(),
					fetchAllowance().catch(() => null)
				]);
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
						...blankBusiness,
						...legacy.business
					};
					await saveProfile(profile);
					if (links.length === 0) links = await insertLinks(legacy.sources.length ? legacy.sources : starterLinkSources);
				}
				set({
					services,
					leads,
					links,
					business: profile,
					template: template ?? blank,
					allowance,
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
				services: [],
				links: [],
				leads: [],
				incoming: null,
				allowance: null,
				template: blank,
				loadedFor: null,
				loadError: "",
				saveError: ""
			});
		},
		clearSaveError: () => set({ saveError: "" }),
		dismissIncoming: () => set({ incoming: null }),
		setAllowance: (allowance) => set({ allowance }),
		updateBusiness: (patch) => {
			set((state) => ({ business: {
				...state.business,
				...patch
			} }));
			later("business", () => saveProfile(get().business));
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
		addLink: async (source) => {
			const [link] = await insertLinks([source]);
			if (link) set((state) => ({ links: [link, ...state.links] }));
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
function PlanCard() {
	const allowance = useLeakKeep((state) => state.allowance);
	if (!allowance) return null;
	if (allowance.plan === "pro") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-primary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			className: "size-4",
			"aria-hidden": "true"
		}), "Pro plan"]
	});
	const used = Math.min(allowance.used, allowance.limit);
	const out = quotesLeft(allowance) === 0;
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
						allowance.limit,
						" AI quotes"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-1.5 overflow-hidden rounded-full bg-line",
				role: "progressbar",
				"aria-label": "AI quotes used this month",
				"aria-valuemin": 0,
				"aria-valuemax": allowance.limit,
				"aria-valuenow": used,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("h-full rounded-full transition-[width] duration-500", out ? "bg-lost" : "bg-primary"),
					style: { width: `${used / allowance.limit * 100}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/pricing",
				className: "press mt-3 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-paper text-sm font-medium text-primary ring-1 ring-line hover:ring-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					className: "size-4",
					"aria-hidden": "true"
				}), "Upgrade"]
			})
		]
	});
}
function PlanPill() {
	const allowance = useLeakKeep((state) => state.allowance);
	if (!allowance || allowance.plan === "pro") return null;
	const left = quotesLeft(allowance);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/pricing",
		className: cn("press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium", left === 0 ? "bg-lost-soft text-lost" : "bg-primary-soft text-primary"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			className: "size-3.5",
			"aria-hidden": "true"
		}), left === 0 ? "Upgrade" : `${left} left`]
	});
}
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
	const fresh = useLeakKeep((state) => state.leads.filter((lead) => lead.status === "new").length);
	const saveError = useLeakKeep((state) => state.saveError);
	const email = useSession((state) => state.user?.email ?? "");
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
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "sticky top-0 z-10 border-b border-line bg-paper px-4 py-3 md:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold tracking-tight",
									children: "LeakKeep"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm text-muted",
									children: business.name || email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanPill, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoutButton, { compact: true })
						]
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
export { useLeakKeep as n, AppShell as t };
