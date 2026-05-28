# app/models/attendance.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from datetime import datetime
import uuid

from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id         = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    date       = Column(Date, nullable=False)
    status     = Column(String(20))   # present, absent, late, excused
    reason     = Column(String(500))
    marked_by  = Column(String(36))   # teacher_id
    created_at = Column(DateTime, default=datetime.utcnow)