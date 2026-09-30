export type TeamMemberType = "leadership" | "team";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  linkedin_url: string | null;
  display_order: number;
  member_type: TeamMemberType;
};

export type TeamListResponse = { data: TeamMember[] };

export type TeamMemberCreateRequest = {
  name: string;
  role: string;
  bio: string;
  photo_url: null;
  linkedin_url: string | null;
  display_order: number;
  member_type: TeamMemberType;
};

export type TeamMemberUpdateRequest = Partial<Omit<TeamMemberCreateRequest, "photo_url">>;
