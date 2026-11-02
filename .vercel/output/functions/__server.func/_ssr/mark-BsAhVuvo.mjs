import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mark-BsAhVuvo.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function oneLine(value, max = 96) {
	const flat = value.replace(/\s+/g, " ").trim();
	if (flat.length <= max) return flat;
	return `${flat.slice(0, max - 1).trimEnd()}…`;
}
function firstName(name) {
	return name.trim().split(/\s+/)[0] || name;
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("size-9 text-ink", className),
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			width: "32",
			height: "32",
			rx: "8",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			className: "fill-primary-ink",
			d: "M16 7c3.2 4.4 6.5 8.2 6.5 12.1A6.5 6.5 0 0 1 16 25.6a6.5 6.5 0 0 1-6.5-6.5C9.5 15.2 12.8 11.4 16 7z"
		})]
	});
}
//#endregion
export { oneLine as i, cn as n, firstName as r, Mark as t };
