# app/models/risk_predictions.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Float, Integer, Boolean, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy import event
from sqlalchemy.engine import Engine
from datetime import datetime
import uuid
import json

from app.database import Base


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id                      = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id              = Column(String(36), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    prediction_date         = Column(Date, nullable=False)
    risk_level              = Column(String(20))   # critical, high, moderate, low, stable
    risk_score              = Column(Float)         # 0-1 probability
    confidence_score        = Column(Float)         # 0-1
    risk_category           = Column(String(50))   # dropout, disengagement, academic_decline
    contributing_factors    = Column(JSON)          # JSON dict
    reasoning               = Column(Text)
    prediction_horizon_days = Column(Integer)       # 30, 60, 90
    model_version           = Column(String(50))
    is_active               = Column(Boolean, default=True)
    created_at              = Column(DateTime, default=datetime.utcnow)

    def get_contributing_factors(self):
        if self.contributing_factors:
            try:
                return json.loads(self.contributing_factors)
            except (json.JSONDecodeError, TypeError):
                return {}
        return {}

    def set_contributing_factors(self, data: dict):
        self.contributing_factors = json.dumps(data) if data else None
