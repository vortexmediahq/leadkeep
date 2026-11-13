import assert from "node:assert/strict";
import test from "node:test";
import {
  accessFor,
  ACCESS,
  canAddQuestionnaire,
  effectiveTier,
  FREE_LEAD_LIMIT,
  foundingOpen,
  gateLeads,
  leadsToCsv,
  lockedCount,
  NO_LIMITS,
  testerReminderDays,
  toEntitlements,
  type Entitlements,
} from "./entitlements.ts";
import type { Lead } from "./types.ts";

const NOW = new Date("2026-11-20T10:00:00Z");
const base: Entitlements = { ready: true, tier: "free", founding: false, admin: false, fullAccessUntil: null, status: "none", periodEnd: null };

function lead(n: number, extra: Partial<Lead> = {}): Lead {
  return {
    id: `lead-${String(n).padStart(3, "0")}`,
    linkId: "link",
    source: "Instagram",
    name: `Customer ${n}`,
    phone: `082000${n}`,
    email: `c${n}@example.com`,
    address: "1 Main Road",
    jobType: "Wedding cake",
    description: "Three tiers please",
    urgency: "",
    preferredTime: "",
    propertyType: "",
    budget: "",
    accessNotes: "",
    responses: [{ question: "Date?", answer: "March" }],
    status: "new",
    createdAt: new Date(Date.UTC(2026, 10, 1, 8, n)).toISOString(),
    quote: "Quote text",
    quoteUpdatedAt: null,
    ...extra,
  };
}

const makeLeads = (count: number) => Array.from({ length: count }, (_, i) => lead(i + 1));

test("free plan keeps the first 10 leads open and hides the rest, but still counts them", () => {
  const gated = gateLeads(makeLeads(13), ACCESS.free);
  assert.equal(gated.length, 13);
  assert.equal(lockedCount(gated), 3);
  for (const item of gated.slice(0, FREE_LEAD_LIMIT)) assert.equal(item.locked, false);
  for (const item of gated.slice(FREE_LEAD_LIMIT)) assert.equal(item.locked, true);
});

test("exactly 10 leads is still fully visible", () => {
  assert.equal(lockedCount(gateLeads(makeLeads(10), ACCESS.free)), 0);
});

test("locked leads lose every personal detail but keep source, status and time", () => {
  const [locked] = gateLeads(makeLeads(11), ACCESS.free).filter((item) => item.locked);
  assert.equal(locked.name, "Hidden lead");
  for (const field of ["phone", "email", "address", "jobType", "description"] as const) assert.equal(locked[field], "");
  assert.deepEqual(locked.responses, []);
  assert.equal(locked.quote, null);
  assert.equal(locked.source, "Instagram");
  assert.equal(locked.status, "new");
  assert.ok(locked.createdAt);
});

test("the gate follows creation order even when the list is newest-first", () => {
  const newestFirst = makeLeads(12).reverse();
  const gated = gateLeads(newestFirst, ACCESS.free);
  assert.equal(gated.find((item) => item.id === "lead-001")?.locked, false);
  assert.equal(gated.find((item) => item.id === "lead-011")?.locked, true);
  assert.equal(gated.find((item) => item.id === "lead-012")?.locked, true);
  assert.equal(gated[0].id, "lead-012", "input order is kept");
});

test("upgrading unlocks every lead again", () => {
  assert.equal(lockedCount(gateLeads(makeLeads(25), ACCESS.care)), 0);
  assert.equal(lockedCount(gateLeads(makeLeads(25), ACCESS.growth)), 0);
});

test("feature lists match the agreed plans", () => {
  assert.deepEqual(Object.values(ACCESS.free.features).filter(Boolean), []);
  assert.equal(ACCESS.care.features.emailAlerts, true);
  assert.equal(ACCESS.care.features.csvExport, true);
  assert.equal(ACCESS.care.features.aiQuotes, true);
  assert.equal(ACCESS.care.features.sourceDashboard, false);
  assert.equal(ACCESS.growth.features.sourceDashboard, true);
  assert.equal(ACCESS.growth.features.monthlyReport, true);
  assert.ok(ACCESS.growth.questionnaireLimit > ACCESS.care.questionnaireLimit);
  assert.ok(ACCESS.care.questionnaireLimit > ACCESS.free.questionnaireLimit);
});

test("questionnaire limit stops free owners at one", () => {
  assert.equal(canAddQuestionnaire(ACCESS.free, 0), true);
  assert.equal(canAddQuestionnaire(ACCESS.free, 1), false);
  assert.equal(canAddQuestionnaire(ACCESS.care, 2), true);
  assert.equal(canAddQuestionnaire(ACCESS.care, 3), false);
});

test("the owner (admin) always gets full access, whatever their row says", () => {
  assert.equal(effectiveTier({ ...base, admin: true }, NOW), "growth");
  assert.equal(accessFor({ ...base, admin: true }, NOW).leadLimit, Infinity);
});

test("testers get full access until their date, then drop to Free", () => {
  const tester = { ...base, fullAccessUntil: "2026-11-30T21:59:59Z" };
  assert.equal(effectiveTier(tester, NOW), "growth");
  assert.equal(effectiveTier(tester, new Date("2026-12-01T00:00:00Z")), "free");
});

test("paid plans apply as stored", () => {
  assert.equal(effectiveTier({ ...base, tier: "care" }, NOW), "care");
  assert.equal(effectiveTier({ ...base, tier: "growth", founding: true }, NOW), "growth");
});

test("if the database update isn't applied yet, nobody is limited", () => {
  assert.equal(effectiveTier(NO_LIMITS, NOW), "growth");
  assert.equal(lockedCount(gateLeads(makeLeads(30), accessFor(NO_LIMITS, NOW))), 0);
});

test("tester reminder shows only in the last 7 days", () => {
  const tester = { ...base, fullAccessUntil: "2026-11-30T21:59:59Z" };
  assert.equal(testerReminderDays(tester, new Date("2026-11-10T10:00:00Z")), null);
  assert.equal(testerReminderDays(tester, new Date("2026-11-24T10:00:00Z")), 7);
  assert.equal(testerReminderDays({ ...tester, admin: true }, new Date("2026-11-24T10:00:00Z")), null);
  assert.equal(testerReminderDays({ ...tester, tier: "care" }, new Date("2026-11-24T10:00:00Z")), null);
});

test("founding offer closes at zero spots and stays open when the count is unknown", () => {
  assert.equal(foundingOpen(20), true);
  assert.equal(foundingOpen(1), true);
  assert.equal(foundingOpen(0), false);
  assert.equal(foundingOpen(null), true);
});

test("toEntitlements reads the database answer safely", () => {
  assert.equal(toEntitlements(null), null);
  const read = toEntitlements({ tier: "care", founding: true, admin: false, status: "cancelling", periodEnd: "2026-12-01T00:00:00Z" });
  assert.equal(read?.tier, "care");
  assert.equal(read?.founding, true);
  assert.equal(read?.status, "cancelling");
  assert.equal(read?.ready, true);
  assert.equal(toEntitlements({ tier: "platinum" })?.tier, "free");
});

test("CSV export skips hidden leads, quotes commas and blocks spreadsheet formulas", () => {
  const leads = gateLeads([lead(1, { name: 'Smith, "Jo"' }), lead(2, { name: "=HYPERLINK(1)" }), ...makeLeads(12).slice(2)], ACCESS.free);
  const csv = leadsToCsv(leads);
  assert.ok(csv.startsWith("\uFEFF"), "Excel needs a UTF-8 BOM");
  const rows = csv.replace(/^\uFEFF/, "").split("\r\n");
  assert.equal(rows.length, 1 + FREE_LEAD_LIMIT);
  assert.ok(rows[1].includes('"Smith, ""Jo"""'));
  assert.ok(rows[2].includes("'=HYPERLINK(1)"));
  assert.ok(!csv.includes("Hidden lead"));
});

test("plans button reads View plans on Free and Update my plan when paying; hidden for the owner", async () => {
  const { plansButton, PLAN_BANNER, NO_LIMITS } = await import("./entitlements.ts");
  const base = { ...NO_LIMITS, ready: true, admin: false, tier: "free" as const };
  assert.deepEqual(plansButton(base), { show: true, paid: false, label: "View plans" });
  assert.equal(plansButton({ ...base, tier: "care" }).label, "Update my plan");
  assert.equal(plansButton({ ...base, tier: "growth" }).paid, true);
  assert.equal(plansButton({ ...base, admin: true }).show, false);
  assert.equal(plansButton(NO_LIMITS).show, false);
  assert.equal(PLAN_BANNER.care.text, "Care - Most popular");
  assert.equal(PLAN_BANNER.care.tone, "orange");
  assert.equal(PLAN_BANNER.free.tone, "blue");
  assert.equal(PLAN_BANNER.growth.tone, "blue");
});
