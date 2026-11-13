import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as TextArea, r as SelectInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { E as useSession } from "./session-CpXzyFkR.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
import { n as format } from "../_libs/date-fns.mjs";
import { _ as validateFeedback, d as sendFeedback, i as FEEDBACK_MAX, l as isFeedbackAdmin, n as AppShell, r as FEEDBACK_KINDS, s as fetchFeedback } from "./app-shell-CkBjUj6N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/feedback-Dc5WauXY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FeedbackPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feedback, {}) });
}
var kindLabel = (kind) => FEEDBACK_KINDS.find((item) => item.id === kind)?.label ?? "Other";
function Feedback() {
	const email = useSession((state) => state.user?.email ?? "");
	const [kind, setKind] = (0, import_react.useState)("idea");
	const [message, setMessage] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [sent, setSent] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [admin, setAdmin] = (0, import_react.useState)(false);
	const [items, setItems] = (0, import_react.useState)([]);
	const refresh = () => {
		isFeedbackAdmin().then(setAdmin);
		fetchFeedback().then(setItems);
	};
	(0, import_react.useEffect)(refresh, []);
	const onSend = async () => {
		const problem = validateFeedback(message);
		if (problem) return setError(problem);
		setPending(true);
		setError("");
		try {
			await sendFeedback({
				kind,
				message,
				page: document.referrer ? new URL(document.referrer).pathname : "",
				email
			});
			setMessage("");
			setSent(true);
			refresh();
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Something went wrong.");
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Tell us what you think"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Got an idea, spotted a problem, or love something? Tell us. A real person reads every message."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4 rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "rounded-xl bg-accent-soft px-3 py-2 text-sm",
						children: "Thank you! Your message has been sent."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "feedback-kind",
						label: "What is it about?",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
							id: "feedback-kind",
							value: kind,
							onChange: (event) => setKind(event.target.value),
							children: FEEDBACK_KINDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.id,
								children: item.label
							}, item.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "feedback-message",
						label: "Your message",
						hint: `${message.length}/${FEEDBACK_MAX}`,
						error,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							id: "feedback-message",
							value: message,
							maxLength: FEEDBACK_MAX,
							placeholder: "For example: It would help me if…",
							onChange: (event) => {
								setMessage(event.target.value);
								setSent(false);
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "accent",
						className: "self-start",
						disabled: pending,
						onClick: () => void onSend(),
						children: pending ? "Sending…" : "Send"
					})
				]
			}),
			items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight",
					children: admin ? "All feedback (admin)" : "Your messages"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-b border-line py-3 last:border-b-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								kindLabel(item.kind),
								" · ",
								format(new Date(item.createdAt), "d MMM yyyy, HH:mm"),
								admin && item.email ? ` · ${item.email}` : ""
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 break-words whitespace-pre-wrap",
							children: item.message
						})]
					}, item.id))
				})]
			}) : null
		]
	});
}
//#endregion
export { FeedbackPage as component };
