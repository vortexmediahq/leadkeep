import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./mark-BsAhVuvo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fields-4PDzMwcF.js
var import_jsx_runtime = require_jsx_runtime();
var control = "w-full rounded-lg border border-line bg-paper px-3 text-base text-ink placeholder:text-faint";
function Field({ id, label, hint, error, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: "mb-2 block text-sm font-medium text-ink",
			children: label
		}),
		children,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-lost",
			children: error
		}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: hint
		}) : null
	] });
}
function TextInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn(control, "h-11", className),
		...props
	});
}
function TextArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn(control, "min-h-28 py-3", className),
		...props
	});
}
function SelectInput({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn(control, "h-11", className),
		...props,
		children
	});
}
//#endregion
export { TextInput as i, SelectInput as n, TextArea as r, Field as t };
