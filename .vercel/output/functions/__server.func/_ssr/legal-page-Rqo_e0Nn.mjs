import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Logo } from "./mark-I_x-2mlQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/legal-page-Rqo_e0Nn.js
var import_jsx_runtime = require_jsx_runtime();
function LegalPage({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "inline-block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "w-36" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-ink",
				children: "This is a draft template for LeadKeep. It needs to be reviewed before you rely on it, and it is not legal advice."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-6 text-3xl font-semibold tracking-tight",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "legal-copy mt-6 flex flex-col gap-4 text-sm leading-relaxed text-ink-soft",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "font-medium text-primary",
						children: "Back to log in"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/privacy",
						className: "font-medium text-primary",
						children: "Privacy Policy"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/terms",
						className: "font-medium text-primary",
						children: "Terms"
					})
				]
			})
		]
	});
}
//#endregion
export { LegalPage as t };
