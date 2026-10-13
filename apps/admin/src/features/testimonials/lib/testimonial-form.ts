import type { Testimonial, TestimonialCreate, TestimonialUpdate } from "../types";
export type TestimonialFormValues = { quote: string; authorName: string; authorRole: string; companyName: string; companyLogoUrl: string; displayOrder: string; isActive: "true" | "false" };
export type TestimonialFormErrors = Partial<Record<keyof TestimonialFormValues, string>>;
export const emptyTestimonialForm: TestimonialFormValues = { quote: "", authorName: "", authorRole: "", companyName: "", companyLogoUrl: "", displayOrder: "0", isActive: "true" };
export const testimonialFieldMap: Record<string, keyof TestimonialFormValues> = { quote: "quote", author_name: "authorName", author_role: "authorRole", company_name: "companyName", company_logo_url: "companyLogoUrl", display_order: "displayOrder", is_active: "isActive" };
export function testimonialToForm(item: Testimonial): TestimonialFormValues {
  return { quote: item.quote, authorName: item.author_name, authorRole: item.author_role ?? "", companyName: item.company_name ?? "", companyLogoUrl: item.company_logo_url ?? "", displayOrder: String(item.display_order), isActive: item.is_active ? "true" : "false" };
}
export function validateTestimonialForm(values: TestimonialFormValues): TestimonialFormErrors {
  const errors: TestimonialFormErrors = {};
  if (!values.quote.trim()) errors.quote = "Quote is required.";
  if (!values.authorName.trim()) errors.authorName = "Author name is required.";
  if (!values.displayOrder.trim() || !Number.isInteger(Number(values.displayOrder))) errors.displayOrder = "Display order must be a whole number.";
  if (values.companyLogoUrl.trim()) {
    try {
      const url = new URL(values.companyLogoUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch { errors.companyLogoUrl = "Enter a valid HTTP or HTTPS URL."; }
  }
  return errors;
}
export function testimonialCreateRequest(values: TestimonialFormValues): TestimonialCreate {
  return { quote: values.quote.trim(), author_name: values.authorName.trim(), author_role: values.authorRole.trim() || null, company_name: values.companyName.trim() || null, company_logo_url: values.companyLogoUrl.trim() || null, display_order: Number(values.displayOrder), is_active: values.isActive === "true" };
}
export function testimonialUpdateRequest(values: TestimonialFormValues): TestimonialUpdate { const { company_logo_url: _logo, ...payload } = testimonialCreateRequest(values);
  void _logo;
  return payload; }
