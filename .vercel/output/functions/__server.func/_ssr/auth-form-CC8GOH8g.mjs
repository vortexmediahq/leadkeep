import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TextInput, n as Mark, t as Field } from "./fields-B5r7wua3.mjs";
import { t as Button } from "./button-B-Za3APP.mjs";
import { a as useSession, i as startSessionListener, r as signUp, t as signIn } from "./session-BtLIdwA_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-form-CC8GOH8g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COPY = {
	login: {
		title: "Log in",
		lead: "Open your lead desk.",
		submit: "Log in",
		pending: "Logging in…",
		switchText: "New to LeakKeep?",
		switchLabel: "Create an account",
		switchTo: "/signup"
	},
	signup: {
		title: "Create your account",
		lead: "Your leads, services, and quote style stay private to you.",
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
	(0, import_react.useEffect)(() => {
		startSessionListener();
	}, []);
	(0, import_react.useEffect)(() => {
		if (status === "signed-in") navigate({ to: "/" });
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
			await navigate({ to: "/" });
		} catch (error) {
			setErrors({ form: error instanceof Error ? error.message : "Something went wrong. Try again." });
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-screen items-center justify-center bg-mist px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-semibold tracking-tight",
						children: "LeakKeep"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Lead desk"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => void submit(event),
					className: "rounded-3xl border border-line bg-paper p-4 shadow-panel sm:p-6",
					noValidate: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold tracking-tight",
							children: copy.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: copy.lead
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-col gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "auth-email",
									label: "Email",
									error: errors.email,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										id: "auth-email",
										type: "email",
										autoComplete: "email",
										inputMode: "email",
										value: email,
										onChange: (event) => setEmail(event.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "auth-password",
									label: "Password",
									error: errors.password,
									hint: mode === "signup" ? "At least 6 characters." : void 0,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										id: "auth-password",
										type: "password",
										autoComplete: mode === "login" ? "current-password" : "new-password",
										value: password,
										onChange: (event) => setPassword(event.target.value)
									})
								}),
								errors.form ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-lost",
									role: "alert",
									children: errors.form
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									className: "w-full",
									disabled: pending,
									children: pending ? copy.pending : copy.submit
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-center text-sm text-muted",
					children: [
						copy.switchText,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: copy.switchTo,
							className: "font-medium text-primary",
							children: copy.switchLabel
						})
					]
				})
			]
		})
	});
}
//#endregion
export { AuthForm as t };
