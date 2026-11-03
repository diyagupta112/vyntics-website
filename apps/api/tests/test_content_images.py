"""Inline body images for Blogs and Case Studies: schema, storage, lifecycle, API and PostgreSQL."""

import asyncio
from copy import deepcopy
from hashlib import sha256
from io import BytesIO
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

import httpx
import pytest
from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.datastructures import Headers

from app.core.config import Environment, Settings
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.blogs import BlogRepository
from app.repositories.case_studies import CaseStudyRepository
from app.schemas.blogs import BlogCreateRequest, BlogUpdateRequest
from app.schemas.case_studies import CaseStudyCreateRequest, CaseStudyUpdateRequest
from app.schemas.content import content_image_urls
from app.services.blogs import BlogNotFoundError, BlogService, BlogValidationError
from app.services.case_studies import CaseStudyNotFoundError, CaseStudyService, CaseStudyValidationError
from app.storage.supabase import StorageError, SupabaseStorageGateway
from app.storage.uploads import PublicImageStorage, StoredPublicObject, SupabasePublicImageStorage, UploadValidationError
from tests.auth_helpers import TEST_ADMIN
from tests.test_blog_service import BLOG_ID, _blog as blog_row, _create_request as blog_create
from tests.test_case_study_service import CASE_STUDY_ID, _case_study as case_row, _create_request as case_create

BASE = "https://project.supabase.co/storage/v1/object/public/content-images"
JPEG = b"\xff\xd8\xff\xe0image"
PNG = b"\x89PNG\r\n\x1a\nimage"
WEBP = b"RIFF\x04\x00\x00\x00WEBPimage"


def object_name(resource_id, content=PNG, ext=".png"):
    return f"{resource_id}/{sha256(content).hexdigest()}{ext}"


def image_url(resource_id, content=PNG, ext=".png"):
    return f"{BASE}/{object_name(resource_id, content, ext)}"


def image_block(url, alt="System architecture diagram", **extra):
    return {"type": "image", "attrs": {"url": url, "alt": alt, **extra}}


def doc(*blocks):
    paragraph = {"type": "paragraph", "content": [{"type": "text", "text": "Text"}]}
    return {"type": "doc", "content": [paragraph, *blocks, paragraph]}


def _settings():
    return Settings(_env_file=None, debug=False, supabase_url="https://project.supabase.co", supabase_service_role_key="sb_secret_test")


def _storage(gateway=None, *, max_bytes=100):
    return SupabasePublicImageStorage(gateway or SupabaseStorageGateway(_settings(), httpx.AsyncClient()), bucket="content-images", max_bytes=max_bytes)


def _upload(name, content, mime):
    return UploadFile(file=BytesIO(content), filename=name, headers=Headers({"content-type": mime}))


# ------------------------------------------------------------------ content validation

RESOURCES = [
    pytest.param(BlogUpdateRequest, BlogCreateRequest, BLOG_ID, id="blogs"),
    pytest.param(CaseStudyUpdateRequest, CaseStudyCreateRequest, CASE_STUDY_ID, id="case-studies"),
]


@pytest.mark.parametrize("update,_create,rid", RESOURCES)
def test_valid_image_blocks_between_content_and_multiple_images(update, _create, rid):
    content = doc(image_block(image_url(rid), alt="  AWS architecture  "), image_block(image_url(rid, JPEG, ".jpg")), image_block(image_url(rid, b"\x00" + WEBP[1:], ".webp")))
    stored = update(content=content).content
    assert stored["content"][1] == image_block(image_url(rid), alt="AWS architecture")  # alt trimmed
    assert [b["type"] for b in stored["content"]] == ["paragraph", "image", "image", "image", "paragraph"]
    assert len(content_image_urls(stored)) == 3
    nested = {"type": "doc", "content": [{"type": "blockquote", "content": [image_block(image_url(rid))]}]}
    assert update(content=nested).content == nested


@pytest.mark.parametrize("update,_create,rid", RESOURCES)
@pytest.mark.parametrize("block", [
    {"type": "image"},
    {"type": "image", "url": "x", "alt": "x"},  # flat shape is not the content-block convention
    {"type": "image", "attrs": {}},
    {"type": "image", "attrs": {"alt": "only alt"}},
    {"type": "image", "attrs": {"url": "https://project.supabase.co/storage/v1/object/public/content-images/x/y.png"}},
    {"type": "image", "attrs": {"src": "https://example.com/a.png", "alt": "legacy src"}},
    {"type": "image", "attrs": {"url": "https://example.com/a.png", "alt": "external"}},
    {"type": "image", "attrs": {"url": "javascript:alert(1)", "alt": "x"}},
    {"type": "image", "attrs": {"url": "data:image/png;base64,AAAA", "alt": "x"}},
    {"type": "image", "attrs": {"url": "", "alt": "x"}},
    {"type": "image", "attrs": {"url": 5, "alt": "x"}},
    {"type": "image", "attrs": {"url": "https://project.supabase.co/storage/v1/object/public/content-images/../../x.png", "alt": "x"}},
    {"type": "image", "attrs": {"url": "https://project.supabase.co/storage/v1/object/public/content-images/not-a-uuid/" + "a" * 64 + ".png", "alt": "x"}},
    {"type": "image", "attrs": {"url": "https://project.supabase.co/storage/v1/object/public/content-images/" + str(uuid4()) + "/" + "a" * 64 + ".svg", "alt": "x"}},
    {"type": "image", "attrs": {"url": "https://project.supabase.co/storage/v1/object/public/content-images/" + str(uuid4()) + "/" + "a" * 64 + ".png?x=1", "alt": "x"}},
    {"type": "image", "attrs": {"url": "https://user@project.supabase.co/storage/v1/object/public/content-images/" + str(uuid4()) + "/" + "a" * 64 + ".png", "alt": "x"}},
])
def test_malformed_or_external_image_blocks_rejected(update, _create, rid, block):
    with pytest.raises(ValidationError):
        update(content=doc(block))


@pytest.mark.parametrize("update,_create,rid", RESOURCES)
@pytest.mark.parametrize("alt", ["", "   ", "\n", None, 5, "a" * 301])
def test_alt_text_is_required_trimmed_and_bounded(update, _create, rid, alt):
    with pytest.raises(ValidationError):
        update(content=doc(image_block(image_url(rid), alt=alt)))
    assert update(content=doc(image_block(image_url(rid), alt="a" * 300))).content


@pytest.mark.parametrize("update,_create,rid", RESOURCES)
@pytest.mark.parametrize("extra", [
    {"width": 800}, {"height": 400}, {"display_width": 10}, {"display_height": 10}, {"aspect_ratio": "16:9"},
    {"alignment": "center"}, {"crop": True}, {"object_fit": "cover"}, {"style": "x"}, {"class": "x"},
])
def test_presentation_properties_rejected_on_attrs_and_block(update, _create, rid, extra):
    with pytest.raises(ValidationError):
        update(content=doc(image_block(image_url(rid), **extra)))
    with pytest.raises(ValidationError):
        update(content=doc({**image_block(image_url(rid)), **extra}))


@pytest.mark.parametrize("update,_create,rid", RESOURCES)
def test_existing_blocks_and_videos_unchanged_next_to_images(update, _create, rid):
    existing = {"type": "doc", "content": [
        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "T"}]},
        {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": []}]}]},
        {"type": "video", "attrs": {"provider": "youtube", "video_id": "dQw4w9WgXcQ"}},
        {"type": "customLegacyBlock", "attrs": {"x": [None, 1]}},
    ]}
    assert update(content=existing).content == existing
    mixed = deepcopy(existing)
    mixed["content"].insert(2, image_block(image_url(rid)))
    assert update(content=mixed).content == mixed


# ------------------------------------------------------------------ storage validation


@pytest.mark.parametrize("name,content,mime,ext", [("a.jpg", JPEG, "image/jpeg", ".jpg"), ("a.JPEG", JPEG, "image/jpeg", ".jpg"), ("a.png", PNG, "image/png", ".png"), ("a.webp", WEBP, "image/webp", ".webp")])
def test_valid_images_are_stored_under_hash_paths_in_the_content_bucket(name, content, mime, ext):
    gateway = AsyncMock(spec=SupabaseStorageGateway)
    gateway.public_url.side_effect = lambda bucket, path: f"{BASE}/{path}"
    stored = asyncio.run(_storage(gateway).upload(BLOG_ID, _upload(name, content, mime)))
    bucket, path, body, content_type = gateway.upload.await_args.args
    assert bucket == "content-images" and path == f"{BLOG_ID}/{sha256(content).hexdigest()}{ext}"
    assert name not in path and body == content and content_type == mime
    assert stored.object_path == path and stored.size_bytes == len(content) and stored.content_type == mime


@pytest.mark.parametrize("name,content,mime", [
    ("a.png", PNG, "image/jpeg"),  # MIME/extension mismatch
    ("a.jpg", PNG, "image/jpeg"),  # signature does not match extension
    ("a.png", b"not an image", "image/png"),
    ("a.svg", b"<svg onload=alert(1)/>", "image/svg+xml"),
    ("a.html", b"<html></html>", "text/html"),
    ("a.js", b"alert(1)", "application/javascript"),
    ("a.exe", b"MZ\x90\x00", "application/octet-stream"),
    ("a.gif", b"GIF89a", "image/gif"),
    ("a", PNG, "image/png"),
    ("a.png", b"", "image/png"),
    ("a.png", PNG + b"x" * 200, "image/png"),  # over max_bytes=100
])
def test_invalid_images_rejected_before_any_storage_call(name, content, mime):
    gateway = AsyncMock(spec=SupabaseStorageGateway)
    with pytest.raises(UploadValidationError):
        asyncio.run(_storage(gateway).upload(BLOG_ID, _upload(name, content, mime)))
    gateway.upload.assert_not_awaited()


def test_content_image_limit_is_explicit_and_buckets_are_separate():
    settings = Settings(_env_file=None)
    assert settings.content_images_bucket not in {settings.blog_covers_bucket, settings.case_study_covers_bucket}
    assert settings.content_image_max_bytes == 10 * 1024 * 1024
    with pytest.raises(ValidationError):
        Settings(_env_file=None, STORAGE_CONTENT_IMAGES_BUCKET="blog-covers")
    with pytest.raises(ValidationError):
        Settings(_env_file=None, STORAGE_CONTENT_IMAGES_BUCKET="case-study-covers")


def test_managed_object_path_only_accepts_this_buckets_urls_for_this_resource():
    storage = _storage()
    ok = image_url(BLOG_ID)
    assert storage.managed_object_path(ok, BLOG_ID) == object_name(BLOG_ID)
    other = uuid4()
    candidates = [
        image_url(other),  # another resource's image
        ok.replace("content-images", "blog-covers"),  # a cover bucket
        ok.replace("project.supabase.co", "evil.example.com"),
        ok + "?download=1", ok + "#x", ok.replace("/content-images/", "/content-images/../"),
        f"{BASE}/{BLOG_ID}/cover.png", f"{BASE}/{BLOG_ID}/{'a' * 64}.svg", "https://example.com/a.png", "not a url",
    ]
    for candidate in candidates:
        assert storage.managed_object_path(candidate, BLOG_ID) is None, candidate


# ------------------------------------------------------------------ services (Blog and Case Study)


class Case:
    def __init__(self, name):
        if name == "blog":
            self.rid, self.row, self.create_request, self.update_request, self.Error, self.NotFound = BLOG_ID, blog_row, blog_create, BlogUpdateRequest, BlogValidationError, BlogNotFoundError
            self.service_cls, self.repo_cls, self.repo_kw, self.type = BlogService, BlogRepository, "blog_repository", "blog"
        else:
            self.rid, self.row, self.create_request, self.update_request, self.Error, self.NotFound = CASE_STUDY_ID, case_row, case_create, CaseStudyUpdateRequest, CaseStudyValidationError, CaseStudyNotFoundError
            self.service_cls, self.repo_cls, self.repo_kw, self.type = CaseStudyService, CaseStudyRepository, "case_study_repository", "case_study"

    def build(self, content=None, storage="default"):
        row = self.row()
        if content is not None:
            row.content = content
        repo = AsyncMock(spec=self.repo_cls)
        repo.get_by_id.return_value = row
        repo.slug_exists.return_value = False
        audits = AsyncMock(spec=AuditLogRepository)
        session = AsyncMock(spec=AsyncSession)
        if storage == "default":
            storage = AsyncMock(spec=PublicImageStorage)
            storage.managed_object_path.side_effect = lambda url, rid: object_name(rid) if url.startswith(f"{BASE}/{rid}/") else None
        service = self.service_cls(session, **{self.repo_kw: repo}, audit_repository=audits, content_image_storage=storage)
        return service, row, repo, audits, session, storage


@pytest.fixture(params=["blog", "case"])
def case(request):
    return Case(request.param)


def test_upload_stores_audits_commits_and_returns_managed_reference(case):
    service, row, repo, audits, session, storage = case.build()
    storage.upload.return_value = StoredPublicObject(image_url(case.rid), object_name(case.rid), "image/png", 12)
    result = asyncio.run(service.upload_content_image(case.rid, _upload("a.png", PNG, "image/png"), actor=TEST_ADMIN))
    assert result.url == image_url(case.rid) and result.content_type == "image/png" and result.size_bytes == 12
    storage.upload.assert_awaited_once()
    assert storage.upload.await_args.args[0] == case.rid
    audit = audits.add.await_args.args[0]
    assert audit.action == "update" and audit.resource_type == case.type and audit.context["content_image_operation"] == "upload"
    assert "content" not in audit.context
    session.commit.assert_awaited_once()
    repo.refresh.assert_not_awaited()  # the row itself did not change


def test_upload_compensates_when_database_write_fails(case):
    service, row, repo, audits, session, storage = case.build()
    storage.upload.return_value = StoredPublicObject(image_url(case.rid), object_name(case.rid))
    audits.add.side_effect = RuntimeError("database down")
    with pytest.raises(RuntimeError):
        asyncio.run(service.upload_content_image(case.rid, _upload("a.png", PNG, "image/png"), actor=TEST_ADMIN))
    storage.delete_path.assert_awaited_once_with(object_name(case.rid))
    session.rollback.assert_awaited_once()
    # A failed compensation never masks the original error.
    storage.delete_path.side_effect = StorageError("provider")
    with pytest.raises(RuntimeError):
        asyncio.run(service.upload_content_image(case.rid, _upload("a.png", PNG, "image/png"), actor=TEST_ADMIN))


def test_upload_for_missing_resource_or_unconfigured_storage(case):
    service, row, repo, audits, session, storage = case.build()
    repo.get_by_id.return_value = None
    with pytest.raises(case.NotFound):
        asyncio.run(service.upload_content_image(case.rid, _upload("a.png", PNG, "image/png"), actor=TEST_ADMIN))
    storage.upload.assert_not_awaited()
    service, *_ = case.build(storage=None)
    with pytest.raises(StorageError):
        asyncio.run(service.upload_content_image(case.rid, _upload("a.png", PNG, "image/png"), actor=TEST_ADMIN))


def test_create_cannot_reference_images_yet(case):
    service, *_ = case.build()
    request = case.create_request()
    request = request.model_copy(update={"content": doc(image_block(image_url(case.rid)))})
    with pytest.raises(case.Error):
        asyncio.run(service.create(request, actor=TEST_ADMIN))


def test_update_accepts_only_this_resources_managed_images(case):
    service, row, repo, audits, session, storage = case.build()
    good = doc(image_block(image_url(case.rid)))
    updated = asyncio.run(service.update(case.rid, case.update_request(content=good), actor=TEST_ADMIN))
    assert updated.content == good and storage.delete_managed_url.await_count == 0
    for url in (image_url(uuid4()), image_url(case.rid).replace("content-images", "blog-covers"), f"https://example.com/{uuid4()}/{'a' * 64}.png"):
        service, row, repo, audits, session, storage = case.build()
        with pytest.raises(ValidationError if url.startswith("https://example.com") else case.Error):
            asyncio.run(service.update(case.rid, case.update_request(content=doc(image_block(url))), actor=TEST_ADMIN))
        session.commit.assert_not_awaited()
    service, *_ = case.build(storage=None)
    with pytest.raises(case.Error):
        asyncio.run(service.update(case.rid, case.update_request(content=good), actor=TEST_ADMIN))


def test_removed_images_are_deleted_after_commit_and_referenced_ones_are_kept(case):
    keep, drop = image_url(case.rid, PNG, ".png"), image_url(case.rid, JPEG, ".jpg")
    service, row, repo, audits, session, storage = case.build(content=doc(image_block(keep), image_block(drop)))
    asyncio.run(service.update(case.rid, case.update_request(content=doc(image_block(keep))), actor=TEST_ADMIN))
    storage.delete_managed_url.assert_awaited_once_with(drop, case.rid)
    session.commit.assert_awaited_once()
    # The same image used twice survives while one use remains; removing every use deletes it once.
    service, row, repo, audits, session, storage = case.build(content=doc(image_block(keep), image_block(keep, alt="again")))
    asyncio.run(service.update(case.rid, case.update_request(content=doc(image_block(keep))), actor=TEST_ADMIN))
    storage.delete_managed_url.assert_not_awaited()
    asyncio.run(service.update(case.rid, case.update_request(content=doc()), actor=TEST_ADMIN))
    storage.delete_managed_url.assert_awaited_once_with(keep, case.rid)
    # Alt text edits and non-content updates never delete anything.
    service, row, repo, audits, session, storage = case.build(content=doc(image_block(keep)))
    asyncio.run(service.update(case.rid, case.update_request(content=doc(image_block(keep, alt="New alt"))), actor=TEST_ADMIN))
    asyncio.run(service.update(case.rid, case.update_request(title="New title"), actor=TEST_ADMIN))
    storage.delete_managed_url.assert_not_awaited()


def test_nothing_is_deleted_when_the_update_fails_or_cleanup_fails(case):
    keep, drop = image_url(case.rid, PNG, ".png"), image_url(case.rid, JPEG, ".jpg")
    service, row, repo, audits, session, storage = case.build(content=doc(image_block(keep), image_block(drop)))
    audits.add.side_effect = RuntimeError("database down")
    with pytest.raises(RuntimeError):
        asyncio.run(service.update(case.rid, case.update_request(content=doc(image_block(keep))), actor=TEST_ADMIN))
    storage.delete_managed_url.assert_not_awaited()
    service, row, repo, audits, session, storage = case.build(content=doc(image_block(keep), image_block(drop)))
    storage.delete_managed_url.side_effect = StorageError("provider")
    updated = asyncio.run(service.update(case.rid, case.update_request(content=doc(image_block(keep))), actor=TEST_ADMIN))
    assert updated.content == doc(image_block(keep))  # the committed update still succeeds


def test_deleting_the_resource_removes_all_its_content_images(case):
    service, row, repo, audits, session, storage = case.build(content=doc(image_block(image_url(case.rid))))
    asyncio.run(service.delete(case.rid, actor=TEST_ADMIN))
    storage.delete_all.assert_awaited_once_with(case.rid)
    storage.delete_all.side_effect = StorageError("provider")
    asyncio.run(service.delete(case.rid, actor=TEST_ADMIN))  # cleanup failure is logged, not raised


def test_delete_all_lists_and_deletes_only_the_resource_folder():
    gateway = AsyncMock(spec=SupabaseStorageGateway)
    gateway.list_objects.return_value = [f"{BLOG_ID}/a.png", f"{BLOG_ID}/b.jpg"]
    assert asyncio.run(_storage(gateway).delete_all(BLOG_ID)) == 2
    gateway.list_objects.assert_awaited_once_with("content-images", f"{BLOG_ID}/")
    assert [c.args for c in gateway.delete.await_args_list] == [("content-images", f"{BLOG_ID}/a.png"), ("content-images", f"{BLOG_ID}/b.jpg")]


def test_gateway_list_objects_contract():
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(200, json=[{"name": "a.png"}, {"name": "b.jpg"}])

    gateway = SupabaseStorageGateway(_settings(), httpx.AsyncClient(transport=httpx.MockTransport(handler)))
    assert asyncio.run(gateway.list_objects("content-images", "abc/")) == ["abc/a.png", "abc/b.jpg"]
    assert seen[0].url.path == "/storage/v1/object/list/content-images" and seen[0].method == "POST"


# ------------------------------------------------------------------ HTTP


@pytest.fixture(params=["blog", "case"])
def api(request):
    from fastapi.testclient import TestClient
    from app.api.dependencies.blogs import get_blog_service
    from app.api.dependencies.case_studies import get_case_study_service
    from app.main import create_app
    from tests.auth_helpers import authenticate_test_admin

    blog = request.param == "blog"
    service = AsyncMock(spec=BlogService if blog else CaseStudyService)
    application = create_app(Settings(_env_file=None, environment=Environment.TEST))
    authenticate_test_admin(application)
    application.dependency_overrides[get_blog_service if blog else get_case_study_service] = lambda: service
    with TestClient(application) as client:
        yield client, service, ("/blogs/" if blog else "/case-studies/"), (BLOG_ID if blog else CASE_STUDY_ID), (BlogNotFoundError if blog else CaseStudyNotFoundError)


def test_http_upload_contract_and_error_mapping(api):
    from app.schemas.content import ContentImageUploadResponse

    client, service, prefix, rid, NotFound = api
    service.upload_content_image.return_value = ContentImageUploadResponse(url=image_url(rid), content_type="image/png", size_bytes=12)
    response = client.put(f"{prefix}{rid}/content-images", files={"file": ("diagram.png", PNG, "image/png")}, data={"bucket": "blog-covers", "path": "../../x"})
    assert response.status_code == 200
    assert response.json() == {"url": image_url(rid), "content_type": "image/png", "size_bytes": 12}
    call = service.upload_content_image.await_args
    assert call.args[0] == rid and set(call.kwargs) == {"actor"}  # the client cannot choose a bucket or path
    service.upload_content_image.side_effect = NotFound
    assert client.put(f"{prefix}{rid}/content-images", files={"file": ("a.png", PNG, "image/png")}).status_code == 404
    service.upload_content_image.side_effect = UploadValidationError("bad image")
    invalid = client.put(f"{prefix}{rid}/content-images", files={"file": ("a.png", b"x", "image/png")})
    assert invalid.status_code == 422 and invalid.json() == {"detail": "bad image"}
    service.upload_content_image.side_effect = StorageError("provider internals")
    unavailable = client.put(f"{prefix}{rid}/content-images", files={"file": ("a.png", PNG, "image/png")})
    assert unavailable.status_code == 503 and "provider internals" not in unavailable.text
    assert client.put(f"{prefix}{rid}/content-images").status_code == 422  # file is required
    assert client.put(f"{prefix}not-a-uuid/content-images", files={"file": ("a.png", PNG, "image/png")}).status_code == 422


def test_http_content_with_images_round_trips_and_openapi_documents_it(api):
    client, service, prefix, rid, _ = api
    schema = client.get("/openapi.json").json()
    path = schema["paths"][f"{prefix}{{{'blog_id' if prefix == '/blogs/' else 'case_study_id'}}}/content-images"]
    assert set(path) == {"put"} and path["put"]["security"]
    assert "ContentImageUploadResponse" in str(path["put"]["responses"]["200"])
    for name in ("BlogCreateRequest", "CaseStudyCreateRequest"):
        assert "content-images" in schema["components"]["schemas"][name]["properties"]["content"]["description"]


# ------------------------------------------------------------------ migration


def test_bucket_migration_is_separate_public_and_restricted():
    sql = (Path(__file__).resolve().parents[3] / "supabase/migrations/20261102120000_create_content_images_bucket.sql").read_text().lower()
    assert "'content-images'" in sql and "blog-covers" not in sql.replace("-- ", "").split("insert")[1] and "case-study-covers" not in sql.split("insert")[1]
    assert "10485760" in sql and "image/jpeg" in sql and "image/png" in sql and "image/webp" in sql and "svg" not in sql.split("insert")[1]
    assert "on conflict" in sql


# ------------------------------------------------------------------ PostgreSQL (disposable schema)

from sqlalchemy import text  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker  # noqa: E402

from app.api.dependencies.database import get_db_session  # noqa: E402
from app.db.session import create_database, dispose_database  # noqa: E402
from app.main import create_app  # noqa: E402
from tests.auth_helpers import authenticate_test_admin  # noqa: E402
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run  # noqa: E402


@pytest.mark.skipif(not RUN_DATABASE_INTEGRATION_TESTS, reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL")
@pytest.mark.parametrize("resource", ["blogs", "case-studies"])
def test_postgres_upload_reference_read_replace_remove_and_delete(resource):
    from tests.test_blog_api import _request_body as blog_body
    from tests.test_case_study_api import _request_body as case_body

    async def exercise():
        database = create_database(Settings())
        schema = "content_images_test_" + uuid4().hex
        created = False
        application = None
        client_http = httpx.AsyncClient()
        gateway = SupabaseStorageGateway(_settings(), client_http)
        gateway.upload, gateway.delete, gateway.list_objects = AsyncMock(), AsyncMock(), AsyncMock(return_value=[])
        try:
            async with database.engine.begin() as connection:
                await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
                created = True
                for table in ("audit_logs", "blogs", "case_studies"):
                    await connection.execute(text(f'CREATE TABLE "{schema}"."{table}" (LIKE public."{table}" INCLUDING ALL)'))
            factory = async_sessionmaker(database.engine.execution_options(schema_translate_map={None: schema}), expire_on_commit=False)
            application = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False))
            application.state.storage_gateway = gateway

            async def scoped_session():
                async with factory() as session:
                    yield session
            application.dependency_overrides[get_db_session] = scoped_session
            authenticate_test_admin(application)
            body = blog_body(status="draft") if resource == "blogs" else case_body(status="draft")
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application), base_url="http://testserver") as client:
                path = f"/{resource}"
                created_row = (await client.post(path, json=body)).json()
                rid = created_row["id"]
                # create cannot reference images (no resource to own them yet)
                bad = await client.post(path, json={**body, "slug": "other", "content": doc(image_block(image_url(UUID(rid))))})
                assert bad.status_code == 422
                # upload: validated, stored in the content bucket under the resource folder, audited
                first = await client.put(f"{path}/{rid}/content-images", files={"file": ("diagram.png", PNG, "image/png")})
                assert first.status_code == 200
                url_one = first.json()["url"]
                assert url_one == image_url(UUID(rid)) and gateway.upload.await_args.args[0] == "content-images"
                assert (await client.put(f"{path}/{rid}/content-images", files={"file": ("x.svg", b"<svg/>", "image/svg+xml")})).status_code == 422
                second = (await client.put(f"{path}/{rid}/content-images", files={"file": ("photo.jpg", JPEG, "image/jpeg")})).json()["url"]
                assert (await client.put(f"{path}/{uuid4()}/content-images", files={"file": ("a.png", PNG, "image/png")})).status_code == 404
                # the same resource's cover image behavior is untouched by body images
                content = doc(image_block(url_one), image_block(second, alt="Photo"))
                patched = await client.patch(f"{path}/{rid}", json={"content": content})
                assert patched.status_code == 200 and patched.json()["content"] == content
                assert patched.json()["cover_image_url"] == body["cover_image_url"]
                read = (await client.get(f"/admin/{resource}/{rid}")).json()
                assert read["content"]["content"][1]["type"] == "image" and read["content"]["content"][2]["attrs"]["alt"] == "Photo"
                gateway.delete.assert_not_awaited()
                # another resource's image, or a foreign URL, is refused and nothing is deleted
                foreign = await client.patch(f"{path}/{rid}", json={"content": doc(image_block(image_url(uuid4())))})
                assert foreign.status_code == 422
                external = await client.patch(f"{path}/{rid}", json={"content": doc(image_block("https://example.com/a.png"))})
                assert external.status_code == 422
                gateway.delete.assert_not_awaited()
                # removing one image deletes only that object
                kept = doc(image_block(url_one))
                assert (await client.patch(f"{path}/{rid}", json={"content": kept})).status_code == 200
                assert [c.args for c in gateway.delete.await_args_list] == [("content-images", object_name(UUID(rid), JPEG, ".jpg"))]
                assert (await client.get(f"/admin/{resource}/{rid}")).json()["content"] == kept
                # publishing rules are unchanged: a draft with images can be published (it has a cover)
                published = await client.patch(f"{path}/{rid}", json={"status": "published"})
                assert published.status_code == 200 and published.json()["content"] == kept
                public = (await client.get(f"{path}/phase-6-blog" if resource == "blogs" else f"{path}/phase-7-case-study")).json()
                assert public["content"] == kept
                # deleting the resource removes everything under its folder
                gateway.list_objects.return_value = [object_name(UUID(rid))]
                assert (await client.delete(f"{path}/{rid}")).status_code == 204
                gateway.list_objects.assert_awaited_with("content-images", f"{rid}/")
                assert gateway.delete.await_args.args == ("content-images", object_name(UUID(rid)))
            async with factory() as session:
                audits = (await session.execute(text(f'select context from "{schema}".audit_logs'))).scalars().all()
                assert sum(1 for c in audits if c.get("content_image_operation") == "upload") == 2
        finally:
            if application:
                application.dependency_overrides.clear()
                await application.state.auth_verifier.aclose()
            if created:
                async with database.engine.begin() as connection:
                    await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
            await client_http.aclose()
            await dispose_database(database)
    _run(asyncio.wait_for(exercise(), timeout=240))
