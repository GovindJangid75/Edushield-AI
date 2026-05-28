# app/models/student.py
from sqlalchemy import Column, String, Date, Boolean, DateTime
from datetime import datetime
import uuid

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id            = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id    = Column(String(50), unique=True, nullable=False, index=True)
    name          = Column(String(200), nullable=False)
    class_        = Column("class", String(20))
    section       = Column(String(10))
    roll_number   = Column(String(20))
    date_of_birth = Column(Date)
    gender        = Column(String(20))
    phone         = Column(String(20))
    parent_phone  = Column(String(20))
    address       = Column(String(500))
    enrollment_date = Column(Date)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)