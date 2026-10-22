import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as cn } from "./fields-9FC-irLv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-badge-Db6qe6Ua.js
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	{
		id: "new",
		label: "New"
	},
	{
		id: "contacted",
		label: "Contacted"
	},
	{
		id: "quoted",
		label: "Quoted"
	},
	{
		id: "won",
		label: "Won"
	},
	{
		id: "lost",
		label: "Lost"
	}
];
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
//#endregion
export { StatusBadge as n, STATUSES as t };
