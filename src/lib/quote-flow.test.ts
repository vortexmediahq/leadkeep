import assert from "node:assert/strict";
import test from "node:test";
import {
  isFixedPrice,
  parseVideoUrl,
  priceCheck,
  quoteExpiry,
  quoteReminder,
  quoteStateLabel,
  newQuoteToken,
  parseQuoteStyle,
} from "./quote-flow.ts";

test("only a clear single price is quoted automatically", () => {
  assert.equal(isFixedPrice("R650"), true);
  assert.equal(isFixedPrice("$1,200.50"), true);
  assert.equal(isFixedPrice("650"), true);
  assert.equal(isFixedPrice("R650–R1,200"), false);
  assert.equal(isFixedPrice("from R500"), false);
  assert.equal(isFixedPrice("R650 per hour"), false);
  assert.equal(isFixedPrice(""), false);
  assert.equal(priceCheck("from R500", true).auto, false);
  assert.equal(priceCheck("R50", true).auto, true);
  assert.equal(priceCheck("R50", false).auto, false);
  assert.equal(priceCheck("", true).auto, false);
});

test("only YouTube and Vimeo links become video embeds", () => {
  assert.equal(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.embedUrl, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ?t=3")?.provider, "youtube");
  assert.equal(parseVideoUrl("https://www.youtube.com/shorts/abcDEF12345")?.provider, "youtube");
  assert.equal(parseVideoUrl("https://vimeo.com/123456789")?.embedUrl, "https://player.vimeo.com/video/123456789");
  assert.equal(parseVideoUrl("https://evil.example.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(parseVideoUrl("javascript:alert(1)"), null);
  assert.equal(parseVideoUrl("not a link"), null);
});

test("quote status words and follow-up nudges at 2 and 5 days", () => {
  assert.equal(quoteStateLabel("sent"), "Quote sent – awaiting reply");
  assert.equal(quoteStateLabel("viewed"), "Viewed");
  assert.equal(quoteStateLabel("accepted"), "Accepted");
  const sent = "2026-11-10T08:00:00.000Z";
  const at = (days: number) => new Date(Date.parse(sent) + days * 86_400_000);
  assert.equal(quoteReminder({ quoteState: "sent", quoteSentAt: sent }, at(1)), null);
  assert.equal(quoteReminder({ quoteState: "sent", quoteSentAt: sent }, at(2.1))?.day, 2);
  assert.equal(quoteReminder({ quoteState: "viewed", quoteSentAt: sent }, at(5.5))?.day, 5);
  assert.equal(quoteReminder({ quoteState: "accepted", quoteSentAt: sent }, at(9)), null);
  assert.equal(quoteReminder({ quoteState: "review", quoteSentAt: null }, at(9)), null);
});

test("tokens are long and expiry is limited to 1-90 days", () => {
  assert.match(newQuoteToken(), /^[a-f0-9]{40}$/);
  assert.notEqual(newQuoteToken(), newQuoteToken());
  const from = new Date("2026-11-13T00:00:00.000Z");
  assert.equal(quoteExpiry(14, from), "2026-11-27T00:00:00.000Z");
  assert.equal(quoteExpiry(500, from), "2027-02-11T00:00:00.000Z");
  assert.equal(parseQuoteStyle("neon"), "clean");
  assert.equal(parseQuoteStyle("bold"), "bold");
});

import { isPlaceholderStyle, styleInstruction } from "./quote-flow.ts";
test("starter hints are never treated as the owner's wording", () => {
  assert.equal(isPlaceholderStyle("Tell customers about any guarantee, refund or cancellation terms here."), true);
  assert.equal(isPlaceholderStyle("  close with the business name and one line: we will confirm the details by phone. "), true);
  assert.equal(styleInstruction("Tell customers about any guarantee, refund or cancellation terms here."), "");
  assert.equal(styleInstruction(""), "");
  assert.equal(styleInstruction(" 12 month guarantee "), "12 month guarantee");
});
