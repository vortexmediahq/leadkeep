import assert from "node:assert/strict";
import test from "node:test";
import { automationScore, averageServicePrice, dashboardStats, money, moneyLeft, monthlyCounts, priceNumber } from "./dashboard.ts";
import type { Lead } from "./types.ts";

const NOW = new Date("2026-11-20T10:00:00Z");
const day = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();
function lead(extra: Partial<Lead>): Lead {
  return { id: "x", status: "new", createdAt: day(0), quoteState: "", quoteSentAt: null, ...extra } as Lead;
}

test("prices become numbers", () => {
  assert.equal(priceNumber("R650"), 650);
  assert.equal(priceNumber("R1,200–R2,000"), 1200);
  assert.equal(priceNumber("from R500"), 500);
  assert.equal(priceNumber("ask me"), null);
  assert.equal(averageServicePrice([{ price: "R100" }, { price: "R300" }, { price: "" }]), 200);
  assert.equal(averageServicePrice([{ price: "" }]), null);
});

test("money left on the table = average job value x leads that need a follow-up", () => {
  const leads = [
    lead({ createdAt: day(3) }), // new for 3 days -> counts
    lead({ createdAt: day(0) }), // brand new -> no
    lead({ status: "quoted", quoteState: "sent", quoteSentAt: day(3) }), // quote with no reply -> counts
    lead({ createdAt: day(5), status: "won" }), // won -> no
    lead({ createdAt: day(5), quoteState: "accepted", quoteSentAt: day(4) }), // accepted -> no
  ];
  assert.deepEqual(moneyLeft(leads, 500, NOW), { count: 2, amount: 1000 });
  assert.deepEqual(moneyLeft(leads, null, NOW), { count: 2, amount: null });
  assert.equal(money("R", 12345.6), "R12,346");
});

test("month counts and totals", () => {
  const leads = [lead({ createdAt: day(1), status: "won" }), lead({ createdAt: day(25) }), lead({ createdAt: day(40) })];
  const stats = dashboardStats(leads, NOW);
  assert.equal(stats.thisMonth, 1);
  assert.equal(stats.lastMonth, 2);
  assert.equal(stats.total, 3);
  assert.equal(stats.won, 1);
  assert.equal(stats.winRate, 33);
  const months = monthlyCounts(leads, 6, NOW);
  assert.equal(months.length, 6);
  assert.equal(months[5].leads, 1);
  assert.equal(months[5].won, 1);
});

test("automation score explains itself", () => {
  const none = automationScore({ leads: [], links: [], services: [], emailAlerts: false });
  assert.equal(none.score, 0);
  const full = automationScore({
    leads: [lead({ createdAt: day(1), quoteState: "sent", quoteSentAt: new Date(Date.parse(day(1)) + 1000).toISOString() })],
    links: [{ kind: "quote", autoSend: true, serviceId: "s1" }],
    services: [{ id: "s1", price: "R50" }],
    emailAlerts: true,
  });
  assert.equal(full.score, 100);
  const range = automationScore({ leads: [], links: [{ kind: "quote", autoSend: true, serviceId: "s1" }], services: [{ id: "s1", price: "from R50" }], emailAlerts: true });
  assert.equal(range.score, 20);
});
