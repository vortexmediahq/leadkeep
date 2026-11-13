import { ut as quoteStateLabel } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as STATUSES } from "./types-DRh0686U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-badge-CWLT8zrl.js
var import_jsx_runtime = require_jsx_runtime();
var tones = {
	new: "bg-primary-soft text-primary",
	contacted: "bg-mist text-ink-soft",
	quoted: "border border-line bg-paper text-ink",
	won: "bg-won-soft text-won",
	lost: "bg-lost-soft text-lost"
};
function StatusBadge({ status }) {
	const label = STATUSES.find((item) => item.id === status)?.label ?? status;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-medium", tones[status]),
		children: label
	});
}
var quoteTones = {
	review: "bg-primary-soft text-primary",
	sent: "border border-line bg-paper text-ink",
	viewed: "bg-mist text-ink",
	accepted: "bg-won-soft text-won"
};
/** The badge a lead shows in lists: a live quote step wins over the plain status, except won and lost. */
function LeadBadge({ lead }) {
	const state = lead.quoteState;
	if (state && lead.status !== "won" && lead.status !== "lost") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-medium", quoteTones[state]),
		children: quoteStateLabel(state)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: lead.status });
}
//#endregion
export { LeadBadge as t };
