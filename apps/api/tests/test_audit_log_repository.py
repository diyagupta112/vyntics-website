"""SQL query and transaction safety checks for audit reads."""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audit_log import AuditLog
from app.repositories.audit_logs import AuditLogRepository
from app.services.audit_logs import AuditLogNotFoundError, AuditLogService


def test_filters_count_order_and_pagination_are_sql():
    session = AsyncMock(spec=AsyncSession)
    session.scalar.return_value = 12
    result = MagicMock()
    result.all.return_value = []
    session.scalars.return_value = result
    actor_id, resource_id = uuid4(), uuid4()
    now = datetime(2026, 10, 1, tzinfo=timezone.utc)
    rows, total = asyncio.run(AuditLogRepository(session).list_page(
        page=3, page_size=5, actor_id=actor_id, action="update",
        resource_type="blog", resource_id=resource_id, from_time=now, to_time=now,
    ))
    assert rows == [] and total == 12
    count = session.scalar.await_args.args[0]
    listing = session.scalars.await_args.args[0]
    def sql(statement):
        return str(statement.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
    assert str(count.whereclause) == str(listing.whereclause)
    assert "count(*)" in sql(count)
    assert "LIMIT" not in sql(count) and "OFFSET" not in sql(count)
    assert "ORDER BY audit_logs.created_at DESC, audit_logs.id DESC" in sql(listing)
    assert "LIMIT 5 OFFSET 10" in sql(listing)
    for fragment in (str(actor_id), str(resource_id), "'update'", "'blog'", "created_at >=", "created_at <="):
        assert fragment in sql(listing)
    session.commit.assert_not_awaited()
    session.add.assert_not_called()


def test_detail_missing_and_success_without_writes():
    session = AsyncMock(spec=AsyncSession)
    record = AuditLog(id=uuid4())
    session.get.return_value = record
    service = AuditLogService(session)
    assert asyncio.run(service.get_by_id(record.id)) is record
    session.get.assert_awaited_once_with(AuditLog, record.id)
    session.get.return_value = None
    with pytest.raises(AuditLogNotFoundError):
        asyncio.run(service.get_by_id(record.id))
    session.commit.assert_not_awaited()
    session.add.assert_not_called()
