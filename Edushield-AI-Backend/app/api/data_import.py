# app/api/data_import.py
"""
Data Import API — CSV/Excel upload endpoints for attendance,
assessments, and student enrollment spreadsheets.
"""
import io
import csv
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.import_history import ImportHistory
from app.services.import_processor import (
    process_attendance_import,
    process_assessment_import,
    process_student_import,
)

router = APIRouter()

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _validate_file(file: UploadFile):
    """Validate uploaded file type."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Accepted: {', '.join(ALLOWED_EXTENSIONS)}",
        )


@router.post("/attendance")
async def import_attendance(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload an attendance CSV/Excel file and bulk-import records."""
    _validate_file(file)
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10 MB.")

    # Create history record
    history = ImportHistory(
        id=str(uuid.uuid4()),
        upload_type="attendance",
        filename=file.filename,
        uploaded_by="admin",
        status="processing",
    )
    db.add(history)
    db.commit()

    result = process_attendance_import(file_bytes, file.filename, db)

    # Update history
    history.rows_processed = result.get("rows_processed", 0)
    history.rows_failed = result.get("rows_failed", 0)
    history.rows_skipped = result.get("rows_skipped", 0)
    history.status = "completed" if result.get("success") else "failed"
    history.error_summary = "; ".join(result.get("errors", [])[:10]) or None
    history.completed_at = datetime.utcnow()
    db.commit()

    return {
        "message": "Attendance import completed",
        "import_id": history.id,
        **result,
    }


@router.post("/assessments")
async def import_assessments(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload an assessment/marks CSV/Excel file and bulk-import records."""
    _validate_file(file)
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10 MB.")

    history = ImportHistory(
        id=str(uuid.uuid4()),
        upload_type="assessments",
        filename=file.filename,
        uploaded_by="admin",
        status="processing",
    )
    db.add(history)
    db.commit()

    result = process_assessment_import(file_bytes, file.filename, db)

    history.rows_processed = result.get("rows_processed", 0)
    history.rows_failed = result.get("rows_failed", 0)
    history.rows_skipped = result.get("rows_skipped", 0)
    history.status = "completed" if result.get("success") else "failed"
    history.error_summary = "; ".join(result.get("errors", [])[:10]) or None
    history.completed_at = datetime.utcnow()
    db.commit()

    return {
        "message": "Assessment import completed",
        "import_id": history.id,
        **result,
    }


@router.post("/students")
async def import_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a student enrollment CSV/Excel file and bulk-import records."""
    _validate_file(file)
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10 MB.")

    history = ImportHistory(
        id=str(uuid.uuid4()),
        upload_type="students",
        filename=file.filename,
        uploaded_by="admin",
        status="processing",
    )
    db.add(history)
    db.commit()

    result = process_student_import(file_bytes, file.filename, db)

    history.rows_processed = result.get("rows_processed", 0)
    history.rows_failed = result.get("rows_failed", 0)
    history.rows_skipped = result.get("rows_skipped", 0)
    history.status = "completed" if result.get("success") else "failed"
    history.error_summary = "; ".join(result.get("errors", [])[:10]) or None
    history.completed_at = datetime.utcnow()
    db.commit()

    return {
        "message": "Student enrollment import completed",
        "import_id": history.id,
        **result,
    }


@router.get("/history")
def get_import_history(
    upload_type: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    """List past import operations."""
    query = db.query(ImportHistory)
    if upload_type:
        query = query.filter(ImportHistory.upload_type == upload_type)
    records = query.order_by(ImportHistory.created_at.desc()).limit(limit).all()

    return {
        "imports": [
            {
                "id": r.id,
                "upload_type": r.upload_type,
                "filename": r.filename,
                "rows_processed": r.rows_processed,
                "rows_failed": r.rows_failed,
                "rows_skipped": r.rows_skipped,
                "status": r.status,
                "error_summary": r.error_summary,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "completed_at": r.completed_at.isoformat() if r.completed_at else None,
            }
            for r in records
        ]
    }


@router.get("/templates/{upload_type}")
def download_template(upload_type: str):
    """Download a blank CSV template for the given upload type."""
    templates = {
        "attendance": ["student_id", "date", "status", "reason"],
        "assessments": ["student_id", "subject", "assessment_type", "assessment_name", "max_marks", "obtained_marks", "date"],
        "students": ["student_id", "name", "class", "section", "gender", "phone", "date_of_birth", "address"],
    }

    if upload_type not in templates:
        raise HTTPException(status_code=400, detail=f"Unknown template type. Available: {', '.join(templates.keys())}")

    headers = templates[upload_type]

    # Build example rows
    example_rows = {
        "attendance": [
            ["STU-001", "2026-05-28", "present", ""],
            ["STU-002", "2026-05-28", "absent", "Sick leave"],
        ],
        "assessments": [
            ["STU-001", "Mathematics", "exam", "Midterm Exam", "100", "78", "2026-05-15"],
            ["STU-002", "Science", "quiz", "Unit Test 3", "50", "35", "2026-05-20"],
        ],
        "students": [
            ["STU-NEW-01", "Priya Kumari", "7", "A", "F", "9876543210", "2013-03-15", "Jaipur, Rajasthan"],
            ["STU-NEW-02", "Arjun Meena", "8", "B", "M", "9876543211", "2012-07-22", "Jodhpur, Rajasthan"],
        ],
    }

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    for row in example_rows.get(upload_type, []):
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=edushield_{upload_type}_template.csv"},
    )
