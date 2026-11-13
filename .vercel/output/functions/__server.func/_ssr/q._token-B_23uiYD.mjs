import { i as __toESM } from "../_runtime.mjs";
import { L as fetchQuoteView, h as acceptQuoteRpc } from "./data-vq0z3oFT.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as Download, j as Check } from "../_libs/lucide-react.mjs";
import { n as BrandTheme, r as PoweredBy } from "./brand-mark-CkcOvvyS.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
import { n as format } from "../_libs/date-fns.mjs";
import { n as Route } from "./router-B8jrlzhQ.mjs";
import { t as QuoteDocument } from "./quote-document-BPnZ9ufN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/q._token-B_23uiYD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TOKEN = /^[a-z0-9]{24,64}$/;
function Message({ title, body }) {
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
function QuotePage() {
	const { token } = Route.useParams();
	const valid = TOKEN.test(token);
	const [loaded, setLoaded] = (0, import_react.useState)({ state: "loading" });
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!valid) return;
		let live = true;
		fetchQuoteView(token).then((quote) => live && setLoaded(quote ? {
			state: "ready",
			quote
		} : { state: "missing" })).catch(() => live && setLoaded({ state: "failed" }));
		return () => {
			live = false;
		};
	}, [token, valid]);
	if (!valid || loaded.state === "missing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Message, {
		title: "This quote isn't available",
		body: "The link may be wrong. Ask the business to send it again."
	});
	if (loaded.state === "failed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Message, {
		title: "The quote couldn't load",
		body: "Check your connection and refresh the page."
	});
	if (loaded.state === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Message, {
		title: "Loading your quote…",
		body: "One moment."
	});
	const quote = loaded.quote;
	const accepted = quote.state === "accepted";
	const branded = quote.branding;
	const accept = async () => {
		setBusy(true);
		setError("");
		try {
			if (!await acceptQuoteRpc(token)) throw new Error("expired");
			const next = await fetchQuoteView(token, false);
			if (next) setLoaded({
				state: "ready",
				quote: next
			});
		} catch {
			setError("We couldn't record that. The quote may have expired. Please contact the business.");
		} finally {
			setBusy(false);
		}
	};
	const page = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:py-10 print:max-w-none print:p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteDocument, {
			style: quote.style,
			businessName: quote.business.name,
			contact: {
				phone: quote.business.phone,
				email: quote.business.email
			},
			branding: branded,
			logoPath: branded?.logoPath ?? "",
			backgroundPath: quote.backgroundPath,
			customer: quote.customer,
			service: quote.service,
			text: quote.text,
			expiresAt: quote.expiresAt
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-3xl border border-line bg-paper p-4 shadow-panel print:hidden",
			"aria-label": "Respond to this quote",
			children: [
				accepted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "status",
					className: "flex items-center gap-2 font-medium text-won",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-5",
							"aria-hidden": "true"
						}),
						"Accepted",
						quote.acceptedAt ? ` on ${format(new Date(quote.acceptedAt), "d MMM yyyy")}` : "",
						". ",
						quote.business.name || "The business",
						" will be in touch."
					]
				}) : quote.expired ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "status",
					className: "font-medium text-lost",
					children: [
						"This quote has expired. Please contact ",
						quote.business.name || "the business",
						" for a fresh one."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					onClick: () => void accept(),
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-4",
						"aria-hidden": "true"
					}), busy ? "Saving…" : "Accept this quote"]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-2 text-sm text-lost",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-2 w-full",
					variant: "secondary",
					onClick: () => window.print(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Print or save as PDF"]
				})
			]
		})]
	});
	return branded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandTheme, {
		branding: branded,
		className: "min-h-screen",
		children: page
	}) : page;
}
//#endregion
export { QuotePage as component };
