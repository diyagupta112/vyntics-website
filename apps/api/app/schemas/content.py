"""YouTube references within the existing JSON rich-text node format."""

import re
from typing import Annotated, Literal, TypeAlias
from urllib.parse import parse_qs, urlsplit

from pydantic import AfterValidator, Field, ValidationError, model_validator

from app.schemas.common import JsonObject, RequestSchema


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


def normalize_video_content(content: JsonObject) -> JsonObject:
    """Validate video nodes wherever nested while preserving every other value."""
    def visit(value, path):
        if isinstance(value, dict):
            if value.get("type") == "video":
                try:
                    block = YouTubeVideoBlock.model_validate(value)
                except ValidationError as error:
                    message = error.errors(include_url=False)[0]["msg"]
                    raise ValueError(f"{path}: {message}") from None
                return block.model_dump(exclude_none=True)
            return {key: visit(child, f"{path}.{key}") for key, child in value.items()}
        if isinstance(value, list):
            return [visit(child, f"{path}[{index}]") for index, child in enumerate(value)]
        return value

    return visit(content, "content")


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
    "or presentation settings. Other JSON content remains unchanged."
)

BodyContent: TypeAlias = Annotated[
    JsonObject,
    AfterValidator(normalize_video_content),
    Field(description=CONTENT_DESCRIPTION, examples=[CONTENT_EXAMPLE]),
]
StoredBodyContent: TypeAlias = Annotated[
    JsonObject,
    Field(description=CONTENT_DESCRIPTION, examples=[CONTENT_EXAMPLE]),
]
