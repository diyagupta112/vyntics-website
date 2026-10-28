"""Shared display_order rules. The caller holds the table's ordering lock (repo.lock_ordering())
inside its own transaction, and these helpers only issue the shifts.

Invariant per scope: positions are 1..N with no gaps or duplicates.
"""

from typing import Any

from app.repositories.ordering import Scope


def _kwargs(scope: Scope | None) -> dict[str, Any]:
    return {} if scope is None else {"scope": scope}


async def insertion_position(repo: Any, requested: int | None, scope: Scope | None = None) -> int:
    """Resolve where a new row goes (append when omitted, clamped to the end) and open the slot."""
    kw = _kwargs(scope)
    last = await repo.count(**kw)
    position = last + 1 if requested is None else min(requested, last + 1)
    if position <= last:
        await repo.shift(delta=1, first=position, **kw)
    return position


async def close_gap(repo: Any, position: int, scope: Scope | None = None) -> None:
    """Shift later rows up after a row left `position`."""
    await repo.shift(delta=-1, first=position + 1, **_kwargs(scope))


async def apply_changes(repo: Any, resource: Any, fields: dict[str, Any], scope_names: tuple[str, ...] = ()) -> list[str]:
    """Apply `fields` (which may include display_order or scope fields) to a locked, freshly loaded row.

    Returns the names of fields that actually changed. Neighbors are shifted only when the
    effective position or scope changes. Scope changes (FAQ page/sub_page) close the gap in the
    old scope and insert into the new one (appended unless display_order is supplied).
    """
    old_scope = {name: getattr(resource, name) for name in scope_names}
    old_position = resource.display_order
    requested = fields.get("display_order")
    new_scope = {name: fields[name] if name in fields else old_scope[name] for name in scope_names}
    changed: list[str] = []
    if new_scope != old_scope:
        # Ordering work happens before the row's own scope columns are modified.
        await close_gap(repo, old_position, old_scope)
        position = await insertion_position(repo, requested, new_scope)
        resource.display_order = position
        changed.append("display_order")
    elif requested is not None:
        position = min(requested, await repo.count(**_kwargs(old_scope or None)))
        if position != old_position:
            kw = _kwargs(old_scope or None)
            if position < old_position:
                await repo.shift(delta=1, first=position, last=old_position - 1, **kw)
            else:
                await repo.shift(delta=-1, first=old_position + 1, last=position, **kw)
            resource.display_order = position
            changed.append("display_order")
    for name, value in fields.items():
        if name != "display_order" and getattr(resource, name) != value:
            setattr(resource, name, value)
            changed.append(name)
    return changed


async def locked_update(session: Any, repo: Any, resource_id: Any, fields: dict[str, Any], scope_names: tuple[str, ...] = ()) -> tuple[Any | None, list[str]]:
    """Take the ordering lock, reload the row and apply `fields`.

    Returns (None, []) when the row vanished and (row, []) when nothing changed; in both cases
    the transaction is rolled back to release the lock and an unchanged row is reloaded.
    """
    await repo.lock_ordering()
    resource = await repo.get_for_update(resource_id)
    if resource is None:
        await session.rollback()
        return None, []
    changed = await apply_changes(repo, resource, fields, scope_names)
    if not changed:
        await session.rollback()
        resource = await repo.get_by_id(resource_id)
    return resource, changed
