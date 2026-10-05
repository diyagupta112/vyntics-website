export type Badge = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BadgeCreateRequest = {
  name: string;
  description: string | null;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
};

export type BadgeUpdateRequest = Partial<BadgeCreateRequest>;
