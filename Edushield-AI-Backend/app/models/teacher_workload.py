# app/models/teacher_workload.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Float, Integer, UniqueConstraint
from datetime import datetime
import uuid

from app.database import Base


class TeacherWorkload(Base):
    __tablename__ = "teacher_workload"

    id                      = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id              = Column(String(36), ForeignKey('teachers.id'), nullable=False)
    date                    = Column(Date, nullable=False)
    classes_taught          = Column(Integer, default=0)
    assignments_corrected   = Column(Integer, default=0)
    students_mentored       = Column(Integer, default=0)
    interventions_handled   = Column(Integer, default=0)
    hours_worked            = Column(Float)
    stress_level            = Column(String(20))    # low, moderate, high, critical
    burnout_score           = Column(Float)          # 0-1
    created_at              = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('teacher_id', 'date', name='_teacher_date_uc'),)
