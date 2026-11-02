import { i as __toESM } from "../_runtime.mjs";
import { _ as submitLeadViaLink, l as fetchPublicForm } from "./data-CeVsywp6.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Check } from "../_libs/lucide-react.mjs";
import { r as Route$1 } from "./router-BNwn92cE.mjs";
import { n as cn, r as firstName, t as Mark } from "./mark-BsAhVuvo.mjs";
import { i as TextInput, n as SelectInput, r as TextArea, t as Field } from "./fields-4PDzMwcF.mjs";
import { t as Button } from "./button-BhX55BEi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/l._linkId--BXkCgOT.js
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
var SLUG = /^[a-z0-9]{6,32}$/;
var FIELD_IDS = {
	name: "cust-name",
	phone: "cust-phone",
	job: "cust-job",
	customJob: "cust-custom",
	description: "cust-desc",
	urgency: "cust-urgency"
};
function FormSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8",
		"aria-busy": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-10 animate-pulse rounded-xl bg-line" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-4 w-40 animate-pulse rounded bg-line" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 w-28 animate-pulse rounded bg-line" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-96 animate-pulse rounded-3xl border border-line bg-paper" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				children: "Loading the form"
			})
		]
	});
}
function FormMessage({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-line bg-paper p-6 shadow-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold tracking-tight",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-base text-ink-soft",
				children: body
			})]
		})
	});
}
function PublicPage() {
	const { linkId } = Route$1.useParams();
	const slug = linkId.toLowerCase();
	const valid = SLUG.test(slug);
	const [loaded, setLoaded] = (0, import_react.useState)({ state: "loading" });
	const [round, setRound] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!valid) return;
		let live = true;
		setLoaded({ state: "loading" });
		fetchPublicForm(slug).then((form) => live && setLoaded(form ? {
			state: "ready",
			form
		} : { state: "missing" })).catch(() => live && setLoaded({ state: "failed" }));
		return () => {
			live = false;
		};
	}, [slug, valid]);
	if (!valid || loaded.state === "missing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {
		title: "This link isn't active",
		body: "Ask the business for a fresh link to request a quote."
	});
	if (loaded.state === "failed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {
		title: "The form couldn't load",
		body: "Check your connection and refresh the page to try again."
	});
	if (loaded.state === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormSkeleton, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Capture, {
		slug,
		form: loaded.form,
		onAnother: () => setRound((value) => value + 1)
	}, round);
}
function Capture({ slug, form, onAnother }) {
	const { business, services: serviceNames } = form;
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
		const first = Object.keys(next)[0];
		if (first) {
			const target = document.getElementById(FIELD_IDS[first] ?? "");
			target?.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
			if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) target.focus({ preventScroll: true });
			return;
		}
		setSending(true);
		setSendError("");
		try {
			await submitLeadViaLink(slug, {
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
			setDone(name.trim());
		} catch (error) {
			const busy = error instanceof Error && error.message.includes("Too many requests");
			setSendError(busy ? "This form is getting a lot of requests right now. Wait a few minutes and try again." : "Your request didn't go through. Check your connection and try again.");
		} finally {
			setSending(false);
		}
	};
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-line bg-paper p-6 shadow-panel",
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
						"Thanks ",
						firstName(done),
						". ",
						business.name || "The business",
						" has your details and will be in touch soon."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "mt-6 w-full",
					onClick: onAnother,
					children: "Send another request"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 sm:py-10",
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
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel sm:p-6",
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
							" will come back with a price. Takes about a minute."
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
								id: "cust-urgency",
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
				children: "No account needed · Powered by LeakKeep"
			})
		]
	});
}
function ChoiceGroup({ id, label, options, value, onChange, error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		id,
		children: [
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
		]
	});
}
//#endregion
export { PublicPage as component };
