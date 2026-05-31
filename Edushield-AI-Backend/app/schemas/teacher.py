# app/schemas/teacher.py
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class TeacherBase(BaseModel):
    teacher_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    subjects: Optional[List[str]] = None
    classes_assigned: Optional[List[str]] = None

    @field_validator('subjects', 'classes_assigned', mode='before')
    @classmethod
    def parse_comma_separated_string(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(',') if item.strip()]
        return v

class TeacherCreate(TeacherBase):
    password: str

class TeacherResponse(TeacherBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
