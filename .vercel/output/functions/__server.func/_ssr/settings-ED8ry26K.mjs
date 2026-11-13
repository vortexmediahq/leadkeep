import { i as __toESM } from "../_runtime.mjs";
import { At as uploadBrandImage, D as effectiveTier, W as hasBranding, a as HEX_COLOR, et as parseHexColor, p as QUOTE_STYLES, t as BRAND_FONTS } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TextInput, r as SelectInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { t as BrandMark } from "./brand-mark-CkcOvvyS.mjs";
import { C as startTotpEnrollment, E as useSession, a as confirmTotpEnrollment, b as signOut, c as downloadJson, f as listPasskeys, g as registerPasskey, h as passkeysSupported, i as UNUSUAL_COPY, l as downloadLeadsCsv, m as markLoginEventsSeen, o as deleteMyAccount, p as listTotpFactors, s as deletePasskey, u as fetchRecentLoginEvents, w as unenrollTotp } from "./session-CpXzyFkR.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { f as useAccess, g as useLeakKeep, n as AppShell, p as useAlerts, t as ALERT_CHANNELS, v as wantsEmail } from "./app-shell-CkBjUj6N.mjs";
import { t as NOTIFY_SETUP_KEY } from "./setup-progress-wfvHHY4f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-ED8ry26K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsBranding() {
	const userId = useSession((state) => state.user?.id ?? "");
	const business = useLeakKeep((state) => state.business);
	const branding = useLeakKeep((state) => state.branding);
	const updateBusiness = useLeakKeep((state) => state.updateBusiness);
	const updateBranding = useLeakKeep((state) => state.updateBranding);
	const setLogo = useLeakKeep((state) => state.setLogo);
	const clearLogo = useLeakKeep((state) => state.clearLogo);
	const locked = !useAccess().features.customBranding;
	const [logoError, setLogoError] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const onFile = async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !userId) return;
		setUploading(true);
		setLogoError("");
		try {
			await setLogo(file, userId);
		} catch (problem) {
			setLogoError(problem instanceof Error ? problem.message : "We couldn't upload that logo.");
		} finally {
			setUploading(false);
		}
	};
	const setColor = (key, value) => {
		const next = parseHexColor(value);
		if (next || value === "") updateBranding({ [key]: next });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "branding",
		className: "scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold tracking-tight",
				children: "Your branding"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Add a logo and colours so your enquiry form and quotes look like you. Your logo is never stretched."
			}),
			locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-2xl border border-accent/30 bg-accent-soft p-3",
				role: "status",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-ink",
						children: "Your own logo and colours are on Care and Growth"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-ink-soft",
						children: "Upgrade your plan to put your branding on your enquiry form, quotes and this app."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "accent",
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pricing",
							children: "Upgrade your plan"
						})
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				disabled: locked,
				className: locked ? "mt-4 flex flex-col gap-4 opacity-50" : "mt-4 flex flex-col gap-4",
				"aria-disabled": locked,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Logo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-center gap-4",
							children: [branding.logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-2xl border border-line bg-mist px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
									path: branding.logoPath,
									name: business.name,
									heightClass: "h-14"
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-14 w-28 place-items-center rounded-2xl border border-dashed border-line text-xs text-muted",
								children: "No logo yet"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "secondary",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "cursor-pointer",
										children: [uploading ? "Uploading…" : branding.logoPath ? "Replace logo" : "Upload logo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											accept: "image/png,image/jpeg,image/webp,image/svg+xml",
											className: "sr-only",
											onChange: (event) => void onFile(event),
											disabled: uploading
										})]
									})
								}), branding.logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									size: "sm",
									onClick: () => {
										setLogoError("");
										clearLogo();
									},
									children: "Remove"
								}) : null]
							})]
						}),
						logoError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-lost",
							children: logoError
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "PNG, JPG, WEBP or SVG, under 2 MB."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "brand-name",
						label: "Business name on forms and quotes",
						hint: "This is the same name as on the Links page.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							id: "brand-name",
							value: business.name,
							onChange: (event) => updateBusiness({ name: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
							id: "primary-color",
							label: "Main colour",
							value: branding.primaryColor,
							onChange: (value) => setColor("primaryColor", value),
							onPicker: (value) => setColor("primaryColor", value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
							id: "accent-color",
							label: "Accent colour",
							value: branding.accentColor,
							onChange: (value) => setColor("accentColor", value),
							onPicker: (value) => setColor("accentColor", value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "brand-font",
						label: "Font",
						hint: "Optional. Used on your enquiry form and quotes.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
							id: "brand-font",
							value: branding.font,
							onChange: (event) => updateBranding({ font: event.target.value }),
							children: BRAND_FONTS.map((font) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: font.id,
								children: font.label
							}, font.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-3 rounded-2xl border border-line px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mt-1 size-4 accent-accent",
							checked: branding.showOnForm,
							onChange: (event) => updateBranding({ showOnForm: event.target.checked })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium",
							children: "Show this branding on the enquiry form"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm text-muted",
							children: "Customers see your logo and colours when they fill in a link."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-3 rounded-2xl border border-line px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mt-1 size-4 accent-accent",
							checked: branding.showOnQuote,
							onChange: (event) => updateBranding({ showOnQuote: event.target.checked })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium",
							children: "Show this branding on quotes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm text-muted",
							children: "A preview appears on each lead so you can copy a quote that looks like you."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteOptions, { userId }),
					hasBranding(branding) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Once your branding is on, the \"Powered by LeadKeep\" line stays small and sits under your logo or at the bottom."
					}) : null
				]
			})
		]
	});
}
function ColorField({ id, label, value, onChange, onPicker }) {
	const [draft, setDraft] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => {
		setDraft(value);
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		id,
		label,
		hint: "Leave blank to keep LeadKeep's colour.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "color",
				"aria-label": `${label} picker`,
				className: "size-11 shrink-0 cursor-pointer rounded-lg border border-line bg-paper p-1",
				value: HEX_COLOR.test(value) ? value : "#0B1F3B",
				onChange: (event) => {
					const next = event.target.value.toUpperCase();
					setDraft(next);
					onPicker(next);
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				id,
				value: draft,
				placeholder: "#0B1F3B",
				onChange: (event) => {
					let next = event.target.value.trim().toUpperCase();
					if (next && !next.startsWith("#")) next = `#${next}`;
					if (next.length > 7) return;
					setDraft(next);
					if (next === "" || HEX_COLOR.test(next)) onChange(next);
				}
			})]
		})
	});
}
function QuoteOptions({ userId }) {
	const branding = useLeakKeep((state) => state.branding);
	const updateBranding = useLeakKeep((state) => state.updateBranding);
	const [error, setError] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const onBackground = async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !userId) return;
		setUploading(true);
		setError("");
		try {
			updateBranding({ quoteBgPath: await uploadBrandImage(userId, file, "quote-bg") });
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "We couldn't upload that picture.");
		} finally {
			setUploading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 border-t border-line pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold tracking-tight",
				children: "Your quotes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Pick how the quote your customer sees looks."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "radiogroup",
				"aria-label": "Quote style",
				className: "grid gap-2 sm:grid-cols-3",
				children: QUOTE_STYLES.map((style) => {
					const on = branding.quoteStyle === style.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "radio",
						"aria-checked": on,
						onClick: () => updateBranding({ quoteStyle: style.id }),
						className: cn("press rounded-2xl border p-3 text-left", on ? "border-ink bg-mist" : "border-line bg-paper"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium",
							children: style.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted",
							children: style.help
						})]
					}, style.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-start gap-3 rounded-2xl border border-line px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "mt-1 size-4 accent-accent",
					checked: branding.logoOnQuote,
					onChange: (event) => updateBranding({ logoOnQuote: event.target.checked })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-medium",
					children: "Put my logo on quotes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm text-muted",
					children: "Untick to send quotes with your business name only."
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-start gap-3 rounded-2xl border border-line px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "mt-1 size-4 accent-accent",
					checked: branding.logoOnForm,
					onChange: (event) => updateBranding({ logoOnForm: event.target.checked })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-medium",
					children: "Put my logo on forms and link pages"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm text-muted",
					children: "What customers see before they send a request."
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Quote background (optional)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "cursor-pointer",
							children: [uploading ? "Uploading…" : branding.quoteBgPath ? "Replace background" : "Upload background", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/png,image/jpeg,image/webp",
								className: "sr-only",
								onChange: (event) => void onBackground(event),
								disabled: uploading
							})]
						})
					}), branding.quoteBgPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						size: "sm",
						onClick: () => updateBranding({ quoteBgPath: "" }),
						children: "Remove"
					}) : null]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-lost",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Shown faintly behind the quote so the words stay easy to read. Under 2 MB."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: "quote-days",
				label: "Quotes stay open for (days)",
				hint: "After this, the Accept button turns off. 1 to 90 days.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					id: "quote-days",
					type: "number",
					inputMode: "numeric",
					min: 1,
					max: 90,
					value: branding.quoteValidDays,
					onChange: (event) => {
						const days = Math.round(Number(event.target.value));
						if (Number.isFinite(days) && days >= 1 && days <= 90) updateBranding({ quoteValidDays: days });
					}
				})
			})
		]
	});
}
function SettingsPrivacy() {
	const email = useSession((state) => state.user?.email ?? "");
	const business = useLeakKeep((state) => state.business);
	const branding = useLeakKeep((state) => state.branding);
	const services = useLeakKeep((state) => state.services);
	const links = useLeakKeep((state) => state.links);
	const questionnaires = useLeakKeep((state) => state.questionnaires);
	const template = useLeakKeep((state) => state.template);
	const leads = useLeakKeep((state) => state.leads);
	const channel = useAlerts((state) => state.channel);
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const download = () => {
		const payload = {
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			business,
			branding,
			services,
			links,
			questionnaires,
			quoteStyle: {
				tone: template.tone,
				structure: template.structure,
				paymentTerms: template.paymentTerms,
				warranty: template.warranty,
				extra: template.extra
			},
			leads,
			alertChannel: channel
		};
		const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		downloadJson(`leadkeep-data-${stamp}.json`, payload);
		downloadLeadsCsv(`leadkeep-leads-${stamp}.csv`, leads);
	};
	const destroy = async () => {
		if (confirm.trim().toLowerCase() !== "delete") return;
		setPending(true);
		setError("");
		try {
			await deleteMyAccount();
			await signOut();
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "We couldn't delete your account just yet.");
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "privacy",
		className: "scroll-mt-20 flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Your data"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Under POPIA you can get a copy of the information we hold for you, or ask us to delete your account."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						className: "mt-3",
						onClick: download,
						children: "Download my data"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "You'll get a JSON file of your settings, questionnaires and leads, plus a CSV of your leads."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-lost/30 bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Delete my account and data"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "This permanently removes your account, leads, questionnaires, branding and settings. It cannot be undone. Your enquiry links will stop working."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "confirm-delete",
						label: `Type delete to confirm${email ? ` for ${email}` : ""}`,
						error,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							id: "confirm-delete",
							value: confirm,
							autoComplete: "off",
							onChange: (event) => setConfirm(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						className: "mt-3 bg-lost text-white hover:bg-lost/90",
						disabled: pending || confirm.trim().toLowerCase() !== "delete",
						onClick: () => void destroy(),
						children: pending ? "Deleting…" : "Delete my account and data"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Read our",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/privacy",
						className: "font-medium text-primary",
						children: "Privacy Policy"
					}),
					" ",
					"and",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/terms",
						className: "font-medium text-primary",
						children: "Terms"
					}),
					". These pages are a draft for review, not legal advice."
				]
			})
		]
	});
}
function SettingsSecurity() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "security",
		className: "scroll-mt-20 flex flex-col gap-4 rounded-3xl border border-line bg-paper p-4 shadow-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold tracking-tight",
				children: "Sign-in security"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Extra steps so only you can open your lead inbox."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TotpSettings, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasskeySettings, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnusualList, {})
		]
	});
}
function TotpSettings() {
	const [factors, setFactors] = (0, import_react.useState)([]);
	const [enroll, setEnroll] = (0, import_react.useState)(null);
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const refresh = () => void listTotpFactors().then(setFactors);
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	const start = async () => {
		setPending(true);
		setError("");
		setMessage("");
		try {
			setEnroll(await startTotpEnrollment());
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "Couldn't start authenticator setup.");
		} finally {
			setPending(false);
		}
	};
	const confirm = async (event) => {
		event.preventDefault();
		if (!enroll) return;
		setPending(true);
		setError("");
		try {
			await confirmTotpEnrollment(enroll.factorId, code);
			setEnroll(null);
			setCode("");
			setMessage("Authenticator app is on. You'll be asked for a code the next time you log in.");
			refresh();
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "That code didn't work.");
		} finally {
			setPending(false);
		}
	};
	const turnOff = async (id) => {
		if (!window.confirm("Turn off the authenticator app? You'll only need your password (or fingerprint) to log in.")) return;
		setPending(true);
		setError("");
		try {
			await unenrollTotp(id);
			setMessage("Authenticator app is off.");
			refresh();
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "We couldn't turn that off.");
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Authenticator app"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "After your password, you'll enter a 6-digit code from an app such as Google Authenticator, Authy or 1Password."
			}),
			factors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-won",
					children: "On"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					size: "sm",
					disabled: pending,
					onClick: () => void turnOff(factors[0].id),
					children: "Turn off"
				})]
			}) : enroll ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => void confirm(event),
				className: "mt-4 flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Scan this with your authenticator app, or type the key below."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: enroll.qrCode,
						alt: "Authenticator QR code",
						className: "size-40 rounded-xl bg-paper object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-all font-mono text-xs text-ink-soft",
						children: enroll.secret
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						id: "enroll-code",
						label: "Enter the 6-digit code to confirm",
						error,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							id: "enroll-code",
							inputMode: "numeric",
							autoComplete: "one-time-code",
							value: code,
							onChange: (event) => setCode(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "sm",
							disabled: pending,
							children: pending ? "Checking…" : "Turn on"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "secondary",
							onClick: () => {
								setEnroll(null);
								setError("");
							},
							children: "Cancel"
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				size: "sm",
				className: "mt-3",
				disabled: pending,
				onClick: () => void start(),
				children: pending ? "Starting…" : "Set up authenticator"
			}),
			error && !enroll ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-lost",
				children: error
			}) : null,
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-ink-soft",
				children: message
			}) : null
		]
	});
}
function PasskeySettings() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const supported = passkeysSupported();
	const refresh = () => void listPasskeys().then((list) => setItems(list)).catch(() => setItems([]));
	(0, import_react.useEffect)(() => {
		if (supported) refresh();
	}, [supported]);
	const add = async () => {
		setPending(true);
		setError("");
		setMessage("");
		try {
			await registerPasskey();
			setMessage("This device can now unlock LeadKeep with your fingerprint, face or device PIN.");
			refresh();
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "We couldn't add this device.");
		} finally {
			setPending(false);
		}
	};
	const remove = async (id) => {
		if (!window.confirm("Remove fingerprint login from this device?")) return;
		setPending(true);
		setError("");
		try {
			await deletePasskey(id);
			setMessage("Removed.");
			refresh();
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : "We couldn't remove that.");
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Fingerprint or face unlock"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "After you have an account, you can unlock LeadKeep with this device's fingerprint, face or PIN. This uses a passkey, which stays on your device."
			}),
			!supported ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "This browser doesn't support fingerprint or face unlock."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 rounded-xl bg-mist px-3 py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.friendly_name || item.name || "This device" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						size: "sm",
						disabled: pending,
						onClick: () => void remove(item.id),
						children: "Remove"
					})]
				}, item.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "No devices added yet."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				size: "sm",
				className: "mt-3",
				disabled: pending,
				onClick: () => void add(),
				children: pending ? "Waiting for your device…" : "Add this device"
			})] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-lost",
				children: error
			}) : null,
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-ink-soft",
				children: message
			}) : null
		]
	});
}
function UnusualList() {
	const [events, setEvents] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		fetchRecentLoginEvents().then((list) => {
			setEvents(list);
			if (list.some((item) => !item.seenAt)) markLoginEventsSeen();
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Unusual activity"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "We'll flag a new device, a sign-in from a new time zone, or several failed password attempts. Notices also appear at the top of the app."
			}),
			events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "No unusual sign-ins recorded."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: events.map((event) => {
					const copy = event.reason ? UNUSUAL_COPY[event.reason] : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl bg-mist px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: copy?.title ?? "Unusual sign-in"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted",
							children: [
								formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }),
								event.deviceLabel ? ` · ${event.deviceLabel}` : "",
								event.timezone ? ` · ${event.timezone}` : ""
							]
						})]
					}, event.id);
				})
			})
		]
	});
}
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {}) });
}
function Settings() {
	const userId = useSession((state) => state.user?.id ?? null);
	const loginEmail = useSession((state) => state.user?.email ?? "");
	const businessEmail = useLeakKeep((state) => state.business.email);
	const entitlements = useLeakKeep((state) => state.entitlements);
	const { channel, load, setChannel } = useAlerts();
	const [saved, setSaved] = (0, import_react.useState)(false);
	const emailOk = useAccess().features.emailAlerts;
	const tier = effectiveTier(entitlements);
	const planName = entitlements.admin ? "Owner access (no limits)" : entitlements.tier === "free" && tier !== "free" && !entitlements.admin ? "early access (full, for now)" : {
		"free": "the Free plan",
		"care": "the Care plan",
		"growth": "the Growth plan"
	}[tier] + (entitlements.founding ? ", at the founding price" : "");
	const canUpgrade = !entitlements.admin && tier !== "growth";
	(0, import_react.useEffect)(() => {
		if (userId) load(userId);
	}, [userId, load]);
	(0, import_react.useEffect)(() => {
		try {
			window.localStorage.setItem(NOTIFY_SETUP_KEY, "1");
		} catch {}
	}, []);
	const sendTo = businessEmail.trim() || loginEmail;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Choose how LeadKeep tells you about new leads."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "plan",
				className: "scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Your plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"You're on ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-ink",
								children: planName
							}),
							".",
							entitlements.periodEnd ? " Renews or ends on the date shown on the pricing page." : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-3",
						variant: canUpgrade ? "accent" : "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pricing",
							children: canUpgrade ? "Upgrade" : "See plans"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "alerts",
				className: "scroll-mt-20 rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "New lead alerts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "mt-3 flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "sr-only",
							children: "How should we tell you about new leads?"
						}), ALERT_CHANNELS.map((option) => {
							const locked = !emailOk && wantsEmail(option.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: cn("press flex items-start gap-3 rounded-2xl border px-4 py-3", locked ? "cursor-not-allowed opacity-60" : "cursor-pointer", channel === option.id && !locked ? "border-accent bg-accent-soft" : "border-line"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "alert-channel",
									className: "mt-1 size-4 accent-accent",
									checked: locked ? false : emailOk ? channel === option.id : option.id === "app",
									disabled: locked,
									onChange: () => {
										setChannel(option.id).then(() => {
											setSaved(true);
											window.setTimeout(() => setSaved(false), 2e3);
										});
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-medium",
									children: option.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm text-muted",
									children: locked ? "Email alerts come with Care and Growth." : option.help
								})] })]
							}, option.id);
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						"aria-live": "polite",
						children: saved ? "Saved." : emailOk && channel !== "app" ? `Emails go to ${sendTo || "your login email"}.` : "\xA0"
					}),
					!emailOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-ink-soft",
						children: [
							"On the Free plan new leads show up under the bell.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/pricing",
								className: "font-medium text-primary",
								children: "Upgrade for email alerts"
							}),
							"."
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Want emails sent somewhere else? Change the email in your business details on the",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/links",
								className: "font-medium text-primary",
								children: "Links"
							}),
							" ",
							"page."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsBranding, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSecurity, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight",
					children: "Follow-up reminders"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Leads still marked \"New\" after 24 hours get an orange \"Follow up\" tag, so nobody slips through the cracks."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Tell us what you think"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Ideas, problems or praise. We read every message."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "accent",
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/feedback",
							children: "Send feedback"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPrivacy, {})
		]
	});
}
//#endregion
export { SettingsPage as component };
