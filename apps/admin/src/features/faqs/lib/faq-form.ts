import { displayOrderPayload, validateDisplayOrder } from "@/lib/forms/display-order";
import type { FAQ, FAQCreate, FAQUpdate } from "../types";
export type FAQFormValues = { page: string; subPage: string; question: string; answer: string; displayOrder: string; isActive: "true" | "false" };
export type FAQFormErrors = Partial<Record<keyof FAQFormValues, string>>;
export const emptyFAQForm: FAQFormValues = { page: "", subPage: "", question: "", answer: "", displayOrder: "", isActive: "true" };
export const faqFieldMap: Record<string, keyof FAQFormValues> = { page: "page", sub_page: "subPage", question: "question", answer: "answer", display_order: "displayOrder", is_active: "isActive" };
export function faqToForm(faq: FAQ): FAQFormValues {
  return { page: faq.page, subPage: faq.sub_page ?? "", question: faq.question, answer: faq.answer, displayOrder: String(faq.display_order), isActive: faq.is_active ? "true" : "false" };
}
export function validateFAQForm(values: FAQFormValues): FAQFormErrors {
  const errors: FAQFormErrors = {};
  if (!values.page.trim()) errors.page = "Page is required.";
  else if (values.page.trim().length > 255 || !/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/.test(values.page.trim())) errors.page = "Choose a valid page.";
  const subPage = values.subPage.trim();
  if (subPage && (subPage.length > 255 || !/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/.test(subPage))) errors.subPage = "Choose a valid sub-page.";
  if (!values.question.trim()) errors.question = "Question is required.";
  if (!values.answer.trim()) errors.answer = "Answer is required.";
  const orderError = validateDisplayOrder(values.displayOrder);
  if (orderError) errors.displayOrder = orderError;
  return errors;
}
export function faqCreateRequest(values: FAQFormValues): FAQCreate {
  return { page: values.page.trim(), sub_page: values.subPage.trim() || null, question: values.question.trim(), answer: values.answer.trim(), ...displayOrderPayload(values.displayOrder), is_active: values.isActive === "true" };
}
export function faqUpdateRequest(values: FAQFormValues): FAQUpdate { return faqCreateRequest(values); }
