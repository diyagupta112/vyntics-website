-- Optional targeting; existing content remains unclassified (NULL).
alter table public.blogs
  add column related_service text,
  add constraint ck_blogs_related_service check (
    related_service in ('cloud_foundations', 'data_engineering', 'analytics_bi',
                        'ai_solutions', 'crm_revenue_ops', 'all')
  );

alter table public.case_studies
  add column related_service text,
  add constraint ck_case_studies_related_service check (
    related_service in ('cloud_foundations', 'data_engineering', 'analytics_bi',
                        'ai_solutions', 'crm_revenue_ops', 'all')
  );
