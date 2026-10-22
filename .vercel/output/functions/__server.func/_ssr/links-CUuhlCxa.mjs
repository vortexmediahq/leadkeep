import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as useLeakKeep, n as Field, o as TextInput, u as slugify } from "./fields-CleTNQx1.mjs";
import { t as Button } from "./button-CXjZ6N1h.mjs";
import { t as AppShell } from "./app-shell-DZys6Ba0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/links-CUuhlCxa.js
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
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [origin, setOrigin] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
	function create(event) {
		event.preventDefault();
		const name = source.trim();
		if (!name) {
			setFormError("Name the place you'll share it, like Facebook Ad.");
			return;
		}
		const taken = new Set(links.map((link) => link.id));
		const base = slugify(name);
		let id = base;
		let n = 2;
		while (taken.has(id)) {
			id = `${base}-${n}`;
			n += 1;
		}
		addLink(name, id);
		setSource("");
		setFormError("");
	}
	async function copy(id) {
		const url = `${origin}/l/${id}`;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(id);
			window.setTimeout(() => setCopied((current) => current === id ? null : current), 2e3);
		} catch {
			setCopied(null);
			setFormError("Couldn't copy. Select the link and copy it manually.");
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
						children: "Shown on the form, and used when a quote is written."
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight",
					children: "New link"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
								placeholder: "Facebook Ad",
								onChange: (event) => setSource(event.target.value)
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Create link"
					})]
				})]
			}),
			links.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-3xl border border-line bg-paper px-4 py-8 text-center text-sm text-muted",
				children: "No links yet. Create one to start collecting jobs."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-4",
				children: links.map((link) => {
					const path = `/l/${link.id}`;
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
									onChange: (event) => updateLink(link.id, event.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm break-all text-muted",
								children: url
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Renaming the source does not change the link."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => void copy(link.id),
										children: copied === link.id ? "Copied" : "Copy link"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/l/$linkId",
											params: { linkId: link.id },
											children: "Open form"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "danger",
										onClick: () => removeLink(link.id),
										children: "Remove"
									})
								]
							})
						]
					}, link.id);
				})
			})
		]
	});
}
//#endregion
export { LinksPage as component };
