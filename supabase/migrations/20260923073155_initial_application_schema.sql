create table public.admin_users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid not null,
    email text not null,
    role text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_admin_users_auth_user_id unique (auth_user_id),
    constraint ck_admin_users_role check (role in ('superadmin', 'admin'))
);

create table public.blogs (
    id uuid primary key default gen_random_uuid(),
    slug text not null,
    title text not null,
    seo_title text not null,
    meta_description text not null,
    author text not null,
    category text not null,
    excerpt text not null,
    cover_image_url text,
    read_time integer not null,
    content jsonb not null,
    status text not null default 'draft',
    published_at timestamptz,
    created_by uuid references public.admin_users (id),
    updated_by uuid references public.admin_users (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_blogs_slug unique (slug),
    constraint ck_blogs_status check (
        status in ('draft', 'published', 'unpublished')
    )
);

create index ix_blogs_status_published_at
    on public.blogs (status, published_at);

create table public.case_studies (
    id uuid primary key default gen_random_uuid(),
    slug text not null,
    title text not null,
    seo_title text not null,
    meta_description text not null,
    client_name text not null,
    excerpt text not null,
    cover_image_url text,
    tech_stack text[] not null default '{}'::text[],
    tags text[] not null default '{}'::text[],
    content jsonb not null,
    status text not null default 'draft',
    published_at timestamptz,
    created_by uuid references public.admin_users (id),
    updated_by uuid references public.admin_users (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_case_studies_slug unique (slug),
    constraint ck_case_studies_status check (
        status in ('draft', 'published', 'unpublished')
    )
);

create index ix_case_studies_status_published_at
    on public.case_studies (status, published_at);

create table public.careers (
    id uuid primary key default gen_random_uuid(),
    slug text not null,
    title text not null,
    location text not null,
    employment_type text not null,
    department text not null,
    experience text not null,
    short_description text not null,
    description jsonb not null,
    responsibilities jsonb not null,
    requirements jsonb not null,
    nice_to_have jsonb not null default '{}'::jsonb,
    benefits jsonb not null default '{}'::jsonb,
    published_at timestamptz not null,
    created_by uuid references public.admin_users (id),
    updated_by uuid references public.admin_users (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_careers_slug unique (slug)
);

create index ix_careers_published_at on public.careers (published_at);

create table public.job_applications (
    id uuid primary key default gen_random_uuid(),
    career_id uuid not null,
    name text not null,
    email text not null,
    phone text not null,
    resume_url text not null,
    cover_letter text,
    status text not null default 'new',
    notes text,
    submitted_at timestamptz not null default now(),
    constraint fk_job_applications_career_id
        foreign key (career_id)
        references public.careers (id)
        on delete restrict
);

create index ix_job_applications_career_id
    on public.job_applications (career_id);

create index ix_job_applications_status_submitted_at
    on public.job_applications (status, submitted_at);

create table public.team_members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    role text not null,
    bio text not null,
    photo_url text,
    linkedin_url text,
    display_order integer not null,
    member_type text not null,
    is_visible boolean not null,
    created_by uuid references public.admin_users (id),
    updated_by uuid references public.admin_users (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ck_team_members_member_type check (
        member_type in ('leadership', 'team')
    )
);

create index ix_team_members_visible_order
    on public.team_members (is_visible, display_order);

create table public.contact_submissions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    company text,
    subject text not null,
    message text not null,
    source_page text not null,
    status text not null default 'new',
    notes text,
    submitted_at timestamptz not null default now(),
    resolved_at timestamptz,
    resolved_by uuid references public.admin_users (id)
);

create index ix_contact_submissions_status_submitted_at
    on public.contact_submissions (status, submitted_at);

create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references public.admin_users (id),
    actor_email text,
    action text not null,
    resource_type text not null,
    resource_id uuid,
    context jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index ix_audit_logs_actor_created_at
    on public.audit_logs (actor_id, created_at);

create index ix_audit_logs_resource_created_at
    on public.audit_logs (resource_type, resource_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create trigger set_blogs_updated_at
before update on public.blogs
for each row execute function public.set_updated_at();

create trigger set_case_studies_updated_at
before update on public.case_studies
for each row execute function public.set_updated_at();

create trigger set_careers_updated_at
before update on public.careers
for each row execute function public.set_updated_at();

create trigger set_team_members_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();
