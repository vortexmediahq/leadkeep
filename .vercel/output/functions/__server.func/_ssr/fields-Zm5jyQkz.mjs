import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as EyeOff, S as Eye } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fields-Zm5jyQkz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var control = "w-full rounded-lg border border-line bg-paper px-3 text-base text-ink placeholder:text-faint";
var controlOnDark = "w-full rounded-lg border border-white/20 bg-primary/40 px-3 text-base text-white placeholder:text-white/40 caret-white";
function controlClass(tone) {
	return tone === "onDark" ? controlOnDark : control;
}
function Field({ id, label, hint, error, tone = "default", children }) {
	const onDark = tone === "onDark";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: cn("mb-2 block text-sm font-medium", onDark ? "text-[#c5d0de]" : "text-ink"),
			children: label
		}),
		children,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-2 text-sm", onDark ? "text-red-300" : "text-lost"),
			children: error
		}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-2 text-sm", onDark ? "text-[#c5d0de]" : "text-muted"),
			children: hint
		}) : null
	] });
}
function TextInput({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn(controlClass(tone), "h-11", className),
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
function PasswordInput({ className, tone, ...props }) {
	const [visible, setVisible] = (0, import_react.useState)(false);
	const onDark = tone === "onDark";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "password-input",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			...props,
			type: visible ? "text" : "password",
			className: cn(controlClass(tone), "h-11", className)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setVisible((value) => !value),
			className: cn("password-input__toggle", onDark ? "text-[#c5d0de] hover:text-white" : "text-muted hover:text-ink"),
			"aria-label": visible ? "Hide password" : "Show password",
			"aria-pressed": visible,
			children: visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, {
				className: "size-4",
				"aria-hidden": "true"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
				className: "size-4",
				"aria-hidden": "true"
			})
		})]
	});
}
//#endregion
export { TextInput as a, TextArea as i, PasswordInput as n, SelectInput as r, Field as t };
