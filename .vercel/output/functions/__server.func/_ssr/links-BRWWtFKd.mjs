import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Check, l as Copy } from "../_libs/lucide-react.mjs";
import { a as TextInput, t as Field } from "./fields-DVtkzD7W.mjs";
import { t as Button } from "./button-C8ZtgPRe.mjs";
import { n as useLeakKeep, t as AppShell } from "./app-shell-BBMKJtBV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/links-BRWWtFKd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	const [source, setSource] = (0, import_react.useState)("");
	const [formError, setFormError] = (0, import_react.useState)("");
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [copyError, setCopyError] = (0, import_react.useState)("");
	const [confirming, setConfirming] = (0, import_react.useState)(null);
	const [origin, setOrigin] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
	async function create(event) {
		event.preventDefault();
		const name = source.trim();
		if (!name) {
			setFormError("Name the place you'll share it, like Facebook Ad.");
			return;
		}
		setCreating(true);
		setFormError("");
		try {
			await addLink(name.slice(0, 120));
			setSource("");
		} catch {
			setFormError("Couldn't create the link. Check your connection and try again.");
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
				children: "Put a link on a Facebook ad, your website, Google Business, or Instagram. The person fills in the job. It lands here tagged with the source."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
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
								label: "Trade",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "biz-trade",
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "New link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Every lead that comes through it is tagged with this source."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: create,
						className: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: "new-source",
								label: "Source name",
								error: formError,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "new-source",
									value: source,
									maxLength: 120,
									placeholder: "Facebook Ad",
									onChange: (event) => setSource(event.target.value)
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: creating,
							children: creating ? "Creating…" : "Create link"
						})]
					})
				]
			}),
			copyError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-lost",
				role: "alert",
				children: copyError
			}) : null,
			links.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-3xl border border-line bg-paper px-4 py-8 text-center text-sm text-muted",
				children: "No links yet. Create one to start collecting jobs."
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
								label: "Source",
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/l/$linkId",
										params: { linkId: link.slug },
										target: "_blank",
										children: "Open form"
									})
								}), confirming === link.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
								})]
							}),
							confirming === link.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Anyone with this link will no longer be able to send you jobs. Existing leads stay."
							}) : null
						]
					}, link.id);
				})
			})
		]
	});
}
//#endregion
export { LinksPage as component };
