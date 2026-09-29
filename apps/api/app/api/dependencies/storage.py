"""FastAPI dependency access to the application-lifetime Storage gateway."""

from typing import Annotated

from fastapi import Depends, Request

from app.storage.supabase import SupabaseStorageGateway


def get_storage_gateway(request: Request) -> SupabaseStorageGateway | None:
    """Return the configured gateway without creating request-local clients."""

    return request.app.state.storage_gateway


StorageGatewayDependency = Annotated[
    SupabaseStorageGateway | None,
    Depends(get_storage_gateway),
]
