import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-DVps23Si.js
var env = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_AUTH_ENABLED": "false",
	"VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaWZoaWpnZGh4cXpkbHV3cGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MzkzOTYsImV4cCI6MjEwODIxNTM5Nn0.tKJkTC7OsW0E7lTwNikQnlw9QdSiBdkZkNrWxAH4Iy8",
	"VITE_SUPABASE_URL": "https://dqifhijgdhxqzdluwpdd.supabase.co"
};
var url = env.VITE_SUPABASE_URL;
var anonKey = env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.");
var supabase = createClient(url, anonKey);
function createUserClient(accessToken) {
	return createClient(url, anonKey, {
		global: { headers: { Authorization: `Bearer ${accessToken}` } },
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
//#endregion
export { supabase as n, createUserClient as t };
