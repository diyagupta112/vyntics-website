"""Typed authenticated identity representations."""

from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from uuid import UUID


AdminRole = Literal["superadmin", "admin"]


@dataclass(frozen=True, slots=True)
class SupabaseIdentity:
    """Minimal identity returned after Supabase verifies an access token."""

    user_id: UUID
    email: str


@dataclass(frozen=True, slots=True)
class AuthenticatedAdmin:
    """Verified Supabase identity resolved to an active Vyntics admin."""

    supabase_user_id: UUID
    supabase_email: str
    admin_id: UUID
    admin_auth_user_id: UUID
    admin_email: str
    role: AdminRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
