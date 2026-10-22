import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type SessionState = {
  status: "loading" | "signed-in" | "signed-out";
  user: User | null;
};

export const useSession = create<SessionState>()(() => ({ status: "loading", user: null }));

let listening = false;

export function startSessionListener() {
  if (listening) return;
  listening = true;
  void supabase.auth.getSession().then(({ data }) => {
    const user = data.session?.user ?? null;
    useSession.setState({ user, status: user ? "signed-in" : "signed-out" });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;
    useSession.setState({ user, status: user ? "signed-in" : "signed-out" });
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
  return message;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(friendlyAuthError(error.message));
  if (!data.session) throw new Error("Account created. Log in to continue.");
}

export async function signOut() {
  await supabase.auth.signOut();
}
