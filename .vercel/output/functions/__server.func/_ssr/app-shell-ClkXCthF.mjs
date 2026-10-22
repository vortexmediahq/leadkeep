import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Link2, i as LogOut, o as Inbox, r as ScrollText, t as Wrench } from "../_libs/lucide-react.mjs";
import { n as Mark, o as cn } from "./fields-B5r7wua3.mjs";
import { r as useLeakKeep } from "./store-DKW15xVj.mjs";
import { a as useSession, i as startSessionListener, n as signOut } from "./session-BtLIdwA_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-ClkXCthF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var rehydrated = null;
function rehydrateLocal() {
	rehydrated ??= Promise.resolve(useLeakKeep.persist.rehydrate()).catch(() => void 0);
	return rehydrated;
}
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
		rehydrateLocal().then(() => useLeakKeep.getState().load(userId)).finally(() => {
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: business.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-muted",
								title: email,
								children: email
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoutButton, {})
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
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold tracking-tight",
									children: "LeakKeep"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm text-muted",
									children: business.name
								})]
							}),
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
