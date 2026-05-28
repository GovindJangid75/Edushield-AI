# app/models/homework_submissions.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Float
from datetime import datetime
import uuid

from app.database import Base


class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"

    id              = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id      = Column(String(36), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    subject         = Column(String(100))
    assignment_name = Column(String(200))
    assigned_date   = Column(Date)
    due_date        = Column(Date)
    submission_date = Column(Date)
    status          = Column(String(20))    # submitted, late, missing
    quality_score   = Column(Float)         # 0-1
    teacher_remarks = Column(String(500))
    created_at      = Column(DateTime, default=datetime.utcnow)