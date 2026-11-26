import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getInternshipCategory, internshipCatalog } from "../js/internship-catalog.js";

const expectedCategories = ["instant", "short-term", "long-term", "summer"];
assert.deepEqual(Object.keys(internshipCatalog), expectedCategories);
assert.equal(getInternshipCategory("missing"), null);

for (const categoryId of ["short-term", "long-term", "summer"]) {
  const category = getInternshipCategory(categoryId);
  assert.equal(category.id, categoryId);
  assert.equal(category.domains.length, 20, `${categoryId} must define 20 domains`);
  assert.equal(category.plans.length, 3, `${categoryId} must define 3 plans`);
  assert.equal(category.enrollment.available, false);
  assert.equal(category.enrollment.deadline, null);
  assert.equal(category.enrollment.googleFormUrl, "");
  assert.equal(category.payment.checkoutEnabled, false);
  assert.equal(category.payment.ownerApproved, false);
  assert.equal(new Set(category.plans.map((plan) => plan.id)).size, 3);

  const recommendedPlans = category.plans.filter((plan) => plan.recommended);
  assert.equal(recommendedPlans.length, 1, `${categoryId} must identify one balanced-scope plan`);
  assert.equal(recommendedPlans[0].recommendationLabel, "Balanced scope");

  assert.deepEqual(category.plans.map(p=>p.priceINR), {"short-term":[0,99,299],"long-term":[0,199,399],summer:[0,149,349]}[categoryId]);
  for (const plan of category.plans) {
    assert.equal(plan.expectedAmountPaise, plan.priceINR * 100);
    assert.equal(plan.certificateIncluded, true);
    assert.equal(plan.instantPdfIncluded, plan.name === "Premium");
    assert.ok(Number.isInteger(plan.priceINR) && plan.priceINR >= 0);
    assert.ok(Number.isInteger(plan.weeks) && plan.weeks > 0);
  }
  for (const item of category.domains) {
    assert.ok(item.id && item.name && item.emoji && item.description && item.project);
    assert.ok(item.skills.length > 0, `${categoryId}/${item.id} must list skills`);
    if (categoryId === "long-term") {
      assert.ok(item.overview && item.objectives.length && item.milestones.length && item.deliverables.length);
    }
    if (categoryId === "summer") {
      assert.ok(item.objective && item.deliverables.length);
    }
  }

  const htmlPath = `../${category.route.replace(/^\//, "")}index.html`;
  const html = await readFile(new URL(htmlPath, import.meta.url), "utf8");
  assert.match(html, new RegExp(`<body data-category-id="${categoryId}">`));
  assert.match(html, /category-pages\.css/);
  assert.match(html, /js\/category-page\.js/);
}

assert.deepEqual(
  internshipCatalog.instant.plans.map((plan) => plan.displayPriceINR),
  [99, 199, 299]
);
assert.equal(internshipCatalog.instant.payment.currentLiveAmountPaise, 100);
assert.equal(internshipCatalog.instant.payment.checkoutEnabled, true);

console.log("Internship catalog checks passed.");
