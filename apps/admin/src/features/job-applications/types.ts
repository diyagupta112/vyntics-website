export type JobApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";

export type JobApplicationListItem = {
  id: string;
  career_id: string | null;
  career_title_snapshot: string;
  career_slug_snapshot: string;
  name: string;
  email: string;
  phone: string;
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
