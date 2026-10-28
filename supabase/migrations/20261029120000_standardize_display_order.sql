-- Standardize display_order: a contiguous 1..N sequence per resource (per page and
-- sub-page for FAQs), enforced by the database. The API assigns positions and shifts
-- neighbors under an advisory lock; the unique constraints are deferred so a shift
-- inside one transaction is valid.
--
-- Existing rows are renumbered only inside a sequence whose positions are not already
-- 1..N, keeping their current relative order (display_order, created_at, id). Sequences
-- that already satisfy the invariant are left untouched.

with stats as (
    select (count(*) <> count(distinct display_order)
            or min(display_order) <> 1 or max(display_order) <> count(*)) as bad
    from public.badges
), ranked as (
    select id, row_number() over (order by display_order, created_at, id) as position
    from public.badges
)
update public.badges t
set display_order = ranked.position
from ranked, stats
where stats.bad and t.id = ranked.id and t.display_order <> ranked.position;

with stats as (
    select (count(*) <> count(distinct display_order)
            or min(display_order) <> 1 or max(display_order) <> count(*)) as bad
    from public.team_members
), ranked as (
    select id, row_number() over (order by display_order, created_at, id) as position
    from public.team_members
)
update public.team_members t
set display_order = ranked.position
from ranked, stats
where stats.bad and t.id = ranked.id and t.display_order <> ranked.position;

with stats as (
    select (count(*) <> count(distinct display_order)
            or min(display_order) <> 1 or max(display_order) <> count(*)) as bad
    from public.testimonials
), ranked as (
    select id, row_number() over (order by display_order, created_at, id) as position
    from public.testimonials
)
update public.testimonials t
set display_order = ranked.position
from ranked, stats
where stats.bad and t.id = ranked.id and t.display_order <> ranked.position;

with ranked as (
    select id,
           page, sub_page,
           row_number() over (partition by page, sub_page order by display_order, created_at, id) as position
    from public.faqs
), bad as (
    select page, sub_page
    from public.faqs
    group by page, sub_page
    having count(*) <> count(distinct display_order)
        or min(display_order) <> 1 or max(display_order) <> count(*)
)
update public.faqs f
set display_order = ranked.position
from ranked
where f.id = ranked.id
  and (ranked.page, ranked.sub_page) in (select page, sub_page from bad)
  and f.display_order <> ranked.position;

alter table public.testimonials alter column display_order drop default;
alter table public.faqs alter column display_order drop default;

alter table public.badges
    add constraint ck_badges_display_order_positive check (display_order >= 1),
    add constraint uq_badges_display_order unique (display_order) deferrable initially deferred;

alter table public.team_members
    add constraint ck_team_members_display_order_positive check (display_order >= 1),
    add constraint uq_team_members_display_order unique (display_order) deferrable initially deferred;

alter table public.testimonials
    add constraint ck_testimonials_display_order_positive check (display_order >= 1),
    add constraint uq_testimonials_display_order unique (display_order) deferrable initially deferred;

alter table public.faqs
    add constraint ck_faqs_display_order_positive check (display_order >= 1),
    add constraint uq_faqs_page_sub_page_display_order
        unique nulls not distinct (page, sub_page, display_order) deferrable initially deferred;
