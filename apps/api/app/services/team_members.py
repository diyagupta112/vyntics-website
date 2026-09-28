"""Team Member application logic and transaction boundaries."""

import logging
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.team_member import TeamMember
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.team_members import TeamMemberRepository
from app.schemas.team import TeamMemberCreateRequest, TeamMemberUpdateRequest
from app.storage.supabase import StorageConfigurationError, StorageError
from app.storage.uploads import PublicImageStorage


logger = logging.getLogger(__name__)


class TeamMemberNotFoundError(LookupError):
    """Raised when a Team member does not exist."""


class TeamMemberService:
    """Coordinate Team Member rules, persistence, auditing, and transactions."""

    def __init__(
        self,
        session: AsyncSession,
        *,
        team_member_repository: TeamMemberRepository | None = None,
        audit_repository: AuditLogRepository | None = None,
        image_storage: PublicImageStorage | None = None,
    ) -> None:
        self._session = session
        self._team_members = team_member_repository or TeamMemberRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)
        self._image_storage = image_storage

    async def list_all(self) -> list[TeamMember]:
        """Return every Team member in the repository-defined order."""

        return await self._team_members.list_all()

    async def get_by_id(self, team_member_id: UUID) -> TeamMember:
        """Return one Team member or raise the domain not-found error."""

        team_member = await self._team_members.get_by_id(team_member_id)
        if team_member is None:
            raise TeamMemberNotFoundError
        return team_member

    async def create(
        self,
        request: TeamMemberCreateRequest,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> TeamMember:
        """Create and audit a Team member in one transaction."""

        team_member = TeamMember(**request.model_dump(mode="json"))
        try:
            await self._team_members.add(team_member)
            await self._audit_logs.add(
                self._build_audit_log(
                    action="create",
                    team_member=team_member,
                    context=self._safe_context(team_member),
                    actor=actor,
                )
            )
            await self._team_members.refresh(team_member)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        return team_member

    async def update(
        self,
        team_member_id: UUID,
        request: TeamMemberUpdateRequest,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> TeamMember:
        """Apply supplied Team Member fields and audit actual changes."""

        team_member = await self._team_members.get_by_id(team_member_id)
        if team_member is None:
            raise TeamMemberNotFoundError
        previous_photo_url = team_member.photo_url

        changed_fields: list[str] = []
        for field_name, value in request.model_dump(
            exclude_unset=True,
            mode="json",
        ).items():
            if getattr(team_member, field_name) != value:
                setattr(team_member, field_name, value)
                changed_fields.append(field_name)

        if not changed_fields:
            return team_member

        context = self._safe_context(team_member)
        context["changed_fields"] = sorted(changed_fields)
        try:
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    team_member=team_member,
                    context=context,
                    actor=actor,
                )
            )
            await self._team_members.refresh(team_member)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        if "photo_url" in changed_fields and self._image_storage is not None:
            await self._cleanup_previous_photo(
                self._image_storage,
                previous_photo_url,
                team_member.id,
            )
        return team_member

    async def delete(
        self,
        team_member_id: UUID,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> None:
        """Hard-delete and audit a Team member in one transaction."""

        team_member = await self._team_members.get_by_id(team_member_id)
        if team_member is None:
            raise TeamMemberNotFoundError

        audit_log = self._build_audit_log(
            action="delete",
            team_member=team_member,
            context=self._safe_context(team_member),
            actor=actor,
        )
        previous_photo_url = team_member.photo_url
        try:
            await self._team_members.delete(team_member)
            await self._audit_logs.add(audit_log)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

        if self._image_storage is not None:
            await self._cleanup_previous_photo(
                self._image_storage,
                previous_photo_url,
                team_member.id,
            )

    async def upload_photo(
        self,
        team_member_id: UUID,
        upload: UploadFile,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> TeamMember:
        """Replace a Team photo with a validated backend-managed object."""

        team_member = await self.get_by_id(team_member_id)
        storage = self._require_image_storage()
        previous_url = team_member.photo_url
        stored = await storage.upload(team_member.id, upload)
        team_member.photo_url = stored.public_url
        try:
            context = self._safe_context(team_member)
            context["changed_fields"] = ["photo_url"]
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    team_member=team_member,
                    context=context,
                    actor=actor,
                )
            )
            await self._team_members.refresh(team_member)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            try:
                await storage.delete_path(stored.object_path)
            except StorageError:
                logger.warning(
                    "Could not remove an unreferenced Team photo after rollback.",
                    extra={"resource_type": "team_member", "resource_id": str(team_member.id)},
                )
            raise
        await self._cleanup_previous_photo(storage, previous_url, team_member.id)
        return team_member

    async def delete_photo(
        self,
        team_member_id: UUID,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> None:
        """Clear a Team photo and clean up only a managed object."""

        team_member = await self.get_by_id(team_member_id)
        previous_url = team_member.photo_url
        if previous_url is None:
            return
        storage = self._require_image_storage()
        team_member.photo_url = None
        try:
            context = self._safe_context(team_member)
            context["changed_fields"] = ["photo_url"]
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    team_member=team_member,
                    context=context,
                    actor=actor,
                )
            )
            await self._team_members.refresh(team_member)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        await self._cleanup_previous_photo(storage, previous_url, team_member.id)

    def _require_image_storage(self) -> PublicImageStorage:
        if self._image_storage is None:
            raise StorageConfigurationError("Storage is not configured.")
        return self._image_storage

    @staticmethod
    async def _cleanup_previous_photo(
        storage: PublicImageStorage,
        previous_url: str | None,
        team_member_id: UUID,
    ) -> None:
        if previous_url is None:
            return
        try:
            await storage.delete_managed_url(str(previous_url), team_member_id)
        except StorageError:
            logger.warning(
                "Could not clean up a previous Team photo.",
                extra={
                    "resource_type": "team_member",
                    "resource_id": str(team_member_id),
                },
            )

    @staticmethod
    def _safe_context(team_member: TeamMember) -> dict[str, object]:
        return {
            "member_type": team_member.member_type,
            "display_order": team_member.display_order,
        }

    @staticmethod
    def _build_audit_log(
        *,
        action: str,
        team_member: TeamMember,
        context: dict[str, object],
        actor: AuthenticatedAdmin | None = None,
    ) -> AuditLog:
        """Build an approved non-sensitive Team Member audit record."""

        return AuditLog(
            actor_id=actor.admin_id if actor is not None else None,
            actor_email=actor.admin_email if actor is not None else None,
            action=action,
            resource_type="team_member",
            resource_id=team_member.id,
            context=context,
        )
