import { describe, expect, it } from "vitest";
import { testimonialFixture } from "../test-fixtures";
import { emptyTestimonialForm, testimonialToForm, testimonialCreateRequest, testimonialUpdateRequest, validateTestimonialForm } from "./testimonial-form";
describe("Testimonial editorial contract", () => {
  it("validates required quote/name and integer ordering", () => {
    expect(validateTestimonialForm(emptyTestimonialForm)).toEqual({ quote: "Quote is required.", authorName: "Author name is required." });
    for (const order of ["0", "-1", "1.2", "NaN"]) expect(validateTestimonialForm({ ...testimonialToForm(testimonialFixture), displayOrder: order }).displayOrder).toBeDefined();
  });
  it.each(["javascript:alert(1)", "data:image/png,invalid", "not a URL"])("rejects invalid logo URL %s", companyLogoUrl => expect(validateTestimonialForm({ ...testimonialToForm(testimonialFixture), companyLogoUrl }).companyLogoUrl).toBeDefined());
  it("loads and preserves optional attribution/logo values on edit", () => {
    const values = testimonialToForm(testimonialFixture);
    expect(testimonialUpdateRequest(values)).toEqual({ quote: testimonialFixture.quote, author_name: testimonialFixture.author_name, author_role: testimonialFixture.author_role, company_name: testimonialFixture.company_name, display_order: 2, is_active: true });
  });
  it("submits blank optional fields as null without extra fields", () => {
    expect(testimonialCreateRequest({ ...emptyTestimonialForm, quote: " Quote ", authorName: " Name " })).toEqual({ quote: "Quote", author_name: "Name", author_role: null, company_name: null, company_logo_url: null, is_active: true });
  });
  it("sends the exact integer when a position is given", () => {
    expect(testimonialCreateRequest({ ...emptyTestimonialForm, quote: "Q", authorName: "N", displayOrder: "3" }).display_order).toBe(3);
  });
});
