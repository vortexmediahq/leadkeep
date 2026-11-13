import { B as fontFamily, it as publicLogoUrl, y as brandCssVars } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as PoweredBy, t as BrandMark } from "./brand-mark-CkcOvvyS.mjs";
import { n as format } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quote-document-BPnZ9ufN.js
var import_jsx_runtime = require_jsx_runtime();
var PRINT_EXACT = {
	printColorAdjust: "exact",
	WebkitPrintColorAdjust: "exact"
};
/** The quote itself: three looks, the customer's name, the owner's logo and an optional background. */
function QuoteDocument(props) {
	const { style, businessName, contact, branding, logoPath, backgroundPath, customer, service, text, expiresAt, className } = props;
	const bg = backgroundPath ? publicLogoUrl(backgroundPath) : "";
	const vars = branding ? brandCssVars(branding) : void 0;
	const classic = style === "classic";
	const bodyFont = classic ? "Georgia, 'Times New Roman', serif" : branding ? fontFamily(branding.font) : void 0;
	const contactLine = [contact?.phone, contact?.email].filter((part) => part && part.trim()).join(" · ");
	const meta = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: cn("grid gap-0.5 text-sm", classic ? "justify-items-center text-center" : "sm:text-right"),
		children: [
			customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "sr-only",
				children: "Prepared for"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: ["Prepared for ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: customer })] })] }) : null,
			service ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "sr-only",
				children: "Service"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: service })] }) : null,
			expiresAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "sr-only",
				children: "Valid until"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
				className: "opacity-80",
				children: ["Valid until ", format(new Date(expiresAt), "d MMM yyyy")]
			})] }) : null
		]
	});
	const identity = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-w-0", classic && "flex flex-col items-center text-center"),
		children: [
			logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
				path: logoPath,
				name: businessName,
				heightClass: style === "bold" ? "h-14" : "h-12",
				className: classic ? "justify-center" : void 0
			}) : null,
			businessName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("font-semibold tracking-tight", logoPath ? "mt-2 text-base" : "text-xl"),
				children: businessName
			}) : null,
			contactLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm opacity-80",
				children: contactLine
			}) : null
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("quote-doc relative overflow-hidden rounded-2xl border border-line bg-paper text-ink", className),
		style: {
			...vars,
			...PRINT_EXACT,
			fontFamily: bodyFont
		},
		"data-style": style,
		children: [bg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: "pointer-events-none absolute inset-0 bg-cover bg-center opacity-15",
			style: {
				backgroundImage: `url("${bg}")`,
				...PRINT_EXACT
			}
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				style === "bold" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-wrap items-start justify-between gap-4 px-5 py-6",
					style: {
						background: "var(--color-primary)",
						color: "var(--color-primary-ink)",
						...PRINT_EXACT
					},
					children: [identity, meta]
				}) : style === "classic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-col items-center gap-3 border-b-4 border-double px-5 py-6",
					style: { borderColor: "var(--color-primary)" },
					children: [identity, meta]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "border-t-4 px-5 pt-5",
					style: { borderColor: "var(--color-primary)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4",
						children: [identity, meta]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: cn("px-5 py-5 text-sm leading-relaxed whitespace-pre-wrap sm:text-base", classic && "text-center sm:text-left"),
					style: { fontFamily: "inherit" },
					children: text
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, {
					compact: true,
					className: "px-5 pb-4"
				})
			]
		})]
	});
}
//#endregion
export { QuoteDocument as t };
