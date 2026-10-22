-- Life at Vyntics gallery. Photos live in the existing public
-- `life-at-vyntics` Storage bucket; the bucket is not created here.
create table public.life_at_vyntics (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    image_url text,
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ck_life_at_vyntics_title_not_blank check (title ~ '[^[:space:]]')
);

create index ix_life_at_vyntics_active_display_order
    on public.life_at_vyntics (is_active, display_order, created_at, id);

create trigger set_life_at_vyntics_updated_at
before update on public.life_at_vyntics
for each row execute function public.set_updated_at();
