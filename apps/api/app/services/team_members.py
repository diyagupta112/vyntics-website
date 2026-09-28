"""Team Member application logic and transaction boundaries."""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.team_member import TeamMember
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.team_members import TeamMemberRepository
from app.schemas.team import TeamMemberCreateRequest, TeamMemberUpdateRequest


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
    ) -> None:
        self._session = session
        self._team_members = team_member_repository or TeamMemberRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)

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
        try:
            await self._team_members.delete(team_member)
            await self._audit_logs.add(audit_log)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

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
