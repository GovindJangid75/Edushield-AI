# app/models/teacher.py
from sqlalchemy import Column, String, Boolean, DateTime, Text
from datetime import datetime
import uuid

from app.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id               = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id       = Column(String(50), unique=True, nullable=False, index=True)
    name             = Column(String(200), nullable=False)
    email            = Column(String(200), unique=True)
    phone            = Column(String(20))
    subject          = Column(String(100))          # primary subject
    subjects         = Column(Text)                  # comma-separated subjects: "Math,Science"
    classes_assigned = Column(Text)                  # comma-separated: "10A,10B"
    role             = Column(String(50), default='teacher')
    hashed_password  = Column(String(500))
    is_active        = Column(Boolean, default=True)
    created_at       = Column(DateTime, default=datetime.utcnow)
    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)