import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TextInput, n as PasswordInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { E as useSession, S as startSessionListener, h as passkeysSupported, r as AuthShell, t as AUTH_PANEL, v as signIn, x as signUp, y as signInWithPasskey } from "./session-CpXzyFkR.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
import { t as MfaChallenge } from "./mfa-challenge-B0DKDHYU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-form-Bwxkkgb8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COPY = {
	login: {
		title: "Log in",
		lead: "Open your lead inbox.",
		submit: "Log in",
		pending: "Logging in…",
		switchText: "New to LeadKeep?",
		switchLabel: "Create an account",
		switchTo: "/signup"
	},
	signup: {
		title: "Create your account",
		lead: "Build your questionnaire, share the link, and every answer lands here. Private to you.",
		submit: "Create account",
		pending: "Creating account…",
		switchText: "Already have an account?",
		switchLabel: "Log in",
		switchTo: "/login"
	}
};
function AuthForm({ mode }) {
	const copy = COPY[mode];
	const navigate = useNavigate();
	const status = useSession((state) => state.status);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [pending, setPending] = (0, import_react.useState)(false);
	const [passkeyPending, setPasskeyPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		startSessionListener();
	}, []);
	(0, import_react.useEffect)(() => {
		if (status === "signed-in") navigate({ to: "/dashboard" });
	}, [status, navigate]);
	const submit = async (event) => {
		event.preventDefault();
		const next = {};
		if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
		if (password.length < 6) next.password = "Use at least 6 characters.";
		setErrors(next);
		if (Object.keys(next).length) return;
		setPending(true);
		try {
			if (mode === "login") await signIn(email.trim(), password);
			else await signUp(email.trim(), password);
			await navigate({ to: "/dashboard" });
		} catch (error) {
			setErrors({ form: error instanceof Error ? error.message : "Something went wrong. Try again." });
		} finally {
			setPending(false);
		}
	};
	const onPasskey = async () => {
		setPasskeyPending(true);
		setErrors({});
		try {
			await signInWithPasskey();
			await navigate({ to: "/dashboard" });
		} catch (error) {
			setErrors({ form: error instanceof Error ? error.message : "Something went wrong. Try again." });
		} finally {
			setPasskeyPending(false);
		}
	};
	if (status === "needs-mfa") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MfaChallenge, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => void submit(event),
			className: AUTH_PANEL,
			noValidate: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight text-white",
					children: copy.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-[#c5d0de]",
					children: copy.lead
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							id: "auth-email",
							label: "Email",
							error: errors.email,
							tone: "onDark",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								id: "auth-email",
								type: "email",
								autoComplete: mode === "login" ? "username webauthn" : "email",
								inputMode: "email",
								value: email,
								onChange: (event) => setEmail(event.target.value),
								tone: "onDark"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							id: "auth-password",
							label: "Password",
							error: errors.password,
							hint: mode === "signup" ? "At least 6 characters." : void 0,
							tone: "onDark",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
								id: "auth-password",
								autoComplete: mode === "login" ? "current-password" : "new-password",
								value: password,
								onChange: (event) => setPassword(event.target.value),
								tone: "onDark"
							})
						}),
						mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/forgot-password",
							className: "-mt-2 block w-full text-center text-sm font-medium text-[#c5d0de] hover:text-accent",
							children: "Forgot password?"
						}) : null,
						errors.form ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-red-300",
							role: "alert",
							children: errors.form
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "accent",
							className: "w-full",
							disabled: pending,
							children: pending ? copy.pending : copy.submit
						}),
						mode === "login" && passkeysSupported() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							className: "w-full border-white/20 bg-transparent text-white hover:bg-white/10",
							disabled: passkeyPending,
							onClick: () => void onPasskey(),
							children: passkeyPending ? "Waiting for your device…" : "Log in with fingerprint or face"
						}) : null
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 w-full text-center text-sm text-white/70",
			children: [
				copy.switchText,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: copy.switchTo,
					className: "font-medium text-accent hover:underline",
					children: copy.switchLabel
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 w-full text-center text-xs text-white/50",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/privacy",
					className: "hover:text-white/80",
					children: "Privacy Policy"
				}),
				" · ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/terms",
					className: "hover:text-white/80",
					children: "Terms"
				})
			]
		})
	] });
}
//#endregion
export { AuthForm as t };
