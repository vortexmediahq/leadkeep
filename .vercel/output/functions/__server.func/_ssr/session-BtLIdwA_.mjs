import { u as supabase } from "./fields-B5r7wua3.mjs";
import { n as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-BtLIdwA_.js
var useSession = create()(() => ({
	status: "loading",
	user: null
}));
var listening = false;
function startSessionListener() {
	if (listening) return;
	listening = true;
	supabase.auth.getSession().then(({ data }) => {
		const user = data.session?.user ?? null;
		useSession.setState({
			user,
			status: user ? "signed-in" : "signed-out"
		});
	});
	supabase.auth.onAuthStateChange((_event, session) => {
		const user = session?.user ?? null;
		useSession.setState({
			user,
			status: user ? "signed-in" : "signed-out"
		});
	});
}
function friendlyAuthError(message) {
	const text = message.toLowerCase();
	if (text.includes("invalid login")) return "That email and password don't match an account.";
	if (text.includes("already registered") || text.includes("already exists")) return "An account with this email already exists. Log in instead.";
	if (text.includes("password")) return "Use a password with at least 6 characters.";
	if (text.includes("email")) return "Enter a valid email address.";
	if (text.includes("fetch") || text.includes("network")) return "Couldn't reach the server. Check your connection.";
	return message;
}
async function signIn(email, password) {
	const { error } = await supabase.auth.signInWithPassword({
		email,
		password
	});
	if (error) throw new Error(friendlyAuthError(error.message));
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
//#endregion
export { useSession as a, startSessionListener as i, signOut as n, signUp as r, signIn as t };
