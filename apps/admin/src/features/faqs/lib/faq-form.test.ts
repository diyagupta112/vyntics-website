import { describe, expect, it } from "vitest";
import { faqFixture } from "../test-fixtures";
import { emptyFAQForm, faqToForm, faqCreateRequest, faqUpdateRequest, validateFAQForm } from "./faq-form";
import { faqPageChoices, faqPageLabel, faqPageOptions, faqSubPageChoices, faqSubPageOptions } from "./page-options";
import { servicePages } from "@/lib/content/service-pages";
import { relatedServiceOptions } from "@/lib/content/related-services";
import { subServiceOptions } from "@/lib/content/sub-services";
describe("FAQ editorial contract", () => {
  it("validates required fields and whole-number order", () => {
    expect(validateFAQForm(emptyFAQForm)).toEqual({ page: "Page is required.", question: "Question is required.", answer: "Answer is required." });
    for (const order of ["0", "-1", "1.2", "NaN"]) expect(validateFAQForm({ ...faqToForm(faqFixture), displayOrder: order }).displayOrder).toBeDefined();
    expect(validateFAQForm({ ...faqToForm(faqFixture), page: "Cloud Foundations" }).page).toBeDefined();
  });
  it("preserves arbitrary valid page keys and submits only accepted fields", () => {
    const values = faqToForm({ ...faqFixture, page: "company/future-page", is_active: false });
    expect(values.page).toBe("company/future-page");
    const payload = { page: "company/future-page", sub_page: null, question: faqFixture.question, answer: faqFixture.answer, display_order: 1, is_active: false };
    expect(faqCreateRequest(values)).toEqual(payload); expect(faqUpdateRequest(values)).toEqual(payload);
    expect(faqPageChoices([values.page, values.page])).toHaveLength(6);
  });
  it.each(faqPageOptions)("maps $value to $label", option => expect(faqPageLabel(option.value)).toBe(option.label));
  it("sends sub_page as the bare key, or null for the main page", () => {
    expect(faqCreateRequest({ ...faqToForm(faqFixture), subPage: "cloud-migration" }).sub_page).toBe("cloud-migration");
    expect(faqUpdateRequest({ ...faqToForm(faqFixture), subPage: "" }).sub_page).toBeNull();
    expect(faqToForm({ ...faqFixture, sub_page: "x-y" }).subPage).toBe("x-y");
    expect(faqToForm(faqFixture).subPage).toBe("");
    expect(validateFAQForm({ ...faqToForm(faqFixture), subPage: "services/a b" }).subPage).toBeDefined();
  });
  it("derives every option list from the one shared configuration", () => {
    expect(servicePages.map(p => [p.service, p.name, p.page])).toEqual([
      ["cloud_foundations", "Cloud Foundations", "services/cloud-foundations"],
      ["data_engineering", "Data Engineering", "services/data-engineering"],
      ["analytics_bi", "Analytics & BI", "services/analytics-bi"],
      ["ai_solutions", "AI Solutions", "services/ai-solutions"],
      ["crm_revenue_ops", "CRM & Revenue Ops", "services/crm-revenue-ops"],
    ]);
    expect(relatedServiceOptions.map(o => o.label)).toEqual(servicePages.map(p => p.name));
    expect(faqPageOptions.map(o => o.value)).toEqual(servicePages.map(p => p.page));
    for (const p of servicePages) expect(faqSubPageOptions(p.page)).toEqual(p.subPages.map(s => ({ label: s.name, value: s.key })));
    expect(subServiceOptions).toHaveLength(servicePages.flatMap(p => p.subPages).length);
    expect(faqSubPageOptions("careers")).toEqual([]);
  });
  it("keeps an unknown existing sub-page as a visible choice", () => {
    expect(faqSubPageChoices("services/cloud-foundations", "future-page")).toContainEqual({ label: "future-page (existing)", value: "future-page" });
  });
});
