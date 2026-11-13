import assert from "node:assert/strict";
import test from "node:test";
import { buildQuoteEmail, canEmail, parseRequest, quoteLink, type QuoteLead } from "./logic.ts";

const lead: QuoteLead = {
  id: "11111111-1111-1111-1111-111111111111",
  user_id: "u",
  name: "Sam Jones",
  email: "sam@example.com",
  quote: "Quote",
  quote_token: "a".repeat(40),
  quote_state: "sent",
  quote_expires_at: "2026-12-01T00:00:00.000Z",
  quote_emailed_at: null,
};
const now = new Date("2026-11-13T00:00:00.000Z");

test("only well-formed requests are accepted", () => {
  assert.deepEqual(parseRequest({ leadId: lead.id }), { leadId: lead.id });
  assert.deepEqual(parseRequest({ token: "a".repeat(40) }), { token: "a".repeat(40) });
  assert.equal(parseRequest({ token: "short" }), null);
  assert.equal(parseRequest({ leadId: "1 or 1=1" }), null);
  assert.equal(parseRequest(null), null);
});

test("a customer can trigger the email once; the owner can resend", () => {
  assert.equal(canEmail(lead, "public", now).ok, true);
  const sent = { ...lead, quote_emailed_at: "2026-11-13T00:00:00.000Z" };
  assert.equal(canEmail(sent, "public", now).ok, false);
  assert.equal(canEmail(sent, "owner", now).ok, true);
});

test("nothing is emailed without a sent quote, an email address, or after expiry", () => {
  assert.equal(canEmail({ ...lead, quote_state: "review" }, "owner", now).ok, false);
  assert.equal(canEmail({ ...lead, quote_token: null }, "owner", now).ok, false);
  assert.equal(canEmail({ ...lead, email: "nope" }, "owner", now).ok, false);
  assert.equal(canEmail({ ...lead, quote_expires_at: "2026-11-01T00:00:00.000Z" }, "owner", now).ok, false);
});

test("the email names the business and escapes customer text", () => {
  const mail = buildQuoteEmail({
    businessName: "Cake <b>Co</b>",
    customerName: "Sam <script>",
    service: "Tape",
    link: quoteLink("https://app.example.com/", "t".repeat(30)),
    expiresAt: null,
  });
  assert.match(mail.subject, /Your Tape quote from/);
  assert.ok(!mail.html.includes("<script>"));
  assert.ok(!mail.html.includes("<b>Co"));
  assert.match(mail.html, /https:\/\/app\.example\.com\/q\/t{30}/);
});
