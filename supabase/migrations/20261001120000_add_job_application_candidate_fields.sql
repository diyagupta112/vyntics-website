-- Add structured candidate information while preserving historical applications.

alter table public.job_applications
    add column experience_years integer,
    add column experience_months smallint,
    add column currently_working boolean,
    add column current_company text,
    add column notice_period text,
    add constraint ck_job_applications_experience_years
        check (experience_years is null or experience_years >= 0),
    add constraint ck_job_applications_experience_months
        check (
            experience_months is null
            or experience_months between 0 and 11
        ),
    add constraint ck_job_applications_current_company
        check (
            current_company is null
            or char_length(btrim(current_company)) between 1 and 200
        ),
    add constraint ck_job_applications_notice_period
        check (
            notice_period is null
            or notice_period in (
                'immediate',
                '15_days',
                '30_days',
                '60_days',
                '90_days',
                'other'
            )
        );
