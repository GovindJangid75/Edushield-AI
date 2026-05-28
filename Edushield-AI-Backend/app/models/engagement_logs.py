# app/models/engagement_logs.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Float, Integer
from datetime import datetime
import uuid

from app.database import Base


class EngagementLog(Base):
    __tablename__ = "engagement_logs"

    id                      = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id              = Column(String(36), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    date                    = Column(Date, nullable=False)
    participation_score     = Column(Float, default=0.0)   # 0-1
    questions_asked         = Column(Integer, default=0)
    class_interaction_level = Column(String(20))            # high, medium, low, none
    focus_level             = Column(String(20))            # high, medium, low, distracted
    mood_observed           = Column(String(30))            # happy, neutral, sad, anxious
    observer_id             = Column(String(36))            # teacher_id who logged this
    created_at              = Column(DateTime, default=datetime.utcnow)
