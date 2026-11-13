import { i as __toESM } from "../_runtime.mjs";
import { H as fromTemplate, b as canAddQuestionnaire, d as QUESTION_TEMPLATES, v as blankQuestion } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as Copy, N as ArrowUp, P as ArrowDown, i as Trash2, l as Plus } from "../_libs/lucide-react.mjs";
import { a as TextInput, i as TextArea, r as SelectInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
import { f as useAccess, g as useLeakKeep, m as useEffectiveBranding, n as AppShell } from "./app-shell-CkBjUj6N.mjs";
import { t as Capture } from "./lead-form-CiM4z-eP.mjs";
import { t as QUESTION_TYPES } from "./types-DRh0686U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/questions-BrC9FlgF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function QuestionsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Questions, {}) });
}
function Questions() {
	const ready = useLeakKeep((state) => state.questionnairesReady);
	const questionnaires = useLeakKeep((state) => state.questionnaires);
	const create = useLeakKeep((state) => state.createQuestionnaire);
	const duplicate = useLeakKeep((state) => state.duplicateQuestionnaire);
	const access = useAccess();
	const canAdd = canAddQuestionnaire(access, questionnaires.length);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function withBusy(task) {
		setBusy(true);
		setError("");
		try {
			const id = await task();
			if (id) setOpenId(id);
		} catch {
			setError("Couldn't save. Check your connection and try again.");
		} finally {
			setBusy(false);
		}
	}
	const [previewId, setPreviewId] = (0, import_react.useState)(null);
	const business = useLeakKeep((state) => state.business);
	const services = useLeakKeep((state) => state.services);
	const branding = useEffectiveBranding();
	const open = questionnaires.find((item) => item.id === openId) ?? null;
	const previewing = questionnaires.find((item) => item.id === previewId) ?? null;
	if (previewing) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Capture, {
		slug: "preview",
		onAnother: () => void 0,
		preview: { onBack: () => setPreviewId(null) },
		form: {
			source: "Preview",
			business: {
				name: business.name,
				trade: business.trade,
				city: business.city
			},
			services: services.map((service) => service.name).filter((name) => name.trim()),
			questionnaire: {
				name: previewing.name,
				intro: previewing.intro,
				questions: previewing.questions
			},
			branding,
			kind: "questionnaire",
			landing: {
				headline: "",
				intro: "",
				mediaPath: "",
				mediaUrl: "",
				ctaText: "",
				serviceName: ""
			}
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Questions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Build the questionnaire people fill in from your links. Name, email and phone are always asked for you."
				})] }), ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						document.getElementById("templates")?.scrollIntoView({
							behavior: "smooth",
							block: "start"
						});
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						"aria-hidden": "true"
					}), "New questionnaire"]
				}) : null]
			}),
			!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-accent/40 bg-accent-soft p-4 text-sm text-ink",
				role: "status",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "One database update is needed before you can save questionnaires."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-ink-soft",
					children: "Until then, every link uses the standard “Quick enquiry” questions, and answers still reach your inbox."
				})]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-lost",
				role: "alert",
				children: error
			}) : null,
			ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "templates",
				className: "scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: questionnaires.length === 0 ? "Start with a template" : "Start another from a template"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: canAdd ? "You can change every question afterwards. Templates stay here whenever you want a new questionnaire." : "You've reached the number of questionnaires on your plan. Upgrade to add another, or edit one you already have."
					}),
					!canAdd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pricing",
							children: "More questionnaires on Care"
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: QUESTION_TEMPLATES.map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: busy || !canAdd,
							onClick: () => {
								if (!canAdd) return;
								withBusy(() => create(fromTemplate(template)));
							},
							className: "press flex h-full w-full flex-col items-start rounded-2xl border border-line bg-mist p-4 text-left hover:border-accent disabled:opacity-50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-ink",
									children: template.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 text-sm text-muted",
									children: template.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-2 text-sm text-faint",
									children: [
										template.questions.length,
										" ",
										template.questions.length === 1 ? "question" : "questions"
									]
								})
							]
						}) }, template.key))
					})
				]
			}) : null,
			questionnaires.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: questionnaires.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-paper p-4 shadow-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: item.name || "Untitled questionnaire"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								item.questions.length,
								" ",
								item.questions.length === 1 ? "question" : "questions"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setOpenId(openId === item.id ? null : item.id),
								children: openId === item.id ? "Close" : "Edit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setPreviewId(item.id),
								children: "Preview as customer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => void withBusy(() => duplicate(item.id)),
								disabled: busy || !canAdd,
								"aria-label": `Duplicate ${item.name}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
									className: "size-4",
									"aria-hidden": "true"
								}), "Duplicate"]
							})
						]
					})]
				}, item.id))
			}) : null,
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editor, {
				item: open,
				onClosed: () => setOpenId(null)
			}, open.id) : null,
			ready && questionnaires.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Next: pick a questionnaire for each link on the",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/links",
						className: "font-medium text-primary underline-offset-2 hover:text-accent hover:underline",
						children: "Links page"
					}),
					"."
				]
			}) : null
		]
	});
}
function Editor({ item, onClosed }) {
	const save = useLeakKeep((state) => state.saveQuestionnaire);
	const remove = useLeakKeep((state) => state.removeQuestionnaire);
	const usedBy = useLeakKeep((state) => state.links.filter((link) => link.questionnaireId === item.id).length);
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	const update = (patch) => save({
		...item,
		...patch
	});
	const setQuestions = (questions) => update({ questions });
	const patchQuestion = (id, patch) => setQuestions(item.questions.map((question) => question.id === id ? {
		...question,
		...patch
	} : question));
	const move = (index, by) => {
		const next = [...item.questions];
		const [moved] = next.splice(index, 1);
		next.splice(index + by, 0, moved);
		setQuestions(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
		"aria-label": "Edit questionnaire",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					id: "q-name",
					label: "Questionnaire name",
					hint: "Only you see this.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						id: "q-name",
						value: item.name,
						maxLength: 120,
						onChange: (event) => update({ name: event.target.value })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					id: "q-intro",
					label: "Intro line",
					hint: "Shown at the top of the form.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						id: "q-intro",
						rows: 2,
						value: item.intro,
						maxLength: 600,
						onChange: (event) => update({ intro: event.target.value })
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-6 text-base font-semibold",
				children: "Questions"
			}),
			item.questions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted",
				children: "No questions yet. Add your first one below."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 flex flex-col gap-3",
				children: item.questions.map((question, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-line bg-mist p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-[1fr_11rem]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `ql-${question.id}`,
								label: `Question ${index + 1}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: `ql-${question.id}`,
									value: question.label,
									maxLength: 300,
									placeholder: "Type your question",
									onChange: (event) => patchQuestion(question.id, { label: event.target.value })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `qt-${question.id}`,
								label: "Answer type",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
									id: `qt-${question.id}`,
									value: question.type,
									onChange: (event) => {
										const type = event.target.value;
										const needsOptions = (type === "choice" || type === "multi") && question.options.length === 0;
										patchQuestion(question.id, {
											type,
											options: needsOptions ? ["Option 1", "Option 2"] : question.options
										});
									},
									children: QUESTION_TYPES.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: type.id,
										children: type.label
									}, type.id))
								})
							})]
						}),
						question.type === "choice" || question.type === "multi" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `qo-${question.id}`,
								label: "Choices",
								hint: "One per line.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
									id: `qo-${question.id}`,
									rows: 3,
									value: question.options.join("\n"),
									onChange: (event) => patchQuestion(question.id, { options: event.target.value.split("\n").slice(0, 20) })
								})
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mr-auto flex items-center gap-2 text-sm text-ink",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										className: "size-4 accent-primary",
										checked: question.required,
										onChange: (event) => patchQuestion(question.id, { required: event.target.checked })
									}), "Required"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									label: "Move up",
									disabled: index === 0,
									onClick: () => move(index, -1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
										className: "size-4",
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									label: "Move down",
									disabled: index === item.questions.length - 1,
									onClick: () => move(index, 1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
										className: "size-4",
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									label: "Duplicate question",
									onClick: () => {
										const next = [...item.questions];
										next.splice(index + 1, 0, {
											...question,
											id: crypto.randomUUID(),
											options: [...question.options]
										});
										setQuestions(next);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
										className: "size-4",
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									label: "Delete question",
									onClick: () => setQuestions(item.questions.filter((q) => q.id !== question.id)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
										className: "size-4",
										"aria-hidden": "true"
									})
								})
							]
						})
					]
				}, question.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "secondary",
					disabled: item.questions.length >= 30,
					onClick: () => setQuestions([...item.questions, blankQuestion()]),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Add question"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mr-auto text-sm text-muted",
					children: "Saved automatically."
				}), confirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "danger",
					onClick: () => {
						remove(item.id);
						onClosed();
					},
					children: "Yes, delete"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setConfirming(false),
					children: "Keep it"
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "danger",
					onClick: () => setConfirming(true),
					children: "Delete questionnaire"
				})]
			}),
			confirming && usedBy > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					usedBy,
					" ",
					usedBy === 1 ? "link uses" : "links use",
					" this. They'll switch to the standard questions. Existing leads keep their answers."
				]
			}) : null
		]
	});
}
function IconButton({ label, disabled, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		title: label,
		disabled,
		onClick,
		className: cn("press grid size-10 place-items-center rounded-lg border border-line bg-paper text-ink-soft hover:text-ink disabled:opacity-40"),
		children
	});
}
//#endregion
export { QuestionsPage as component };
