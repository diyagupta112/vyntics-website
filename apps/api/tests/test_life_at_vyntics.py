"""Life at Vyntics API, auth, validation, Storage lifecycle and audit contracts."""

import asyncio
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from io import BytesIO
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

import httpx
import pytest
from fastapi import UploadFile
from fastapi.testclient import TestClient
from sqlalchemy.dialects import postgresql
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.datastructures import Headers
from starlette.requests import Request

from app.api.dependencies.life_at_vyntics import get_life_at_vyntics_service
from app.auth.supabase import InvalidAccessTokenError
from app.core.config import Environment, Settings
from app.db.models.life_at_vyntics import LifeAtVyntics
from app.main import create_app
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.life_at_vyntics import LifeAtVynticsRepository
from app.services.life_at_vyntics import LifeAtVynticsService
from app.storage.supabase import StorageError, SupabaseStorageGateway
from app.storage.uploads import SupabasePublicImageStorage
from tests.auth_helpers import TEST_ADMIN, authenticate_test_admin
from tests.test_auth import _admin, authenticated_api

ID = UUID("0b6f8a62-4d3c-4c0e-9d7b-6f1f5a1b2c3d")
BASE = "https://project.supabase.co/storage/v1/object/public/life-at-vyntics/"
OLD = f"{BASE}{ID}/old.png"
PNG = b"\x89PNG\r\n\x1a\nphoto"
NOW = datetime(2026, 10, 22, tzinfo=timezone.utc)
URL = f"/life-at-vyntics/{ID}"
IMAGE = f"{URL}/image"
ADMIN_URL = f"/admin/life-at-vyntics/{ID}"


def item(url=OLD, order=1, id=ID, **overrides):
    values = dict(id=id, image_url=url, display_order=order, created_at=NOW, updated_at=NOW)
    return LifeAtVyntics(**{**values, **overrides})


class FakeOrdering:
    """In-memory stand-in for the repository's ordering SQL (real SQL: integration test)."""

    def __init__(self, rows):
        self.rows = rows
        self.locked = 0

    def install(self, repo):
        async def lock():
            self.locked += 1

        async def count():
            return len(self.rows)

        async def get_by_id(rid):
            return next((r for r in self.rows if r.id == rid), None)

        async def shift(*, delta, first, last=None):
            for r in self.rows:
                if r.display_order >= first and (last is None or r.display_order <= last):
                    r.display_order += delta

        async def add(resource):
            resource.id, resource.created_at, resource.updated_at = uuid4(), NOW, NOW
            self.rows.append(resource)

        async def delete(resource):
            self.rows.remove(resource)

        async def list_all():
            return sorted(self.rows, key=lambda r: (r.display_order, r.created_at, str(r.id)))

        repo.lock_ordering.side_effect = lock
        repo.count.side_effect = count
        repo.get_by_id.side_effect = get_by_id
        repo.get_for_update.side_effect = get_by_id
        repo.shift.side_effect = shift
        repo.add.side_effect = add
        repo.delete.side_effect = delete
        repo.list_all.side_effect = list_all

    def order(self):
        return [(r.id, r.display_order) for r in sorted(self.rows, key=lambda r: r.display_order)]


@pytest.fixture
def api():
    session = AsyncMock(spec=AsyncSession)
    repo = AsyncMock(spec=LifeAtVynticsRepository)
    repo.get_by_id.return_value = item()
    audits = AsyncMock(spec=AuditLogRepository)
    settings = Settings(_env_file=None, environment=Environment.TEST, debug=False,
                        supabase_url="https://project.supabase.co",
                        supabase_service_role_key="test-only-key")
    gateway = SupabaseStorageGateway(settings, httpx.AsyncClient())
    gateway.upload = AsyncMock()
    gateway.delete = AsyncMock()
    storage = SupabasePublicImageStorage(gateway, bucket="life-at-vyntics", max_bytes=5 * 1024 * 1024)
    service = LifeAtVynticsService(session, repository=repo, audit_repository=audits, image_storage=storage)
    app = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False))
    authenticate_test_admin(app)
    app.dependency_overrides[get_life_at_vyntics_service] = lambda: service
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client, service, session, repo, audits, gateway
    asyncio.run(gateway._client.aclose())


@pytest.fixture
def gallery(api):
    """The api fixture with the fake ordering repository holding a 4-image gallery."""
    client, service, session, repo, audits, gateway = api
    ids = [UUID(int=i) for i in range(1, 5)]
    fake = FakeOrdering([item(url=None, order=n + 1, id=ids[n]) for n in range(4)])
    fake.install(repo)
    return client, fake, ids, session, audits, gateway


def digest_path(content, extension):
    return f"{ID}/{sha256(content).hexdigest()}{extension}"


# --- public / admin reads ----------------------------------------------------

def test_public_reads_need_no_auth_and_expose_only_gallery_fields():
    session = AsyncMock(spec=AsyncSession)
    repo = AsyncMock(spec=LifeAtVynticsRepository)
    repo.list_all.return_value = [item()]
    service = LifeAtVynticsService(session, repository=repo, audit_repository=AsyncMock(spec=AuditLogRepository))
    app = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False))
    app.dependency_overrides[get_life_at_vyntics_service] = lambda: service
    with TestClient(app) as client:
        response = client.get("/life-at-vyntics")
        assert response.status_code == 200
        assert set(response.json()["data"][0]) == {"id", "image_url", "display_order", "created_at", "updated_at"}
        repo.get_by_id.return_value = item()
        assert set(client.get(URL).json()) == {"id", "image_url", "display_order", "created_at", "updated_at"}
        repo.get_by_id.return_value = None
        missing = client.get(URL)
        assert missing.status_code == 404 and missing.json() == {"detail": "Life at Vyntics image not found."}


def test_list_query_orders_by_position_with_deterministic_ties_and_no_filter():
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = MagicMock(all=lambda: [])
    asyncio.run(LifeAtVynticsRepository(session).list_all())
    sql = str(session.scalars.await_args.args[0].compile(dialect=postgresql.dialect()))
    assert "WHERE" not in sql
    assert "ORDER BY life_at_vyntics.display_order ASC, life_at_vyntics.created_at ASC, life_at_vyntics.id ASC" in sql


def test_admin_reads(api):
    client, _, _, repo, _, _ = api
    repo.list_all.return_value = [item(order=1), item(order=2, id=UUID(int=2))]
    assert [r["display_order"] for r in client.get("/admin/life-at-vyntics").json()] == [1, 2]
    assert client.get(ADMIN_URL).json()["display_order"] == 1
    repo.get_by_id.return_value = None
    assert client.get(ADMIN_URL).status_code == 404


def test_persistence_failures_are_generic(api):
    client, _, _, repo, _, _ = api
    repo.list_all.side_effect = SQLAlchemyError("secret")
    response = client.get("/life-at-vyntics")
    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process Life at Vyntics request."}


# --- authentication ----------------------------------------------------------

REQUESTS = [
    ("get", "/admin/life-at-vyntics", {}),
    ("get", ADMIN_URL, {}),
    ("post", "/life-at-vyntics", {"json": {}}),
    ("patch", URL, {"json": {"display_order": 1}}),
    ("delete", URL, {}),
    ("put", IMAGE, {"files": {"file": ("p.png", PNG, "image/png")}}),
    ("delete", IMAGE, {}),
]


def _protected_service():
    service = AsyncMock(spec=LifeAtVynticsService)
    service.list_all.return_value = []
    service.get_by_id.return_value = item()
    service.create.return_value = item()
    service.update.return_value = item()
    service.upload_image.return_value = item()
    return service


@pytest.mark.parametrize("method,path,kwargs", REQUESTS)
@pytest.mark.parametrize("state", ["missing_token", "invalid_token", "missing_admin", "inactive", "admin", "superadmin"])
def test_protected_endpoints_use_existing_admin_authorization(authenticated_api, method, path, kwargs, state):
    client, verifier, session, _ = authenticated_api
    service = _protected_service()
    client.app.dependency_overrides[get_life_at_vyntics_service] = lambda: service
    headers = {"Authorization": "Bearer test-access-token"}
    if state == "missing_token":
        headers = {}
    elif state == "invalid_token":
        verifier.verify.side_effect = InvalidAccessTokenError("expired")
    elif state == "missing_admin":
        session.scalar.return_value = None
    elif state == "inactive":
        session.scalar.return_value = _admin(is_active=False)
    else:
        session.scalar.return_value = _admin(role=state)
    response = getattr(client, method)(path, headers=headers, **kwargs)
    if state in ("admin", "superadmin"):
        assert response.status_code < 300
    else:
        assert response.status_code == 401
        assert not [c for c in service.method_calls if c[0] != "__bool__"]


# --- create ------------------------------------------------------------------

def test_create_without_position_appends_one_two_three(api):
    client, _, session, repo, audits, _ = api
    fake = FakeOrdering([])
    fake.install(repo)
    for expected in (1, 2, 3):
        response = client.post("/life-at-vyntics", json={})
        assert response.status_code == 201
        assert response.json()["display_order"] == expected and response.json()["image_url"] is None
    assert fake.locked == 3
    assert sorted(o for _, o in fake.order()) == [1, 2, 3]
    audit = audits.add.await_args.args[0]
    assert (audit.action, audit.resource_type) == ("create", "life_at_vyntics")
    assert audit.actor_id == TEST_ADMIN.admin_id and audit.actor_email == TEST_ADMIN.admin_email


@pytest.mark.parametrize("requested,expected_new", [(1, 1), (2, 2), (3, 3), (4, 4), (100, 5)])
def test_create_at_position_shifts_following_images(gallery, requested, expected_new):
    client, fake, ids, _, _, _ = gallery
    response = client.post("/life-at-vyntics", json={"display_order": requested})
    assert response.status_code == 201
    assert response.json()["display_order"] == expected_new
    new_id = UUID(response.json()["id"])
    order = [rid for rid, _ in fake.order()]
    old = list(ids)
    assert order == old[: expected_new - 1] + [new_id] + old[expected_new - 1 :]
    assert [o for _, o in fake.order()] == [1, 2, 3, 4, 5]


def test_create_five_to_three_example_from_three_images(api):
    client, _, _, repo, _, _ = api
    fake = FakeOrdering([item(url=None, order=n, id=UUID(int=n)) for n in (1, 2, 3)])
    fake.install(repo)
    new_id = UUID(client.post("/life-at-vyntics", json={"display_order": 1}).json()["id"])
    assert [rid for rid, _ in fake.order()] == [new_id, UUID(int=1), UUID(int=2), UUID(int=3)]


@pytest.mark.parametrize("body", [
    {"display_order": 0}, {"display_order": -1}, {"display_order": 1.5}, {"display_order": "2"},
    {"display_order": None}, {"display_order": True}, {"display_order": []},
    {"title": "x"}, {"is_active": True}, {"image_url": "https://example.com/x.png"},
])
def test_create_validation(api, body):
    client, _, session, repo, _, _ = api
    assert client.post("/life-at-vyntics", json=body).status_code == 422
    repo.add.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_create_failure_rolls_back_without_leaking(api):
    client, _, session, repo, _, _ = api
    FakeOrdering([]).install(repo)
    session.commit.side_effect = RuntimeError("private")
    response = client.post("/life-at-vyntics", json={})
    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process Life at Vyntics request."}
    session.rollback.assert_awaited_once()


# --- reorder -----------------------------------------------------------------

def _positions(fake):
    return {rid.int: pos for rid, pos in fake.order()}


@pytest.mark.parametrize("moved,target,expected", [
    (4, 2, {1: 1, 4: 2, 2: 3, 3: 4}),
    (1, 3, {2: 1, 3: 2, 1: 3, 4: 4}),
    (1, 4, {2: 1, 3: 2, 4: 3, 1: 4}),
    (4, 1, {4: 1, 1: 2, 2: 3, 3: 4}),
    (2, 3, {1: 1, 3: 2, 2: 3, 4: 4}),
    (3, 2, {1: 1, 3: 2, 2: 3, 4: 4}),
    (2, 100, {1: 1, 3: 2, 4: 3, 2: 4}),
])
def test_reorder_shifts_neighbors_atomically(gallery, moved, target, expected):
    client, fake, ids, session, audits, _ = gallery
    response = client.patch(f"/life-at-vyntics/{UUID(int=moved)}", json={"display_order": target})
    assert response.status_code == 200
    assert _positions(fake) == expected
    assert response.json()["display_order"] == expected[moved]
    assert fake.locked == 1
    session.commit.assert_awaited_once()
    audit = audits.add.await_args.args[0]
    assert audit.action == "update" and audit.context["changed_fields"] == ["display_order"]
    assert audit.context["previous_display_order"] == moved


def test_move_to_current_position_is_a_noop(gallery):
    client, fake, _, session, audits, _ = gallery
    assert client.patch(f"/life-at-vyntics/{UUID(int=2)}", json={"display_order": 2}).status_code == 200
    assert _positions(fake) == {1: 1, 2: 2, 3: 3, 4: 4}
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_empty_patch_is_a_noop(gallery):
    client, fake, _, session, audits, _ = gallery
    assert client.patch(f"/life-at-vyntics/{UUID(int=2)}", json={}).status_code == 200
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()


@pytest.mark.parametrize("body", [
    {"display_order": 0}, {"display_order": -3}, {"display_order": 1.5}, {"display_order": None},
    {"display_order": "1"}, {"title": "x"}, {"is_active": False}, {"image_url": "https://example.com/x.png"},
])
def test_reorder_validation(gallery, body):
    client, fake, _, session, _, _ = gallery
    assert client.patch(f"/life-at-vyntics/{UUID(int=2)}", json=body).status_code == 422
    assert _positions(fake) == {1: 1, 2: 2, 3: 3, 4: 4}
    session.commit.assert_not_awaited()


def test_reorder_failure_rolls_back(gallery):
    client, _, _, session, audits, _ = gallery
    audits.add.side_effect = RuntimeError("private")
    assert client.patch(f"/life-at-vyntics/{UUID(int=4)}", json={"display_order": 1}).status_code == 500
    session.rollback.assert_awaited_once()
    session.commit.assert_not_awaited()


def test_missing_resource_is_404(api):
    client, _, session, repo, _, gateway = api
    repo.get_by_id.return_value = None
    assert client.patch(URL, json={"display_order": 1}).status_code == 404
    assert client.delete(URL).status_code == 404
    assert client.delete(IMAGE).status_code == 404
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 404
    gateway.upload.assert_not_awaited()
    gateway.delete.assert_not_awaited()
    session.commit.assert_not_awaited()


# --- delete ------------------------------------------------------------------

@pytest.mark.parametrize("removed,expected", [
    (1, {2: 1, 3: 2, 4: 3}),
    (2, {1: 1, 3: 2, 4: 3}),
    (4, {1: 1, 2: 2, 3: 3}),
])
def test_delete_closes_the_gap(gallery, removed, expected):
    client, fake, _, session, audits, _ = gallery
    assert client.delete(f"/life-at-vyntics/{UUID(int=removed)}").status_code == 204
    assert _positions(fake) == expected
    session.commit.assert_awaited_once()
    audit = audits.add.await_args.args[0]
    assert audit.action == "delete" and audit.context["display_order"] == removed


def test_delete_removes_managed_image_after_commit(api):
    client, _, session, repo, _, gateway = api
    FakeOrdering([item()]).install(repo)
    events = []
    session.commit.side_effect = lambda: events.append("commit")
    gateway.delete.side_effect = lambda *a: events.append("delete")
    assert client.delete(URL).status_code == 204
    gateway.delete.assert_awaited_once_with("life-at-vyntics", f"{ID}/old.png")
    assert events == ["commit", "delete"]


def test_delete_database_failure_keeps_image_and_order(api):
    client, _, session, repo, _, gateway = api
    fake = FakeOrdering([item()])
    fake.install(repo)
    session.commit.side_effect = RuntimeError("private")
    assert client.delete(URL).status_code == 500
    session.rollback.assert_awaited_once()
    gateway.delete.assert_not_awaited()


EXTERNAL = [
    "https://external.example/photo.png",
    f"{BASE}{UUID(int=1)}/old.png",
    "https://other.supabase.co/storage/v1/object/public/life-at-vyntics/old.png",
    OLD + "?download=1",
    None,
]


@pytest.mark.parametrize("url", EXTERNAL)
def test_resource_delete_never_deletes_unmanaged_objects(api, url):
    client, _, _, repo, _, gateway = api
    FakeOrdering([item(url=url)]).install(repo)
    assert client.delete(URL).status_code == 204
    gateway.delete.assert_not_awaited()


def test_resource_delete_cleanup_failure_is_best_effort(api):
    client, _, session, repo, _, gateway = api
    FakeOrdering([item()]).install(repo)
    gateway.delete.side_effect = StorageError("down")
    assert client.delete(URL).status_code == 204
    session.rollback.assert_not_awaited()


# --- image upload / delete --------------------------------------------------

@pytest.mark.parametrize("name,mime,content,extension", [
    ("untrusted.JPEG", "image/jpeg", b"\xff\xd8\xff\xe0photo", ".jpg"),
    ("../../x.png", "image/png", PNG, ".png"),
    ("photo.webp", "image/webp", b"RIFF\x04\0\0\0WEBPphoto", ".webp"),
])
def test_upload_accepts_formats_and_orders_upload_commit_cleanup(api, name, mime, content, extension):
    client, _, session, repo, audits, gateway = api
    events = []
    gateway.upload.side_effect = lambda *a: events.append("upload")
    session.commit.side_effect = lambda: events.append("commit")
    gateway.delete.side_effect = lambda *a: events.append("delete")
    response = client.put(IMAGE, files={"file": (name, content, mime)})
    path = digest_path(content, extension)
    assert response.status_code == 200
    assert response.json()["image_url"] == BASE + path
    gateway.upload.assert_awaited_once_with("life-at-vyntics", path, content, mime)
    gateway.delete.assert_awaited_once_with("life-at-vyntics", f"{ID}/old.png")
    assert events == ["upload", "commit", "delete"]
    audit = audits.add.await_args.args[0]
    assert audit.action == "update" and audit.resource_type == "life_at_vyntics"
    assert audit.actor_id == TEST_ADMIN.admin_id
    assert audit.context["changed_fields"] == ["image_url"]
    assert audit.context["image_operation"] == "replace"


def test_first_upload_is_logged_as_upload_and_deletes_nothing(api):
    client, _, _, repo, audits, gateway = api
    repo.get_by_id.return_value.image_url = None
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 200
    assert audits.add.await_args.args[0].context["image_operation"] == "upload"
    gateway.delete.assert_not_awaited()


@pytest.mark.parametrize("name,mime,content", [
    ("p.png", "application/octet-stream", PNG),
    ("p.png", "image/jpeg", PNG),
    ("p.svg", "image/svg+xml", b"<svg/>"),
    ("p.gif", "image/gif", b"GIF89a"),
    ("p.png", "image/png", b"not an image"),
    ("p.jpg", "image/jpeg", PNG),
    ("p.webp", "image/webp", b"RIFFnotwebp"),
    ("p.png", "image/png", b""),
    ("p.png", "image/png", PNG + b"x" * (5 * 1024 * 1024)),
])
def test_invalid_uploads_never_reach_storage_or_database(api, name, mime, content):
    client, _, session, repo, audits, gateway = api
    assert client.put(IMAGE, files={"file": (name, content, mime)}).status_code == 422
    gateway.upload.assert_not_awaited()
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()
    assert repo.get_by_id.return_value.image_url == OLD


def test_exact_maximum_size_is_accepted(api):
    client, _, _, _, _, gateway = api
    content = PNG + b"x" * (5 * 1024 * 1024 - len(PNG))
    assert client.put(IMAGE, files={"file": ("p.png", content, "image/png")}).status_code == 200
    assert len(gateway.upload.await_args.args[2]) == 5 * 1024 * 1024


@pytest.mark.parametrize("stage", ["audit", "refresh", "commit"])
def test_database_failure_removes_only_the_new_object(api, stage):
    client, _, session, repo, audits, gateway = api
    target = {"audit": audits.add, "refresh": repo.refresh, "commit": session.commit}[stage]
    target.side_effect = RuntimeError("private")
    response = client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")})
    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process Life at Vyntics request."}
    session.rollback.assert_awaited_once()
    gateway.delete.assert_awaited_once_with("life-at-vyntics", digest_path(PNG, ".png"))


def test_compensation_failure_keeps_generic_error(api):
    client, _, session, _, _, gateway = api
    session.commit.side_effect = RuntimeError("db")
    gateway.delete.side_effect = StorageError("provider")
    response = client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")})
    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process Life at Vyntics request."}


def test_storage_failure_preserves_database_state(api):
    client, _, session, repo, audits, gateway = api
    gateway.upload.side_effect = StorageError("provider")
    response = client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")})
    assert response.status_code == 503
    assert response.json() == {"detail": "Image storage is temporarily unavailable."}
    assert repo.get_by_id.return_value.image_url == OLD
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()


@pytest.mark.parametrize("failure", [False, True])
def test_same_digest_never_deletes_current_asset(api, failure):
    client, _, session, repo, _, gateway = api
    repo.get_by_id.return_value.image_url = BASE + digest_path(PNG, ".png")
    if failure:
        session.commit.side_effect = RuntimeError("x")
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == (500 if failure else 200)
    gateway.delete.assert_not_awaited()


def test_replacing_external_url_does_not_delete_provider_object(api):
    client, _, _, repo, _, gateway = api
    repo.get_by_id.return_value.image_url = "https://external.example/photo.png"
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 200
    gateway.delete.assert_not_awaited()


def test_post_commit_cleanup_failure_is_best_effort(api):
    client, _, session, _, _, gateway = api
    gateway.delete.side_effect = StorageError("down")
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 200
    assert client.delete(IMAGE).status_code == 204
    session.rollback.assert_not_awaited()


def test_image_delete_clears_reference_deletes_object_and_audits(api):
    client, _, session, repo, audits, gateway = api
    events = []
    session.commit.side_effect = lambda: events.append("commit")
    gateway.delete.side_effect = lambda *a: events.append("delete")
    assert client.delete(IMAGE).status_code == 204
    assert repo.get_by_id.return_value.image_url is None
    assert events == ["commit", "delete"]
    audit = audits.add.await_args.args[0]
    assert audit.action == "update" and audit.context["image_operation"] == "delete"
    assert audit.context["changed_fields"] == ["image_url"]


@pytest.mark.parametrize("url", EXTERNAL[:-1])
def test_image_delete_ignores_unmanaged_urls_in_storage(api, url):
    client, _, session, repo, _, gateway = api
    repo.get_by_id.return_value.image_url = url
    assert client.delete(IMAGE).status_code == 204
    assert repo.get_by_id.return_value.image_url is None
    session.commit.assert_awaited_once()
    gateway.delete.assert_not_awaited()


def test_image_delete_without_image_is_idempotent(api):
    client, _, session, repo, audits, gateway = api
    repo.get_by_id.return_value.image_url = None
    assert client.delete(IMAGE).status_code == 204
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()
    gateway.delete.assert_not_awaited()


def test_image_delete_database_failure_keeps_object(api):
    client, _, session, _, _, gateway = api
    session.commit.side_effect = RuntimeError("x")
    assert client.delete(IMAGE).status_code == 500
    gateway.delete.assert_not_awaited()


def test_storage_unconfigured_returns_503(api):
    client, service, session, _, _, _ = api
    service._image_storage = None
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 503
    assert client.delete(IMAGE).status_code == 503
    session.commit.assert_not_awaited()


def test_multipart_and_id_validation(api):
    client, _, session, _, _, gateway = api
    assert client.put(IMAGE).status_code == 422
    assert client.put("/life-at-vyntics/not-a-uuid/image", files={"file": ("p.png", PNG, "image/png")}).status_code == 422
    assert client.delete("/life-at-vyntics/not-a-uuid/image").status_code == 422
    gateway.upload.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_dependency_uses_exact_bucket_and_caps_size():
    app = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False, image_max_bytes=10 * 1024 * 1024))
    request = Request({"type": "http", "app": app})
    service = get_life_at_vyntics_service(AsyncMock(spec=AsyncSession), request, AsyncMock(spec=SupabaseStorageGateway))
    assert service._image_storage._bucket == "life-at-vyntics"
    assert service._image_storage._max_bytes == 5 * 1024 * 1024
    assert get_life_at_vyntics_service(AsyncMock(spec=AsyncSession), request, None)._image_storage is None


def test_openapi_and_health(api):
    client, *_ = api
    assert client.get("/health").status_code == 200
    paths = client.get("/openapi.json").json()["paths"]
    assert set(paths["/life-at-vyntics"]) == {"get", "post"}
    assert set(paths["/life-at-vyntics/{resource_id}"]) == {"get", "patch", "delete"}
    assert set(paths["/life-at-vyntics/{resource_id}/image"]) == {"put", "delete"}
    assert set(paths["/admin/life-at-vyntics"]) == {"get"}
    assert "security" not in paths["/life-at-vyntics"]["get"]
    assert "security" not in paths["/life-at-vyntics/{resource_id}"]["get"]
    assert paths["/life-at-vyntics"]["post"]["security"]
    assert paths["/admin/life-at-vyntics"]["get"]["security"]
    assert "multipart/form-data" in paths["/life-at-vyntics/{resource_id}/image"]["put"]["requestBody"]["content"]
    schemas = client.get("/openapi.json").json()["components"]["schemas"]
    assert set(schemas["LifeAtVynticsResponse"]["properties"]) == {"id", "image_url", "display_order", "created_at", "updated_at"}


def test_model_matches_contract():
    table = LifeAtVyntics.__table__
    assert set(table.c.keys()) == {"id", "image_url", "display_order", "created_at", "updated_at"}
    assert table.c.image_url.nullable and not table.c.display_order.nullable
    unique = next(c for c in table.constraints if c.name == "uq_life_at_vyntics_display_order")
    assert unique.deferrable and unique.initially == "DEFERRED"
