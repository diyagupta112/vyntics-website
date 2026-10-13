import { describe, expect, it } from "vitest";
import { faqFixture } from "../test-fixtures";
import { emptyFAQForm, faqToForm, faqCreateRequest, faqUpdateRequest, validateFAQForm } from "./faq-form";
import { faqPageChoices, faqPageLabel, faqPageOptions } from "./page-options";
describe("FAQ editorial contract", () => {
  it("validates required fields and whole-number order", () => {
    expect(validateFAQForm(emptyFAQForm)).toEqual({ page: "Page is required.", question: "Question is required.", answer: "Answer is required." });
    for (const order of ["", "1.2", "NaN"]) expect(validateFAQForm({ ...faqToForm(faqFixture), displayOrder: order }).displayOrder).toBeDefined();
    expect(validateFAQForm({ ...faqToForm(faqFixture), page: "Cloud Foundations" }).page).toBeDefined();
  });
  it("preserves arbitrary valid page keys and submits only accepted fields", () => {
    const values = faqToForm({ ...faqFixture, page: "company/future-page", is_active: false });
    expect(values.page).toBe("company/future-page");
    const payload = { page: "company/future-page", question: faqFixture.question, answer: faqFixture.answer, display_order: 1, is_active: false };
    expect(faqCreateRequest(values)).toEqual(payload); expect(faqUpdateRequest(values)).toEqual(payload);
    expect(faqPageChoices([values.page, values.page])).toHaveLength(6);
  });
  it.each(faqPageOptions)("maps $value to $label", option => expect(faqPageLabel(option.value)).toBe(option.label));
});
