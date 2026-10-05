-- Public partner, certification, achievement, and trust badges.

create table public.badges (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    logo_url text,
    website_url text,
    display_order integer not null,
    is_active boolean not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index ix_badges_active_display_order
    on public.badges (is_active, display_order, created_at, id);

create trigger set_badges_updated_at
before update on public.badges
for each row execute function public.set_updated_at();
