import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-CeKzjCG5.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function oneLine(value, max = 96) {
	const flat = value.replace(/\s+/g, " ").trim();
	if (flat.length <= max) return flat;
	return `${flat.slice(0, max - 1).trimEnd()}…`;
}
function firstName(name) {
	return name.trim().split(/\s+/)[0] || name;
}
//#endregion
export { firstName as n, oneLine as r, cn as t };
