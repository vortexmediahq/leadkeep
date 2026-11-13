import { it as publicLogoUrl, y as brandCssVars } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brand-mark-CkcOvvyS.js
var import_jsx_runtime = require_jsx_runtime();
function BrandTheme({ branding, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		style: brandCssVars(branding),
		children
	});
}
/** A small, quiet mark. Sit it under the client's own name or logo when one is shown. */
function PoweredBy({ className, light, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-center tracking-wide", compact ? "text-[10px]" : "text-[11px]", light ? "text-white/45" : compact ? "text-faint/80" : "text-faint", className),
		children: "Powered by LeadKeep"
	});
}
/** Client logo, never stretched. Sit it in a fixed-height box and let the image keep its shape. */
function BrandMark({ path, name, className, heightClass = "h-12" }) {
	const src = publicLogoUrl(path);
	if (!src) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex max-w-full items-center justify-start", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: name ? `${name} logo` : "Business logo",
			className: cn(heightClass, "w-auto max-w-full object-contain")
		})
	});
}
//#endregion
export { BrandTheme as n, PoweredBy as r, BrandMark as t };
