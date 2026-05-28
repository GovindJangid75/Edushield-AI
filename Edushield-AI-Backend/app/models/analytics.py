# app/models/analytics.py
"""
Analytics snapshot model — stores pre-computed daily school-level metrics
so dashboards can load instantly without re-running heavy queries.
"""
from sqlalchemy import Column, String, Date, DateTime, Float, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database import Base


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id              = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    snapshot_date   = Column(Date, nullable=False, index=True)
    snapshot_type   = Column(String(50), nullable=False)          # daily | weekly | monthly

    # School-level aggregates
    total_students          = Column(Integer, default=0)
    active_students         = Column(Integer, default=0)
    total_teachers          = Column(Integer, default=0)

    # Risk distribution
    critical_risk_count     = Column(Integer, default=0)
    high_risk_count         = Column(Integer, default=0)
    moderate_risk_count     = Column(Integer, default=0)
    low_risk_count          = Column(Integer, default=0)
    avg_risk_score          = Column(Float, default=0.0)

    # Attendance
    avg_attendance_rate     = Column(Float, default=0.0)
    absent_today            = Column(Integer, default=0)

    # Academic
    avg_marks_percentage    = Column(Float, default=0.0)
    subjects_failing        = Column(Integer, default=0)

    # Engagement
    avg_engagement_score    = Column(Float, default=0.0)
    low_engagement_count    = Column(Integer, default=0)

    # Interventions
    total_interventions     = Column(Integer, default=0)
    pending_interventions   = Column(Integer, default=0)
    completed_interventions = Column(Integer, default=0)
    intervention_success_rate = Column(Float, default=0.0)

    # Composite health
    school_health_score     = Column(Float, default=0.0)
    health_grade            = Column(String(2), default='C')

    # Full raw payload (for any extra metrics)
    raw_metrics             = Column(JSON, default=dict)

    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
