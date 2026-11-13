import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TextInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { _ as requestPasswordReset, n as AuthCard } from "./session-CpXzyFkR.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-dAYMEc-s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPassword() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [sent, setSent] = (0, import_react.useState)(false);
	const submit = async (event) => {
		event.preventDefault();
		if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
			setError("Enter a valid email address.");
			return;
		}
		setPending(true);
		setError("");
		try {
			await requestPasswordReset(email.trim());
			setSent(true);
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "Something went wrong. Try again.");
		} finally {
			setPending(false);
		}
	};
	const back = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "font-medium text-accent hover:underline",
		children: "Back to log in"
	});
	if (sent) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthCard, {
		title: "Check your email",
		lead: `If ${email.trim()} has a LeadKeep account, a reset link is on its way. It can take a minute; check spam too.`,
		footer: back,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			className: "w-full border-white/20 bg-transparent text-white hover:bg-white/10",
			onClick: () => setSent(false),
			children: "Use a different email"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthCard, {
		title: "Forgot your password?",
		lead: "Enter your account email and we'll send you a link to set a new one.",
		footer: back,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => void submit(event),
			noValidate: true,
			className: "flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: "reset-email",
				label: "Email",
				error,
				tone: "onDark",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					id: "reset-email",
					type: "email",
					autoComplete: "email",
					inputMode: "email",
					value: email,
					onChange: (event) => setEmail(event.target.value),
					tone: "onDark"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "accent",
				className: "w-full",
				disabled: pending,
				children: pending ? "Sending…" : "Send reset link"
			})]
		})
	});
}
//#endregion
export { ForgotPassword as component };
