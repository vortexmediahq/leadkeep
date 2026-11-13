import { i as __toESM } from "../_runtime.mjs";
import { F as fetchPublicForm } from "./data-vq0z3oFT.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as PoweredBy } from "./brand-mark-CkcOvvyS.mjs";
import { i as Route$2 } from "./router-B8jrlzhQ.mjs";
import { t as Capture } from "./lead-form-CiM4z-eP.mjs";
import { t as Landing } from "./landing--es_bVeY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/l._linkId-CMenNvHI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Facebook and WhatsApp read these tags when the link is shared. They only see them if the host renders the page on the server. */
var SLUG = /^[a-z0-9]{6,32}$/;
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-line bg-paper p-6 shadow-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold tracking-tight",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-base text-ink-soft",
				children: body
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, { className: "mt-6" })]
	});
}
function PublicPage() {
	const { linkId } = Route$2.useParams();
	const { preview } = Route$2.useSearch();
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
		body: "Ask the business for a fresh link to get in touch."
	});
	if (loaded.state === "failed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {
		title: "The form couldn't load",
		body: "Check your connection and refresh the page to try again."
	});
	if (loaded.state === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormSkeleton, {});
	if (loaded.form.kind !== "questionnaire") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {
		slug,
		form: loaded.form,
		preview: preview ? { onBack: () => window.history.length > 1 ? window.history.back() : window.close() } : void 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Capture, {
		slug,
		form: loaded.form,
		onAnother: () => setRound((value) => value + 1),
		preview: preview ? { onBack: () => window.history.length > 1 ? window.history.back() : window.close() } : void 0
	}, round);
}
//#endregion
export { PublicPage as component };
