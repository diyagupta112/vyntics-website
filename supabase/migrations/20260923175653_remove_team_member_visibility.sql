drop index if exists public.ix_team_members_visible_order;

alter table public.team_members
    drop column is_visible;
