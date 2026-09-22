"""Application logging configuration."""

import logging
from typing import Literal

LogLevel = Literal["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"]


def configure_logging(log_level: LogLevel) -> None:
    """Configure the root logger from application settings."""
    logging.basicConfig(level=log_level)

