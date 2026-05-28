# app/api/voice.py
"""
Voice Observation API

Allows teachers to:
  1. Upload an audio file (m4a/mp3/wav/webm) → POST /api/voice/observe/audio
  2. Submit a text observation → POST /api/voice/observe/text
  3. Connect via WebSocket for real-time risk alerts → WS /api/voice/ws/alerts/{teacher_id}
"""
import os
import uuid
import aiofiles
from datetime import datetime

from fastapi import (
    APIRouter, Depends, File, Form, HTTPException, UploadFile, WebSocket,
    WebSocketDisconnect, BackgroundTasks
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.student import Student
from app.models.teacher_observations import TeacherObservation
from app.ai_engine.voice_processor import VoiceProcessor
from app.services.realtime_monitor import manager  # WebSocket connection manager

router = APIRouter()
voice_processor = VoiceProcessor()

UPLOAD_DIR = "uploads/voice_observations"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".ogg"}


# ─────────────────────────────────────────────────────────────────────────────
# Audio upload endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/observe/audio")
async def observe_via_audio(
    student_id: str = Form(...),
    teacher_id: str = Form(...),
    language: str = Form("hi"),
    audio: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
):
    """
    Upload a teacher voice note (Hindi/English) for AI processing.

    The audio is transcribed via Whisper, analysed for concern signals,
    and the observation is stored in the database.
    """
    # Validate student
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Validate file type
    ext = os.path.splitext(audio.filename or "")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}"
        )

    # Save to disk
    file_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    async with aiofiles.open(file_path, "wb") as f:
        content = await audio.read()
        await f.write(content)

    # Process audio
    processed = await voice_processor.process_audio(file_path, language)

    # Persist observation
    observation = TeacherObservation(
        id=str(uuid.uuid4()),
        student_id=student_id,
        teacher_id=teacher_id,
        observation_date=datetime.now().date(),
        observation_type="voice",
        original_text=processed.get("transcribed_text", ""),
        transcribed_text=processed.get("transcribed_text", ""),
        language=processed.get("language_detected", language),
        sentiment=processed.get("sentiment", "neutral"),
        concern_level=processed.get("concern_level", "low"),
        extracted_insights=processed.get("extracted_insights", {}),
        audio_file_path=file_path,
        processing_confidence=processed.get("confidence", 0.5),
    )
    db.add(observation)
    db.commit()
    db.refresh(observation)

    # Push real-time alert if concern is high/critical
    if processed.get("concern_level") in ("high", "critical"):
        background_tasks.add_task(
            _broadcast_concern_alert,
            teacher_id=teacher_id,
            student_name=student.name,
            concern_level=processed["concern_level"],
            transcribed_text=processed.get("transcribed_text", ""),
        )

    return {
        "observation_id":  str(observation.id),
        "student_id":      student_id,
        "student_name":    student.name,
        "processed":       processed,
        "observation_saved": True,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Text observation endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/observe/text")
async def observe_via_text(
    student_id: str = Form(...),
    teacher_id: str = Form(...),
    observation_text: str = Form(...),
    language: str = Form("en"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
):
    """
    Submit a typed teacher observation for NLP processing.
    Supports Hindi (transliterated) and English.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    processed = voice_processor.process_text(observation_text, language)

    observation = TeacherObservation(
        id=str(uuid.uuid4()),
        student_id=student_id,
        teacher_id=teacher_id,
        observation_date=datetime.now().date(),
        observation_type="text",
        original_text=observation_text,
        transcribed_text=observation_text,
        language=language,
        sentiment=processed.get("sentiment", "neutral"),
        concern_level=processed.get("concern_level", "low"),
        extracted_insights=processed.get("extracted_insights", {}),
        processing_confidence=processed.get("confidence", 0.5),
    )
    db.add(observation)
    db.commit()
    db.refresh(observation)

    if processed.get("concern_level") in ("high", "critical"):
        background_tasks.add_task(
            _broadcast_concern_alert,
            teacher_id=teacher_id,
            student_name=student.name,
            concern_level=processed["concern_level"],
            transcribed_text=processed.get("transcribed_text", ""),
        )

    return {
        "observation_id":  str(observation.id),
        "student_id":      student_id,
        "student_name":    student.name,
        "processed":       processed,
        "observation_saved": True,
    }


# ─────────────────────────────────────────────────────────────────────────────
# WebSocket — real-time alert stream
# ─────────────────────────────────────────────────────────────────────────────

@router.websocket("/ws/alerts/{teacher_id}")
async def websocket_alerts(websocket: WebSocket, teacher_id: str):
    """
    WebSocket endpoint for real-time risk/concern alerts.

    Connect: ws://host/api/voice/ws/alerts/{teacher_id}

    Receives JSON payloads:
      { "type": "risk_alert" | "concern_alert", "student_name": ..., ... }
    """
    await manager.connect(websocket, teacher_id)
    try:
        # Keep connection alive; receive optional client pings
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        manager.disconnect(websocket, teacher_id)


# ─────────────────────────────────────────────────────────────────────────────
# Background helper
# ─────────────────────────────────────────────────────────────────────────────

async def _broadcast_concern_alert(
    teacher_id: str,
    student_name: str,
    concern_level: str,
    transcribed_text: str,
):
    """Push a concern alert to the teacher's WebSocket connection(s)."""
    await manager.send_to_teacher(teacher_id, {
        "type":             "concern_alert",
        "student_name":     student_name,
        "concern_level":    concern_level,
        "observation_text": transcribed_text[:200],
        "timestamp":        datetime.now().isoformat(),
    })