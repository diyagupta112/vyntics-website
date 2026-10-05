-- Preserve existing feature designations; installations without the earlier
-- column receive the same non-null false default.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_studies' and column_name='is_featured') then
    alter table public.case_studies rename column is_featured to featured;
  else
    alter table public.case_studies add column featured boolean not null default false;
  end if;
end $$;

-- Serialize feature capacity checks, including writes outside the API.
create function public.lock_case_study_featured_capacity() returns trigger
language plpgsql set search_path = public as $$
begin
  perform pg_advisory_xact_lock(1448693332, 2);
  return null;
end $$;
create trigger lock_case_study_featured_capacity
before insert or update or delete on public.case_studies
for each statement execute function public.lock_case_study_featured_capacity();

create function public.check_case_study_featured_capacity() returns trigger
language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.case_studies where featured) > 5 then
    raise exception 'Maximum of 5 featured case studies allowed.'
      using errcode = '23514', constraint = 'case_studies_featured_limit';
  end if;
  return null;
end $$;
create trigger check_case_study_featured_capacity
 after insert or update on public.case_studies
 for each statement execute function public.check_case_study_featured_capacity();

-- Fail safely if existing draft/published flags already exceed the new limit.
do $$
begin
  if (select count(*) from public.case_studies where featured) > 5 then
    raise exception 'Unfeature excess case studies before applying this migration (maximum 5).';
  end if;
end $$;
