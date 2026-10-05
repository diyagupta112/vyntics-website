"""API contract tests for public and administrative Blog routes."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from tests.auth_helpers import authenticate_test_admin

from app.api.dependencies.blogs import get_blog_service
from app.core.config import Environment, Settings
from app.db.models.blog import Blog
from app.main import create_app
from app.services.blogs import (
    BlogNotFoundError,
    BlogService,
    BlogSlugConflictError,
    BlogValidationError,
)
from app.storage.supabase import StorageError
from app.storage.uploads import UploadValidationError


BLOG_ID = UUID("5326b73c-022f-4cc7-8291-8904d3ef01fc")
PUBLISHED_AT = datetime(2026, 9, 23, 12, 0, tzinfo=timezone.utc)


def _blog(
    *,
    slug: str = "phase-6-blog",
    status: str = "published",
) -> Blog:
    return Blog(
        id=BLOG_ID,
        slug=slug,
        title="Phase 6 Blog",
        seo_title="Phase 6 Blog | Vyntics",
        meta_description="API contract test.",
        author="Vyntics",
        category="Engineering",
        excerpt="API contract test.",
        cover_image_url="https://example.com/cover.jpg",
        read_time=5,
        content={"type": "doc", "content": []},
        status=status,
        is_featured=False,
        published_at=PUBLISHED_AT if status == "published" else None,
        created_at=PUBLISHED_AT,
        updated_at=PUBLISHED_AT,
        created_by=None,
        updated_by=None,
    )


def _request_body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "slug": "phase-6-blog",
        "title": "Phase 6 Blog",
        "seo_title": "Phase 6 Blog | Vyntics",
        "meta_description": "API contract test.",
        "author": "Vyntics",
        "category": "Engineering",
        "excerpt": "API contract test.",
        "cover_image_url": "https://example.com/cover.jpg",
        "read_time": 5,
        "content": {"type": "doc", "content": []},
        "status": "published",
    }
    body.update(overrides)
    return body


@pytest.fixture
def blog_api() -> tuple[TestClient, AsyncMock]:
    service = AsyncMock(spec=BlogService)
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST)
    )
    authenticate_test_admin(application)
    application.dependency_overrides[get_blog_service] = lambda: service
    with TestClient(application) as client:
        yield client, service


def test_get_blogs_uses_public_list_contract(blog_api) -> None:
    client, service = blog_api
    service.list_published.return_value = [
        _blog(slug="newest"),
        _blog(slug="older"),
    ]

    response = client.get("/blogs")

    assert response.status_code == 200
    assert [item["slug"] for item in response.json()["data"]] == [
        "newest",
        "older",
    ]
    assert set(response.json()["data"][0]) == {
        "id",
        "is_featured",
        "slug",
        "title",
        "author",
        "category",
        "excerpt",
        "cover_image_url",
        "read_time",
        "published_at",
    }


def test_get_blog_detail_and_missing_behavior(blog_api) -> None:
    client, service = blog_api
    service.get_published_by_slug.return_value = _blog()

    response = client.get("/blogs/phase-6-blog")

    assert response.status_code == 200
    assert response.json()["content"] == {"type": "doc", "content": []}
    assert response.json()["seo_title"] == "Phase 6 Blog | Vyntics"

    service.get_published_by_slug.side_effect = BlogNotFoundError
    missing = client.get("/blogs/missing")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Blog not found."}


def test_get_admin_blogs_returns_all_statuses_with_admin_contract(blog_api) -> None:
    client, service = blog_api
    service.list_all.return_value = [
        _blog(slug="draft-blog", status="draft"),
        _blog(slug="published-blog", status="published"),
        _blog(slug="unpublished-blog", status="unpublished"),
    ]

    response = client.get("/admin/blogs")

    assert response.status_code == 200
    assert [item["status"] for item in response.json()] == [
        "draft",
        "published",
        "unpublished",
    ]
    assert all(
        set(item)
        == {
            "id",
            "is_featured",
            "slug",
            "title",
            "seo_title",
            "meta_description",
            "author",
            "category",
            "excerpt",
            "cover_image_url",
            "read_time",
            "content",
            "status",
            "published_at",
            "created_at",
            "updated_at",
        }
        for item in response.json()
    )
    service.list_all.assert_awaited_once_with()
    service.list_published.assert_not_awaited()


@pytest.mark.parametrize("blog_status", ["draft", "published", "unpublished"])
def test_get_admin_blog_by_uuid_returns_every_status(
    blog_api,
    blog_status: str,
) -> None:
    client, service = blog_api
    service.get_by_id.return_value = _blog(status=blog_status)

    response = client.get(f"/admin/blogs/{BLOG_ID}")

    assert response.status_code == 200
    assert response.json()["id"] == str(BLOG_ID)
    assert response.json()["status"] == blog_status
    service.get_by_id.assert_awaited_once_with(BLOG_ID)


def test_get_admin_blog_returns_404_and_requires_uuid(blog_api) -> None:
    client, service = blog_api
    service.get_by_id.side_effect = BlogNotFoundError

    missing = client.get(f"/admin/blogs/{BLOG_ID}")
    invalid_id = client.get("/admin/blogs/not-a-uuid")

    assert missing.status_code == 404
    assert missing.json() == {"detail": "Blog not found."}
    assert invalid_id.status_code == 422


def test_create_blog_returns_confirmed_admin_contract(blog_api) -> None:
    client, service = blog_api
    service.create.return_value = _blog()

    response = client.post("/blogs", json=_request_body())

    assert response.status_code == 201
    assert set(response.json()) == {
        "id",
        "is_featured",
        "slug",
        "title",
        "seo_title",
        "meta_description",
        "author",
        "category",
        "excerpt",
        "cover_image_url",
        "read_time",
        "content",
        "status",
        "published_at",
        "created_at",
        "updated_at",
    }
    assert "created_by" not in response.json()
    assert "updated_by" not in response.json()


def test_create_blog_returns_conflict_and_validation_errors(blog_api) -> None:
    client, service = blog_api
    service.create.side_effect = BlogSlugConflictError

    conflict = client.post("/blogs", json=_request_body())
    invalid_status = client.post(
        "/blogs",
        json=_request_body(status="scheduled"),
    )
    missing_cover = client.post(
        "/blogs",
        json=_request_body(cover_image_url=None),
    )
    invalid_content = client.post(
        "/blogs",
        json=_request_body(content=["invalid"]),
    )

    assert conflict.status_code == 409
    assert conflict.json() == {
        "detail": "A Blog with this slug already exists."
    }
    assert invalid_status.status_code == 422
    assert missing_cover.status_code == 422
    assert invalid_content.status_code == 422


@pytest.mark.parametrize(
    ("error", "expected_status"),
    [
        (BlogNotFoundError(), 404),
        (BlogSlugConflictError(), 409),
        (
            BlogValidationError(
                "cover_image_url is required for published Blogs"
            ),
            422,
        ),
    ],
)
def test_update_blog_maps_confirmed_errors(
    blog_api,
    error: Exception,
    expected_status: int,
) -> None:
    client, service = blog_api
    service.update.side_effect = error

    response = client.patch(
        f"/blogs/{BLOG_ID}",
        json={"title": "Updated"},
    )

    assert response.status_code == expected_status
    assert set(response.json()) == {"detail"}


def test_update_blog_returns_admin_contract(blog_api) -> None:
    client, service = blog_api
    updated = _blog()
    updated.title = "Updated title"
    service.update.return_value = updated

    response = client.patch(
        f"/blogs/{BLOG_ID}",
        json={"title": "Updated title"},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated title"
    assert "created_by" not in response.json()


def test_delete_blog_returns_204_and_404(blog_api) -> None:
    client, service = blog_api

    deleted = client.delete(f"/blogs/{BLOG_ID}")
    assert deleted.status_code == 204
    assert deleted.content == b""

    service.delete.side_effect = BlogNotFoundError
    missing = client.delete(f"/blogs/{BLOG_ID}")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Blog not found."}


def test_cover_file_endpoints_upload_delete_and_map_errors(blog_api) -> None:
    client, service = blog_api
    uploaded_blog = _blog()
    uploaded_blog.cover_image_url = (
        "https://project/storage/blog-covers/id/hash.jpg"
    )
    service.upload_cover.return_value = uploaded_blog

    uploaded = client.put(
        f"/blogs/{BLOG_ID}/cover-image",
        files={"file": ("cover.jpg", b"\xff\xd8\xffimage", "image/jpeg")},
    )
    assert uploaded.status_code == 200
    assert uploaded.json()["cover_image_url"].endswith("/id/hash.jpg")
    service.upload_cover.assert_awaited_once()

    deleted = client.delete(f"/blogs/{BLOG_ID}/cover-image")
    assert deleted.status_code == 204 and deleted.content == b""
    service.delete_cover.assert_awaited_once()

    service.delete_cover.side_effect = BlogValidationError("published cover")
    protected = client.delete(f"/blogs/{BLOG_ID}/cover-image")
    assert protected.status_code == 422

    service.upload_cover.side_effect = UploadValidationError("bad image")
    invalid = client.put(
        f"/blogs/{BLOG_ID}/cover-image",
        files={"file": ("cover.jpg", b"bad", "image/jpeg")},
    )
    assert invalid.status_code == 422 and invalid.json() == {"detail": "bad image"}

    service.upload_cover.side_effect = StorageError("provider internals")
    unavailable = client.put(
        f"/blogs/{BLOG_ID}/cover-image",
        files={"file": ("cover.jpg", b"bad", "image/jpeg")},
    )
    assert unavailable.status_code == 503
    assert "provider internals" not in unavailable.text


def test_openapi_exposes_blog_request_and_response_schemas(blog_api) -> None:
    client, _ = blog_api

    schema = client.get("/openapi.json").json()

    post = schema["paths"]["/blogs"]["post"]
    patch = schema["paths"]["/blogs/{blog_id}"]["patch"]
    assert post["requestBody"]["content"]["application/json"]["schema"][
        "$ref"
    ].endswith("/BlogCreateRequest")
    assert patch["requestBody"]["content"]["application/json"]["schema"][
        "$ref"
    ].endswith("/BlogUpdateRequest")
    assert "201" in post["responses"]
    assert "200" in patch["responses"]
    assert set(schema["paths"]["/blogs/{blog_id}/cover-image"]) == {
        "put",
        "delete",
    }

    admin_list = schema["paths"]["/admin/blogs"]["get"]
    admin_detail = schema["paths"]["/admin/blogs/{blog_id}"]["get"]
    list_schema = admin_list["responses"]["200"]["content"][
        "application/json"
    ]["schema"]
    detail_schema = admin_detail["responses"]["200"]["content"][
        "application/json"
    ]["schema"]
    assert list_schema["type"] == "array"
    assert list_schema["items"]["$ref"].endswith("/BlogAdminResponse")
    assert detail_schema["$ref"].endswith("/BlogAdminResponse")
