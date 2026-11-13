import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BbNg3-4z.js
var import_jsx_runtime = require_jsx_runtime();
var buttonClass = cva("press inline-flex items-center justify-center gap-2 font-medium disabled:pointer-events-none disabled:opacity-50", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-ink hover:bg-primary/90",
			accent: "bg-accent text-accent-ink hover:bg-accent/90",
			secondary: "border border-line bg-paper text-ink hover:bg-mist",
			ghost: "bg-transparent text-ink-soft hover:bg-mist",
			danger: "border border-line bg-paper text-lost hover:bg-lost-soft"
		},
		size: {
			md: "h-11 rounded-lg px-4 text-sm",
			sm: "h-10 rounded-lg px-3 text-sm"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ asChild, className, variant, size, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonClass({
			variant,
			size
		}), className),
		type: asChild ? void 0 : type ?? "button",
		...props
	});
}
//#endregion
export { buttonClass as n, Button as t };
