# app/models/teacher_observations.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Float, Text, JSON
from datetime import datetime
import uuid
import json

from app.database import Base


class TeacherObservation(Base):
    __tablename__ = "teacher_observations"

    id                  = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id          = Column(String(36), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    teacher_id          = Column(String(36), ForeignKey('teachers.id'), nullable=False)
    observation_date    = Column(Date)
    observation_type    = Column(String(50))    # voice, text, behavioral
    original_text       = Column(Text)
    transcribed_text    = Column(Text)
    audio_file_path     = Column(String(500))
    language            = Column(String(10))    # en, hi
    sentiment           = Column(String(20))    # positive, neutral, concerning
    concern_level       = Column(String(20))    # low, medium, high, critical
    extracted_insights  = Column(JSON)          # JSON dict
    processing_confidence = Column(Float, default=0.5)
    observed_at         = Column(DateTime, default=datetime.utcnow)
    created_at          = Column(DateTime, default=datetime.utcnow)

    def get_extracted_insights(self):
        if self.extracted_insights:
            try:
                return json.loads(self.extracted_insights)
            except (json.JSONDecodeError, TypeError):
                return {}
        return {}

    def set_extracted_insights(self, data: dict):
        self.extracted_insights = json.dumps(data) if data else None
