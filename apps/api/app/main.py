"""FastAPI application entry point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import configure_logging
from app.db.session import Database, create_database, dispose_database


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        database: Database | None = None
        if settings.database_url is not None:
            database = create_database(settings)

        application.state.database = database
        try:
            yield
        finally:
            if database is not None:
                await dispose_database(database)

    application = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        lifespan=lifespan,
    )
    application.state.settings = settings
    application.state.database = None

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router)
    register_exception_handlers(application)

    return application


app = create_app()
