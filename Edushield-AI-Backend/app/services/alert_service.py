# app/services/alert_service.py
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.models.alerts import Alert
from app.models.interventions import Intervention


class AlertService:
    """Service for managing alerts and notifications."""

    def create_intervention_alert(self, intervention: Intervention, db: Session):
        """Create alert for new intervention assignment."""
        alert = Alert(
            id=uuid.uuid4(),
            alert_type='intervention_assigned',
            severity=intervention.priority,
            entity_type='intervention',
            entity_id=intervention.id,
            title=f"New {intervention.priority} priority intervention assigned",
            message=f"Intervention: {intervention.intervention_type} for student",
            assigned_to=intervention.assigned_to,
            is_read=False,
            is_resolved=False
        )
        db.add(alert)
        db.commit()

    def create_risk_alert(self, student_id: str, risk_level: str, message: str, db: Session):
        """Create alert for high-risk student."""
        alert = Alert(
            id=uuid.uuid4(),
            alert_type='student_risk',
            severity=risk_level,
            entity_type='student',
            entity_id=student_id,
            title=f"Student at {risk_level.upper()} risk",
            message=message,
            is_read=False,
            is_resolved=False
        )
        db.add(alert)
        db.commit()

    def get_unread_alerts(self, teacher_id: str, db: Session):
        """Get unread alerts for a teacher."""
        return db.query(Alert).filter(
            Alert.assigned_to == teacher_id,
            Alert.is_read == False
        ).order_by(Alert.created_at.desc()).all()

    def mark_alert_read(self, alert_id: str, db: Session):
        """Mark alert as read."""
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.is_read = True
            db.commit()

    def resolve_alert(self, alert_id: str, db: Session):
        """Resolve an alert."""
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.is_resolved = True
            alert.resolved_at = datetime.utcnow()
            db.commit()
