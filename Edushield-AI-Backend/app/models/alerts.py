# app/models/alerts.py
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from datetime import datetime
import uuid

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id          = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_type  = Column(String(50))    # student_risk, teacher_burnout, system
    severity    = Column(String(20))    # critical, high, medium, low
    entity_type = Column(String(50))    # student, teacher, class
    entity_id   = Column(String(36))
    title       = Column(String(200))
    message     = Column(Text)
    is_read     = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    assigned_to = Column(String(36), ForeignKey('teachers.id'), nullable=True)
    resolved_at = Column(DateTime)
    created_at  = Column(DateTime, default=datetime.utcnow)
