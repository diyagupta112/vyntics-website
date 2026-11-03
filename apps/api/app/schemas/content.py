"""YouTube references within the existing JSON rich-text node format."""

import re
from typing import Annotated, Literal, TypeAlias
from urllib.parse import parse_qs, urlsplit

from pydantic import AfterValidator, Field, StringConstraints, ValidationError, field_validator, model_validator

from app.schemas.common import JsonObject, RequestSchema, ResponseSchema


VIDEO_ID_PATTERN = r"^[A-Za-z0-9_-]{11}$"
VIDEO_ID = re.compile(VIDEO_ID_PATTERN)


def youtube_video_id(url: str) -> str:
    """Extract a YouTube identifier locally without fetching the URL."""
    url = url.strip()
    if not url or re.search(r"[\s\x00-\x1f\x7f]", url):
        raise ValueError("Invalid YouTube URL")
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError:
        raise ValueError("Invalid YouTube URL") from None
    if (
        parsed.scheme not in {"https", "http"}
        or parsed.username is not None
        or parsed.password is not None
        or port not in {None, 443 if parsed.scheme == "https" else 80}
    ):
        raise ValueError("Invalid YouTube URL")
    host = parsed.hostname
    path = parsed.path.rstrip("/")
    identifier = None
    if host in {"youtu.be", "www.youtu.be"}:
        parts = path.split("/")
        if len(parts) == 2:
            identifier = parts[1]
    elif host in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        if path == "/watch":
            values = parse_qs(parsed.query, keep_blank_values=True).get("v", [])
            if len(values) == 1:
                identifier = values[0]
        else:
            parts = path.split("/")
            if len(parts) == 3 and parts[1] in {"embed", "shorts"}:
                identifier = parts[2]
    if identifier is None or VIDEO_ID.fullmatch(identifier) is None:
        raise ValueError("Invalid YouTube URL or video ID")
    return identifier


class YouTubeVideoAttributes(RequestSchema):
    """Semantic reference only; no presentation or iframe attributes."""

    provider: Literal["youtube"]
    video_id: Annotated[str, Field(pattern=VIDEO_ID_PATTERN)] | None = None
    url: str | None = None

    @model_validator(mode="after")
    def normalize_reference(self) -> "YouTubeVideoAttributes":
        if (self.video_id is None) == (self.url is None):
            raise ValueError("Provide exactly one of video_id or url")
        if self.url is not None:
            self.video_id = youtube_video_id(self.url)
            self.url = None
        return self


class YouTubeVideoBlock(RequestSchema):
    """A leaf node following the existing type/attrs content representation."""

    type: Literal["video"]
    attrs: YouTubeVideoAttributes


# A backend-managed body image: <origin>/storage/v1/object/public/<bucket>/<resource uuid>/<sha256>.<ext>.
# The service additionally pins the exact bucket and the owning resource; this only fixes the shape.
MANAGED_IMAGE_URL = re.compile(
    r"^https?://[^\s/?#@]+/storage/v1/object/public/[A-Za-z0-9._-]+/"
    r"(?P<resource_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/"
    r"[0-9a-f]{64}\.(?:jpg|png|webp)$"
)
IMAGE_ALT_MAX_LENGTH = 300


class ImageAttributes(RequestSchema):
    """Semantic reference only: the managed image URL and its alt text."""

    url: str
    alt: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=IMAGE_ALT_MAX_LENGTH)]

    @field_validator("url")
    @classmethod
    def require_managed_image_url(cls, value: str) -> str:
        if MANAGED_IMAGE_URL.fullmatch(value) is None:
            raise ValueError("Image url must be an image uploaded through the content-images endpoint")
        return value


class ImageBlock(RequestSchema):
    """A leaf node following the existing type/attrs content representation."""

    type: Literal["image"]
    attrs: ImageAttributes


class ContentImageUploadResponse(ResponseSchema):
    """Result of uploading a body image; the author places it with an alt text."""

    url: str
    content_type: str
    size_bytes: int


def content_image_urls(content: JsonObject) -> set[str]:
    """Return every image URL referenced by image nodes, wherever nested."""
    found: set[str] = set()

    def visit(value):
        if isinstance(value, dict):
            if value.get("type") == "image" and isinstance(value.get("attrs"), dict):
                url = value["attrs"].get("url")
                if isinstance(url, str):
                    found.add(url)
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(content)
    return found


_LEAF_BLOCKS = {"video": YouTubeVideoBlock, "image": ImageBlock}


def normalize_content(content: JsonObject) -> JsonObject:
    """Validate video and image nodes wherever nested while preserving every other value."""
    def visit(value, path):
        if isinstance(value, dict):
            block_type = value.get("type")
            if isinstance(block_type, str) and block_type in _LEAF_BLOCKS:
                try:
                    block = _LEAF_BLOCKS[block_type].model_validate(value)
                except ValidationError as error:
                    message = error.errors(include_url=False)[0]["msg"]
                    raise ValueError(f"{path}: {message}") from None
                return block.model_dump(exclude_none=True)
            return {key: visit(child, f"{path}.{key}") for key, child in value.items()}
        if isinstance(value, list):
            return [visit(child, f"{path}[{index}]") for index, child in enumerate(value)]
        return value

    return visit(content, "content")


normalize_video_content = normalize_content  # earlier name, kept for existing imports


CANONICAL_VIDEO = {
    "type": "video", "attrs": {"provider": "youtube", "video_id": "dQw4w9WgXcQ"},
}
CONTENT_EXAMPLE = {
    "type": "doc", "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Introduction"}]},
        CANONICAL_VIDEO,
        {"type": "paragraph", "content": [{"type": "text", "text": "Conclusion"}]},
    ],
}
CONTENT_DESCRIPTION = (
    "Existing structured JSON content. YouTube videos use a leaf node with "
    "type='video' and attrs={provider:'youtube', video_id:'11-character ID'}. "
    "Writes may instead supply attrs.url as a YouTube watch, youtu.be, embed, "
    "or shorts URL; it is normalized to video_id before storage. Supply exactly "
    "one of video_id or url. Video nodes do not accept HTML, other providers, "
    "or presentation settings. Body images use a leaf node with type='image' and "
    "attrs={url, alt}: url must be an image uploaded through the resource's "
    "content-images endpoint and alt is required (1-300 characters). Image nodes "
    "accept no presentation settings. Other JSON content remains unchanged."
)

BodyContent: TypeAlias = Annotated[
    JsonObject,
    AfterValidator(normalize_content),
    Field(description=CONTENT_DESCRIPTION, examples=[CONTENT_EXAMPLE]),
]
StoredBodyContent: TypeAlias = Annotated[
    JsonObject,
    Field(description=CONTENT_DESCRIPTION, examples=[CONTENT_EXAMPLE]),
]
