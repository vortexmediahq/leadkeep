import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TextInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { D as verifyMfaCode, b as signOut, r as AuthShell, t as AUTH_PANEL } from "./session-CpXzyFkR.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mfa-challenge-B0DKDHYU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MfaChallenge({ embedded }) {
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const submit = async (event) => {
		event.preventDefault();
		const value = code.replace(/\s/g, "");
		if (!/^\d{6}$/.test(value)) {
			setError("Enter the 6-digit code from your authenticator app.");
			return;
		}
		setPending(true);
		setError("");
		try {
			await verifyMfaCode(value);
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "That code didn't work. Try again.");
		} finally {
			setPending(false);
		}
	};
	const form = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (event) => void submit(event),
		className: embedded ? "flex flex-col gap-4" : AUTH_PANEL,
		noValidate: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: embedded ? "text-2xl font-semibold tracking-tight" : "text-2xl font-semibold tracking-tight text-white",
				children: "Enter your code"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: embedded ? "mt-1 text-sm text-muted" : "mt-1 text-sm text-[#c5d0de]",
				children: "Open your authenticator app and type the 6-digit code for LeadKeep."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "mfa-code",
						label: "Authenticator code",
						error,
						tone: embedded ? void 0 : "onDark",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							id: "mfa-code",
							inputMode: "numeric",
							autoComplete: "one-time-code",
							value: code,
							onChange: (event) => setCode(event.target.value),
							tone: embedded ? void 0 : "onDark"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "accent",
						className: "w-full",
						disabled: pending,
						children: pending ? "Checking…" : "Continue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: embedded ? "text-sm font-medium text-muted" : "text-sm font-medium text-white/70",
						onClick: () => void signOut(),
						children: "Use a different account"
					})
				]
			})
		]
	});
	if (embedded) return form;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthShell, { children: form });
}
//#endregion
export { MfaChallenge as t };
