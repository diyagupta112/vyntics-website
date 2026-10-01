export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  linkedin_url: string | null;
  display_order: number;
  member_type: "leadership" | "team";
};

export type TeamMemberSummary = Pick<
  TeamMember,
  "id" | "name" | "role" | "photo_url" | "display_order" | "member_type"
>;

type TeamResponse = { data: TeamMember[] };

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isTeamMember(value: unknown): value is TeamMember {
  if (!value || typeof value !== "object") return false;
  const member = value as Record<string, unknown>;

  return (
    typeof member.id === "string" &&
    typeof member.name === "string" &&
    member.name.trim().length > 0 &&
    typeof member.role === "string" &&
    member.role.trim().length > 0 &&
    typeof member.bio === "string" &&
    (member.photo_url === null || isHttpUrl(member.photo_url)) &&
    (member.linkedin_url === null || isHttpUrl(member.linkedin_url)) &&
    typeof member.display_order === "number" &&
    (member.member_type === "leadership" || member.member_type === "team")
  );
}

function apiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch(`${apiBaseUrl()}/our-team`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as Partial<TeamResponse>;
    if (!Array.isArray(payload.data)) return [];

    const members = payload.data.filter(isTeamMember);
    if (members.length !== payload.data.length) return [];
    return members.sort((a, b) => a.display_order - b.display_order);
  } catch {
    return [];
  }
}
