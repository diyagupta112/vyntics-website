"""Standard display_order behavior across every resource that has it.

Resources and their ordering scope:
  badges, testimonials, team members, Life at Vyntics: one sequence each.
  FAQs: one sequence per (page, sub_page).
"""

import asyncio
from pathlib import Path
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from pydantic import ValidationError
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.api.dependencies.database import get_db_session
from app.core.config import Settings
from app.db.session import create_database, dispose_database
from app.main import create_app
from app.schemas.badges import BadgeCreateRequest, BadgeUpdateRequest
from app.schemas.faqs import FAQCreateRequest, FAQUpdateRequest
from app.schemas.life_at_vyntics import LifeAtVynticsCreateRequest, LifeAtVynticsUpdateRequest
from app.schemas.team import TeamMemberCreateRequest, TeamMemberUpdateRequest
from app.schemas.testimonials import TestimonialCreateRequest, TestimonialUpdateRequest
from app.repositories.ordering import DisplayOrderRepositoryMixin
from app.services import ordering
from tests.auth_helpers import authenticate_test_admin
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run

MIGRATIONS = Path(__file__).resolve().parents[3] / "supabase/migrations"
BASE = {
    "badges": {"name": "B", "is_active": True},
    "testimonials": {"quote": "Q", "author_name": "A"},
    "team": {"name": "N", "role": "R", "bio": "Bio", "member_type": "team"},
    "faqs": {"page": "services/cloud-foundations", "question": "Q?", "answer": "A."},
    "life": {},
}
SCHEMAS = {
    "badges": (BadgeCreateRequest, BadgeUpdateRequest),
    "testimonials": (TestimonialCreateRequest, TestimonialUpdateRequest),
    "team": (TeamMemberCreateRequest, TeamMemberUpdateRequest),
    "faqs": (FAQCreateRequest, FAQUpdateRequest),
    "life": (LifeAtVynticsCreateRequest, LifeAtVynticsUpdateRequest),
}
BAD_POSITIONS = [0, -1, 1.5, True, "2", None]


@pytest.mark.parametrize("resource", SCHEMAS)
def test_create_display_order_is_optional_one_based_and_strict(resource):
    create, update = SCHEMAS[resource]
    assert create(**BASE[resource]).display_order is None
    assert create(**BASE[resource], display_order=1).display_order == 1
    assert create(**BASE[resource], display_order=500).display_order == 500
    for value in BAD_POSITIONS:
        with pytest.raises(ValidationError):
            create(**BASE[resource], display_order=value)
        with pytest.raises(ValidationError):
            update(display_order=value)
    assert update().model_dump(exclude_unset=True) == {}
    assert update(display_order=3).model_dump(exclude_unset=True) == {"display_order": 3}


class _Repo:
    """In-memory stand-in for the shared helpers: rows are (scope, position) lists."""

    def __init__(self, rows):
        self.rows = rows

    async def count(self, scope=None):
        return sum(1 for r in self.rows if all(r.get(k) == v for k, v in (scope or {}).items()))

    async def shift(self, *, delta, first, last=None, scope=None):
        for r in self.rows:
            if all(r.get(k) == v for k, v in (scope or {}).items()) and r["display_order"] >= first and (last is None or r["display_order"] <= last):
                r["display_order"] += delta


def _positions(rows, **scope):
    return sorted(r["display_order"] for r in rows if all(r.get(k) == v for k, v in scope.items()))


def test_shared_helpers_insert_clamp_move_and_close_gap():
    async def run():
        rows = [{"id": i, "display_order": i} for i in range(1, 6)]
        repo = _Repo(rows)
        assert await ordering.insertion_position(repo, None) == 6
        assert await ordering.insertion_position(repo, 99) == 6
        assert _positions(rows) == [1, 2, 3, 4, 5]
        assert await ordering.insertion_position(repo, 1) == 1
        assert _positions(rows) == [2, 3, 4, 5, 6]
        await ordering.close_gap(repo, 1)
        assert _positions(rows) == [1, 2, 3, 4, 5]

        class Row:
            display_order = 5

        row = Row()
        rows[4]["display_order"] = 5
        assert await ordering.apply_changes(repo, row, {"display_order": 2}) == ["display_order"]
        assert row.display_order == 2
        row.display_order = 3
        assert await ordering.apply_changes(repo, row, {"display_order": 3}) == []
        assert await ordering.apply_changes(repo, row, {"display_order": 99}) == ["display_order"] and row.display_order == 5
    asyncio.run(run())


def test_scoped_helpers_only_touch_their_scope():
    async def run():
        rows = [
            {"page": "a", "sub_page": None, "display_order": 1}, {"page": "a", "sub_page": None, "display_order": 2},
            {"page": "a", "sub_page": "s", "display_order": 1}, {"page": "a", "sub_page": "s", "display_order": 2},
            {"page": "b", "sub_page": None, "display_order": 1},
        ]
        repo = _Repo(rows)
        scope = {"page": "a", "sub_page": "s"}
        assert await ordering.insertion_position(repo, 1, scope) == 1
        assert _positions(rows, page="a", sub_page="s") == [2, 3]
        assert _positions(rows, page="a", sub_page=None) == [1, 2]
        assert _positions(rows, page="b") == [1]
    asyncio.run(run())


def test_mixin_scope_conditions_match_null():
    from app.db.models.faq import FAQ

    class Repo(DisplayOrderRepositoryMixin):
        ordering_model = FAQ
        ordering_lock_key = "x"

    sql = " ".join(str(c) for c in Repo._scope_conditions(Repo(), {"page": "a", "sub_page": None}))
    assert "faqs.page =" in sql and "faqs.sub_page IS NULL" in sql


# ---------------------------------------------------------------- PostgreSQL

pg = pytest.mark.skipif(not RUN_DATABASE_INTEGRATION_TESTS, reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL")
TABLES = ["badges", "team_members", "testimonials", "faqs", "life_at_vyntics"]
CONSTRAINTS = {
    "badges": ["ck_badges_display_order_positive", "uq_badges_display_order"],
    "team_members": ["ck_team_members_display_order_positive", "uq_team_members_display_order"],
    "testimonials": ["ck_testimonials_display_order_positive", "uq_testimonials_display_order"],
    "faqs": ["ck_faqs_display_order_positive", "uq_faqs_page_sub_page_display_order"],
    "life_at_vyntics": ["ck_life_at_vyntics_display_order_positive", "uq_life_at_vyntics_display_order"],
}
PATHS = {"badges": "/badges", "testimonials": "/testimonials", "team": "/our-team", "faqs": "/faqs", "life": "/life-at-vyntics"}
LIST_PATHS = {"badges": "/admin/badges", "testimonials": "/admin/testimonials", "team": "/our-team", "faqs": "/admin/faqs", "life": "/admin/life-at-vyntics"}


async def _with_schema(body):
    database = create_database(Settings())
    schema = "display_order_test_" + uuid4().hex
    created = False
    application = None
    try:
        async with database.engine.begin() as connection:
            await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
            created = True
            await connection.execute(text(f'CREATE TABLE "{schema}".audit_logs (LIKE public.audit_logs INCLUDING ALL)'))
            for table in TABLES:
                await connection.execute(text(f'CREATE TABLE "{schema}"."{table}" (LIKE public."{table}" INCLUDING ALL)'))
                # Start from the pre-migration shape so the real migration is what is under test.
                for name in CONSTRAINTS[table]:
                    await connection.execute(text(f'ALTER TABLE "{schema}"."{table}" DROP CONSTRAINT IF EXISTS "{name}"'))
            await connection.execute(text(f'ALTER TABLE "{schema}".life_at_vyntics ADD CONSTRAINT ck_life_at_vyntics_display_order_positive CHECK (display_order >= 1), ADD CONSTRAINT uq_life_at_vyntics_display_order UNIQUE (display_order) DEFERRABLE INITIALLY DEFERRED'))
            sql = (MIGRATIONS / "20261029120000_standardize_display_order.sql").read_text()
            # Life already carries these constraints; the migration owns the other four tables.
            sql = sql.replace("public.", f'"{schema}".')
            await connection.exec_driver_sql(sql)
        factory = async_sessionmaker(database.engine.execution_options(schema_translate_map={None: schema}), expire_on_commit=False)
        application = create_app(Settings(_env_file=None))
        application.state.storage_gateway = AsyncMock()

        async def scoped_session():
            async with factory() as session:
                yield session
        application.dependency_overrides[get_db_session] = scoped_session
        authenticate_test_admin(application)
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application), base_url="http://testserver") as client:
            await body(client, factory, database, schema)
    finally:
        if application:
            application.dependency_overrides.clear()
            await application.state.auth_verifier.aclose()
        if created:
            async with database.engine.begin() as connection:
                await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        await dispose_database(database)


async def _create(client, resource, label, **extra):
    body = {**BASE[resource], **extra}
    if resource == "badges": body["name"] = label
    elif resource == "testimonials": body["quote"] = label
    elif resource == "team": body["name"] = label
    elif resource == "faqs": body["question"] = label + "?"
    response = await client.post(PATHS[resource], json=body)
    assert response.status_code == 201, response.text
    return response.json()


def _label(resource, row):
    return {"badges": row.get("name"), "testimonials": row.get("quote"), "team": row.get("name"), "faqs": (row.get("question") or "").rstrip("?"), "life": row.get("id")}[resource]


async def _sequence(client, resource, **scope):
    response = await client.get(LIST_PATHS[resource])
    assert response.status_code == 200
    data = response.json()
    rows = data["data"] if isinstance(data, dict) else data
    rows = [r for r in rows if all(r.get(k) == v for k, v in scope.items())]
    rows.sort(key=lambda r: r["display_order"])
    assert [r["display_order"] for r in rows] == list(range(1, len(rows) + 1)), rows  # contiguous 1..N, no duplicates
    return [_label(resource, r) for r in rows]


@pg
@pytest.mark.parametrize("resource", ["badges", "testimonials", "team", "faqs", "life"])
def test_postgres_standard_ordering(resource):
    async def body(client, factory, database, schema):
        path = PATHS[resource]
        ids = {}
        # Omitted display_order appends; the first item becomes 1.
        for label in "ABCDE":
            row = await _create(client, resource, label)
            ids[label] = row["id"]
            assert row["display_order"] == len("".join(ids))
        names = lambda: _sequence(client, resource)
        base = await names()
        keys = {l: (ids[l] if resource == "life" else l) for l in "ABCDE"}
        assert base == [keys[l] for l in "ABCDE"]
        # Insert at 1 shifts everything down.
        x = await _create(client, resource, "X", display_order=1)
        ids["X"] = x["id"]; keys["X"] = x["id"] if resource == "life" else "X"
        assert x["display_order"] == 1
        assert await names() == [keys[l] for l in "XABCDE"]
        # Beyond the end clamps to the end (no gap).
        y = await _create(client, resource, "Y", display_order=99)
        ids["Y"] = y["id"]; keys["Y"] = y["id"] if resource == "life" else "Y"
        assert y["display_order"] == 7
        # Middle insert.
        m = await _create(client, resource, "M", display_order=4)
        ids["M"] = m["id"]; keys["M"] = m["id"] if resource == "life" else "M"
        assert await names() == [keys[l] for l in "XABMCDEY"]
        # Move later -> earlier, earlier -> later, first -> later, last -> first, middle shifts.
        async def move(label, position):
            response = await client.patch(f"{path}/{ids[label]}", json={"display_order": position})
            assert response.status_code == 200, response.text
            return response.json()["display_order"]
        assert await move("Y", 2) == 2
        assert await names() == [keys[l] for l in "XYABMCDE"]
        assert await move("A", 6) == 6
        assert await names() == [keys[l] for l in "XYBMCADE"]
        assert await move("X", 8) == 8
        assert await names() == [keys[l] for l in "YBMCADEX"]
        assert await move("X", 1) == 1
        assert await names() == [keys[l] for l in "XYBMCADE"]
        assert await move("D", 3) == 3
        assert await names() == [keys[l] for l in "XYDBMCAE"]
        assert await move("E", 500) == 8  # clamped, already last: unchanged
        # An unchanged position changes nothing and writes no audit entry.
        async with factory() as session:
            before = await session.scalar(text(f'select count(*) from "{schema}".audit_logs'))
        assert await move("D", 3) == 3
        async with factory() as session:
            assert await session.scalar(text(f'select count(*) from "{schema}".audit_logs')) == before
        assert await names() == [keys[l] for l in "XYDBMCAE"]
        # Invalid positions are rejected and change nothing.
        for bad in (0, -1, 1.5, True, "2", None):
            assert (await client.patch(f"{path}/{ids['D']}", json={"display_order": bad})).status_code == 422
            assert (await client.post(path, json={**BASE[resource], "display_order": bad})).status_code == 422
        assert await names() == [keys[l] for l in "XYDBMCAE"]
        # Delete first, middle and last: the remaining positions stay contiguous.
        for label in ("X", "B", "E"):
            assert (await client.delete(f"{path}/{ids[label]}")).status_code == 204
            await names()
        assert await names() == [keys[l] for l in "YDMCA"]
        # Database refuses duplicate or non-positive positions.
        table = {"team": "team_members", "life": "life_at_vyntics"}.get(resource, resource)
        async with factory() as session:
            for statement in (f'update "{schema}"."{table}" set display_order = 0', f'update "{schema}"."{table}" set display_order = 1'):
                with pytest.raises(IntegrityError):
                    async with session.begin_nested():
                        await session.execute(text(statement))
                        await session.execute(text("set constraints all immediate"))
    _run(asyncio.wait_for(_with_schema(body), timeout=240))


@pg
def test_postgres_faq_ordering_is_scoped_by_page_and_sub_page():
    async def body(client, factory, database, schema):
        async def faq(page, sub_page, label, **extra):
            payload = {"page": page, "question": label + "?", "answer": "A."}
            if sub_page: payload["sub_page"] = sub_page
            response = await client.post("/faqs", json={**payload, **extra})
            assert response.status_code == 201, response.text
            return response.json()
        a1 = await faq("page-a", None, "a1"); a2 = await faq("page-a", None, "a2")
        s1 = await faq("page-a", "sub-page-1", "s1"); s2 = await faq("page-a", "sub-page-1", "s2")
        b1 = await faq("page-b", None, "b1")
        assert [r["display_order"] for r in (a1, a2, s1, s2, b1)] == [1, 2, 1, 2, 1]
        new = await faq("page-a", "sub-page-1", "new", display_order=1)
        assert new["display_order"] == 1
        assert await _sequence(client, "faqs", page="page-a", sub_page="sub-page-1") == ["new", "s1", "s2"]
        assert await _sequence(client, "faqs", page="page-a", sub_page=None) == ["a1", "a2"]
        assert await _sequence(client, "faqs", page="page-b", sub_page=None) == ["b1"]
        # Reorder inside one scope leaves the others alone.
        assert (await client.patch(f"/faqs/{s2['id']}", json={"display_order": 1})).status_code == 200
        assert await _sequence(client, "faqs", page="page-a", sub_page="sub-page-1") == ["s2", "new", "s1"]
        assert await _sequence(client, "faqs", page="page-a", sub_page=None) == ["a1", "a2"]
        # Moving to another scope closes the old gap and appends (or inserts) in the new one.
        moved = await client.patch(f"/faqs/{a1['id']}", json={"sub_page": "sub-page-1"})
        assert moved.status_code == 200 and moved.json()["display_order"] == 4
        assert await _sequence(client, "faqs", page="page-a", sub_page="sub-page-1") == ["s2", "new", "s1", "a1"]
        assert await _sequence(client, "faqs", page="page-a", sub_page=None) == ["a2"]
        moved = await client.patch(f"/faqs/{a1['id']}", json={"page": "page-b", "sub_page": None, "display_order": 1})
        assert moved.status_code == 200 and moved.json()["display_order"] == 1
        assert await _sequence(client, "faqs", page="page-b", sub_page=None) == ["a1", "b1"]
        assert await _sequence(client, "faqs", page="page-a", sub_page="sub-page-1") == ["s2", "new", "s1"]
        # Delete compacts only its own scope; page filtering on the public list still works.
        assert (await client.delete(f"/faqs/{s2['id']}")).status_code == 204
        assert await _sequence(client, "faqs", page="page-a", sub_page="sub-page-1") == ["new", "s1"]
        assert await _sequence(client, "faqs", page="page-b", sub_page=None) == ["a1", "b1"]
        public = (await client.get("/faqs", params={"page": "page-a", "sub_page": "sub-page-1"})).json()["data"]
        assert [r["question"] for r in public] == ["new?", "s1?"]
    _run(asyncio.wait_for(_with_schema(body), timeout=240))


@pg
@pytest.mark.parametrize("resource", ["badges", "faqs"])
def test_postgres_concurrent_creates_keep_positions_unique_and_contiguous(resource):
    async def body(client, factory, database, schema):
        responses = await asyncio.gather(*[client.post(PATHS[resource], json={**BASE[resource], **({"name": f"B{i}"} if resource == "badges" else {})}) for i in range(6)])
        assert all(r.status_code == 201 for r in responses), [r.text for r in responses]
        assert sorted(r.json()["display_order"] for r in responses) == [1, 2, 3, 4, 5, 6]
        mixed = await asyncio.gather(
            client.post(PATHS[resource], json={**BASE[resource], "display_order": 1}),
            client.post(PATHS[resource], json={**BASE[resource], "display_order": 1}),
            client.patch(f"{PATHS[resource]}/{responses[0].json()['id']}", json={"display_order": 6}),
            client.delete(f"{PATHS[resource]}/{responses[5].json()['id']}"),
        )
        assert [r.status_code for r in mixed] == [201, 201, 200, 204]
        rows = (await client.get(LIST_PATHS[resource])).json()
        rows = rows["data"] if isinstance(rows, dict) else rows
        assert sorted(r["display_order"] for r in rows) == list(range(1, len(rows) + 1))
    _run(asyncio.wait_for(_with_schema(body), timeout=240))


@pg
def test_postgres_migration_keeps_valid_data_and_repairs_only_invalid_sequences():
    async def body(client, factory, database, schema):
        async with database.engine.begin() as connection:
            # Re-run the repair on invalid data: drop the new constraints, seed gaps/duplicates.
            for table, names in CONSTRAINTS.items():
                for name in names[:2]:
                    await connection.execute(text(f'ALTER TABLE "{schema}"."{table}" DROP CONSTRAINT IF EXISTS "{name}"'))
            await connection.execute(text(f"""insert into "{schema}".badges (name,display_order,is_active,created_at) values
                ('a',1,true,'2026-01-01'),('b',2,true,'2026-01-02'),('c',3,true,'2026-01-03')"""))
            await connection.execute(text(f"""insert into "{schema}".testimonials (quote,author_name,display_order,created_at) values
                ('a','x',0,'2026-01-01'),('b','x',0,'2026-01-02'),('c','x',7,'2026-01-03')"""))
            await connection.execute(text(f"""insert into "{schema}".faqs (page,sub_page,question,answer,display_order,created_at) values
                ('p',null,'a','a',1,'2026-01-01'),('p',null,'b','b',2,'2026-01-02'),
                ('p','s','c','c',5,'2026-01-03'),('p','s','d','d',5,'2026-01-04')"""))
            sql = (MIGRATIONS / "20261029120000_standardize_display_order.sql").read_text().replace("public.", f'"{schema}".')
            await connection.exec_driver_sql(sql)
            q = lambda t, c="display_order": text(f'select {c} from "{schema}".{t} order by display_order, created_at')
            assert [r[0] for r in (await connection.execute(q("badges"))).all()] == [1, 2, 3]  # valid data untouched
            assert [r[0] for r in (await connection.execute(q("testimonials"))).all()] == [1, 2, 3]
            faq = (await connection.execute(text(f'select sub_page, question, display_order from "{schema}".faqs order by sub_page nulls first, display_order'))).all()
            assert faq == [(None, "a", 1), (None, "b", 2), ("s", "c", 1), ("s", "d", 2)]
    _run(asyncio.wait_for(_with_schema(body), timeout=240))
