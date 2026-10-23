"""Global exception-handler registration."""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError
from sqlalchemy.exc import TimeoutError as PoolTimeoutError

logger = logging.getLogger(__name__)


def register_exception_handlers(application: FastAPI) -> None:
    """Report an unreachable or saturated database as 503, not a bare 500.

    An unhandled exception is answered by Starlette's outermost middleware,
    outside CORSMiddleware, so browsers see a misleading CORS failure. These
    handlers run inside CORS, keep the real status visible, and still log the
    full traceback server-side.
    """

    @application.exception_handler(OperationalError)
    @application.exception_handler(PoolTimeoutError)
    async def database_unavailable(request: Request, error: Exception) -> JSONResponse:
        logger.error(
            "Database unavailable for %s %s",
            request.method,
            request.url.path,
            exc_info=error,
        )
        return JSONResponse(
            status_code=503,
            content={"detail": "The database is temporarily unavailable."},
            headers={"Retry-After": "5"},
        )
