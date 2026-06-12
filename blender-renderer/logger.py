"""Logging configuration for Blender Chess addon."""

import logging
import sys


def setup_logger(name: str = "blender_chess", level: int = logging.INFO):
    """
    Configure logger for the addon.

    Logs to console (visible in Blender's system console).

    Args:
        name: Logger name
        level: Logging level (default: INFO)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Avoid duplicate handlers if called multiple times
    if logger.handlers:
        return logger

    logger.setLevel(level)

    # Console handler (shows in Blender's console)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_formatter = logging.Formatter("%(name)s - %(levelname)s - %(message)s")
    console_handler.setFormatter(console_formatter)

    logger.addHandler(console_handler)

    return logger


# Global logger instance for the addon
logger = setup_logger()
