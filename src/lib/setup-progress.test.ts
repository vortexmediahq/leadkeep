import assert from "node:assert/strict";
import test from "node:test";
import { blankBusiness } from "./seed.ts";
import { isBusinessReady, setupProgress } from "./setup-progress.ts";

test("business details need a name and a way to be reached", () => {
  assert.equal(isBusinessReady(blankBusiness), false);
  assert.equal(isBusinessReady({ ...blankBusiness, name: "Grove Salon" }), false);
  assert.equal(isBusinessReady({ ...blankBusiness, name: "Grove Salon", email: "hi@grove.test" }), true);
});

test("setup percentage ignores the optional branding step", () => {
  const empty = setupProgress({
    business: blankBusiness,
    linksCount: 0,
    questionnairesReady: true,
    questionnairesCount: 0,
    namedServices: 0,
    notificationsChosen: false,
  });
  assert.equal(empty.total, 5);
  assert.equal(empty.done, 0);
  assert.equal(empty.percent, 0);
  const branding = empty.steps.find((step) => step.id === "branding");
  assert.equal(branding?.counted, false);
  assert.equal(branding?.done, false);

  const full = setupProgress({
    business: { ...blankBusiness, name: "Grove Salon", phone: "0820000000" },
    linksCount: 1,
    questionnairesReady: true,
    questionnairesCount: 1,
    namedServices: 1,
    notificationsChosen: true,
  });
  assert.equal(full.done, 5);
  assert.equal(full.percent, 100);

  const withBrand = setupProgress({
    business: { ...blankBusiness, name: "Grove Salon", phone: "0820000000" },
    linksCount: 1,
    questionnairesReady: true,
    questionnairesCount: 1,
    namedServices: 1,
    notificationsChosen: true,
    brandingReady: true,
  });
  assert.equal(withBrand.percent, 100);
  assert.equal(withBrand.steps.find((step) => step.id === "branding")?.done, true);
});
