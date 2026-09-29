-- Preserve Job Applications as historical records after Career deletion.

alter table public.job_applications
    add column career_title_snapshot text,
    add column career_slug_snapshot text;

update public.job_applications as application
set career_title_snapshot = career.title,
    career_slug_snapshot = career.slug
from public.careers as career
where application.career_id = career.id;

alter table public.job_applications
    alter column career_title_snapshot set not null,
    alter column career_slug_snapshot set not null,
    alter column career_id drop not null,
    drop constraint if exists fk_job_applications_career_id,
    add constraint fk_job_applications_career_id
        foreign key (career_id)
        references public.careers (id)
        on delete set null;
