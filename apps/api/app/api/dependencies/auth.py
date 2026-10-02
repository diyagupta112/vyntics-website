"""Reusable FastAPI authentication and role dependencies."""

from collections.abc import Callable, Coroutine
from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.api.dependencies.database import DatabaseSession
from app.auth.models import AdminRole, AuthenticatedAdmin, SupabaseIdentity
from app.auth.supabase import (
    AccessTokenVerifier,
    AuthConfigurationError,
    AuthServiceUnavailableError,
    InvalidAccessTokenError,
)
from app.core.config import Settings
from app.repositories.admin_users import AdminUserRepository


bearer_scheme = HTTPBearer(auto_error=False)
BearerCredentials = Annotated[
    HTTPAuthorizationCredentials | None,
    Depends(bearer_scheme),
]


def get_auth_verifier(request: Request) -> AccessTokenVerifier:
    """Return the process-level Supabase token verifier."""

    return request.app.state.auth_verifier


TokenVerifierDependency = Annotated[
    AccessTokenVerifier,
    Depends(get_auth_verifier),
]


def _unauthorized(detail: str = "Authentication required.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _email_is_in_domain(email: str, allowed_domain: str) -> bool:
    local_part, separator, domain = email.strip().rpartition("@")
    return bool(
        separator
        and local_part
        and domain.casefold() == allowed_domain.strip().lstrip("@").casefold()
    )


async def verify_supabase_identity(
    credentials: BearerCredentials,
    verifier: TokenVerifierDependency,
    request: Request,
) -> SupabaseIdentity:
    """Verify Bearer credentials and enforce the configured email domain."""

    if credentials is None or credentials.scheme.casefold() != "bearer":
        raise _unauthorized()

    try:
        identity = await verifier.verify(credentials.credentials)
    except InvalidAccessTokenError:
        raise _unauthorized("Invalid or expired authentication credentials.") from None
    except (AuthConfigurationError, AuthServiceUnavailableError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is unavailable.",
        ) from None

    settings: Settings = request.app.state.settings
    if not _email_is_in_domain(
        identity.email,
        settings.auth_allowed_email_domain,
    ):
        raise _unauthorized("Administrator authentication failed.")

    return identity


VerifiedIdentityDependency = Annotated[
    SupabaseIdentity,
    Depends(verify_supabase_identity),
]


async def require_authenticated_admin(
    identity: VerifiedIdentityDependency,
    session: DatabaseSession,
) -> AuthenticatedAdmin:
    """Resolve a verified identity to an active Vyntics administrator."""

    admin = await AdminUserRepository(session).get_by_auth_user_id(
        identity.user_id
    )
    if admin is None or not admin.is_active:
        raise _unauthorized("Administrator authentication failed.")

    return AuthenticatedAdmin(
        supabase_user_id=identity.user_id,
        supabase_email=identity.email,
        admin_id=admin.id,
        admin_auth_user_id=admin.auth_user_id,
        admin_email=admin.email,
        role=admin.role,
        is_active=admin.is_active,
        created_at=admin.created_at,
        updated_at=admin.updated_at,
    )


AuthenticatedAdminDependency = Annotated[
    AuthenticatedAdmin,
    Depends(require_authenticated_admin),
]


def require_admin_roles(
    *allowed_roles: AdminRole,
) -> Callable[..., Coroutine[Any, Any, AuthenticatedAdmin]]:
    """Build a dependency that returns 403 for an insufficient admin role."""

    allowed = frozenset(allowed_roles)

    async def require_role(
        admin: AuthenticatedAdminDependency,
    ) -> AuthenticatedAdmin:
        if admin.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )
        return admin

    return require_role
