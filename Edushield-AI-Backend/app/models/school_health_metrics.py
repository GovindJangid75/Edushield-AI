# app/models/school_health_metrics.py
from sqlalchemy import Column, String, Date, DateTime, Float, Integer
from datetime import datetime
import uuid

from app.database import Base


class SchoolHealthMetric(Base):
    __tablename__ = "school_health_metrics"

    id                        = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_date               = Column(Date, nullable=False, unique=True)
    total_students            = Column(Integer)
    at_risk_students          = Column(Integer)
    critical_cases            = Column(Integer)
    avg_attendance_rate       = Column(Float)
    avg_performance           = Column(Float)
    avg_engagement_score      = Column(Float)
    intervention_success_rate = Column(Float)
    teacher_burnout_rate      = Column(Float)
    overall_health_score      = Column(Float)  # 0-100
    created_at                = Column(DateTime, default=datetime.utcnow)
