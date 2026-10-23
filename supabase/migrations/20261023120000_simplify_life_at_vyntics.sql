-- Life at Vyntics becomes an image-only gallery ordered by a dense 1..n
-- display_order. Existing rows and image URLs are preserved; every remaining
-- row becomes public because is_active is removed.

-- Normalize existing positions to 1..n using the previous public ordering.
with ranked as (
    select id, row_number() over (order by display_order, created_at, id) as position
    from public.life_at_vyntics
)
update public.life_at_vyntics as gallery
set display_order = ranked.position
from ranked
where ranked.id = gallery.id
  and gallery.display_order <> ranked.position;

drop index public.ix_life_at_vyntics_active_display_order;

-- Dropping title also drops ck_life_at_vyntics_title_not_blank.
alter table public.life_at_vyntics
    drop column title,
    drop column description,
    drop column is_active,
    alter column display_order drop default,
    add constraint ck_life_at_vyntics_display_order_positive check (display_order >= 1),
    -- Deferred so one UPDATE can shift a range of positions inside a transaction.
    add constraint uq_life_at_vyntics_display_order unique (display_order)
        deferrable initially deferred;
