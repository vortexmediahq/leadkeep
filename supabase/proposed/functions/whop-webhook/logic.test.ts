import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { parseMembershipEvent, verifyWhopSignature } from "./logic.ts";

const SECRET_BYTES = Buffer.from("super-secret-test-key-123456");
const SECRET = `whsec_${SECRET_BYTES.toString("base64")}`;
const NOW = 1_800_000_000_000;

function signed(body: string, opts: { id?: string; ts?: number; key?: Buffer } = {}) {
  const id = opts.id ?? "msg_1";
  const ts = String(opts.ts ?? Math.floor(NOW / 1000));
  const sig = createHmac("sha256", opts.key ?? SECRET_BYTES).update(`${id}.${ts}.${body}`).digest("base64");
  return new Headers({ "webhook-id": id, "webhook-timestamp": ts, "webhook-signature": `v1,${sig}` });
}

test("accepts a correctly signed webhook", async () => {
  const body = '{"type":"membership.activated"}';
  assert.equal(await verifyWhopSignature(SECRET, signed(body), body, NOW), true);
});

test("accepts a secret given as plain text", async () => {
  const body = "{}";
  const plain = "plain-text-secret";
  assert.equal(await verifyWhopSignature(plain, signed(body, { key: Buffer.from(plain) }), body, NOW), true);
});

test("rejects a changed body, wrong secret, old timestamp and missing headers", async () => {
  const body = '{"a":1}';
  assert.equal(await verifyWhopSignature(SECRET, signed(body), '{"a":2}', NOW), false);
  assert.equal(await verifyWhopSignature("whsec_" + Buffer.from("other").toString("base64"), signed(body), body, NOW), false);
  assert.equal(await verifyWhopSignature(SECRET, signed(body, { ts: Math.floor(NOW / 1000) - 3600 }), body, NOW), false);
  assert.equal(await verifyWhopSignature(SECRET, new Headers(), body, NOW), false);
  assert.equal(await verifyWhopSignature("", signed(body), body, NOW), false);
});

const event = (type: string, data: Record<string, unknown>) => ({ id: "evt_1", type, data });
const USER = "0b9a5d1e-6f1c-4f6e-9c43-0f3a6c2a9b11";

test("activated membership is valid and carries email, plan and user id", () => {
  const parsed = parseMembershipEvent(
    event("membership.activated", {
      id: "mem_1",
      plan_id: "plan_83fVGMKdf3J9r",
      status: "active",
      user_id: "user_abc",
      user: { email: "Owner@Example.com" },
      metadata: { user_id: USER },
      renewal_period_end: "2026-12-10T00:00:00Z",
    }),
  );
  assert.ok(parsed);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.planId, "plan_83fVGMKdf3J9r");
  assert.equal(parsed.email, "owner@example.com");
  assert.equal(parsed.userId, USER);
  assert.equal(parsed.eventId, "evt_1");
  assert.equal(parsed.cancelling, false);
});

test("cancelled and expired memberships are invalid; cancel-at-period-end stays valid but flagged", () => {
  const data = { id: "mem_1", plan_id: "plan_8tnneDa1AiqYi", user: { email: "a@b.co" } };
  assert.equal(parseMembershipEvent(event("membership.updated", { ...data, status: "canceled" }))?.valid, false);
  assert.equal(parseMembershipEvent(event("membership.updated", { ...data, status: "expired" }))?.valid, false);
  assert.equal(parseMembershipEvent(event("membership.deactivated", data))?.valid, false);
  const cancelling = parseMembershipEvent(event("membership.updated", { ...data, status: "active", cancel_at_period_end: true }));
  assert.equal(cancelling?.valid, true);
  assert.equal(cancelling?.cancelling, true);
  const pastDue = parseMembershipEvent(event("membership.updated", { ...data, status: "past_due" }));
  assert.equal(pastDue?.valid, true);
  assert.equal(pastDue?.pastDue, true);
});

test("an explicit valid flag wins", () => {
  const data = { id: "m", plan_id: "p", status: "active", valid: false };
  assert.equal(parseMembershipEvent(event("membership.updated", data))?.valid, false);
});

test("ignores other events, unreadable updates and bad user ids", () => {
  assert.equal(parseMembershipEvent(event("payment.succeeded", { id: "pay_1" })), null);
  assert.equal(parseMembershipEvent(event("membership.updated", { id: "m", plan_id: "p" })), null);
  assert.equal(parseMembershipEvent({ nope: true }), null);
  assert.equal(parseMembershipEvent(event("membership.activated", { id: "m" })), null);
  const bad = parseMembershipEvent(event("membership.activated", { id: "m", plan_id: "p", metadata: { user_id: "not-a-uuid" } }));
  assert.equal(bad?.userId, null);
});

test("plan id can come from a nested variant", () => {
  assert.equal(parseMembershipEvent(event("membership.activated", { id: "m", variant: { id: "plan_x" } }))?.planId, "plan_x");
});
