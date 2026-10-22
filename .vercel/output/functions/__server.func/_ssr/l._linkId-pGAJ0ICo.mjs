import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as Check } from "../_libs/lucide-react.mjs";
import { r as Route$1 } from "./router-CIuwgEj1.mjs";
import { a as TextArea, c as firstName, d as useLeakKeep, i as SelectInput, n as Field, o as TextInput, r as Mark, s as cn, t as ClientGate } from "./fields-9FC-irLv.mjs";
import { t as Button } from "./button-BCzTNtt4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/l._linkId-pGAJ0ICo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var URGENCY = [
	"Emergency",
	"This week",
	"Flexible"
];
var PROPERTY = [
	"House",
	"Apartment",
	"Business"
];
var TIMES = [
	"Morning",
	"Afternoon",
	"Evening",
	"Anytime"
];
function FormSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-mist px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-base font-semibold tracking-tight",
			children: "Request a quote"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Loading the form"
		})]
	});
}
function PublicPage() {
	const { linkId } = Route$1.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientGate, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Capture, { linkId })
	});
}
function Capture({ linkId }) {
	const link = useLeakKeep((state) => state.links.find((item) => item.id === linkId));
	const business = useLeakKeep((state) => state.business);
	const services = useLeakKeep((state) => state.services);
	const addLead = useLeakKeep((state) => state.addLead);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [jobType, setJobType] = (0, import_react.useState)("");
	const [customJob, setCustomJob] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [urgency, setUrgency] = (0, import_react.useState)("");
	const [preferredTime, setPreferredTime] = (0, import_react.useState)("");
	const [propertyType, setPropertyType] = (0, import_react.useState)("");
	const [budget, setBudget] = (0, import_react.useState)("");
	const [accessNotes, setAccessNotes] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [done, setDone] = (0, import_react.useState)(null);
	const [sending, setSending] = (0, import_react.useState)(false);
	const [sendError, setSendError] = (0, import_react.useState)("");
	const tradeLine = [business.trade, business.city].filter(Boolean).join(" · ");
	const serviceNames = services.map((service) => service.name).filter(Boolean);
	const active = link ?? {
		id: linkId,
		source: linkId.charAt(0).toUpperCase() + linkId.slice(1)
	};
	const submit = async (event) => {
		event.preventDefault();
		const next = {};
		if (!name.trim()) next.name = "Add your name.";
		if (phone.trim().length < 7) next.phone = "Add a phone number we can reach you on.";
		if (!jobType) next.job = "Choose the kind of job.";
		if (jobType === "Something else" && !customJob.trim()) next.customJob = "Tell us what you need.";
		if (description.trim().length < 8) next.description = "A sentence or two is enough.";
		if (!urgency) next.urgency = "Choose how soon you need someone.";
		setErrors(next);
		if (Object.keys(next).length) return;
		setSending(true);
		setSendError("");
		try {
			const id = await addLead({
				linkId: active.id,
				source: active.source,
				name: name.trim(),
				phone: phone.trim(),
				email: email.trim(),
				address: address.trim(),
				jobType: jobType === "Something else" ? customJob.trim() : jobType,
				description: description.trim(),
				urgency,
				preferredTime,
				propertyType,
				budget: budget.trim(),
				accessNotes: accessNotes.trim()
			});
			setDone({
				id,
				name: name.trim()
			});
		} catch {
			setSendError("Your request didn't go through. Check your connection and try again.");
		} finally {
			setSending(false);
		}
	};
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-12 place-items-center rounded-full bg-primary-soft text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-6",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-2xl font-semibold tracking-tight",
					children: "Request received"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-base text-ink-soft",
					children: [
						firstName(done.name),
						", ",
						business.name || "the business",
						" has the details and will be in touch."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-6 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/leads/$leadId",
						params: { leadId: done.id },
						children: "View this lead"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-lg font-semibold tracking-tight",
						children: business.name || "Request a quote"
					}), tradeLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-muted",
						children: tradeLine
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => void submit(event),
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				noValidate: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: "Request a quote"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Tell us about the job. ",
							business.name || "We",
							" will come back with a price."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-name",
								label: "Your name",
								error: errors.name,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "cust-name",
									autoComplete: "name",
									value: name,
									onChange: (event) => setName(event.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-5 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "cust-phone",
									label: "Phone",
									error: errors.phone,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										id: "cust-phone",
										autoComplete: "tel",
										inputMode: "tel",
										value: phone,
										onChange: (event) => setPhone(event.target.value)
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "cust-email",
									label: "Email",
									hint: "Optional",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										id: "cust-email",
										autoComplete: "email",
										inputMode: "email",
										value: email,
										onChange: (event) => setEmail(event.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-address",
								label: "Address or suburb",
								hint: "Optional, but it helps with timing.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "cust-address",
									autoComplete: "street-address",
									value: address,
									onChange: (event) => setAddress(event.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-job",
								label: "What do you need?",
								error: errors.job,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
									id: "cust-job",
									value: jobType,
									onChange: (event) => setJobType(event.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Choose a service"
										}),
										serviceNames.map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: service,
											children: service
										}, service)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Something else",
											children: "Something else"
										})
									]
								})
							}),
							jobType === "Something else" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-custom",
								label: "Describe the job type",
								error: errors.customJob,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "cust-custom",
									value: customJob,
									onChange: (event) => setCustomJob(event.target.value)
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-desc",
								label: "What's going on?",
								error: errors.description,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
									id: "cust-desc",
									value: description,
									placeholder: "Where it is, and what you've already noticed.",
									onChange: (event) => setDescription(event.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceGroup, {
								label: "How soon?",
								options: URGENCY,
								value: urgency,
								onChange: setUrgency,
								error: errors.urgency
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceGroup, {
								label: "Property",
								options: PROPERTY,
								value: propertyType,
								onChange: setPropertyType
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceGroup, {
								label: "Best time to come",
								options: TIMES,
								value: preferredTime,
								onChange: setPreferredTime
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-budget",
								label: "Budget, if you have one",
								hint: "Optional.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "cust-budget",
									value: budget,
									onChange: (event) => setBudget(event.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-access",
								label: "Access notes",
								hint: "Gate code, pets, parking, complex rules. Optional.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
									id: "cust-access",
									className: "min-h-20",
									value: accessNotes,
									onChange: (event) => setAccessNotes(event.target.value)
								})
							}),
							sendError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-lost",
								role: "alert",
								children: sendError
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "w-full",
								disabled: sending,
								children: sending ? "Sending…" : "Send job details"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-center text-sm text-muted",
				children: "No account needed · LeakKeep"
			})
		]
	});
}
function ChoiceGroup({ label, options, value, onChange, error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
			className: "mb-2 text-sm font-medium text-ink",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("grid gap-2", options.length === 4 ? "grid-cols-2" : "grid-cols-3"),
			children: options.map((option) => {
				const on = value === option;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": on,
					onClick: () => onChange(option),
					className: cn("press h-11 rounded-lg border px-2 text-sm font-medium", on ? "border-primary bg-primary-soft text-primary" : "border-line bg-paper text-ink"),
					children: option
				}, option);
			})
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-lost",
			children: error
		}) : null
	] });
}
//#endregion
export { PublicPage as component };
