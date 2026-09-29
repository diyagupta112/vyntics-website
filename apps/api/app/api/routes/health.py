"""Application health-check route."""

from fastapi import APIRouter, Response, status

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    response_class=Response,
)
def health_check() -> Response:
    """Confirm that the API process is available."""
    return Response(status_code=status.HTTP_200_OK)

