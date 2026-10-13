import type { FAQ, FAQCreate, FAQUpdate } from "../types";
export type FAQFormValues = { page: string; question: string; answer: string; displayOrder: string; isActive: "true" | "false" };
export type FAQFormErrors = Partial<Record<keyof FAQFormValues, string>>;
export const emptyFAQForm: FAQFormValues = { page: "", question: "", answer: "", displayOrder: "0", isActive: "true" };
export const faqFieldMap: Record<string, keyof FAQFormValues> = { page: "page", question: "question", answer: "answer", display_order: "displayOrder", is_active: "isActive" };
export function faqToForm(faq: FAQ): FAQFormValues {
  return { page: faq.page, question: faq.question, answer: faq.answer, displayOrder: String(faq.display_order), isActive: faq.is_active ? "true" : "false" };
}
export function validateFAQForm(values: FAQFormValues): FAQFormErrors {
  const errors: FAQFormErrors = {};
  if (!values.page.trim()) errors.page = "Page is required.";
  else if (values.page.trim().length > 255 || !/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/.test(values.page.trim())) errors.page = "Choose a valid page.";
  if (!values.question.trim()) errors.question = "Question is required.";
  if (!values.answer.trim()) errors.answer = "Answer is required.";
  if (!values.displayOrder.trim() || !Number.isInteger(Number(values.displayOrder))) errors.displayOrder = "Display order must be a whole number.";
  return errors;
}
export function faqCreateRequest(values: FAQFormValues): FAQCreate {
  return { page: values.page.trim(), question: values.question.trim(), answer: values.answer.trim(), display_order: Number(values.displayOrder), is_active: values.isActive === "true" };
}
export function faqUpdateRequest(values: FAQFormValues): FAQUpdate { return faqCreateRequest(values); }
