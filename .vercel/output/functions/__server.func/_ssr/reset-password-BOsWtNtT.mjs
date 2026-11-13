import { i as __toESM } from "../_runtime.mjs";
import { yt as supabase } from "./data-vq0z3oFT.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as PasswordInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { T as updatePassword, n as AuthCard } from "./session-CpXzyFkR.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-BOsWtNtT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPassword() {
	const navigate = useNavigate();
	const [phase, setPhase] = (0, import_react.useState)("checking");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			if (!live) return;
			if (event === "PASSWORD_RECOVERY" || session) setPhase("ready");
		});
		const timer = window.setTimeout(() => {
			supabase.auth.getSession().then(({ data: current }) => {
				if (live) setPhase(current.session ? "ready" : "expired");
			});
		}, 1200);
		return () => {
			live = false;
			window.clearTimeout(timer);
			data.subscription.unsubscribe();
		};
	}, []);
	const submit = async (event) => {
		event.preventDefault();
		const next = {};
		if (password.length < 6) next.password = "Use at least 6 characters.";
		if (confirm !== password) next.confirm = "The passwords don't match.";
		setErrors(next);
		if (Object.keys(next).length) return;
		setPending(true);
		try {
			await updatePassword(password);
			await navigate({ to: "/dashboard" });
		} catch (problem) {
			setErrors({ form: problem instanceof Error ? problem.message : "Something went wrong. Try again." });
		} finally {
			setPending(false);
		}
	};
	if (phase === "checking") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthCard, {
		title: "One moment…",
		lead: "Checking your reset link."
	});
	if (phase === "expired") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthCard, {
		title: "This link has expired",
		lead: "Reset links work once and only for a short time. Ask for a new one.",
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/login",
			className: "font-medium text-accent hover:underline",
			children: "Back to log in"
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			className: "w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/forgot-password",
				children: "Send a new link"
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthCard, {
		title: "Set a new password",
		lead: "Choose a new password for your LeadKeep account.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => void submit(event),
			noValidate: true,
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					id: "new-password",
					label: "New password",
					error: errors.password,
					hint: "At least 6 characters.",
					tone: "onDark",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "new-password",
						autoComplete: "new-password",
						value: password,
						onChange: (event) => setPassword(event.target.value),
						tone: "onDark"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					id: "confirm-password",
					label: "Type it again",
					error: errors.confirm,
					tone: "onDark",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "confirm-password",
						autoComplete: "new-password",
						value: confirm,
						onChange: (event) => setConfirm(event.target.value),
						tone: "onDark"
					})
				}),
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
					children: pending ? "Saving…" : "Save new password"
				})
			]
		})
	});
}
//#endregion
export { ResetPassword as component };
