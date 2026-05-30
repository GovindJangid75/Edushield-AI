# app/services/escalation_service.py
"""
Escalation Service — Periodic background task that:
1. Detects overdue interventions and bumps their priority
2. Flags students at critical risk without active interventions
3. Creates escalation Alert records for the notification system
"""
import uuid
import logging
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session

from app.models.alerts import Alert
from app.models.interventions import Intervention
from app.models.risk_predictions import RiskPrediction
from app.models.student import Student

logger = logging.getLogger("edushield_ai.escalation_service")

PRIORITY_ESCALATION = {
    "low": "medium",
    "medium": "high",
    "high": "critical",
    "critical": "critical",
}


def run_escalation_check(db: Session):
    """
    Execute one escalation scan cycle.
    Called periodically by the background scheduler.
    """
    escalation_count = 0

    # ── 1. Overdue Interventions ─────────────────────────────────────────
    overdue = (
        db.query(Intervention)
        .filter(
            Intervention.status.in_(["recommended", "planned", "in_progress"]),
            Intervention.scheduled_date != None,
            Intervention.scheduled_date < date.today(),
        )
        .all()
    )

    for intervention in overdue:
        days_overdue = (date.today() - intervention.scheduled_date).days

        # Only escalate if not already escalated recently (check for existing alert)
        existing_alert = (
            db.query(Alert)
            .filter(
                Alert.entity_id == intervention.id,
                Alert.alert_type == "intervention_overdue",
                Alert.is_resolved == False,
            )
            .first()
        )

        if existing_alert:
            continue  # Already has an active escalation alert

        # Bump priority
        old_priority = intervention.priority or "medium"
        new_priority = PRIORITY_ESCALATION.get(old_priority, "critical")
        intervention.priority = new_priority
        intervention.updated_at = datetime.utcnow()

        # Look up student name for the alert message
        student = db.query(Student).filter(Student.id == intervention.student_id).first()
        student_name = student.name if student else "Unknown student"

        alert = Alert(
            id=str(uuid.uuid4()),
            alert_type="intervention_overdue",
            severity=new_priority,
            entity_type="intervention",
            entity_id=str(intervention.id),
            title=f"Overdue intervention: {intervention.intervention_type}",
            message=(
                f"Intervention for {student_name} was scheduled for "
                f"{intervention.scheduled_date.isoformat()} and is now {days_overdue} day(s) overdue. "
                f"Priority escalated from {old_priority} to {new_priority}."
            ),
            assigned_to=intervention.assigned_to,
            is_read=False,
            is_resolved=False,
        )
        db.add(alert)
        escalation_count += 1

    # ── 2. Critical students without active interventions ────────────────
    critical_predictions = (
        db.query(RiskPrediction)
        .filter(
            RiskPrediction.is_active == True,
            RiskPrediction.risk_level == "critical",
        )
        .all()
    )

    for pred in critical_predictions:
        # Check if this student already has an active intervention
        active_intervention = (
            db.query(Intervention)
            .filter(
                Intervention.student_id == pred.student_id,
                Intervention.status.in_(["recommended", "planned", "in_progress"]),
            )
            .first()
        )

        if active_intervention:
            continue  # Already being handled

        # Check if we already have an unresolved alert for this
        existing_alert = (
            db.query(Alert)
            .filter(
                Alert.entity_id == pred.student_id,
                Alert.alert_type == "risk_escalation",
                Alert.is_resolved == False,
            )
            .first()
        )

        if existing_alert:
            continue

        student = db.query(Student).filter(Student.id == pred.student_id).first()
        student_name = student.name if student else "Unknown student"

        alert = Alert(
            id=str(uuid.uuid4()),
            alert_type="risk_escalation",
            severity="critical",
            entity_type="student",
            entity_id=str(pred.student_id),
            title=f"Critical risk: {student_name} has no active intervention",
            message=(
                f"{student_name} has been at CRITICAL risk (score: {pred.risk_score:.0%}) "
                f"since {pred.prediction_date.isoformat() if pred.prediction_date else 'recently'} "
                f"but has no active intervention assigned. Immediate action required."
            ),
            is_read=False,
            is_resolved=False,
        )
        db.add(alert)
        escalation_count += 1

    db.commit()

    logger.info(
        f"Escalation check complete: {len(overdue)} overdue interventions scanned, "
        f"{len(critical_predictions)} critical students checked, "
        f"{escalation_count} new escalation alerts created."
    )

    return {"escalations_created": escalation_count}
