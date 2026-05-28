# app/utils/validators.py
import re


def validate_phone(phone: str) -> bool:
    """Validate Indian phone number (starts with 6-9, 10 digits)."""
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, phone))


def validate_student_id(student_id: str) -> bool:
    """Validate student ID format (min 3 chars)."""
    return bool(student_id and len(student_id) >= 3)


def validate_risk_level(risk_level: str) -> bool:
    """Validate risk level value."""
    return risk_level in ['critical', 'high', 'moderate', 'low', 'stable']


def validate_intervention_status(status: str) -> bool:
    """Validate intervention status value."""
    return status in ['recommended', 'planned', 'in_progress', 'completed', 'dismissed']


def sanitize_text(text: str, max_length: int = 1000) -> str:
    """Sanitize user input text — collapse whitespace and truncate."""
    if not text:
        return ""
    text = ' '.join(text.split())
    if len(text) > max_length:
        text = text[:max_length]
    return text
