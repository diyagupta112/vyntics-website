"""Global exception-handler registration."""

from fastapi import FastAPI


def register_exception_handlers(application: FastAPI) -> None:
    """Register global handlers after the API error contract is approved."""
    # Phase 1 establishes the registration point without inventing the error
    # response contract that is scheduled for a later implementation phase.
    del application

