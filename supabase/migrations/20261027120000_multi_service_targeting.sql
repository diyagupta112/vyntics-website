-- Blogs and Case Studies can target several services and sub-services.
-- Services stay a fixed set of keys; sub-services are open-ended keys (no table).
-- The old single related_service value is carried over, and the retired 'all'
-- value becomes the full service list, which matches how 'all' was filtered
-- (it matched every requested service). NULL becomes an empty array.

alter table public.blogs
  add column related_services text[] not null default '{}',
  add column related_sub_services text[] not null default '{}';

alter table public.case_studies
  add column related_services text[] not null default '{}',
  add column related_sub_services text[] not null default '{}';

update public.blogs set related_services = case
  when related_service = 'all'
    then array['cloud_foundations', 'data_engineering', 'analytics_bi', 'ai_solutions', 'crm_revenue_ops']
  when related_service is null then '{}'::text[]
  else array[related_service]
end;

update public.case_studies set related_services = case
  when related_service = 'all'
    then array['cloud_foundations', 'data_engineering', 'analytics_bi', 'ai_solutions', 'crm_revenue_ops']
  when related_service is null then '{}'::text[]
  else array[related_service]
end;

alter table public.blogs
  drop constraint ck_blogs_related_service,
  drop column related_service,
  add constraint ck_blogs_related_services check (
    related_services <@ array['cloud_foundations', 'data_engineering', 'analytics_bi',
                              'ai_solutions', 'crm_revenue_ops']::text[]
  );

alter table public.case_studies
  drop constraint ck_case_studies_related_service,
  drop column related_service,
  add constraint ck_case_studies_related_services check (
    related_services <@ array['cloud_foundations', 'data_engineering', 'analytics_bi',
                              'ai_solutions', 'crm_revenue_ops']::text[]
  );

create index ix_blogs_related_services on public.blogs using gin (related_services);
create index ix_blogs_related_sub_services on public.blogs using gin (related_sub_services);
create index ix_case_studies_related_services on public.case_studies using gin (related_services);
create index ix_case_studies_related_sub_services on public.case_studies using gin (related_sub_services);
