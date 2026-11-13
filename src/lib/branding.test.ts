import assert from "node:assert/strict";
import test from "node:test";
import {
  blankBranding,
  hasBranding,
  inkOn,
  isMissingBrandingColumns,
  logoMimeType,
  logoUploadMessage,
  logoUrl,
  parseFont,
  parseHexColor,
  softTint,
} from "./branding.ts";

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

test("logo file types are read from the file ending when the browser sends none", () => {
  assert.equal(logoMimeType({ type: "", name: "Logo.SVG" }), "image/svg+xml");
  assert.equal(logoMimeType({ type: "image/jpg", name: "a.jpg" }), "image/jpeg");
  assert.equal(logoMimeType({ type: "application/octet-stream", name: "a.png" }), "image/png");
  assert.equal(logoMimeType({ type: "image/heic", name: "a.heic" }), "");
});

test("a missing branding database update is recognised, other errors are not", () => {
  assert.equal(isMissingBrandingColumns({ code: "42703", message: "column business_profiles.logo_path does not exist" }), true);
  assert.equal(isMissingBrandingColumns({ code: "PGRST204", message: "Could not find the 'font' column of 'business_profiles' in the schema cache" }), true);
  assert.equal(isMissingBrandingColumns({ code: "23514", message: "new row violates check constraint" }), false);
  assert.equal(isMissingBrandingColumns(null), false);
});

test("logo upload errors are explained in plain words", () => {
  assert.match(logoUploadMessage({ message: "Bucket not found", statusCode: "404" }), /database update/);
  assert.match(logoUploadMessage({ message: "new row violates row-level security policy" }), /Log out/);
  assert.match(logoUploadMessage({ message: "The object exceeded the maximum allowed size", statusCode: "413" }), /2 MB/);
  assert.match(logoUploadMessage({ message: "mime type image/gif is not supported" }), /PNG, JPG/);
  assert.match(logoUploadMessage({ message: "Failed to fetch" }), /connection/);
});
