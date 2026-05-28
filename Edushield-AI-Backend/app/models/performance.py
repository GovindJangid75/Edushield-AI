# app/models/performance.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Float
from datetime import datetime
import uuid

from app.database import Base


class Performance(Base):
    __tablename__ = "performance"

    id               = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id       = Column(String(36), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    subject          = Column(String(100))
    assessment_type  = Column(String(50))   # test, exam, quiz, assignment
    assessment_name  = Column(String(200))
    max_marks        = Column(Float)
    obtained_marks   = Column(Float)
    assessment_date  = Column(Date)
    teacher_remarks  = Column(String(500))
    created_at       = Column(DateTime, default=datetime.utcnow)