# app/schemas/student.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class StudentBase(BaseModel):
    student_id: str
    name: str
    class_: Optional[str] = Field(None, alias="class")
    section: Optional[str] = None
    roll_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    address: Optional[str] = None

class StudentCreate(StudentBase):
    enrollment_date: Optional[date] = None

class StudentResponse(StudentBase):
    id: UUID
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

class AttendanceRecord(BaseModel):
    id: UUID
    date: date
    status: str
    reason: Optional[str] = None
    
    class Config:
        from_attributes = True

class PerformanceRecord(BaseModel):
    id: UUID
    subject: Optional[str] = None
    assessment_type: Optional[str] = None
    assessment_name: Optional[str] = None
    max_marks: Optional[float] = None
    obtained_marks: Optional[float] = None
    assessment_date: Optional[date] = None
    
    class Config:
        from_attributes = True

class StudentDetailResponse(BaseModel):
    student: StudentResponse
    attendance_records: List[AttendanceRecord]
    performance_records: List[PerformanceRecord]
    latest_risk_assessment: Optional[dict] = None
