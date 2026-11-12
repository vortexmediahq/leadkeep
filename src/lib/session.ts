import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { recordFailedLogin, recordSignIn } from "@/lib/security";
import { supabase } from "@/lib/supabase";

type SessionState = {
  status: "loading" | "signed-in" | "signed-out" | "needs-mfa";
  user: User | null;
};

export const useSession = create<SessionState>()(() => ({ status: "loading", user: null }));

let listening = false;

async function applySession(user: User | null, event?: string) {
  if (!user) {
    useSession.setState({ user: null, status: "signed-out" });
    return;
  }
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsMfa = data?.currentLevel === "aal1" && data?.nextLevel === "aal2";
  useSession.setState({ user, status: needsMfa ? "needs-mfa" : "signed-in" });
  if (event === "SIGNED_IN" && !needsMfa) void recordSignIn();
}

export function startSessionListener() {
  if (listening) return;
  listening = true;
  void supabase.auth.getSession().then(({ data }) => {
    void applySession(data.session?.user ?? null);
  });
  supabase.auth.onAuthStateChange((event, session) => {
    void applySession(session?.user ?? null, event);
  });
}

function friendlyAuthError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("invalid login")) return "That email and password don't match an account.";
  if (text.includes("already registered") || text.includes("already exists"))
    return "An account with this email already exists. Log in instead.";
  if (text.includes("password")) return "Use a password with at least 6 characters.";
  if (text.includes("email")) return "Enter a valid email address.";
  if (text.includes("fetch") || text.includes("network")) return "Couldn't reach the server. Check your connection.";
  if (text.includes("mfa") && text.includes("challenge")) return "That code didn't match. Try the latest one from your app.";
  return message;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    void recordFailedLogin(email);
    throw new Error(friendlyAuthError(error.message));
  }
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(friendlyAuthError(error.message));
  if (!data.session) throw new Error("Account created. Log in to continue.");
}

export async function signOut() {
  await supabase.auth.signOut();
}

/** Emails a reset link. Always resolves the same way so it can't be used to check which emails have accounts. */
export async function requestPasswordReset(email: string) {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error && (error.message.toLowerCase().includes("fetch") || error.message.toLowerCase().includes("network"))) {
    throw new Error("Couldn't reach the server. Check your connection.");
  }
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function verifyMfaCode(code: string) {
  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  if (listError) throw new Error(friendlyAuthError(listError.message));
  const factor = factors.totp.find((item) => item.status === "verified");
  if (!factor) throw new Error("Authenticator isn't set up on this account.");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
  if (error) throw new Error("That code didn't match. Try the latest one from your app.");
  await applySession((await supabase.auth.getUser()).data.user, "SIGNED_IN");
}

export type TotpEnrollment = { factorId: string; qrCode: string; secret: string };

export async function startTotpEnrollment(): Promise<TotpEnrollment> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Authenticator app",
  });
  if (error || data.type !== "totp") throw new Error(error?.message ?? "Couldn't start authenticator setup.");
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

export async function confirmTotpEnrollment(factorId: string, code: string) {
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
  if (error) throw new Error("That code didn't match. Try the latest one from your app.");
}

export async function unenrollTotp(factorId: string) {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw new Error("We couldn't turn that off. Check your connection and try again.");
}

export async function listTotpFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return [];
  return data.totp.filter((item) => item.status === "verified");
}

export function passkeysSupported() {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function";
}

function friendlyPasskeyError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("abort") || text.includes("not allowed") || text.includes("cancel"))
    return "That sign-in was cancelled.";
  if (text.includes("not enabled") || text.includes("feature") || text.includes("passkey") && text.includes("disabled"))
    return "Fingerprint login isn't switched on for this project yet.";
  if (text.includes("https") || text.includes("secure context"))
    return "Fingerprint login needs a secure (https) site.";
  return "We couldn't use fingerprint or face unlock on this device just now.";
}

export async function signInWithPasskey() {
  const { data, error } = await supabase.auth.signInWithPasskey();
  if (error) throw new Error(friendlyPasskeyError(error.message));
  return data.session;
}

export async function registerPasskey() {
  const { error } = await supabase.auth.registerPasskey();
  if (error) throw new Error(friendlyPasskeyError(error.message));
}

export async function listPasskeys() {
  const { data, error } = await supabase.auth.passkey.list();
  if (error || !data) return [];
  return data;
}

export async function deletePasskey(passkeyId: string) {
  const { error } = await supabase.auth.passkey.delete({ passkeyId });
  if (error) throw new Error("We couldn't remove that passkey. Try again.");
}
