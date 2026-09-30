import type { ApiError } from "@/lib/api/errors";
import type { TeamMember, TeamMemberCreateRequest, TeamMemberType, TeamMemberUpdateRequest } from "../types";

export type TeamMemberFormValues = { name: string; role: string; bio: string; linkedinUrl: string; displayOrder: string; memberType: TeamMemberType };
export type TeamMemberFormErrors = Partial<Record<keyof TeamMemberFormValues, string>>;
export const emptyTeamMemberForm: TeamMemberFormValues = { name: "", role: "", bio: "", linkedinUrl: "", displayOrder: "0", memberType: "team" };

export function teamMemberToForm(member: TeamMember): TeamMemberFormValues {
  return { name: member.name, role: member.role, bio: member.bio, linkedinUrl: member.linkedin_url ?? "", displayOrder: String(member.display_order), memberType: member.member_type };
}

export function validateTeamMemberForm(values: TeamMemberFormValues): TeamMemberFormErrors {
  const errors: TeamMemberFormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  if (!values.role.trim()) errors.role = "Role is required.";
  if (!values.bio.trim()) errors.bio = "Biography is required.";
  if (!Number.isInteger(Number(values.displayOrder))) errors.displayOrder = "Display order must be a whole number.";
  if (values.linkedinUrl.trim()) {
    try {
      const url = new URL(values.linkedinUrl.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch { errors.linkedinUrl = "Enter a valid HTTP or HTTPS URL."; }
  }
  return errors;
}

function common(values: TeamMemberFormValues) {
  return { name: values.name.trim(), role: values.role.trim(), bio: values.bio.trim(), linkedin_url: values.linkedinUrl.trim() || null, display_order: Number(values.displayOrder), member_type: values.memberType };
}
export function toCreateRequest(values: TeamMemberFormValues): TeamMemberCreateRequest { return { ...common(values), photo_url: null }; }
export function toUpdateRequest(values: TeamMemberFormValues): TeamMemberUpdateRequest { return common(values); }

const fieldMap: Record<string, keyof TeamMemberFormValues> = { name: "name", role: "role", bio: "bio", linkedin_url: "linkedinUrl", display_order: "displayOrder", member_type: "memberType" };
export function backendFieldErrors(error: ApiError): TeamMemberFormErrors {
  return Object.fromEntries(error.validationIssues.flatMap((issue) => {
    const backend = [...issue.location].reverse().find((part) => typeof part === "string");
    const field = typeof backend === "string" ? fieldMap[backend] : undefined;
    return field ? [[field, issue.message]] : [];
  }));
}
