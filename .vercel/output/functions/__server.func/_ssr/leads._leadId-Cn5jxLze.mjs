import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as ChevronLeft } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-CIuwgEj1.mjs";
import { a as TextArea, d as useLeakKeep, i as SelectInput, s as cn } from "./fields-9FC-irLv.mjs";
import { t as Button } from "./button-BCzTNtt4.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as AppShell } from "./app-shell-DvyEtrYI.mjs";
import { n as StatusBadge, t as STATUSES } from "./status-badge-Db6qe6Ua.mjs";
import { n as format, t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads._leadId-Cn5jxLze.js
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
function clip(value, max) {
	const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
	if (text.length <= max) return text;
	return `${text.slice(0, max - 1).trimEnd()}…`;
}
function asInput(input) {
	const raw = input ?? {};
	const business = raw.business ?? {};
	const template = raw.template ?? {};
	const lead = raw.lead ?? {};
	const services = Array.isArray(raw.services) ? raw.services.slice(0, 30) : [];
	return {
		business: {
			name: clip(business.name, 80),
			trade: clip(business.trade, 140),
			city: clip(business.city, 80),
			phone: clip(business.phone, 40),
			email: clip(business.email, 80),
			currency: clip(business.currency, 8) || "R"
		},
		services: services.map((service) => ({
			name: clip(service?.name, 80),
			description: clip(service?.description, 280),
			price: clip(service?.price, 80),
			notes: clip(service?.notes, 200)
		})),
		template: {
			tone: clip(template.tone, 700),
			structure: clip(template.structure, 900),
			paymentTerms: clip(template.paymentTerms, 700),
			warranty: clip(template.warranty, 700),
			extra: clip(template.extra, 700)
		},
		lead: {
			name: clip(lead.name, 80),
			phone: clip(lead.phone, 40),
			email: clip(lead.email, 80),
			address: clip(lead.address, 160),
			jobType: clip(lead.jobType, 80),
			description: clip(lead.description, 1200),
			urgency: clip(lead.urgency, 40),
			preferredTime: clip(lead.preferredTime, 40),
			propertyType: clip(lead.propertyType, 40),
			budget: clip(lead.budget, 120),
			accessNotes: clip(lead.accessNotes, 300),
			source: clip(lead.source, 80)
		}
	};
}
var generateQuote = createServerFn({ method: "POST" }).validator((input) => asInput(input)).handler(createSsrRpc("c211341b0a0f31208e5c139f62be53a08fa757f216e39ba50286f495ee055735"));
function LeadPage() {
	const { leadId } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadDetail, { leadId }) });
}
function LeadDetail({ leadId }) {
	const lead = useLeakKeep((state) => state.leads.find((item) => item.id === leadId));
	const business = useLeakKeep((state) => state.business);
	const services = useLeakKeep((state) => state.services);
	const template = useLeakKeep((state) => state.template);
	const updateLead = useLeakKeep((state) => state.updateLead);
	const setStatus = useLeakKeep((state) => state.setStatus);
	const [text, setText] = (0, import_react.useState)(lead?.quote ?? "");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setText(lead?.quote ?? "");
		setError("");
		setCopied(false);
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
	const saveText = (value) => {
		setText(value);
		updateLead(current.id, {
			quote: value,
			quoteUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	};
	const onGenerate = async () => {
		setPending(true);
		setError("");
		try {
			const result = await generateQuote({ data: {
				business,
				services: services.map(({ name, description, price, notes }) => ({
					name,
					description,
					price,
					notes
				})),
				template,
				lead: {
					name: current.name,
					phone: current.phone,
					email: current.email,
					address: current.address,
					jobType: current.jobType,
					description: current.description,
					urgency: current.urgency,
					preferredTime: current.preferredTime,
					propertyType: current.propertyType,
					budget: current.budget,
					accessNotes: current.accessNotes,
					source: current.source
				}
			} });
			if (!result.ok) {
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
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-lost",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: () => void onGenerate(),
								disabled: pending,
								children: pending ? "Writing quote…" : text.trim() ? "Regenerate quote" : "Generate quote"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								variant: "secondary",
								onClick: () => void onCopy(),
								disabled: !text.trim() || pending,
								children: copied ? "Copied" : "Copy"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							className: "mt-4 min-h-80 font-serif leading-relaxed",
							value: text,
							onChange: (event) => saveText(event.target.value),
							readOnly: pending,
							"aria-label": "Quote",
							placeholder: "Your quote will land here. You can edit every line before you send it."
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
