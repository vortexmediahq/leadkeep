import { i as __toESM } from "../_runtime.mjs";
import { yt as supabase } from "./data-vq0z3oFT.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as LogoOnDark } from "./mark-I_x-2mlQ.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-CpXzyFkR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Timing for the plant-to-login handoff. Video plays full screen first, then the logo, then login. */
var INTRO = {
	logoDelayMs: 2500,
	logoFadeMs: 700,
	handoverAtMs: 3300,
	handoverMs: 1500,
	doneAtMs: 4900,
	reducedMs: 900,
	/** Logo begins a touch larger, centered over the plant. */
	logoStartScale: 1.28
};
var REST = {
	x: 0,
	y: 0,
	scale: 1
};
var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
function measureCenteredFly(node, scale) {
	const rect = node.getBoundingClientRect();
	return {
		x: window.innerWidth / 2 - (rect.left + rect.width / 2),
		y: window.innerHeight / 2 - (rect.top + rect.height / 2),
		scale
	};
}
function portraitFilmSrc() {
	return window.matchMedia("(orientation: portrait) and (max-width: 767px)").matches ? "/hero-plant-portrait.mp4" : "/hero-plant.mp4";
}
/**
* Drives the plant-to-login motion. The logo lives in its final DOM slot the
* whole time; a transform only parks it over the plant until the handoff.
*
* Phases are derived so the first painted intro frame is already the start
* pose (no reverse fade). Handoff is armed in one frame, then moved in the
* next, so CSS actually animates transform and opacity.
*/
function useIntroMotion({ active, reduced, logoRef, onDone }) {
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [fly, setFly] = (0, import_react.useState)(REST);
	const phaseRef = (0, import_react.useRef)("idle");
	const visual = active && phase === "idle" ? "start" : active ? phase : "idle";
	(0, import_react.useLayoutEffect)(() => {
		if (!active) {
			phaseRef.current = "idle";
			setPhase("idle");
			setFly(REST);
			return;
		}
		if (reduced) {
			setFly(REST);
			phaseRef.current = "start";
			setPhase("start");
			return;
		}
		const node = logoRef.current;
		if (node) setFly(measureCenteredFly(node, INTRO.logoStartScale));
		phaseRef.current = "start";
		setPhase("start");
	}, [
		active,
		reduced,
		logoRef
	]);
	(0, import_react.useEffect)(() => {
		if (!active || reduced) return;
		if (visual !== "start" && visual !== "logo") return;
		const sync = () => {
			const current = phaseRef.current;
			if (current !== "start" && current !== "logo") return;
			const node = logoRef.current;
			if (node) setFly(measureCenteredFly(node, INTRO.logoStartScale));
		};
		window.addEventListener("resize", sync);
		return () => window.removeEventListener("resize", sync);
	}, [
		active,
		reduced,
		visual,
		logoRef
	]);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		if (reduced) {
			const frame = window.requestAnimationFrame(() => {
				phaseRef.current = "done";
				setPhase("done");
			});
			const done = window.setTimeout(onDone, INTRO.reducedMs);
			return () => {
				window.cancelAnimationFrame(frame);
				window.clearTimeout(done);
			};
		}
		const fadeLogo = window.setTimeout(() => {
			phaseRef.current = "logo";
			setPhase("logo");
		}, INTRO.logoDelayMs);
		const arm = window.setTimeout(() => {
			phaseRef.current = "arm";
			setPhase("arm");
		}, INTRO.handoverAtMs);
		const done = window.setTimeout(onDone, INTRO.doneAtMs);
		return () => {
			window.clearTimeout(fadeLogo);
			window.clearTimeout(arm);
			window.clearTimeout(done);
		};
	}, [
		active,
		reduced,
		onDone
	]);
	(0, import_react.useEffect)(() => {
		if (phase !== "arm") return;
		const id = window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				phaseRef.current = "handover";
				setPhase("handover");
				setFly(REST);
			});
		});
		return () => window.cancelAnimationFrame(id);
	}, [phase]);
	const skip = () => {
		phaseRef.current = "idle";
		setPhase("idle");
		setFly(REST);
		onDone();
	};
	const moving = visual === "arm" || visual === "handover";
	const fadingLogo = visual === "start" || visual === "logo";
	const reducedFade = reduced && (visual === "start" || visual === "done");
	const showFilm = visual === "start" || visual === "logo" || visual === "arm" || visual === "handover";
	const logoOn = visual === "logo" || visual === "arm" || visual === "handover" || visual === "done" || visual === "idle";
	const stageOn = visual === "handover" || visual === "done" || visual === "idle";
	const filmOn = visual === "start" || visual === "logo" || visual === "arm";
	const skipVisible = visual === "start" || visual === "logo" || visual === "arm";
	return {
		logoStyle: {
			opacity: logoOn ? 1 : 0,
			transform: `translate3d(${fly.x}px, ${fly.y}px, 0) scale(${fly.scale})`,
			transformOrigin: "center center",
			transition: moving ? `transform ${INTRO.handoverMs}ms ${EASE}, opacity ${INTRO.logoFadeMs}ms ease` : fadingLogo || reducedFade ? `opacity ${reduced ? INTRO.reducedMs : INTRO.logoFadeMs}ms ease` : void 0,
			willChange: active ? "transform, opacity" : void 0
		},
		stageStyle: {
			opacity: stageOn ? 1 : 0,
			transition: moving || reducedFade ? `opacity ${reduced ? INTRO.reducedMs : INTRO.handoverMs}ms ease` : void 0
		},
		filmOpacity: filmOn ? 1 : 0,
		moving,
		skip,
		skipVisible,
		showFilm
	};
}
/**
* Full-bleed plant film. The source is locked on mount so the clip plays once
* from the start: no loop, no seek, no remount, no mid-play swap.
* object-fit: cover only — uniform scale and crop, never stretched.
*/
function IntroFilm({ opacity, moving }) {
	const video = (0, import_react.useRef)(null);
	const srcRef = (0, import_react.useRef)(null);
	if (srcRef.current === null) srcRef.current = portraitFilmSrc();
	const src = srcRef.current;
	(0, import_react.useEffect)(() => {
		const node = video.current;
		if (!node) return;
		node.muted = true;
		node.loop = false;
		node.playsInline = true;
		const play = node.play();
		if (play) play.catch(() => {});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
		style: {
			width: "100vw",
			height: "100dvh",
			opacity,
			transition: moving ? `opacity ${INTRO.handoverMs}ms ease` : void 0,
			transform: "translateZ(0)",
			willChange: moving ? "opacity" : void 0
		},
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			ref: video,
			className: "absolute inset-0 h-full w-full object-cover",
			style: { transform: "translateZ(0)" },
			autoPlay: true,
			muted: true,
			playsInline: true,
			preload: "auto",
			poster: "/hero-poster.jpg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
				src,
				type: "video/mp4"
			})
		})
	});
}
var SEEN_KEY = "leadkeep.startup.seen";
function useIntro() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [show, setShow] = (0, import_react.useState)(false);
	const [reduced, setReduced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			setShow(sessionStorage.getItem(SEEN_KEY) !== "1");
		} catch {
			setShow(true);
		}
		setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
		setReady(true);
	}, []);
	return {
		ready,
		show,
		reduced,
		dismiss: (0, import_react.useCallback)(() => {
			try {
				sessionStorage.setItem(SEEN_KEY, "1");
			} catch {}
			setShow(false);
		}, [])
	};
}
/** Shared navy frame for log in, sign up and password pages, with the plant intro once a session. */
function AuthShell({ children }) {
	const intro = useIntro();
	const logoRef = (0, import_react.useRef)(null);
	const motion = useIntroMotion({
		active: intro.ready && intro.show,
		reduced: intro.reduced,
		logoRef,
		onDone: intro.dismiss
	});
	if (!intro.ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-screen bg-primary" });
	const fadeMs = intro.reduced ? INTRO.reducedMs : INTRO.handoverMs;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4 py-10",
		children: [
			intro.show && !intro.reduced && motion.showFilm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntroFilm, {
				opacity: motion.filmOpacity,
				moving: motion.moving
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 h-1 bg-accent",
				style: {
					opacity: motion.stageStyle.opacity,
					transition: intro.show ? `opacity ${fadeMs}ms ease` : void 0
				},
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute -right-16 top-24 size-72 rounded-full bg-accent/25 blur-3xl",
				style: {
					opacity: motion.stageStyle.opacity,
					transition: intro.show ? `opacity ${fadeMs}ms ease` : void 0
				},
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute -left-12 bottom-8 size-56 rounded-full bg-accent/15 blur-3xl",
				style: {
					opacity: motion.stageStyle.opacity,
					transition: intro.show ? `opacity ${fadeMs}ms ease` : void 0
				},
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-[1] w-full max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: logoRef,
						style: motion.logoStyle,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoOnDark, { className: "w-44" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: motion.stageStyle,
					inert: intro.show ? true : void 0,
					children
				})]
			}),
			intro.show && motion.skipVisible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: motion.skip,
				className: "press absolute right-4 top-4 z-10 rounded-full border border-white/25 bg-primary/50 px-4 py-2 text-sm font-medium text-paper backdrop-blur-sm hover:border-accent hover:text-accent",
				children: "Skip"
			}) : null
		]
	});
}
/** Shared glass panel for log in, sign up and the other auth cards on the navy shell. */
var AUTH_PANEL = "auth-glass rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] p-4 shadow-none backdrop-blur-xl sm:p-6";
function AuthCard({ title, lead, children, footer }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: AUTH_PANEL,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight text-white",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-[#c5d0de]",
					children: lead
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children
				})
			]
		}),
		footer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 w-full text-center text-sm text-white/70",
			children: footer
		}) : null,
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
var UNUSUAL_COPY = {
	new_device: {
		title: "A new device signed in",
		body: "Someone signed in to your account from a device we haven't seen before. If this was you, you can ignore this. If it wasn't, change your password."
	},
	new_location: {
		title: "A sign-in from a new place",
		body: "A sign-in used a different time zone than usual, which often means a new place. If this wasn't you, change your password."
	},
	failed_logins: {
		title: "Several failed sign-in attempts",
		body: "Someone tried your email with the wrong password several times in a short span. If this wasn't you, change your password."
	}
};
function bytesToHex(bytes) {
	return [...new Uint8Array(bytes)].map((part) => part.toString(16).padStart(2, "0")).join("");
}
async function deviceFingerprint() {
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
	const ua = navigator.userAgent;
	let label = "This device";
	if (/iPhone|iPad/.test(ua)) label = "iPhone or iPad";
	else if (/Android/.test(ua)) label = "Android phone or tablet";
	else if (/Mac/.test(ua)) label = "Mac";
	else if (/Win/.test(ua)) label = "Windows computer";
	else if (/Linux/.test(ua)) label = "Linux computer";
	if (/Edg\//.test(ua)) label = `Edge on ${label}`;
	else if (/Chrome\//.test(ua)) label = `Chrome on ${label}`;
	else if (/Firefox\//.test(ua)) label = `Firefox on ${label}`;
	else if (/Safari\//.test(ua)) label = `Safari on ${label}`;
	const raw = [
		ua,
		navigator.language,
		timezone,
		`${screen.width}x${screen.height}`
	].join("|");
	return {
		hash: bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw))),
		label,
		timezone
	};
}
async function recordSignIn() {
	try {
		const device = await deviceFingerprint();
		await supabase.rpc("record_sign_in", {
			p_device_hash: device.hash,
			p_device_label: device.label,
			p_timezone: device.timezone
		});
	} catch {}
}
async function recordFailedLogin(email) {
	try {
		await supabase.rpc("record_failed_login", { p_email: email });
	} catch {}
}
function toEvent(row) {
	const reason = row.reason === "new_device" || row.reason === "new_location" || row.reason === "failed_logins" ? row.reason : "";
	return {
		id: row.id,
		kind: row.kind,
		reason,
		deviceLabel: row.device_label,
		timezone: row.timezone,
		createdAt: row.created_at,
		seenAt: row.seen_at
	};
}
async function fetchUnseenLoginEvents() {
	const { data, error } = await supabase.rpc("unseen_login_events");
	if (error || !data) return [];
	return data.map(toEvent);
}
async function fetchRecentLoginEvents() {
	const { data, error } = await supabase.from("login_events").select("id, kind, reason, device_label, timezone, created_at, seen_at").eq("kind", "unusual").order("created_at", { ascending: false }).limit(10);
	if (error || !data) return [];
	return data.map(toEvent);
}
async function markLoginEventsSeen() {
	await supabase.rpc("mark_login_events_seen");
}
function downloadJson(filename, data) {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function downloadLeadsCsv(filename, leads) {
	const headers = [
		"id",
		"createdAt",
		"source",
		"name",
		"phone",
		"email",
		"address",
		"jobType",
		"description",
		"status",
		"quote"
	];
	const escape = (value) => `"${value.replace(/"/g, "\"\"")}"`;
	const lines = [headers.join(","), ...leads.map((lead) => [
		lead.id,
		lead.createdAt,
		lead.source,
		lead.name,
		lead.phone,
		lead.email,
		lead.address,
		lead.jobType,
		lead.description,
		lead.status,
		lead.quote ?? ""
	].map((value) => escape(String(value))).join(","))];
	const blob = new Blob([lines.join("\n")], { type: "text/csv" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
async function deleteMyAccount() {
	const { error } = await supabase.rpc("delete_my_account");
	if (error) throw new Error("We couldn't delete your account just yet. Please try again in a moment.");
}
var useSession = create()(() => ({
	status: "loading",
	user: null
}));
var listening = false;
async function applySession(user, event) {
	if (!user) {
		useSession.setState({
			user: null,
			status: "signed-out"
		});
		return;
	}
	const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
	const needsMfa = data?.currentLevel === "aal1" && data?.nextLevel === "aal2";
	useSession.setState({
		user,
		status: needsMfa ? "needs-mfa" : "signed-in"
	});
	if (event === "SIGNED_IN" && !needsMfa) recordSignIn();
}
function startSessionListener() {
	if (listening) return;
	listening = true;
	supabase.auth.getSession().then(({ data }) => {
		applySession(data.session?.user ?? null);
	});
	supabase.auth.onAuthStateChange((event, session) => {
		applySession(session?.user ?? null, event);
	});
}
function friendlyAuthError(message) {
	const text = message.toLowerCase();
	if (text.includes("invalid login")) return "That email and password don't match an account.";
	if (text.includes("already registered") || text.includes("already exists")) return "An account with this email already exists. Log in instead.";
	if (text.includes("password")) return "Use a password with at least 6 characters.";
	if (text.includes("email")) return "Enter a valid email address.";
	if (text.includes("fetch") || text.includes("network")) return "Couldn't reach the server. Check your connection.";
	if (text.includes("mfa") && text.includes("challenge")) return "That code didn't match. Try the latest one from your app.";
	return message;
}
async function signIn(email, password) {
	const { error } = await supabase.auth.signInWithPassword({
		email,
		password
	});
	if (error) {
		recordFailedLogin(email);
		throw new Error(friendlyAuthError(error.message));
	}
}
async function signUp(email, password) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password
	});
	if (error) throw new Error(friendlyAuthError(error.message));
	if (!data.session) throw new Error("Account created. Log in to continue.");
}
async function signOut() {
	await supabase.auth.signOut();
}
/** Emails a reset link. Always resolves the same way so it can't be used to check which emails have accounts. */
async function requestPasswordReset(email) {
	const redirectTo = `${window.location.origin}/reset-password`;
	const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
	if (error && (error.message.toLowerCase().includes("fetch") || error.message.toLowerCase().includes("network"))) throw new Error("Couldn't reach the server. Check your connection.");
}
async function updatePassword(password) {
	const { error } = await supabase.auth.updateUser({ password });
	if (error) throw new Error(friendlyAuthError(error.message));
}
async function verifyMfaCode(code) {
	const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
	if (listError) throw new Error(friendlyAuthError(listError.message));
	const factor = factors.totp.find((item) => item.status === "verified");
	if (!factor) throw new Error("Authenticator isn't set up on this account.");
	const { error } = await supabase.auth.mfa.challengeAndVerify({
		factorId: factor.id,
		code: code.trim()
	});
	if (error) throw new Error("That code didn't match. Try the latest one from your app.");
	await applySession((await supabase.auth.getUser()).data.user, "SIGNED_IN");
}
async function startTotpEnrollment() {
	const { data, error } = await supabase.auth.mfa.enroll({
		factorType: "totp",
		friendlyName: "Authenticator app"
	});
	if (error || data.type !== "totp") throw new Error(error?.message ?? "Couldn't start authenticator setup.");
	return {
		factorId: data.id,
		qrCode: data.totp.qr_code,
		secret: data.totp.secret
	};
}
async function confirmTotpEnrollment(factorId, code) {
	const { error } = await supabase.auth.mfa.challengeAndVerify({
		factorId,
		code: code.trim()
	});
	if (error) throw new Error("That code didn't match. Try the latest one from your app.");
}
async function unenrollTotp(factorId) {
	const { error } = await supabase.auth.mfa.unenroll({ factorId });
	if (error) throw new Error("We couldn't turn that off. Check your connection and try again.");
}
async function listTotpFactors() {
	const { data, error } = await supabase.auth.mfa.listFactors();
	if (error) return [];
	return data.totp.filter((item) => item.status === "verified");
}
function passkeysSupported() {
	return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function";
}
function friendlyPasskeyError(message) {
	const text = message.toLowerCase();
	if (text.includes("abort") || text.includes("not allowed") || text.includes("cancel")) return "That sign-in was cancelled.";
	if (text.includes("not enabled") || text.includes("feature") || text.includes("passkey") && text.includes("disabled")) return "Fingerprint login isn't switched on for this project yet.";
	if (text.includes("https") || text.includes("secure context")) return "Fingerprint login needs a secure (https) site.";
	return "We couldn't use fingerprint or face unlock on this device just now.";
}
async function signInWithPasskey() {
	const { data, error } = await supabase.auth.signInWithPasskey();
	if (error) throw new Error(friendlyPasskeyError(error.message));
	return data.session;
}
async function registerPasskey() {
	const { error } = await supabase.auth.registerPasskey();
	if (error) throw new Error(friendlyPasskeyError(error.message));
}
async function listPasskeys() {
	const { data, error } = await supabase.auth.passkey.list();
	if (error || !data) return [];
	return data;
}
async function deletePasskey(passkeyId) {
	const { error } = await supabase.auth.passkey.delete({ passkeyId });
	if (error) throw new Error("We couldn't remove that passkey. Try again.");
}
//#endregion
export { startTotpEnrollment as C, verifyMfaCode as D, useSession as E, startSessionListener as S, updatePassword as T, requestPasswordReset as _, confirmTotpEnrollment as a, signOut as b, downloadJson as c, fetchUnseenLoginEvents as d, listPasskeys as f, registerPasskey as g, passkeysSupported as h, UNUSUAL_COPY as i, downloadLeadsCsv as l, markLoginEventsSeen as m, AuthCard as n, deleteMyAccount as o, listTotpFactors as p, AuthShell as r, deletePasskey as s, AUTH_PANEL as t, fetchRecentLoginEvents as u, signIn as v, unenrollTotp as w, signUp as x, signInWithPasskey as y };
