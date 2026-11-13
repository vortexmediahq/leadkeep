import { t as cn } from "./utils-CeKzjCG5.mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mark-I_x-2mlQ.js
var import_jsx_runtime = require_jsx_runtime();
/** Square LeadKeep icon (navy tile, orange arrow). */
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/favicon.svg",
		alt: "",
		"aria-hidden": "true",
		className: cn("size-9 rounded-lg", className)
	});
}
/** Full LeadKeep wordmark. The file has a white background, so use it on light areas only. */
function Logo({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/KCAAo.jpg",
		alt: "LeadKeep",
		className: cn("h-auto w-36 object-contain", className)
	});
}
/** White wordmark for navy backgrounds. Never stretch. */
function LogoOnDark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/leadkeep-logo-white.png",
		alt: "LeadKeep",
		className: cn("h-auto w-36 aspect-[941/244] object-contain", className)
	});
}
//#endregion
export { LogoOnDark as n, Mark as r, Logo as t };
