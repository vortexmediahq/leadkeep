import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  callHref, emailHref, internationalNumber, needsFollowUp, parseChannel, unreadLeads,
  validateFeedback, wantsApp, wantsEmail, whatsappHref,
} from "./alerts.ts";

describe("alert channel", () => {
  it("defaults to both", () => {
    assert.equal(parseChannel(undefined), "both");
    assert.equal(parseChannel("nonsense"), "both");
    assert.equal(parseChannel("app"), "app");
  });
  it("maps to app/email", () => {
    assert.deepEqual([wantsApp("both"), wantsEmail("both")], [true, true]);
    assert.deepEqual([wantsApp("app"), wantsEmail("app")], [true, false]);
    assert.deepEqual([wantsApp("email"), wantsEmail("email")], [false, true]);
  });
});

describe("contact links", () => {
  it("normalises phone numbers", () => {
    assert.equal(internationalNumber("082 123 4567"), "27821234567");
    assert.equal(internationalNumber("+44 7700 900123"), "447700900123");
    assert.equal(internationalNumber("0044 7700 900123"), "447700900123");
    assert.equal(internationalNumber(""), "");
  });
  it("builds call, WhatsApp and email links", () => {
    assert.equal(callHref("082 123 4567"), "tel:0821234567");
    assert.equal(callHref("12"), null);
    assert.equal(whatsappHref("082 123 4567", "Hi Sam"), "https://wa.me/27821234567?text=Hi%20Sam");
    assert.equal(whatsappHref("123"), null);
    assert.equal(emailHref("sam@example.com", "Your request"), "mailto:sam@example.com?subject=Your%20request");
    assert.equal(emailHref("not-an-email"), null);
  });
});

describe("follow-up reminder", () => {
  const now = new Date("2026-11-05T12:00:00Z");
  it("flags new leads older than 24 hours", () => {
    assert.equal(needsFollowUp({ status: "new", createdAt: "2026-11-04T11:59:00Z" }, now), true);
    assert.equal(needsFollowUp({ status: "new", createdAt: "2026-11-04T13:00:00Z" }, now), false);
  });
  it("ignores contacted leads", () => {
    assert.equal(needsFollowUp({ status: "contacted", createdAt: "2026-11-01T00:00:00Z" }, now), false);
  });
});

describe("unread leads", () => {
  const leads = [{ createdAt: "2026-11-05T10:00:00Z" }, { createdAt: "2026-11-04T10:00:00Z" }];
  it("counts leads after last seen", () => {
    assert.equal(unreadLeads(leads, null).length, 2);
    assert.equal(unreadLeads(leads, "2026-11-05T00:00:00Z").length, 1);
    assert.equal(unreadLeads(leads, "2026-11-06T00:00:00Z").length, 0);
  });
});

describe("feedback", () => {
  it("validates length", () => {
    assert.ok(validateFeedback("  "));
    assert.equal(validateFeedback("Please add a dark mode"), null);
    assert.ok(validateFeedback("x".repeat(2001)));
  });
});
