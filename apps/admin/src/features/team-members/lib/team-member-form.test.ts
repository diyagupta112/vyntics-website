import { describe, expect, it } from "vitest";
import { emptyTeamMemberForm, toCreateRequest, validateTeamMemberForm } from "./team-member-form";
describe("Team Member form helpers", () => {
  it("validates required fields, integer order, and LinkedIn URL", () => {
    const errors = validateTeamMemberForm({ ...emptyTeamMemberForm, displayOrder: "1.5", linkedinUrl: "javascript:bad" });
    expect(errors.name).toBe("Name is required."); expect(errors.bio).toBe("Biography is required."); expect(errors.displayOrder).toMatch(/whole number/); expect(errors.linkedinUrl).toMatch(/HTTP/);
  });
  it("builds the supported create payload", () => {
    expect(toCreateRequest({ name: " Asha ", role: " Director ", bio: " Bio ", linkedinUrl: "https://linkedin.com/in/asha", displayOrder: "2", memberType: "leadership" })).toEqual({ name: "Asha", role: "Director", bio: "Bio", linkedin_url: "https://linkedin.com/in/asha", display_order: 2, member_type: "leadership", photo_url: null });
  });
});
