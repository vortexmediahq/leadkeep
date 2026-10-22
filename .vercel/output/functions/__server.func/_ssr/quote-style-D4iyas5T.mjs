import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as TextArea, t as Field } from "./fields-B5r7wua3.mjs";
import { r as useLeakKeep } from "./store-DKW15xVj.mjs";
import { t as AppShell } from "./app-shell-ClkXCthF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quote-style-D4iyas5T.js
var import_jsx_runtime = require_jsx_runtime();
function QuoteStylePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteStyle, {}) });
}
function QuoteStyle() {
	const template = useLeakKeep((state) => state.template);
	const updateTemplate = useLeakKeep((state) => state.updateTemplate);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Quote style"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm text-muted",
				children: "Paste how you like quotes to sound. Every generated quote follows this, along with the job and your services."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "tone",
						label: "Tone",
						hint: "How you speak to a customer.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							id: "tone",
							value: template.tone,
							onChange: (event) => updateTemplate({ tone: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "structure",
						label: "Structure",
						hint: "The sections, in the order you want them.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							id: "structure",
							className: "min-h-40",
							value: template.structure,
							onChange: (event) => updateTemplate({ structure: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "payment",
						label: "Payment terms",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							id: "payment",
							value: template.paymentTerms,
							onChange: (event) => updateTemplate({ paymentTerms: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "warranty",
						label: "Warranty language",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							id: "warranty",
							value: template.warranty,
							onChange: (event) => updateTemplate({ warranty: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "extra",
						label: "Closing and anything else",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							id: "extra",
							value: template.extra,
							onChange: (event) => updateTemplate({ extra: event.target.value })
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Saved automatically as you type."
			})
		]
	});
}
//#endregion
export { QuoteStylePage as component };
