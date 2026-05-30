# app/api/reports.py
"""
Reports API — Downloadable CSV/JSON reports for school administrators
and NGO auditors. Monthly summaries, risk reports, and intervention logs.
"""
import io
import csv
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.student import Student
from app.models.risk_predictions import RiskPrediction
from app.models.interventions import Intervention
from app.models.attendance import Attendance
from app.models.performance import Performance

router = APIRouter()


def _csv_response(rows: list, headers: list, filename: str) -> StreamingResponse:
    """Build a streaming CSV download response."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/monthly-summary")
def monthly_summary_report(
    days: int = Query(default=30, le=365),
    format: str = Query(default="json"),
    db: Session = Depends(get_db),
):
    """
    Monthly school summary: total students, at-risk counts,
    attendance rates, intervention stats.
    """
    cutoff = (datetime.now() - timedelta(days=days)).date()

    total_students = db.query(Student).filter(Student.is_active == True).count()

    risk_counts = {}
    for level in ["critical", "high", "moderate", "low"]:
        risk_counts[level] = (
            db.query(RiskPrediction)
            .filter(RiskPrediction.is_active == True, RiskPrediction.risk_level == level)
            .count()
        )

    total_att = db.query(Attendance).filter(Attendance.date >= cutoff).count() or 1
    present = db.query(Attendance).filter(Attendance.date >= cutoff, Attendance.status == "present").count()
    attendance_rate = round((present / total_att) * 100, 1)

    total_interventions = db.query(Intervention).filter(Intervention.created_at >= datetime.combine(cutoff, datetime.min.time())).count()
    completed_interventions = db.query(Intervention).filter(
        Intervention.status == "completed",
        Intervention.completed_date >= cutoff,
    ).count()

    summary = {
        "report_period_days": days,
        "generated_at": datetime.now().isoformat(),
        "total_active_students": total_students,
        "risk_distribution": risk_counts,
        "total_at_risk": sum(risk_counts.values()),
        "attendance_rate_percent": attendance_rate,
        "total_interventions_created": total_interventions,
        "interventions_completed": completed_interventions,
    }

    if format == "csv":
        rows = [[k, str(v)] for k, v in summary.items() if k != "risk_distribution"]
        for level, count in risk_counts.items():
            rows.append([f"risk_{level}", str(count)])
        return _csv_response(rows, ["metric", "value"], f"edushield_monthly_summary_{days}d.csv")

    return summary


@router.get("/student-risk")
def student_risk_report(
    format: str = Query(default="json"),
    db: Session = Depends(get_db),
):
    """Export all at-risk students with their current scores."""
    results = (
        db.query(Student, RiskPrediction)
        .join(RiskPrediction, RiskPrediction.student_id == Student.id)
        .filter(
            Student.is_active == True,
            RiskPrediction.is_active == True,
            RiskPrediction.risk_level.in_(["critical", "high", "moderate"]),
        )
        .order_by(RiskPrediction.risk_score.desc())
        .all()
    )

    data = []
    for student, pred in results:
        row = {
            "student_id": student.student_id,
            "name": student.name,
            "class": student.class_,
            "section": student.section,
            "risk_level": pred.risk_level,
            "risk_score": round(pred.risk_score, 3) if pred.risk_score else 0,
            "confidence": round(pred.confidence_score, 3) if pred.confidence_score else 0,
            "risk_category": pred.risk_category,
            "prediction_date": pred.prediction_date.isoformat() if pred.prediction_date else "",
        }
        data.append(row)

    if format == "csv":
        headers = ["student_id", "name", "class", "section", "risk_level", "risk_score", "confidence", "risk_category", "prediction_date"]
        rows = [[d[h] for h in headers] for d in data]
        return _csv_response(rows, headers, "edushield_student_risk_report.csv")

    return {"total": len(data), "students": data}


@router.get("/intervention-log")
def intervention_log_report(
    days: int = Query(default=90, le=365),
    format: str = Query(default="json"),
    db: Session = Depends(get_db),
):
    """Export intervention history with outcomes."""
    cutoff = datetime.now() - timedelta(days=days)

    interventions = (
        db.query(Intervention, Student)
        .join(Student, Student.id == Intervention.student_id)
        .filter(Intervention.created_at >= cutoff)
        .order_by(Intervention.created_at.desc())
        .all()
    )

    data = []
    for interv, student in interventions:
        row = {
            "intervention_id": str(interv.id)[:8],
            "student_id": student.student_id,
            "student_name": student.name,
            "class": student.class_,
            "intervention_type": interv.intervention_type,
            "priority": interv.priority,
            "status": interv.status,
            "recommended_by": interv.recommended_by,
            "scheduled_date": interv.scheduled_date.isoformat() if interv.scheduled_date else "",
            "completed_date": interv.completed_date.isoformat() if interv.completed_date else "",
            "outcome": interv.outcome or "",
            "created_at": interv.created_at.isoformat() if interv.created_at else "",
        }
        data.append(row)

    if format == "csv":
        headers = list(data[0].keys()) if data else ["intervention_id"]
        rows = [[d.get(h, "") for h in headers] for d in data]
        return _csv_response(rows, headers, f"edushield_intervention_log_{days}d.csv")

    return {"period_days": days, "total": len(data), "interventions": data}


@router.get("/attendance-summary")
def attendance_summary_report(
    days: int = Query(default=30, le=365),
    format: str = Query(default="json"),
    db: Session = Depends(get_db),
):
    """Per-student attendance summary for the given period."""
    cutoff = (datetime.now() - timedelta(days=days)).date()

    students = db.query(Student).filter(Student.is_active == True).all()
    data = []

    for student in students:
        total = db.query(Attendance).filter(Attendance.student_id == student.id, Attendance.date >= cutoff).count()
        present = db.query(Attendance).filter(
            Attendance.student_id == student.id,
            Attendance.date >= cutoff,
            Attendance.status == "present",
        ).count()
        absent = db.query(Attendance).filter(
            Attendance.student_id == student.id,
            Attendance.date >= cutoff,
            Attendance.status == "absent",
        ).count()

        rate = round((present / total) * 100, 1) if total > 0 else 0

        data.append({
            "student_id": student.student_id,
            "name": student.name,
            "class": student.class_,
            "section": student.section,
            "total_days": total,
            "present": present,
            "absent": absent,
            "attendance_rate": rate,
        })

    data.sort(key=lambda x: x["attendance_rate"])

    if format == "csv":
        headers = ["student_id", "name", "class", "section", "total_days", "present", "absent", "attendance_rate"]
        rows = [[d[h] for h in headers] for d in data]
        return _csv_response(rows, headers, f"edushield_attendance_summary_{days}d.csv")

    return {"period_days": days, "total_students": len(data), "students": data}
