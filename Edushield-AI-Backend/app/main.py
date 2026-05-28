# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.database import get_db, engine
from app.config import get_settings

# Import all models so that SQLAlchemy metadata is populated before create_all
from app.models import (  # noqa: F401
    Student, Teacher, Attendance, Performance,
    HomeworkSubmission, EngagementLog, TeacherObservation,
    RiskPrediction, Intervention, Alert,
    TeacherWorkload, SchoolHealthMetric, BehavioralPattern,
)
from app.database import Base

# Import API routers
from app.api import auth, students, teachers, interventions, analytics, voice

settings = get_settings()

# Create all tables (idempotent — safe to run on every startup)
Base.metadata.create_all(bind=engine)

# Initialise FastAPI app
app = FastAPI(
    title="EduShield AI",
    description="AI-powered Silent Dropout Detection & Student Support System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["Teachers"])
app.include_router(interventions.router, prefix="/api/interventions", tags=["Interventions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice Processing"])


@app.get("/")
def read_root():
    return {
        "message": "EduShield AI - Preventing Silent Dropouts",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)