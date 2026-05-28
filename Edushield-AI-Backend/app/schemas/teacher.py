# app/schemas/teacher.py
from pydantic import BaseModel, EmailStr
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

class TeacherCreate(TeacherBase):
    password: str

class TeacherResponse(TeacherBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
