import { i as __toESM } from "../_runtime.mjs";
import { W as hasBranding, gt as submitLeadViaLink, i as DEFAULT_PUBLIC_QUESTIONNAIRE, vt as summarise } from "./data-vq0z3oFT.mjs";
import { n as firstName, t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { j as Check } from "../_libs/lucide-react.mjs";
import { a as TextInput, i as TextArea, t as Field } from "./fields-Zm5jyQkz.mjs";
import { n as BrandTheme, r as PoweredBy, t as BrandMark } from "./brand-mark-CkcOvvyS.mjs";
import { r as Mark } from "./mark-I_x-2mlQ.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lead-form-CiM4z-eP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Capture({ slug, form, onAnother, preview }) {
	const { business } = form;
	const questionnaire = form.questionnaire ?? DEFAULT_PUBLIC_QUESTIONNAIRE;
	const questions = questionnaire.questions;
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [answers, setAnswers] = (0, import_react.useState)({});
	const [errors, setErrors] = (0, import_react.useState)({});
	const [done, setDone] = (0, import_react.useState)(null);
	const [sending, setSending] = (0, import_react.useState)(false);
	const [sendError, setSendError] = (0, import_react.useState)("");
	const tradeLine = [business.trade, business.city].filter(Boolean).join(" · ");
	const answerText = (question) => {
		const value = answers[question.id];
		return Array.isArray(value) ? value.join(", ") : (value ?? "").trim();
	};
	const submit = async (event) => {
		event.preventDefault();
		const next = {};
		if (!name.trim()) next["cust-name"] = "Add your name.";
		if (phone.replace(/[^0-9]/g, "").length < 7) next["cust-phone"] = "Add a phone number we can reach you on.";
		if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) next["cust-email"] = "Check your email address.";
		for (const question of questions) if (question.required && !answerText(question)) next[`q-${question.id}`] = "Please answer this one.";
		setErrors(next);
		const first = Object.keys(next)[0];
		if (first) {
			const target = document.getElementById(first);
			target?.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
			if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) target.focus({ preventScroll: true });
			return;
		}
		const responses = questions.map((question) => ({
			question: question.label,
			answer: answerText(question)
		}));
		const firstChoice = questions.find((question) => question.type === "choice" && answerText(question));
		if (preview) {
			setSendError("This is a preview, so nothing was sent. Your customer will see a thank-you screen here.");
			return;
		}
		setSending(true);
		setSendError("");
		try {
			await submitLeadViaLink(slug, {
				name: name.trim(),
				phone: phone.trim(),
				email: email.trim(),
				address: "",
				jobType: (questionnaire.name || "Enquiry").slice(0, 200),
				description: summarise(responses),
				urgency: firstChoice ? answerText(firstChoice).slice(0, 60) : "",
				preferredTime: "",
				propertyType: "",
				budget: "",
				accessNotes: "",
				responses
			});
			setDone(name.trim());
		} catch (error) {
			const busy = error instanceof Error && error.message.includes("Too many requests");
			setSendError(busy ? "This form is getting a lot of requests right now. Wait a few minutes and try again." : "Your answers didn't go through. Check your connection and try again.");
		} finally {
			setSending(false);
		}
	};
	const branding = form.branding;
	const branded = Boolean(branding && hasBranding(branding));
	const wrap = (node) => branding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandTheme, {
		branding,
		className: "min-h-screen",
		children: node
	}) : node;
	if (done) return wrap(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-line bg-paper p-6 shadow-panel",
			children: [
				branded && branding?.logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
					path: branding.logoPath,
					name: business.name,
					heightClass: "h-12",
					className: "mb-4"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-12 place-items-center rounded-full bg-accent-soft text-accent-strong",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-6",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-2xl font-semibold tracking-tight",
					children: "Thanks, we've got it"
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
					children: "Send another response"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, {
			compact: branded,
			className: "mt-6"
		})]
	}));
	return wrap(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 sm:py-10",
		children: [
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-ink",
					children: "Preview: this is how your customer sees it"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					type: "button",
					onClick: preview.onBack,
					children: "Back to edit"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex items-center gap-3",
				children: [branded && branding?.logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
					path: branding.logoPath,
					name: business.name,
					heightClass: "h-12"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-lg font-semibold tracking-tight",
							children: business.name || "Get in touch"
						}),
						tradeLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-muted",
							children: tradeLine
						}) : null,
						branded && branding?.logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, {
							compact: true,
							className: "mt-1 text-left"
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => void submit(event),
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel sm:p-6",
				noValidate: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: "Get in touch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: questionnaire.intro || "Answer a few quick questions and we'll get back to you."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-name",
								label: "Your name",
								error: errors["cust-name"],
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "cust-name",
									autoComplete: "name",
									value: name,
									onChange: (event) => setName(event.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-phone",
								label: "Phone or WhatsApp",
								error: errors["cust-phone"],
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "cust-phone",
									type: "tel",
									autoComplete: "tel",
									inputMode: "tel",
									value: phone,
									onChange: (event) => setPhone(event.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "cust-email",
								label: "Email (optional)",
								error: errors["cust-email"],
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "cust-email",
									type: "email",
									autoComplete: "email",
									inputMode: "email",
									value: email,
									onChange: (event) => setEmail(event.target.value)
								})
							}),
							questions.map((question) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionField, {
								question,
								value: answers[question.id],
								error: errors[`q-${question.id}`],
								onChange: (value) => setAnswers((current) => ({
									...current,
									[question.id]: value
								}))
							}, question.id)),
							sendError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-lost",
								role: "alert",
								children: sendError
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "accent",
								className: "w-full",
								disabled: sending,
								children: sending ? "Sending…" : "Send"
							})
						]
					})
				]
			}),
			branded && branding?.logoPath ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "https://leadkeep.whop.site",
				target: "_blank",
				rel: "noreferrer",
				className: "mt-6 block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, { compact: branded })
			})
		]
	}));
}
function QuestionField({ question, value, error, onChange }) {
	const id = `q-${question.id}`;
	const label = question.required ? question.label : `${question.label} (optional)`;
	const options = question.options.filter((option) => option.trim());
	const text = typeof value === "string" ? value : "";
	if (question.type === "choice" || question.type === "multi") {
		const picked = Array.isArray(value) ? value : text ? [text] : [];
		const multi = question.type === "multi";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
			id,
			tabIndex: -1,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "mb-2 text-sm font-medium text-ink",
					children: label
				}),
				question.help ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "-mt-1 mb-2 text-sm text-muted",
					children: question.help
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
					children: options.map((option) => {
						const on = picked.includes(option);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": on,
							onClick: () => multi ? onChange(on ? picked.filter((item) => item !== option) : [...picked, option]) : onChange(on ? "" : option),
							className: cn("press min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-medium", on ? "border-accent bg-accent-soft text-ink" : "border-line bg-paper text-ink"),
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		id,
		label,
		error,
		hint: question.help || void 0,
		children: question.type === "long" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
			id,
			rows: 4,
			maxLength: 2e3,
			value: text,
			onChange: (event) => onChange(event.target.value)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
			id,
			type: question.type === "date" ? "date" : question.type === "number" ? "number" : "text",
			inputMode: question.type === "number" ? "numeric" : void 0,
			maxLength: 500,
			value: text,
			onChange: (event) => onChange(event.target.value)
		})
	});
}
//#endregion
export { Capture as t };
