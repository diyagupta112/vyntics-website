-- FAQ association is an open-ended page path, not an enum or foreign key.
create table public.faqs (
    id uuid primary key default gen_random_uuid(),
    page text not null,
    question text not null,
    answer text not null,
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ck_faqs_page_key check (
        char_length(page) between 1 and 255 and
        page ~ '^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*$'
    ),
    constraint ck_faqs_question_not_blank check (question ~ '[^[:space:]]'),
    constraint ck_faqs_answer_not_blank check (answer ~ '[^[:space:]]')
);

create index ix_faqs_page_active_display_order
    on public.faqs (page, is_active, display_order, created_at, id);

create trigger set_faqs_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

create table public.testimonials (
    id uuid primary key default gen_random_uuid(),
    quote text not null,
    author_name text not null,
    author_role text,
    company_name text,
    company_logo_url text,
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ck_testimonials_quote_not_blank check (quote ~ '[^[:space:]]'),
    constraint ck_testimonials_author_name_not_blank check (author_name ~ '[^[:space:]]')
);

create index ix_testimonials_active_display_order
    on public.testimonials (is_active, display_order, created_at, id);

create trigger set_testimonials_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();
