import { i as __toESM } from "../_runtime.mjs";
import { n as supabase } from "./supabase-DVps23Si.mjs";
import { m as quotesLeft } from "./data-CeVsywp6.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Check, i as Sparkles, l as Copy, u as ChevronLeft } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-BNwn92cE.mjs";
import { n as cn } from "./mark-BsAhVuvo.mjs";
import { n as SelectInput, r as TextArea } from "./fields-4PDzMwcF.mjs";
import { t as Button } from "./button-BhX55BEi.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as useLeakKeep, t as AppShell } from "./app-shell-B60iWQsn.mjs";
import { n as StatusBadge, t as STATUSES } from "./status-badge-BmeSX9uM.mjs";
import { n as format, t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads._leadId-CA8s3sP2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function asRequest(input) {
	const raw = input ?? {};
	return {
		leadId: typeof raw.leadId === "string" && UUID.test(raw.leadId) ? raw.leadId : "",
		accessToken: typeof raw.accessToken === "string" ? raw.accessToken.slice(0, 4096) : ""
	};
}
var generateQuote = createServerFn({ method: "POST" }).validator((input) => asRequest(input)).handler(createSsrRpc("c211341b0a0f31208e5c139f62be53a08fa757f216e39ba50286f495ee055735"));
function LeadPage() {
	const { leadId } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadDetail, { leadId }) });
}
function LeadDetail({ leadId }) {
	const lead = useLeakKeep((state) => state.leads.find((item) => item.id === leadId));
	const hasServices = useLeakKeep((state) => state.services.some((service) => service.name.trim()));
	const hasStyle = useLeakKeep((state) => [
		state.template.tone,
		state.template.structure,
		state.template.paymentTerms
	].some((part) => part.trim()));
	const flushSaves = useLeakKeep((state) => state.flushSaves);
	const allowance = useLeakKeep((state) => state.allowance);
	const setAllowance = useLeakKeep((state) => state.setAllowance);
	const updateLead = useLeakKeep((state) => state.updateLead);
	const setStatus = useLeakKeep((state) => state.setStatus);
	const [text, setText] = (0, import_react.useState)(lead?.quote ?? "");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [confirmReplace, setConfirmReplace] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setText(lead?.quote ?? "");
		setError("");
		setCopied(false);
		setConfirmReplace(false);
	}, [lead?.id]);
	if (!lead) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "We couldn't find this lead"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "The link may be out of date."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-4 inline-flex text-sm font-medium text-primary",
				children: "Back to leads"
			})
		]
	});
	const current = lead;
	const outOfQuotes = allowance?.plan === "free" && quotesLeft(allowance) === 0;
	const saveText = (value) => {
		setText(value);
		updateLead(current.id, {
			quote: value,
			quoteUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	};
	const onGenerate = async () => {
		setConfirmReplace(false);
		setPending(true);
		setError("");
		try {
			await flushSaves().catch(() => void 0);
			const { data: auth } = await supabase.auth.getSession();
			const accessToken = auth.session?.access_token;
			if (!accessToken) {
				setError("Your session has expired. Log in again to write quotes.");
				return;
			}
			const result = await generateQuote({ data: {
				leadId: current.id,
				accessToken
			} });
			if (result.allowance) setAllowance(result.allowance);
			if (!result.ok) {
				if (result.limitReached) return;
				setError(result.error);
				return;
			}
			saveText(result.text);
			if (current.status === "new" || current.status === "contacted") setStatus(current.id, "quoted");
		} catch {
			setError("The quote didn't come back. Try again.");
		} finally {
			setPending(false);
		}
	};
	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2e3);
		} catch {
			setError("Couldn't copy. Select the quote and copy it manually.");
		}
	};
	const rows = [
		["Phone", lead.phone],
		["Email", lead.email],
		["Address", lead.address],
		["Job", lead.jobType],
		["Urgency", lead.urgency],
		["Preferred time", lead.preferredTime],
		["Property", lead.propertyType],
		["Budget", lead.budget],
		["Access", lead.accessNotes]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-5xl flex-col gap-5",
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
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: lead.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							lead.source,
							" · ",
							format(new Date(lead.createdAt), "d MMM yyyy, HH:mm"),
							" ·",
							" ",
							formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: lead.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold tracking-tight",
							children: "Questionnaire"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-2",
							children: [rows.map(([label, value]) => value.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-sm text-muted",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-base break-words text-ink",
									children: value
								})]
							}, label) : null), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-line py-3 last:border-b-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-sm text-muted",
									children: "What they told you"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 text-base break-words whitespace-pre-wrap text-ink",
									children: lead.description
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-sm font-medium",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "sm:hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
										"aria-label": "Status",
										value: lead.status,
										onChange: (event) => setStatus(lead.id, event.target.value),
										children: STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: status.id,
											children: status.label
										}, status.id))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden gap-2 sm:grid sm:grid-cols-5",
									role: "group",
									"aria-label": "Status",
									children: STATUSES.map((status) => {
										const on = lead.status === status.id;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": on,
											onClick: () => setStatus(lead.id, status.id),
											className: cn("press h-11 rounded-lg border text-sm font-medium", on ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft"),
											children: status.label
										}, status.id);
									})
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "rounded-3xl border border-line bg-paper p-4 shadow-panel lg:sticky lg:top-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold tracking-tight",
							children: "Quote"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Uses this job, your",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/services",
									className: "font-medium text-primary",
									children: "services"
								}),
								", and your",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/quote-style",
									className: "font-medium text-primary",
									children: "quote style"
								}),
								"."
							]
						}),
						!hasServices || !hasStyle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 rounded-xl bg-primary-soft px-3 py-2 text-sm text-ink-soft",
							children: [!hasServices ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Add your",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/services",
									className: "font-medium text-primary",
									children: "services and prices"
								}),
								" ",
								"so quotes show real numbers.",
								" "
							] }) : null, !hasStyle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Set your",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/quote-style",
									className: "font-medium text-primary",
									children: "quote style"
								}),
								" ",
								"so quotes sound like you."
							] }) : null]
						}) : null,
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "mt-3 text-sm text-lost",
							children: error
						}) : null,
						outOfQuotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl border border-primary/30 bg-primary-soft p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium text-ink",
									children: [
										"You've used all ",
										allowance?.limit,
										" free AI quotes this month"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-ink-soft",
									children: "You can still write and edit this quote yourself. Upgrade for unlimited AI quotes."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/pricing",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
											className: "size-4",
											"aria-hidden": "true"
										}), "See plans"]
									})
								})
							]
						}) : confirmReplace ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl border border-line bg-mist p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-ink",
								children: "Replace the current quote and your edits with a fresh one?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => void onGenerate(),
									children: "Replace quote"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setConfirmReplace(false),
									children: "Keep current"
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-4 w-full",
							onClick: () => text.trim() ? setConfirmReplace(true) : void onGenerate(),
							disabled: pending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "size-4",
								"aria-hidden": "true"
							}), pending ? "Writing quote…" : text.trim() ? "Regenerate quote" : "Generate quote"]
						}),
						allowance?.plan === "free" && !outOfQuotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-center text-xs text-muted",
							children: [
								quotesLeft(allowance),
								" of ",
								allowance.limit,
								" free AI quotes left this month ·",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/pricing",
									className: "font-medium text-primary",
									children: "Upgrade"
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							htmlFor: "quote-text",
							className: "mt-4 block text-sm font-medium",
							children: ["Quote text", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-normal text-muted",
								children: " · edit anything before you send"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							id: "quote-text",
							className: cn("mt-2 min-h-96 font-serif leading-relaxed", pending && "animate-pulse opacity-60"),
							value: text,
							onChange: (event) => saveText(event.target.value),
							readOnly: pending,
							placeholder: "Your quote will land here, built from this job, your prices and your quote style."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-3 w-full",
							variant: text.trim() && !pending ? "primary" : "secondary",
							onClick: () => void onCopy(),
							disabled: !text.trim() || pending,
							"aria-live": "polite",
							children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "size-4",
								"aria-hidden": "true"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
								className: "size-4",
								"aria-hidden": "true"
							}), copied ? "Copied to clipboard" : "Copy Quote"]
						}),
						lead.quoteUpdatedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: ["Saved ", formatDistanceToNow(new Date(lead.quoteUpdatedAt), { addSuffix: true })]
						}) : null
					]
				})]
			})
		]
	});
}
//#endregion
export { LeadPage as component };
