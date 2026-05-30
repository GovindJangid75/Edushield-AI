# app/main.py
from contextlib import asynccontextmanager
import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.database import get_db, engine, SessionLocal
from app.config import get_settings

# Import all models so that SQLAlchemy metadata is populated before create_all
from app.models import (  # noqa: F401
    Student, Teacher, Attendance, Performance,
    HomeworkSubmission, EngagementLog, TeacherObservation,
    RiskPrediction, Intervention, Alert,
    TeacherWorkload, SchoolHealthMetric, BehavioralPattern,
    ImportHistory,
)
from app.database import Base

# Import API routers
from app.api import auth, students, teachers, interventions, analytics, voice, data_import, alerts, reports

settings = get_settings()
logger = logging.getLogger("edushield_ai")

# Create all tables (idempotent — safe to run on every startup)
Base.metadata.create_all(bind=engine)


# ── Background escalation task ───────────────────────────────────────────
async def _escalation_loop():
    """Run the escalation service every 30 minutes."""
    from app.services.escalation_service import run_escalation_check
    while True:
        try:
            db = SessionLocal()
            try:
                run_escalation_check(db)
            finally:
                db.close()
        except Exception as exc:
            logger.warning(f"Escalation check error: {exc}")
        await asyncio.sleep(1800)  # 30 minutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle manager."""
    # Start background escalation task
    task = asyncio.create_task(_escalation_loop())
    logger.info("Escalation background service started.")
    yield
    # Shutdown
    task.cancel()
    logger.info("Escalation background service stopped.")


# Initialise FastAPI app
app = FastAPI(
    title="EduShield AI",
    description="Adaptive School Intelligence & Early Intervention Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
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
app.include_router(data_import.router, prefix="/api/import", tags=["Data Import"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts & Notifications"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports & Export"])


@app.get("/")
def read_root():
    return {
        "message": "EduShield AI — Adaptive School Intelligence & Early Intervention Platform",
        "version": "2.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)