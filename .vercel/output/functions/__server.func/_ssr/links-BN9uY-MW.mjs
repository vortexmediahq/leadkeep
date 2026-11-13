import { i as __toESM } from "../_runtime.mjs";
import { At as uploadBrandImage, f as QUOTE_CTA_PRESETS, m as SOURCE_OPTIONS, n as CREATE_NEW_QUESTIONS, r as CTA_PRESETS, rt as priceCheck, st as quoteFlowAvailable, tt as parseVideoUrl } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as Copy, j as Check, l as Plus } from "../_libs/lucide-react.mjs";
import { a as TextInput, i as TextArea, r as SelectInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { E as useSession } from "./session-CpXzyFkR.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
import { g as useLeakKeep, n as AppShell } from "./app-shell-CkBjUj6N.mjs";
import { n as LandingMedia } from "./landing--es_bVeY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/links-BN9uY-MW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Owner settings for a quote link or a simple call-to-action link. */
function LandingEditor({ link }) {
	const userId = useSession((state) => state.user?.id ?? "");
	const services = useLeakKeep((state) => state.services);
	const update = useLeakKeep((state) => state.updateLinkLanding);
	const isQuote = link.kind === "quote";
	const service = services.find((item) => item.id === link.serviceId);
	const [error, setError] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const presets = isQuote ? QUOTE_CTA_PRESETS : CTA_PRESETS;
	const videoProblem = link.mediaUrl.trim() && !parseVideoUrl(link.mediaUrl) ? "Use a YouTube or Vimeo link." : "";
	const onFile = async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !userId) return;
		setUploading(true);
		setError("");
		try {
			update(link.id, {
				mediaPath: await uploadBrandImage(userId, file, `link-${link.slug}`),
				mediaUrl: ""
			});
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "We couldn't upload that picture.");
		} finally {
			setUploading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 flex flex-col gap-3 rounded-2xl border border-line bg-mist p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: isQuote ? "Quote link page" : "Simple link page"
			}),
			isQuote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: `svc-${link.id}`,
				label: "Service this link quotes",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
					id: `svc-${link.id}`,
					value: link.serviceId ?? "",
					onChange: (event) => update(link.id, { serviceId: event.target.value || null }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Choose a service…"
					}), services.filter((item) => item.name.trim()).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: item.id,
						children: [item.name, item.price ? ` · ${item.price}` : ""]
					}, item.id))]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: `headline-${link.id}`,
				label: "Headline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					id: `headline-${link.id}`,
					value: link.headline,
					maxLength: 120,
					placeholder: isQuote && service ? `Get your ${service.name} quote` : "e.g. See what we can do for you",
					onChange: (event) => update(link.id, { headline: event.target.value })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: `intro-${link.id}`,
				label: "A few words (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
					id: `intro-${link.id}`,
					value: link.intro,
					maxLength: 600,
					rows: 3,
					onChange: (event) => update(link.id, { intro: event.target.value })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Picture or video (optional)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "cursor-pointer",
							children: [uploading ? "Uploading…" : link.mediaPath ? "Replace picture" : "Upload a picture", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/png,image/jpeg,image/webp",
								className: "sr-only",
								onChange: (event) => void onFile(event),
								disabled: uploading
							})]
						})
					}), link.mediaPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						size: "sm",
						onClick: () => update(link.id, { mediaPath: "" }),
						children: "Remove picture"
					}) : null]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-lost",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					id: `video-${link.id}`,
					label: "…or paste a YouTube or Vimeo link",
					error: videoProblem,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						id: `video-${link.id}`,
						value: link.mediaUrl,
						maxLength: 300,
						placeholder: "https://www.youtube.com/watch?v=…",
						onChange: (event) => update(link.id, { mediaUrl: event.target.value })
					})
				}),
				link.mediaPath || link.mediaUrl && !videoProblem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 max-w-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingMedia, {
						mediaPath: link.mediaPath,
						mediaUrl: videoProblem ? "" : link.mediaUrl,
						title: "Preview"
					})
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Button text"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: presets.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": link.ctaText === preset,
						onClick: () => update(link.id, { ctaText: preset }),
						className: cn("press h-10 rounded-full px-3 text-sm font-medium", link.ctaText === preset ? "bg-ink text-paper" : "border border-line bg-paper text-ink-soft"),
						children: preset
					}, preset))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					"aria-label": "Button text",
					className: "mt-2",
					value: link.ctaText,
					maxLength: 40,
					placeholder: "Or write your own",
					onChange: (event) => update(link.id, { ctaText: event.target.value })
				})
			] }),
			isQuote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: (() => {
				const check = priceCheck(service?.price ?? "", link.autoSend);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						className: "mt-1 size-4 accent-accent",
						checked: link.autoSend,
						onChange: (event) => update(link.id, { autoSend: event.target.checked })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: "Send the quote straight away"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm text-muted",
						children: "Turn off to check every quote first (\"let me check first\")."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-soft",
					role: "status",
					children: check.note
				})] });
			})() }) : null
		]
	});
}
var SOURCE_LABEL = "Where you'll share this link";
var SOURCE_HINT = "This tags every lead with where it came from (for example Facebook or Instagram), so you can see which post brings you the most leads. It does not change what the customer sees.";
function LinksPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinksDesk, {}) });
}
function LinksDesk() {
	const business = useLeakKeep((state) => state.business);
	const updateBusiness = useLeakKeep((state) => state.updateBusiness);
	const links = useLeakKeep((state) => state.links);
	const addLink = useLeakKeep((state) => state.addLink);
	const updateLink = useLeakKeep((state) => state.updateLink);
	const removeLink = useLeakKeep((state) => state.removeLink);
	const questionnaires = useLeakKeep((state) => state.questionnaires);
	const questionnairesReady = useLeakKeep((state) => state.questionnairesReady);
	const setLinkQuestionnaire = useLeakKeep((state) => state.setLinkQuestionnaire);
	const navigate = useNavigate();
	const goCreateQuestions = () => void navigate({
		to: "/questions",
		hash: "templates"
	});
	const [preset, setPreset] = (0, import_react.useState)(SOURCE_OPTIONS[0]);
	const [custom, setCustom] = (0, import_react.useState)("");
	const [questionnaireId, setQuestionnaireId] = (0, import_react.useState)("");
	const [formError, setFormError] = (0, import_react.useState)("");
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [copyError, setCopyError] = (0, import_react.useState)("");
	const [confirming, setConfirming] = (0, import_react.useState)(null);
	const [origin, setOrigin] = (0, import_react.useState)("");
	const [adding, setAdding] = (0, import_react.useState)(true);
	const [kind, setKind] = (0, import_react.useState)("questionnaire");
	const [serviceId, setServiceId] = (0, import_react.useState)("");
	const services = useLeakKeep((state) => state.services);
	const quoteReady = quoteFlowAvailable();
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
	(0, import_react.useEffect)(() => {
		if (links.length === 0) setAdding(true);
	}, [links.length]);
	async function create(event) {
		event.preventDefault();
		const name = (preset === "other" ? custom : preset).trim();
		if (!name) {
			setFormError("Name the place you'll share it, like a poster or newsletter.");
			return;
		}
		setCreating(true);
		setFormError("");
		try {
			if (kind === "quote" && !serviceId) {
				setFormError("Choose the service this quote link is for.");
				setCreating(false);
				return;
			}
			await addLink(name.slice(0, 120), kind === "questionnaire" ? questionnaireId || null : null, kind === "questionnaire" ? {} : {
				kind,
				serviceId: kind === "quote" ? serviceId : null,
				ctaText: kind === "quote" ? "Send me this quote" : "Send me more info"
			});
			setCustom("");
			setKind("questionnaire");
			setServiceId("");
			setPreset(SOURCE_OPTIONS[0]);
			setAdding(false);
		} catch (error) {
			setFormError(error instanceof Error ? error.message : "Couldn't create the link. Check your connection and try again.");
		} finally {
			setCreating(false);
		}
	}
	async function copy(link) {
		try {
			await navigator.clipboard.writeText(`${origin}/l/${link.slug}`);
			setCopyError("");
			setCopied(link.id);
			window.setTimeout(() => setCopied((current) => current === link.id ? null : current), 2e3);
		} catch {
			setCopied(null);
			setCopyError("Couldn't copy. Select the link and copy it manually.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Lead links"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm text-muted",
				children: "Make one link for each place you share it: a social post, an advert, your website or a QR flyer. People answer your questions and the lead lands in your inbox tagged with where it came from."
			})] }),
			adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "new-link",
				className: "scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Add your social page"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: SOURCE_HINT
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (event) => void create(event),
						className: "mt-4 flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "mb-2 text-sm font-medium text-ink",
								children: "Where will you share it?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [SOURCE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setPreset(option);
										setFormError("");
									},
									"aria-pressed": preset === option,
									className: cn("press h-10 rounded-full px-3 text-sm font-medium", preset === option ? "bg-ink text-paper" : "border border-line bg-paper text-ink-soft"),
									children: option
								}, option)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setPreset("other"),
									"aria-pressed": preset === "other",
									className: cn("press h-10 rounded-full px-3 text-sm font-medium", preset === "other" ? "bg-ink text-paper" : "border border-line bg-paper text-ink-soft"),
									children: "Something else…"
								})]
							})] }),
							preset === "other" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "new-source-custom",
								label: "Name this page",
								error: formError,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "new-source-custom",
									value: custom,
									maxLength: 120,
									placeholder: "e.g. Market stall poster, LinkedIn, newsletter",
									onChange: (event) => setCustom(event.target.value)
								})
							}) : formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-lost",
								role: "alert",
								children: formError
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
									className: "mb-2 text-sm font-medium text-ink",
									children: "What happens when someone opens it?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-3",
									role: "radiogroup",
									"aria-label": "Link type",
									children: [
										[
											"questionnaire",
											"Ask my questions",
											"They answer your questions."
										],
										[
											"quote",
											"Send a quote",
											"Their quote is built from a service price."
										],
										[
											"simple",
											"Simple button",
											"A picture or video and one button."
										]
									].map(([id, label, help]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										role: "radio",
										"aria-checked": kind === id,
										disabled: id !== "questionnaire" && !quoteReady,
										onClick: () => setKind(id),
										className: cn("press rounded-2xl border p-3 text-left disabled:opacity-50", kind === id ? "border-ink bg-mist" : "border-line bg-paper"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-medium",
											children: label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block text-xs text-muted",
											children: help
										})]
									}, id))
								}),
								!quoteReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted",
									children: "Quote and simple links switch on once the quote database update (20261113120000_quote_flow.sql) is applied."
								}) : null
							] }),
							kind === "quote" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "new-service",
								label: "Which service is this link for?",
								hint: "The quote uses that service's saved price. Add services on the Services page.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
									id: "new-service",
									value: serviceId,
									onChange: (event) => setServiceId(event.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Choose a service…"
									}), services.filter((item) => item.name.trim()).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: item.id,
										children: [item.name, item.price ? ` · ${item.price}` : ""]
									}, item.id))]
								})
							}) : null,
							kind === "questionnaire" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "new-questionnaire",
								label: "Questions to ask",
								hint: questionnairesReady && questionnaires.length === 0 ? "Build your own on the Questions page." : void 0,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
									id: "new-questionnaire",
									value: questionnaireId,
									disabled: !questionnairesReady,
									onChange: (event) => {
										if (event.target.value === "__create_new__") return goCreateQuestions();
										setQuestionnaireId(event.target.value);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Standard (Quick enquiry)"
										}),
										questionnaires.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: item.id,
											children: item.name || "Untitled questionnaire"
										}, item.id)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: CREATE_NEW_QUESTIONS,
											children: "Don't see your questions? Create new…"
										})
									]
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: creating,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
									className: "size-4",
									"aria-hidden": "true"
								}), creating ? "Adding…" : "Add your social page"]
							}) })
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "new-link",
				className: "scroll-mt-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setAdding(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Add another"]
				})
			}),
			copyError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-lost",
				role: "alert",
				children: copyError
			}) : null,
			links.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-dashed border-line bg-paper px-4 py-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-ink",
					children: "No links yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-1 max-w-sm text-sm text-muted",
					children: "Pick where you'll share it above and press Add your social page. Then paste the link into your post or advert."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-4",
				children: links.map((link) => {
					const path = `/l/${link.slug}`;
					const url = origin ? `${origin}${path}` : path;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `source-${link.id}`,
								label: SOURCE_LABEL,
								hint: SOURCE_HINT,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: `source-${link.id}`,
									value: link.source,
									maxLength: 120,
									onChange: (event) => updateLink(link.id, event.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center gap-2 rounded-xl border border-line bg-mist p-1 pl-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "min-w-0 flex-1 truncate text-sm text-ink-soft select-all",
									title: url,
									children: url
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: () => void copy(link),
									"aria-label": `Copy ${link.source || "lead"} link`,
									children: [copied === link.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "size-4",
										"aria-hidden": "true"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
										className: "size-4",
										"aria-hidden": "true"
									}), copied === link.id ? "Copied" : "Copy"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Renaming changes the tag on new leads. The link stays the same."
							}),
							link.kind !== "questionnaire" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingEditor, { link }) : null,
							questionnairesReady && link.kind === "questionnaire" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: `questions-${link.id}`,
									label: "Questions on this link",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
										id: `questions-${link.id}`,
										value: link.questionnaireId ?? "",
										onChange: (event) => {
											if (event.target.value === "__create_new__") return goCreateQuestions();
											setLinkQuestionnaire(link.id, event.target.value || null);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "Standard (Quick enquiry)"
											}),
											questionnaires.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: item.id,
												children: item.name || "Untitled questionnaire"
											}, item.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: CREATE_NEW_QUESTIONS,
												children: "Don't see your questions? Create new…"
											})
										]
									})
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/l/$linkId",
											params: { linkId: link.slug },
											search: { preview: "1" },
											children: "Preview as customer"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/l/$linkId",
											params: { linkId: link.slug },
											target: "_blank",
											children: "Open form"
										})
									}),
									confirming === link.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "danger",
										onClick: () => {
											setConfirming(null);
											removeLink(link.id);
										},
										children: "Yes, turn off link"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => setConfirming(null),
										children: "Keep it"
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "danger",
										onClick: () => setConfirming(link.id),
										children: "Remove"
									})
								]
							}),
							confirming === link.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Anyone with this link will no longer be able to reach you through it. Existing leads stay."
							}) : null
						]
					}, link.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "business",
				className: "scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Your business"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Shown at the top of your form, and used when a quote is written. Saved automatically."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "biz-name",
								label: "Business name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "biz-name",
									value: business.name,
									onChange: (event) => updateBusiness({ name: event.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "biz-trade",
								label: "Type of business",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "biz-trade",
									placeholder: "e.g. Hair salon, Photographer, Coach",
									value: business.trade,
									onChange: (event) => updateBusiness({ trade: event.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "biz-city",
								label: "City",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "biz-city",
									value: business.city,
									onChange: (event) => updateBusiness({ city: event.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "biz-currency",
								label: "Currency",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "biz-currency",
									value: business.currency,
									maxLength: 8,
									onChange: (event) => updateBusiness({ currency: event.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "biz-phone",
								label: "Phone",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "biz-phone",
									value: business.phone,
									onChange: (event) => updateBusiness({ phone: event.target.value })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "biz-email",
								label: "Email",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "biz-email",
									value: business.email,
									onChange: (event) => updateBusiness({ email: event.target.value })
								})
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
export { LinksPage as component };
