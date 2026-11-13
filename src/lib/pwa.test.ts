import assert from "node:assert/strict";
import test from "node:test";
import { installMode, LEADKEEP_MANIFEST } from "./pwa.ts";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36";
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120";

test("install help matches the phone", () => {
  assert.equal(installMode({ userAgent: IPHONE, standalone: false, hasPrompt: false }), "ios");
  assert.equal(installMode({ userAgent: ANDROID, standalone: false, hasPrompt: true }), "prompt");
  assert.equal(installMode({ userAgent: ANDROID, standalone: false, hasPrompt: false }), "manual");
  assert.equal(installMode({ userAgent: DESKTOP, standalone: false, hasPrompt: false }), "hidden");
  assert.equal(installMode({ userAgent: IPHONE, standalone: true, hasPrompt: false }), "hidden");
});

test("manifest is LeadKeep, standalone, opens the dashboard and has 192/512 icons", () => {
  assert.equal(LEADKEEP_MANIFEST.name, "LeadKeep");
  assert.equal(LEADKEEP_MANIFEST.short_name, "LeadKeep");
  assert.equal(LEADKEEP_MANIFEST.start_url, "/dashboard");
  assert.equal(LEADKEEP_MANIFEST.display, "standalone");
  const sizes = LEADKEEP_MANIFEST.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192") && sizes.includes("512x512"));
});
