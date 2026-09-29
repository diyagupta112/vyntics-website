-- Temporary Phase 9 verification support: allow applications without resumes.
-- The final product contract still requires resume storage once it is available.

alter table public.job_applications
    alter column resume_url drop not null;
