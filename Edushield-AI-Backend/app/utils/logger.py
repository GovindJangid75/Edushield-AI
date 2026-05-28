# app/utils/logger.py
import logging
import sys
import os
from datetime import datetime


def setup_logger(name: str = "edushield_ai") -> logging.Logger:
    """Setup application logger with console and file handlers."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if logger.handlers:
        return logger  # Already configured

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler (only if logs directory exists)
    logs_dir = 'logs'
    if os.path.exists(logs_dir):
        try:
            file_handler = logging.FileHandler(
                os.path.join(logs_dir, f'edushield_{datetime.now().strftime("%Y%m%d")}.log')
            )
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        except Exception:
            pass  # Skip file logging if directory not writable

    return logger


# Module-level default logger
logger = setup_logger()
