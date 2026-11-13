export type InstallMode = "hidden" | "prompt" | "ios" | "manual";

/** Which install help to show. Pure so it can be tested. */
export function installMode(input: { userAgent: string; maxTouchPoints?: number; standalone: boolean; hasPrompt: boolean }): InstallMode {
  if (input.standalone) return "hidden";
  if (input.hasPrompt) return "prompt";
  const ua = input.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && (input.maxTouchPoints ?? 0) > 1);
  if (ios) return "ios";
  if (/Android/i.test(ua)) return "manual";
  return "hidden";
}

export const IOS_STEPS = "Tap the Share button, then Add to Home Screen.";
export const MANUAL_STEPS = "Open your browser menu (the three dots) and tap Install app, or Add to Home screen.";

/** The app's install details, served at /__grok/manifest.webmanifest. */
export const LEADKEEP_MANIFEST = {
  name: "LeadKeep",
  short_name: "LeadKeep",
  description: "Capture every lead, send quotes fast and follow up.",
  id: "/",
  start_url: "/dashboard",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#0B1F3B",
  theme_color: "#0B1F3B",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    { src: "/__grok/icon-180.png", sizes: "180x180", type: "image/png" },
  ],
};
