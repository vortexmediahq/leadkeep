import { i as __toESM } from "../_runtime.mjs";
import { ht as submitLandingRequest, it as publicLogoUrl, tt as parseVideoUrl, yt as supabase } from "./data-vq0z3oFT.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { j as Check } from "../_libs/lucide-react.mjs";
import { a as TextInput, t as Field } from "./fields-Zm5jyQkz.mjs";
import { n as BrandTheme, r as PoweredBy, t as BrandMark } from "./brand-mark-CkcOvvyS.mjs";
import { r as Mark } from "./mark-I_x-2mlQ.mjs";
import { t as Button } from "./button-BbNg3-4z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/landing--es_bVeY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Image or video shown above the form: an uploaded picture, or a YouTube/Vimeo link. */
function LandingMedia({ mediaPath, mediaUrl, title }) {
	const video = mediaUrl ? parseVideoUrl(mediaUrl) : null;
	if (video) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "aspect-video overflow-hidden rounded-2xl border border-line bg-mist",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			src: video.embedUrl,
			title: title || "Video",
			className: "size-full",
			loading: "lazy",
			allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen",
			referrerPolicy: "strict-origin-when-cross-origin",
			allowFullScreen: true
		})
	});
	const src = mediaPath ? publicLogoUrl(mediaPath) : "";
	if (!src) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: title || "Business",
		className: "max-h-80 w-full rounded-2xl border border-line object-cover"
	});
}
/** Landing page for quote links and simple call-to-action links. */
function Landing({ slug, form, preview }) {
	const navigate = useNavigate();
	const { business, landing, branding } = form;
	const isQuote = form.kind === "quote";
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [website, setWebsite] = (0, import_react.useState)("");
	const [consent, setConsent] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const [done, setDone] = (0, import_react.useState)(null);
	const headline = landing.headline.trim() || (isQuote && landing.serviceName ? `Get your ${landing.serviceName} quote` : business.name || "Get in touch");
	const cta = landing.ctaText.trim() || (isQuote ? "Send me this quote" : "Send me more info");
	const logoPath = branding?.logoPath ?? "";
	const wrap = (node) => branding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandTheme, {
		branding,
		className: "min-h-screen",
		children: node
	}) : node;
	const submit = async (event) => {
		event.preventDefault();
		setError("");
		if (!name.trim()) return setError("Please add your name.");
		if (isQuote && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please add a valid email address.");
		if (!isQuote && !email.trim() && !phone.trim()) return setError("Please add an email address or a phone number.");
		if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("That email address doesn't look right.");
		if (!consent) return setError("Please tick the box so we can contact you about this.");
		if (preview) return setError("This is a preview, so nothing was sent.");
		setSending(true);
		try {
			const result = await submitLandingRequest(slug, {
				name: name.trim(),
				email: email.trim(),
				phone: phone.trim(),
				website,
				consent
			});
			if (!result.ok) throw new Error("not ok");
			if (result.token && result.state === "sent") {
				supabase.functions.invoke("send-quote", { body: { token: result.token } }).catch(() => void 0);
				navigate({
					to: "/q/$token",
					params: { token: result.token }
				});
				return;
			}
			setDone(isQuote ? "review" : "simple");
		} catch {
			setError("We couldn't send that. Please check your details and try again.");
		} finally {
			setSending(false);
		}
	};
	if (done) return wrap(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-line bg-paper p-6 shadow-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-12 place-items-center rounded-full bg-accent-soft text-accent-strong",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-6",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-2xl font-semibold tracking-tight",
					children: "Thanks, we've got it"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-base text-ink-soft",
					children: [
						"Thanks ",
						name.trim().split(/\s+/)[0],
						".",
						" ",
						done === "review" ? `${business.name || "The business"} will check the details and send your quote soon.` : `${business.name || "The business"} has your details and will be in touch soon.`
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, {
			compact: !!logoPath,
			className: "mt-6"
		})]
	}));
	return wrap(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col gap-5 px-4 py-6 sm:py-10",
		children: [
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-ink",
					children: "Preview: this is how your customer sees it"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					type: "button",
					onClick: preview.onBack,
					children: "Back"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3",
				children: [logoPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
					path: logoPath,
					name: business.name,
					heightClass: "h-12"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "min-w-0 truncate text-lg font-semibold tracking-tight",
					children: business.name || "Get in touch"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingMedia, {
				mediaPath: landing.mediaPath,
				mediaUrl: landing.mediaUrl,
				title: headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => void submit(event),
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel sm:p-6",
				noValidate: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: headline
					}),
					landing.intro.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-base whitespace-pre-line text-ink-soft",
						children: landing.intro
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Your name",
								id: "landing-name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "landing-name",
									autoComplete: "name",
									value: name,
									onChange: (e) => setName(e.target.value),
									maxLength: 120
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: isQuote ? "Email (we'll send your quote here)" : "Email",
								id: "landing-email",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "landing-email",
									type: "email",
									autoComplete: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									maxLength: 200
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: isQuote ? "Phone (optional)" : "Phone",
								id: "landing-phone",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									id: "landing-phone",
									type: "tel",
									autoComplete: "tel",
									value: phone,
									onChange: (e) => setPhone(e.target.value),
									maxLength: 40
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"aria-hidden": "true",
								className: "absolute -left-[9999px] h-0 w-0 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Website", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									tabIndex: -1,
									autoComplete: "off",
									value: website,
									onChange: (e) => setWebsite(e.target.value)
								})] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-start gap-3 text-sm text-ink-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "mt-1 size-5 shrink-0",
									checked: consent,
									onChange: (e) => setConsent(e.target.checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"I agree that ",
									business.name || "this business",
									" may contact me about my request and keep my details for that purpose."
								] })]
							})
						]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-4 text-sm text-lost",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "mt-5 w-full",
						disabled: sending,
						children: sending ? "Sending…" : cta
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoweredBy, { compact: !!logoPath })
		]
	}));
}
//#endregion
export { LandingMedia as n, Landing as t };
