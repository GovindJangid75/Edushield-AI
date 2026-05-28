# app/schemas/risk.py
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
from uuid import UUID

class RiskAssessmentResponse(BaseModel):
    student_id: str
    student_name: str
    assessment_date: str
    dropout_risk: Dict
    hidden_patterns: Dict
    triage: Dict
    interventions: List[Dict]
    explanation: Dict
    risk_record_id: str
