import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TextArea, d as useLeakKeep, n as Field, o as TextInput } from "./fields-CleTNQx1.mjs";
import { t as Button } from "./button-CXjZ6N1h.mjs";
import { t as AppShell } from "./app-shell-DZys6Ba0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-DJ2KVbIt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRICE = /((?:from\s+)?(?:R|ZAR|\$|£|€)\s?\d[\d\s,]*(?:\s*[–—-]\s*(?:R|ZAR|\$|£|€)?\s?\d[\d\s,]*)?)/i;
function pullPrice(text) {
	const match = text.match(PRICE);
	if (!match || match.index === void 0) return {
		text: text.trim(),
		price: ""
	};
	const price = match[1].trim();
	return {
		text: `${text.slice(0, match.index)} ${text.slice(match.index + match[0].length)}`.replace(/\s{2,}/g, " ").replace(/^[\s,–—-]+|[\s,–—-]+$/g, "").trim(),
		price
	};
}
function clean(value) {
	return value.replace(/\s+/g, " ").trim();
}
function parseServiceList(raw) {
	const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 40);
	const services = [];
	for (const original of lines) {
		if (/^(name|service)\b/i.test(original) && /[|,\t]/.test(original)) continue;
		const line = original.replace(/^[-*•]\s+/, "");
		let name = "";
		let description = "";
		let price = "";
		let notes = "";
		if (line.includes("|")) {
			const parts = line.split("|").map(clean);
			name = parts[0] ?? "";
			description = parts[1] ?? "";
			price = parts[2] ?? "";
			notes = parts[3] ?? "";
		} else if (line.includes("	")) {
			const parts = line.split("	").map(clean);
			name = parts[0] ?? "";
			description = parts[1] ?? "";
			price = parts[2] ?? "";
			notes = parts[3] ?? "";
		} else {
			const dashed = line.match(/^(.+?)\s+[—–-]\s+(.+)$/);
			const colon = line.match(/^(.+?):\s+(.+)$/);
			if (dashed) {
				name = clean(dashed[1]);
				price = clean(dashed[2]);
			} else if (colon) {
				name = clean(colon[1]);
				description = clean(colon[2]);
			} else name = clean(line);
		}
		if (!price) {
			const fromDescription = pullPrice(description);
			if (fromDescription.price) {
				description = fromDescription.text;
				price = fromDescription.price;
			} else {
				const fromName = pullPrice(name);
				if (fromName.price && fromName.text) {
					name = fromName.text;
					price = fromName.price;
				}
			}
		}
		if (!name) continue;
		services.push({
			name,
			description,
			price,
			notes
		});
	}
	return services;
}
function ServicesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Services, {}) });
}
function Services() {
	const services = useLeakKeep((state) => state.services);
	const currency = useLeakKeep((state) => state.business.currency) || "R";
	const addService = useLeakKeep((state) => state.addService);
	const updateService = useLeakKeep((state) => state.updateService);
	const removeService = useLeakKeep((state) => state.removeService);
	const importServices = useLeakKeep((state) => state.importServices);
	const [paste, setPaste] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	function onImport() {
		const parsed = parseServiceList(paste);
		const count = importServices(parsed);
		setNotice(count ? `Added ${count} ${count === 1 ? "service" : "services"}.` : "No services found. Use one service per line.");
		if (count) setPaste("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Services"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Name, a short description, and a typical price. Quotes use this list instead of inventing rates."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: addService,
					children: "Add service"
				})]
			}),
			services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-3xl border border-line bg-paper px-4 py-8 text-center text-sm text-muted",
				children: "No services yet. Add one, or paste a list below."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-4",
				children: services.map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `name-${service.id}`,
								label: "Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: `name-${service.id}`,
									value: service.name,
									placeholder: "Blocked drain",
									onChange: (event) => updateService(service.id, { name: event.target.value })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `price-${service.id}`,
								label: "Typical price",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: `price-${service.id}`,
									value: service.price,
									placeholder: `${currency}650–${currency}1,200`,
									onChange: (event) => updateService(service.id, { price: event.target.value })
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `desc-${service.id}`,
								label: "Description",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
									id: `desc-${service.id}`,
									value: service.description,
									placeholder: "What the visit usually includes",
									onChange: (event) => updateService(service.id, { description: event.target.value })
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `notes-${service.id}`,
								label: "Notes",
								hint: "Call-out fees, exclusions, or parts.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
									id: `notes-${service.id}`,
									className: "min-h-20",
									value: service.notes,
									onChange: (event) => updateService(service.id, { notes: event.target.value })
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								size: "sm",
								onClick: () => removeService(service.id),
								children: "Remove"
							})
						})
					]
				}, service.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Paste a list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "One service per line. This adds to your list. It does not replace it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						className: "mt-4 min-h-36",
						value: paste,
						onChange: (event) => setPaste(event.target.value),
						"aria-label": "Paste services",
						placeholder: `Blocked drain | Kitchen and bath lines | ${currency}650–${currency}1,800 | Camera extra\nGeyser replacement — ${currency}6,800–${currency}11,500\nLeak detection: find a hidden leak, from ${currency}950`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: onImport,
							disabled: !paste.trim(),
							children: "Add these services"
						}), notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: notice
						}) : null]
					})
				]
			})
		]
	});
}
//#endregion
export { ServicesPage as component };
