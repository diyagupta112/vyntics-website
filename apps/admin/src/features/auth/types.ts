export type AdminRole = "admin" | "superadmin";

export type CurrentAdmin = {
  id: string;
  auth_user_id: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
