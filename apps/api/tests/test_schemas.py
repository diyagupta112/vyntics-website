"""Contract-focused tests for public Pydantic request and response schemas."""

from datetime import datetime, timezone
from io import BytesIO
from types import SimpleNamespace
from uuid import UUID

import pytest
from fastapi import UploadFile
from pydantic import ValidationError

from app.schemas.blogs import BlogDetailResponse, BlogListResponse
from app.schemas.careers import CareerDetailResponse, CareerListItem, CareerListResponse
from app.schemas.case_studies import (
    CaseStudyDetailResponse,
    CaseStudyListResponse,
)
from app.schemas.contact import ContactCreateRequest
from app.schemas.job_applications import JobApplicationCreateRequest
from app.schemas.team import TeamListResponse, TeamMemberResponse


RESOURCE_ID = UUID("7fd6ff67-1db4-4dd7-81a2-c9e1df99f7f5")
PUBLISHED_AT = datetime(2026, 9, 22, 10, 30, tzinfo=timezone.utc)


def _blog_list_item() -> dict[str, object]:
    return {
        "id": RESOURCE_ID,
        "slug": "example-blog-slug",
        "title": "Example Blog Title",
        "author": "Author Name",
        "category": "Artificial Intelligence",
        "excerpt": "Short description of the blog...",
        "cover_image_url": "https://example.com/blog.jpg",
        "read_time": 8,
        "published_at": PUBLISHED_AT,
    }


def _case_study_list_item() -> dict[str, object]:
    return {
        "id": RESOURCE_ID,
        "slug": "example-case-study",
        "title": "Example Case Study",
        "client_name": "Example Client",
        "excerpt": "A short description of the case study...",
        "cover_image_url": "https://example.com/case-study.jpg",
        "tech_stack": ["Python", "FastAPI", "AWS"],
        "tags": ["AI", "Web Development"],
        "published_at": PUBLISHED_AT,
    }


def _career_list_item() -> dict[str, object]:
    return {
        "id": RESOURCE_ID,
        "slug": "senior-software-engineer",
        "title": "Senior Software Engineer",
        "location": "Remote",
        "employment_type": "Full-time",
        "department": "Engineering",
        "experience": "3+ years",
        "short_description": "We are looking for an engineer...",
        "published_at": PUBLISHED_AT,
    }


def _resume(filename: str = "resume.pdf") -> UploadFile:
    return UploadFile(file=BytesIO(b"resume"), filename=filename)


def test_blog_list_response_matches_public_contract() -> None:
    response = BlogListResponse.model_validate({"data": [_blog_list_item()]})

    assert response.data[0].slug == "example-blog-slug"
    assert set(response.data[0].model_dump()) == set(_blog_list_item())


def test_blog_detail_accepts_structured_content_and_required_fields() -> None:
    response = BlogDetailResponse.model_validate(
        {
            **_blog_list_item(),
            "seo_title": "Example Blog Title | Vyntics",
            "meta_description": "Search description.",
            "content": {"type": "doc", "content": [{"type": "paragraph"}]},
        }
    )

    assert response.content["type"] == "doc"

    with pytest.raises(ValidationError):
        BlogDetailResponse.model_validate(
            {
                key: value
                for key, value in response.model_dump().items()
                if key != "title"
            }
        )


def test_blog_response_omits_internal_orm_fields() -> None:
    orm_value = SimpleNamespace(
        **_blog_list_item(),
        status="published",
        created_by=RESOURCE_ID,
        updated_by=RESOURCE_ID,
        created_at=PUBLISHED_AT,
        updated_at=PUBLISHED_AT,
    )

    payload = BlogListResponse(data=[orm_value]).model_dump()

    assert set(payload["data"][0]) == set(_blog_list_item())
    assert "status" not in payload["data"][0]


def test_case_study_list_preserves_tech_stack_and_tags() -> None:
    response = CaseStudyListResponse.model_validate(
        {"data": [_case_study_list_item()]}
    )

    assert response.data[0].tech_stack == ["Python", "FastAPI", "AWS"]
    assert response.data[0].tags == ["AI", "Web Development"]


def test_case_study_detail_matches_contract_without_internal_fields() -> None:
    response = CaseStudyDetailResponse.model_validate(
        {
            **_case_study_list_item(),
            "seo_title": "Example Case Study | Vyntics",
            "meta_description": "Search description.",
            "content": {"type": "doc", "content": []},
        }
    )

    assert response.content == {"type": "doc", "content": []}
    assert "status" not in CaseStudyDetailResponse.model_fields
    assert "created_at" not in CaseStudyDetailResponse.model_fields


def test_case_study_response_rejects_undeclared_internal_fields() -> None:
    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        CaseStudyListResponse.model_validate(
            {
                "data": [
                    {
                        **_case_study_list_item(),
                        "status": "published",
                    }
                ]
            }
        )


def test_career_list_response_matches_public_contract() -> None:
    response = CareerListResponse.model_validate({"data": [_career_list_item()]})

    assert response.data[0].slug == "senior-software-engineer"
    assert "status" not in CareerListItem.model_fields


def test_career_detail_accepts_structured_sections_without_status() -> None:
    structured = {"type": "doc", "content": []}
    response = CareerDetailResponse.model_validate(
        {
            **_career_list_item(),
            "description": structured,
            "responsibilities": structured,
            "requirements": structured,
            "nice_to_have": structured,
            "benefits": structured,
        }
    )

    assert response.requirements == structured
    assert "status" not in CareerDetailResponse.model_fields
    assert "is_active" not in CareerDetailResponse.model_fields


def test_job_application_accepts_required_fields_and_optional_cover_letter() -> None:
    request = JobApplicationCreateRequest(
        name="Applicant Name",
        email="applicant@example.com",
        phone="+1 555 0100",
        resume=_resume(),
    )
    request_with_letter = JobApplicationCreateRequest(
        name="Applicant Name",
        email="applicant@example.com",
        phone="+1 555 0100",
        resume=_resume("resume.docx"),
        cover_letter="I would like to apply.",
    )

    assert request.cover_letter is None
    assert request_with_letter.cover_letter == "I would like to apply."


@pytest.mark.parametrize(
    "internal_field",
    ["id", "career_id", "status", "submitted_at", "resume_url", "notes"],
)
def test_job_application_rejects_backend_controlled_fields(
    internal_field: str,
) -> None:
    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        JobApplicationCreateRequest.model_validate(
            {
                "name": "Applicant Name",
                "email": "applicant@example.com",
                "phone": "+1 555 0100",
                "resume": _resume(),
                internal_field: "client-controlled",
            }
        )


def test_job_application_rejects_invalid_email_and_resume_extension() -> None:
    with pytest.raises(ValidationError):
        JobApplicationCreateRequest(
            name="Applicant Name",
            email="not-an-email",
            phone="+1 555 0100",
            resume=_resume(),
        )

    with pytest.raises(ValidationError, match="resume must use"):
        JobApplicationCreateRequest(
            name="Applicant Name",
            email="applicant@example.com",
            phone="+1 555 0100",
            resume=_resume("resume.txt"),
        )


@pytest.mark.parametrize("member_type", ["leadership", "team"])
def test_team_response_accepts_contract_member_types(member_type: str) -> None:
    response = TeamListResponse.model_validate(
        {
            "data": [
                {
                    "id": RESOURCE_ID,
                    "name": "John Doe",
                    "role": "Chief Executive Officer",
                    "bio": "John leads Vyntics.",
                    "photo_url": "https://example.com/john.jpg",
                    "linkedin_url": "https://linkedin.com/in/johndoe",
                    "display_order": 1,
                    "member_type": member_type,
                }
            ]
        }
    )

    assert response.data[0].member_type == member_type
    assert "is_visible" not in TeamMemberResponse.model_fields


def test_team_response_rejects_unknown_member_type() -> None:
    valid = {
        "id": RESOURCE_ID,
        "name": "John Doe",
        "role": "Chief Executive Officer",
        "bio": "John leads Vyntics.",
        "photo_url": "https://example.com/john.jpg",
        "linkedin_url": "https://linkedin.com/in/johndoe",
        "display_order": 1,
        "member_type": "contractor",
    }

    with pytest.raises(ValidationError):
        TeamMemberResponse.model_validate(valid)


def test_contact_request_accepts_optional_company() -> None:
    without_company = ContactCreateRequest(
        name="John Doe",
        email="john@example.com",
        subject="Website Development Inquiry",
        message="We would like to discuss a website.",
        source_page="/",
    )
    with_company = ContactCreateRequest(
        name="John Doe",
        email="john@example.com",
        company="Example Company",
        subject="Website Development Inquiry",
        message="We would like to discuss a website.",
        source_page="/",
    )

    assert without_company.company is None
    assert with_company.company == "Example Company"


def test_contact_request_enforces_required_fields_and_email() -> None:
    with pytest.raises(ValidationError):
        ContactCreateRequest.model_validate(
            {
                "name": "John Doe",
                "email": "not-an-email",
                "subject": "Inquiry",
                "message": "Message",
            }
        )


@pytest.mark.parametrize(
    "internal_field",
    ["id", "status", "submitted_at", "notes", "resolved_at", "resolved_by"],
)
def test_contact_request_rejects_backend_controlled_fields(
    internal_field: str,
) -> None:
    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        ContactCreateRequest.model_validate(
            {
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Inquiry",
                "message": "Message",
                "source_page": "/",
                internal_field: "client-controlled",
            }
        )
