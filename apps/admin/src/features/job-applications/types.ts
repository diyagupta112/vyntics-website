export type JobApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";

export type NoticePeriod =
  | "immediate"
  | "15_days"
  | "30_days"
  | "60_days"
  | "90_days"
  | "other";

export type JobApplicationListItem = {
  id: string;
  career_id: string | null;
  career_title_snapshot: string;
  career_slug_snapshot: string;
  name: string;
  email: string;
  phone: string;
  experience_years: number | null;
  experience_months: number | null;
  currently_working: boolean | null;
  current_company: string | null;
  notice_period: NoticePeriod | null;
  status: JobApplicationStatus;
  submitted_at: string;
  resume_url: string | null;
};

export type JobApplicationDetail = JobApplicationListItem & {
  cover_letter: string | null;
  notes: string | null;
};

export type JobApplicationUpdateRequest = {
  status?: JobApplicationStatus;
  notes?: string | null;
};
