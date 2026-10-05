-- Publicly featured capacity is enforced by service transactions holding
-- separate PostgreSQL advisory locks for Blogs and Case Studies.
-- Defaults preserve every existing row as non-featured.

alter table public.blogs
    add column is_featured boolean not null default false;

alter table public.case_studies
    add column is_featured boolean not null default false;
