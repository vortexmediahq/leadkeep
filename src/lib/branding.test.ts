import assert from "node:assert/strict";
import test from "node:test";
import { blankBranding, hasBranding, inkOn, logoUrl, parseFont, parseHexColor, softTint } from "./branding.ts";

test("branding is present once a logo or colour is set", () => {
  assert.equal(hasBranding(blankBranding), false);
  assert.equal(hasBranding({ ...blankBranding, logoPath: "user/logo.png" }), true);
  assert.equal(hasBranding({ ...blankBranding, primaryColor: "#0B1F3B" }), true);
});

test("colour helpers keep valid hex values and readable ink", () => {
  assert.equal(parseHexColor("#ff5f03"), "#FF5F03");
  assert.equal(parseHexColor("blue"), "");
  assert.equal(parseFont("serif"), "serif");
  assert.equal(parseFont("comic"), "sans");
  assert.equal(inkOn("#FFFFFF"), "#0B1F3B");
  assert.equal(inkOn("#0B1F3B"), "#ffffff");
  assert.equal(softTint("#FF5F03").startsWith("#"), true);
  assert.equal(
    logoUrl("abc/logo.png", "https://example.supabase.co"),
    "https://example.supabase.co/storage/v1/object/public/brand-assets/abc/logo.png",
  );
});
