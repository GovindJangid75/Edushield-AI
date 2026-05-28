# app/models/behavioral_patterns.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Float, Boolean, Text, JSON
from datetime import datetime
import uuid
import json

from app.database import Base


class BehavioralPattern(Base):
    __tablename__ = "behavioral_patterns"

    id               = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id       = Column(String(36), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    pattern_type     = Column(String(100))  # silent_student, low_confidence, social_disconnect
    pattern_strength = Column(Float)        # 0-1
    detection_date   = Column(Date)
    evidence         = Column(JSON)         # JSON dict
    is_active        = Column(Boolean, default=True)
    created_at       = Column(DateTime, default=datetime.utcnow)

    def get_evidence(self):
        if self.evidence:
            try:
                return json.loads(self.evidence)
            except (json.JSONDecodeError, TypeError):
                return {}
        return {}
