export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  subject: string;
  message: string;
  source_page: string;
  status: string;
  notes: string | null;
  submitted_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
};
