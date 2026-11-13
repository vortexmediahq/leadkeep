import { i as __toESM } from "../_runtime.mjs";
import { $ as newQuoteToken, W as hasBranding, ct as quotePath, dt as quotesLeft, lt as quoteReminder, ot as quoteExpiry, ut as quoteStateLabel, yt as supabase } from "./data-vq0z3oFT.mjs";
import { t as cn } from "./utils-CeKzjCG5.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ChevronLeft, E as Copy, a as Sparkles, j as Check, m as Mail, p as MessageCircle, u as Phone, y as Link2 } from "../_libs/lucide-react.mjs";
import { i as TextArea, r as SelectInput } from "./fields-Zm5jyQkz.mjs";
import { n as buttonClass, t as Button } from "./button-BbNg3-4z.mjs";
import { n as format, t as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { a as callHref, c as greeting, f as useAccess, g as useLeakKeep, h as useGatedLeads, m as useEffectiveBranding, n as AppShell, o as emailHref, u as needsFollowUp, y as whatsappHref } from "./app-shell-CkBjUj6N.mjs";
import { r as Route$1 } from "./router-B8jrlzhQ.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as STATUSES } from "./types-DRh0686U.mjs";
import { t as LeadBadge } from "./status-badge-CWLT8zrl.mjs";
import { t as QuoteDocument } from "./quote-document-BPnZ9ufN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads._leadId-DgGjDmdG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BrandedQuote({ businessName, branding, text, customer, service, contact }) {
	if (!branding.showOnQuote || !hasBranding(branding) || !text.trim()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteDocument, {
		className: "mt-4",
		style: branding.quoteStyle,
		businessName,
		contact,
		branding,
		logoPath: branding.logoOnQuote ? branding.logoPath : "",
		backgroundPath: branding.quoteBgPath,
		customer,
		service,
		text
	});
}
function brandedQuotePlainText(businessName, text) {
	return [businessName.trim(), text.trim()].filter(Boolean).join("\n\n");
}
/** What the customer sees: the branded quote (or a plain one if no branding is on), with a way back to editing. */
function CustomerQuotePreview({ businessName, branding, text, onBack, customer, service, contact }) {
	const branded = branding.showOnQuote && hasBranding(branding);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-ink",
				children: "Preview: this is how your customer sees the quote"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "secondary",
				onClick: onBack,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-4",
					"aria-hidden": "true"
				}), "Back to edit"]
			})]
		}), branded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandedQuote, {
			businessName,
			branding,
			text,
			customer,
			service,
			contact
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteDocument, {
			className: "mt-4",
			style: "clean",
			businessName,
			contact,
			branding: null,
			logoPath: "",
			customer,
			service,
			text
		})]
	});
}
/** One-tap buttons to reach a lead. Tapping one offers to mark the lead as contacted. */
function ContactButtons({ name, phone, email, business, onContact }) {
	const hello = greeting(name, business);
	const links = [
		{
			label: "Call",
			icon: Phone,
			href: callHref(phone)
		},
		{
			label: "WhatsApp",
			icon: MessageCircle,
			href: whatsappHref(phone, hello)
		},
		{
			label: "Email",
			icon: Mail,
			href: emailHref(email, business ? `Your enquiry with ${business}` : "Your enquiry", hello)
		}
	].filter((item) => Boolean(item.href));
	if (!links.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "No phone number or email was left for this lead."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-2",
		children: links.map(({ label, icon: Icon, href }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href,
			target: href.startsWith("https:") ? "_blank" : void 0,
			rel: "noreferrer",
			onClick: onContact,
			className: cn(buttonClass({ variant: label === "Call" ? "accent" : "secondary" }), "h-14 flex-col gap-1 text-xs"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-5",
				"aria-hidden": "true"
			}), label]
		}, label))
	});
}
/** Owner-side panel on the lead page: make the private customer link, copy it, or email it. */
function QuoteShare({ lead, hasText }) {
	const updateLead = useLeakKeep((state) => state.updateLead);
	const setStatus = useLeakKeep((state) => state.setStatus);
	const validDays = useLeakKeep((state) => state.branding.quoteValidDays);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const link = lead.quoteToken ? `${window.location.origin}${quotePath(lead.quoteToken)}` : "";
	const state = lead.quoteState;
	const make = () => {
		const now = /* @__PURE__ */ new Date();
		updateLead(lead.id, {
			quoteToken: lead.quoteToken ?? newQuoteToken(),
			quoteState: "sent",
			quoteSentAt: now.toISOString(),
			quoteExpiresAt: quoteExpiry(validDays, now)
		});
		if (lead.status === "new" || lead.status === "contacted") setStatus(lead.id, "quoted");
		setNote("");
	};
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(link);
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		} catch {
			setNote("Couldn't copy. Select the link and copy it by hand.");
		}
	};
	const email = async () => {
		setBusy(true);
		setNote("");
		try {
			const { data, error } = await supabase.functions.invoke("send-quote", { body: { leadId: lead.id } });
			const sent = !error && data?.sent === true;
			setNote(sent ? "Quote emailed to your customer." : "Emailing isn't switched on yet. Copy the link and send it yourself for now.");
		} catch {
			setNote("Emailing isn't switched on yet. Copy the link and send it yourself for now.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-2xl border border-line bg-mist p-3",
		"aria-label": "Customer quote link",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-sm font-semibold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {
						className: "size-4",
						"aria-hidden": "true"
					}),
					" Customer quote link",
					state ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto rounded-full bg-paper px-2 py-0.5 text-xs font-medium",
						children: quoteStateLabel(state)
					}) : null
				]
			}),
			state === "review" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ink-soft",
				children: "This price needs your check first. Look over the quote, then send it."
			}) : null,
			!link ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ink-soft",
				children: "Make a private page your customer can open, print or save as PDF, and accept."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 w-full",
				onClick: make,
				disabled: !hasText,
				children: state === "review" ? "Approve and make link" : "Make customer link"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					readOnly: true,
					"aria-label": "Customer quote link",
					value: link,
					onFocus: (event) => event.currentTarget.select(),
					className: "mt-2 h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: () => void copy(),
						"aria-live": "polite",
						children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-4",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
							className: "size-4",
							"aria-hidden": "true"
						}), copied ? "Copied" : "Copy link"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: () => void email(),
						disabled: busy || !lead.email.trim(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
							className: "size-4",
							"aria-hidden": "true"
						}), " Email it"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 space-y-0.5 text-xs text-muted",
					children: [
						lead.quoteSentAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Sent ", format(new Date(lead.quoteSentAt), "d MMM, HH:mm")] }) : null,
						lead.quoteViewedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Viewed ", format(new Date(lead.quoteViewedAt), "d MMM, HH:mm")] }) : null,
						lead.quoteAcceptedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "font-medium text-won",
							children: ["Accepted ", format(new Date(lead.quoteAcceptedAt), "d MMM, HH:mm")]
						}) : null,
						lead.quoteExpiresAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Expires ", format(new Date(lead.quoteExpiresAt), "d MMM yyyy")] }) : null
					]
				})
			] }),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-sm text-ink-soft",
				children: note
			}) : null
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function asRequest(input) {
	const raw = input ?? {};
	return {
		leadId: typeof raw.leadId === "string" && UUID.test(raw.leadId) ? raw.leadId : "",
		accessToken: typeof raw.accessToken === "string" ? raw.accessToken.slice(0, 4096) : ""
	};
}
var generateQuote = createServerFn({ method: "POST" }).validator((input) => asRequest(input)).handler(createSsrRpc("c211341b0a0f31208e5c139f62be53a08fa757f216e39ba50286f495ee055735"));
function LeadPage() {
	const { leadId } = Route$1.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadDetail, { leadId }) });
}
function LeadDetail({ leadId }) {
	const businessName = useLeakKeep((state) => state.business.name);
	const businessPhone = useLeakKeep((state) => state.business.phone);
	const businessEmail = useLeakKeep((state) => state.business.email);
	const branding = useEffectiveBranding();
	const [previewing, setPreviewing] = (0, import_react.useState)(false);
	const lead = useGatedLeads().find((item) => item.id === leadId);
	const access = useAccess();
	const hasServices = useLeakKeep((state) => state.services.some((service) => service.name.trim()));
	const hasStyle = useLeakKeep((state) => [
		state.template.tone,
		state.template.structure,
		state.template.paymentTerms
	].some((part) => part.trim()));
	const flushSaves = useLeakKeep((state) => state.flushSaves);
	const allowance = useLeakKeep((state) => state.allowance);
	const setAllowance = useLeakKeep((state) => state.setAllowance);
	const updateLead = useLeakKeep((state) => state.updateLead);
	const setStatus = useLeakKeep((state) => state.setStatus);
	const [text, setText] = (0, import_react.useState)(lead?.quote ?? "");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [confirmReplace, setConfirmReplace] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setText(lead?.quote ?? "");
		setError("");
		setCopied(false);
		setConfirmReplace(false);
	}, [lead?.id]);
	if (!lead) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "We couldn't find this lead"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "The link may be out of date."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-4 inline-flex text-sm font-medium text-primary",
				children: "Back to leads"
			})
		]
	});
	if (lead.locked) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
				className: "size-4",
				"aria-hidden": "true"
			}), "Leads"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-accent/40 bg-accent-soft p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "This lead is saved for you"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-ink-soft",
					children: [
						"Someone got in touch ",
						formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }),
						" through ",
						lead.source || "your link",
						". Your Free plan shows the details of your first 10 leads. Upgrade to see their name, number and answers, and reply while they're still interested."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 select-none text-sm text-ink-soft blur-[5px]",
					"aria-hidden": "true",
					children: "Jordan Example · 082 000 0000 · jordan@example.com"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/pricing",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Unlock my leads"]
					})
				})
			]
		})]
	});
	const current = lead;
	const aiOn = access.features.aiQuotes;
	const outOfQuotes = !aiOn || allowance?.plan === "free" && quotesLeft(allowance) === 0;
	const saveText = (value) => {
		setText(value);
		updateLead(current.id, {
			quote: value,
			quoteUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	};
	const onGenerate = async () => {
		setConfirmReplace(false);
		setPending(true);
		setError("");
		try {
			await flushSaves().catch(() => void 0);
			const { data: auth } = await supabase.auth.getSession();
			const accessToken = auth.session?.access_token;
			if (!accessToken) {
				setError("Your session has expired. Log in again to write quotes.");
				return;
			}
			const result = await generateQuote({ data: {
				leadId: current.id,
				accessToken
			} });
			if (result.allowance) setAllowance(result.allowance);
			if (!result.ok) {
				if (result.limitReached) return;
				setError(result.error);
				return;
			}
			saveText(result.text);
			if (current.status === "new" || current.status === "contacted") setStatus(current.id, "quoted");
		} catch {
			setError("The quote didn't come back. Try again.");
		} finally {
			setPending(false);
		}
	};
	const onCopy = async () => {
		try {
			const payload = branding.showOnQuote ? brandedQuotePlainText(businessName, text) : text;
			await navigator.clipboard.writeText(payload);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2e3);
		} catch {
			setError("Couldn't copy. Select the quote and copy it manually.");
		}
	};
	const rows = [
		["Phone", lead.phone],
		["Email", lead.email],
		["Address", lead.address],
		["Form", lead.jobType],
		["Urgency", lead.urgency],
		["Preferred time", lead.preferredTime],
		["Property", lead.propertyType],
		["Budget", lead.budget],
		["Access", lead.accessNotes]
	];
	if (previewing) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerQuotePreview, {
		businessName,
		branding,
		text,
		customer: lead.name,
		service: lead.serviceName || lead.jobType,
		contact: {
			phone: businessPhone,
			email: businessEmail
		},
		onBack: () => setPreviewing(false)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-5xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-4",
					"aria-hidden": "true"
				}), "Leads"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: lead.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							lead.source,
							" · ",
							format(new Date(lead.createdAt), "d MMM yyyy, HH:mm"),
							" ·",
							" ",
							formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadBadge, { lead })]
			}),
			quoteReminder(lead) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-ink",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Follow up." }),
					" ",
					quoteReminder(lead)?.text
				]
			}) : null,
			needsFollowUp(lead) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-ink",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Follow up today." }), " This lead came in over a day ago and isn't marked as contacted yet."]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
				"aria-label": "Get in touch",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-lg font-semibold tracking-tight",
						children: "Get in touch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactButtons, {
						name: lead.name,
						phone: lead.phone,
						email: lead.email,
						business: businessName,
						onContact: () => {
							if (current.status === "new") setStatus(current.id, "contacted");
						}
					}),
					lead.status === "new" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Tapping a button marks this lead as contacted."
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-line bg-paper p-4 shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold tracking-tight",
							children: "Questionnaire"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-2",
							children: [rows.map(([label, value]) => value.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-sm text-muted",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-base break-words text-ink",
									children: value
								})]
							}, label) : null), lead.responses.length ? lead.responses.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-line py-3 last:border-b-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-sm text-muted",
									children: item.question
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 text-base break-words whitespace-pre-wrap text-ink",
									children: item.answer || "—"
								})]
							}, `${index}-${item.question}`)) : lead.description.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-line py-3 last:border-b-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-sm text-muted",
									children: "Their answers"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 text-base break-words whitespace-pre-wrap text-ink",
									children: lead.description
								})]
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-sm font-medium",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "sm:hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
										"aria-label": "Status",
										value: lead.status,
										onChange: (event) => setStatus(lead.id, event.target.value),
										children: STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: status.id,
											children: status.label
										}, status.id))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden gap-2 sm:grid sm:grid-cols-5",
									role: "group",
									"aria-label": "Status",
									children: STATUSES.map((status) => {
										const on = lead.status === status.id;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": on,
											onClick: () => setStatus(lead.id, status.id),
											className: cn("press h-11 rounded-lg border text-sm font-medium", on ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft"),
											children: status.label
										}, status.id);
									})
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "rounded-3xl border border-line bg-paper p-4 shadow-panel lg:sticky lg:top-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold tracking-tight",
							children: "Quote"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Uses these answers, your",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/services",
									className: "font-medium text-primary",
									children: "services"
								}),
								", and your",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/quote-style",
									className: "font-medium text-primary",
									children: "quote style"
								}),
								"."
							]
						}),
						!hasServices || !hasStyle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 rounded-xl bg-primary-soft px-3 py-2 text-sm text-ink-soft",
							children: [!hasServices ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Add your",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/services",
									className: "font-medium text-primary",
									children: "services and prices"
								}),
								" ",
								"so quotes show real numbers.",
								" "
							] }) : null, !hasStyle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Set your",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/quote-style",
									className: "font-medium text-primary",
									children: "quote style"
								}),
								" ",
								"so quotes sound like you."
							] }) : null]
						}) : null,
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "mt-3 text-sm text-lost",
							children: error
						}) : null,
						outOfQuotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl border border-primary/30 bg-primary-soft p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-ink",
									children: "AI-written quotes are on Care and Growth"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-ink-soft",
									children: "You can still write and edit this quote yourself. Upgrade for unlimited AI quotes."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/pricing",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
											className: "size-4",
											"aria-hidden": "true"
										}), "See plans"]
									})
								})
							]
						}) : confirmReplace ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl border border-line bg-mist p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-ink",
								children: "Replace the current quote and your edits with a fresh one?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => void onGenerate(),
									children: "Replace quote"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setConfirmReplace(false),
									children: "Keep current"
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-4 w-full",
							onClick: () => text.trim() ? setConfirmReplace(true) : void onGenerate(),
							disabled: pending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "size-4",
								"aria-hidden": "true"
							}), pending ? "Writing quote…" : text.trim() ? "Regenerate quote" : "Generate quote"]
						}),
						aiOn && allowance?.plan === "free" && allowance.limit > 0 && !outOfQuotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-center text-xs text-muted",
							children: [
								quotesLeft(allowance),
								" of ",
								allowance.limit,
								" free AI quotes left this month ·",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/pricing",
									className: "font-medium text-primary",
									children: "Upgrade"
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							htmlFor: "quote-text",
							className: "mt-4 block text-sm font-medium",
							children: ["Quote text", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-normal text-muted",
								children: " · edit anything before you send"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							id: "quote-text",
							className: cn("mt-2 min-h-96 font-serif leading-relaxed", pending && "animate-pulse opacity-60"),
							value: text,
							onChange: (event) => saveText(event.target.value),
							readOnly: pending,
							placeholder: "Your quote will land here, built from these answers, your prices and your quote style."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandedQuote, {
							businessName,
							branding,
							text,
							customer: lead.name,
							service: lead.serviceName || lead.jobType,
							contact: {
								phone: businessPhone,
								email: businessEmail
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-3 w-full",
							variant: text.trim() && !pending ? "primary" : "secondary",
							onClick: () => void onCopy(),
							disabled: !text.trim() || pending,
							"aria-live": "polite",
							children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "size-4",
								"aria-hidden": "true"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
								className: "size-4",
								"aria-hidden": "true"
							}), copied ? "Copied to clipboard" : "Copy Quote"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-2 w-full",
							variant: "secondary",
							onClick: () => setPreviewing(true),
							disabled: !text.trim() || pending,
							children: "Preview as customer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteShare, {
							lead,
							hasText: !!text.trim()
						}),
						lead.quoteUpdatedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: ["Saved ", formatDistanceToNow(new Date(lead.quoteUpdatedAt), { addSuffix: true })]
						}) : null
					]
				})]
			})
		]
	});
}
//#endregion
export { LeadPage as component };
