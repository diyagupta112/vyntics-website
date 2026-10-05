"""Shared YouTube block validation, persistence inputs, and API compatibility."""

import asyncio
from copy import deepcopy
from unittest.mock import AsyncMock

import pytest
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_logs import AuditLogRepository
from app.schemas.content import CANONICAL_VIDEO, youtube_video_id
from app.schemas.blogs import BlogAdminResponse, BlogDetailResponse
from app.schemas.case_studies import CaseStudyAdminResponse, CaseStudyDetailResponse
from tests.test_featured_content import RESOURCES
from tests.test_blog_api import blog_api, _blog as api_blog, _request_body as blog_body
from tests.test_case_study_api import case_study_api, _case_study as api_case, _request_body as case_body


ID = "dQw4w9WgXcQ"
OTHER_ID = "9bZkp7q19f0"
EXISTING = {
    "type": "doc", "content": [
        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Title"}]},
        {"type": "paragraph", "content": [
            {"type": "text", "text": "Formatted", "marks": [
                {"type": "bold"}, {"type": "italic"},
                {"type": "link", "attrs": {"href": "https://example.com", "target": "_blank"}},
            ]},
        ]},
        {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Bullet"}]}]}]},
        {"type": "orderedList", "attrs": {"start": 3}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Numbered"}]}]}]},
        {"type": "hardBreak"}, {"type": "blockquote", "content": []},
        {"type": "image", "attrs": {"src": "https://example.com/image.png", "alt": "Existing image"}},
        {"type": "customLegacyBlock", "attrs": {"custom": [None, 1, False]}, "text": "Keep unchanged"},
    ], "legacy_metadata": {"flag": True, "count": 5, "nothing": None},
}


def video(**attrs):
    return {"type": "video", "attrs": {"provider": "youtube", **attrs}}


def document(block):
    return {"type": "doc", "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Before"}]},
        block,
        {"type": "paragraph", "content": [{"type": "text", "text": "After"}]},
    ]}


@pytest.fixture(params=RESOURCES, ids=["blogs", "case-studies"])
def resource(request):
    return request.param


def create_with_content(resource, content):
    payload = resource[6]().model_dump()
    payload["content"] = content
    return resource[2](**payload)


@pytest.mark.parametrize("url", [
    f"https://www.youtube.com/watch?v={ID}",
    f"https://youtu.be/{ID}",
    f"https://www.youtube.com/embed/{ID}",
    f"https://youtube.com/watch?feature=share&v={ID}&t=30#fragment",
    f"https://youtu.be/{ID}?si=shared&t=30",
    f"https://www.youtube.com/embed/{ID}?start=30&rel=0",
    f"https://m.youtube.com/watch?v={ID}",
    f"https://www.youtube.com/shorts/{ID}",
    f" http://www.youtube.com/watch?v={ID} ",
])
def test_common_urls_normalize_for_both_write_schemas(resource, url):
    original = document(video(url=url))
    snapshot = deepcopy(original)
    for request in [create_with_content(resource, original), resource[3](content=original)]:
        assert request.content == document(CANONICAL_VIDEO)
        assert "url" not in request.model_dump()["content"]["content"][1]["attrs"]
    assert original == snapshot
    assert youtube_video_id(url) == ID


@pytest.mark.parametrize("url", [
    "", " ", f"https://vimeo.com/{ID}", f"https://example.com/{ID}.mp4",
    f"https://youtube.com.evil.test/watch?v={ID}", f"https://evil.youtube.com/watch?v={ID}",
    f"https://youtube.com@evil.test/watch?v={ID}", f"https://user:secret@youtube.com/watch?v={ID}",
    "javascript:alert(1)", "data:text/html,<iframe></iframe>",
    '<iframe src="https://youtube.com/embed/dQw4w9WgXcQ"></iframe>', "<script>alert(1)</script>",
    "https://www.youtube.com/watch", "https://www.youtube.com/watch?v=", "https://youtu.be/",
    f"https://www.youtube.com/watch?v={ID}&v={OTHER_ID}",
    f"https://youtu.be/{ID}/extra", f"https://www.youtube.com/embed/{ID}/extra",
    f"https://www.youtube.com:9999/watch?v={ID}", f"ftp://youtube.com/watch?v={ID}",
    f"https://www.you\ntube.com/watch?v={ID}", f"//youtube.com/watch?v={ID}",
    "https://youtu.be/abc123", "https://youtube.com/watch?v=not%20an%20id",
])
def test_invalid_urls_rejected_on_create_and_patch(resource, url):
    for schema in [lambda: create_with_content(resource, document(video(url=url))), lambda: resource[3](content=document(video(url=url)))]:
        with pytest.raises(ValidationError):
            schema()


@pytest.mark.parametrize("identifier", ["", " ", "abc123", "abcdefghijkL", "abc!efghijk", "<iframe />", "dQw4w9WgXcQ\n", 123, None])
def test_empty_and_malformed_identifiers_rejected(resource, identifier):
    with pytest.raises(ValidationError):
        create_with_content(resource, document(video(video_id=identifier)))


@pytest.mark.parametrize("block", [
    {"type": "video"},
    {"type": "video", "provider": "youtube", "video_id": ID},
    video(provider="vimeo", video_id=ID), video(video_id=ID, url=f"https://youtu.be/{ID}"),
    video(), video(src=f"https://youtu.be/{ID}"), video(html="<iframe></iframe>"),
    {**video(video_id=ID), "content": [{"type": "text", "text": "Extra"}]},
    {**video(video_id=ID), "iframe": "<iframe></iframe>"},
    video(video_id=ID, width=800), video(video_id=ID, height=400),
    video(video_id=ID, autoplay=True), video(video_id=ID, aspect_ratio="16:9"),
    video(video_id=ID, thumbnail="https://example.com/image.jpg"),
    video(video_id=ID, muted=True), video(video_id=ID, controls=True),
    video(video_id=ID, border_radius=5), video(video_id=ID, margin=5),
    video(video_id=ID, padding=5), video(video_id=ID, hover_play=True),
])
def test_only_semantic_video_fields_are_accepted(resource, block):
    with pytest.raises(ValidationError):
        resource[3](content=document(block))


def test_non_video_json_is_preserved_and_videos_mix_with_existing_blocks(resource):
    assert create_with_content(resource, EXISTING).content == EXISTING
    assert resource[3](content=EXISTING).content == EXISTING
    combined = deepcopy(EXISTING)
    combined["content"].insert(2, video(url=f"https://youtu.be/{ID}"))
    normalized = create_with_content(resource, combined).content
    assert normalized["content"][2] == CANONICAL_VIDEO
    normalized_without_video = deepcopy(normalized)
    normalized_without_video["content"].pop(2)
    assert normalized_without_video == EXISTING
    # Existing JSON wrappers are retained; normalization reaches nested blocks.
    wrapper = {"project": {"blocks": [video(video_id=ID)]}}
    assert resource[3](content=wrapper).content == wrapper
    assert create_with_content(resource, {}).content == {}


def test_services_create_add_change_and_remove_video_with_existing_audit(resource):
    repo = AsyncMock(spec=resource[0])
    repo.slug_exists.return_value = False
    audits = AsyncMock(spec=AuditLogRepository)
    session = AsyncMock(spec=AsyncSession)
    service = resource[1](session, **{
        "blog_repository" if resource[7] == "blogs" else "case_study_repository": repo,
        "audit_repository": audits,
    })
    created = asyncio.run(service.create(create_with_content(resource, document(video(url=f"https://youtu.be/{ID}")))))
    assert created.content == document(CANONICAL_VIDEO)
    assert audits.add.await_args.args[0].action == "create"
    model = resource[5]()
    model.content = deepcopy(EXISTING)
    repo.get_by_id.return_value = model
    for content, expected in [
        (document(video(url=f"https://youtu.be/{ID}")), document(CANONICAL_VIDEO)),
        (document(video(url=f"https://www.youtube.com/watch?v={OTHER_ID}")), document(video(video_id=OTHER_ID))),
        (EXISTING, EXISTING),
    ]:
        updated = asyncio.run(service.update(model.id, resource[3](content=content)))
        assert updated.content == expected
        audit = audits.add.await_args.args[0]
        assert audit.action == "update" and audit.context["changed_fields"] == ["content"]
        assert "content" not in audit.context and ID not in str(audit.context)
    assert session.commit.await_count == 4


@pytest.mark.parametrize("fixture_name,config,body,model_factory,prefix", [
    ("blog_api", RESOURCES[0], blog_body, api_blog, "Blog"),
    ("case_study_api", RESOURCES[1], case_body, api_case, "CaseStudy"),
])
def test_http_write_read_and_openapi_contract(request, fixture_name, config, body, model_factory, prefix):
    client, service = request.getfixturevalue(fixture_name)
    model = model_factory()
    model.content = document(CANONICAL_VIDEO)
    service.create.return_value = model
    service.update.return_value = model
    service.get_by_id.return_value = model
    service.list_all.return_value = [model]
    service.get_published_by_slug.return_value = model
    path = config[7]
    supplied = document(video(url=f"https://youtu.be/{ID}?t=15"))
    response = client.post(f"/{path}", json=body(content=supplied))
    assert response.status_code == 201
    assert response.json()["content"] == document(CANONICAL_VIDEO)
    assert service.create.await_args.args[0].content == document(CANONICAL_VIDEO)
    assert service.create.await_args.kwargs["actor"].admin_id is not None
    for content, expected in [
        (supplied, document(CANONICAL_VIDEO)),
        (document(video(video_id=OTHER_ID)), document(video(video_id=OTHER_ID))),
        (EXISTING, EXISTING),
    ]:
        model.content = expected
        response = client.patch(f"/{path}/{model.id}", json={"content": content})
        assert response.status_code == 200 and response.json()["content"] == expected
        assert service.update.await_args.args[1].content == expected
    model.content = document(CANONICAL_VIDEO)
    for url in [f"/{path}/{model.slug}", f"/admin/{path}/{model.id}", f"/admin/{path}"]:
        response = client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert (data[0] if isinstance(data, list) else data)["content"] == document(CANONICAL_VIDEO)
    for method, url, payload in [
        ("post", f"/{path}", body(content=document(video(url="javascript:alert(1)")))),
        ("patch", f"/{path}/{model.id}", {"content": document(video(video_id=""))}),
    ]:
        count = service.create.await_count if method == "post" else service.update.await_count
        assert getattr(client, method)(url, json=payload).status_code == 422
        assert (service.create.await_count if method == "post" else service.update.await_count) == count
    schemas = client.get("/openapi.json").json()["components"]["schemas"]
    for suffix in ["CreateRequest", "UpdateRequest", "AdminResponse", "DetailResponse"]:
        field = schemas[prefix+suffix]["properties"]["content"]
        field = next((option for option in field.get("anyOf", [field]) if "description" in option), field)
        assert "YouTube" in field["description"]
        assert field["examples"][0]["content"][1] == CANONICAL_VIDEO
    # Legacy stored video shapes remain readable; only new writes are validated.
    legacy = document({"type": "video", "attrs": {"src": "https://example.com/legacy.mp4", "width": 640}})
    model.content = legacy
    assert client.get(f"/{path}/{model.slug}").json()["content"] == legacy
    admin_schema, detail_schema = (BlogAdminResponse, BlogDetailResponse) if prefix == "Blog" else (CaseStudyAdminResponse, CaseStudyDetailResponse)
    assert admin_schema.model_validate(model).content == legacy
    assert detail_schema.model_validate(model).content == legacy
