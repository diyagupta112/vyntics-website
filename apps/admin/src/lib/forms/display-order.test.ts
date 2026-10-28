import { describe, expect, it } from "vitest";
import { displayOrderPayload, validateDisplayOrder } from "./display-order";
import { badgeFixture } from "@/features/badges/test-fixtures";
import { badgeToForm, emptyBadgeForm, toCreateRequest as badgeCreate, toUpdateRequest as badgeUpdate } from "@/features/badges/lib/badge-form";
import { emptyFAQForm, faqCreateRequest, faqToForm, faqUpdateRequest } from "@/features/faqs/lib/faq-form";
import { faqFixture } from "@/features/faqs/test-fixtures";
import { emptyTeamMemberForm, toCreateRequest as teamCreate } from "@/features/team-members/lib/team-member-form";

describe("display order contract", () => {
  it("accepts blank and positive whole numbers only", () => {
    for (const ok of ["", "  ", "1", "3", "250"]) expect(validateDisplayOrder(ok)).toBeUndefined();
    for (const bad of ["0", "-1", "1.5", "2e1", "abc", "+1"]) expect(validateDisplayOrder(bad)).toBeDefined();
  });
  it("omits a blank order and sends an exact integer otherwise", () => {
    expect(displayOrderPayload("")).toEqual({});
    expect("display_order" in displayOrderPayload("  ")).toBe(false);
    expect(displayOrderPayload("1")).toEqual({ display_order: 1 });
    expect(displayOrderPayload("99")).toEqual({ display_order: 99 });
  });
  it("new records start blank and never default to 0", () => {
    expect(emptyBadgeForm.displayOrder).toBe("");
    expect(emptyFAQForm.displayOrder).toBe("");
    expect(emptyTeamMemberForm.displayOrder).toBe("");
    expect(badgeCreate({ ...emptyBadgeForm, name: "N" })).not.toHaveProperty("display_order");
    expect(faqCreateRequest({ ...emptyFAQForm, page: "services/ai-solutions", question: "Q", answer: "A" })).not.toHaveProperty("display_order");
    expect(teamCreate({ ...emptyTeamMemberForm, name: "N", role: "R", bio: "B" })).not.toHaveProperty("display_order");
  });
  it("loads the backend position and sends a changed one on edit, as a single payload", () => {
    const form = badgeToForm(badgeFixture);
    expect(form.displayOrder).toBe(String(badgeFixture.display_order));
    expect(badgeUpdate({ ...form, displayOrder: "5" }).display_order).toBe(5);
  });
  it("keeps FAQ position independent of page and sub-page", () => {
    const form = { ...faqToForm(faqFixture), displayOrder: "2" };
    const moved = faqUpdateRequest({ ...form, page: "services/ai-solutions", subPage: "ai-agents" });
    expect(moved).toMatchObject({ page: "services/ai-solutions", sub_page: "ai-agents", display_order: 2 });
    expect(faqUpdateRequest({ ...form, displayOrder: "" })).not.toHaveProperty("display_order");
  });
});
