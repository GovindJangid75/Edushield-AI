# app/api/alerts.py
"""
Alerts API — endpoints for listing, reading, and resolving alerts
surfaced by the risk engine, escalation service, and intervention system.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.alerts import Alert

router = APIRouter()


@router.get("/")
def list_alerts(
    severity: Optional[str] = None,
    is_read: Optional[bool] = None,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    """List alerts, optionally filtered by severity and read status."""
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)
    alerts = query.order_by(desc(Alert.created_at)).limit(limit).all()

    return {
        "total": len(alerts),
        "alerts": [
            {
                "id": str(a.id),
                "alert_type": a.alert_type,
                "severity": a.severity,
                "entity_type": a.entity_type,
                "entity_id": a.entity_id,
                "title": a.title,
                "message": a.message,
                "is_read": a.is_read,
                "is_resolved": a.is_resolved,
                "assigned_to": a.assigned_to,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            }
            for a in alerts
        ],
    }


@router.get("/unread/count")
def unread_count(db: Session = Depends(get_db)):
    """Quick count of unread alerts for the notification badge."""
    count = db.query(Alert).filter(Alert.is_read == False).count()
    critical = db.query(Alert).filter(Alert.is_read == False, Alert.severity == "critical").count()
    return {"unread_count": count, "critical_count": critical}


@router.patch("/{alert_id}/read")
def mark_alert_read(alert_id: str, db: Session = Depends(get_db)):
    """Mark an alert as read."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"message": "Alert marked as read", "id": alert_id}


@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    """Resolve an alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    alert.is_read = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Alert resolved", "id": alert_id}


@router.get("/escalations")
def list_escalations(db: Session = Depends(get_db)):
    """List all active (unresolved) escalation alerts."""
    escalations = (
        db.query(Alert)
        .filter(
            Alert.alert_type.in_(["escalation", "intervention_overdue", "risk_escalation"]),
            Alert.is_resolved == False,
        )
        .order_by(desc(Alert.created_at))
        .all()
    )
    return {
        "total": len(escalations),
        "escalations": [
            {
                "id": str(a.id),
                "alert_type": a.alert_type,
                "severity": a.severity,
                "title": a.title,
                "message": a.message,
                "entity_type": a.entity_type,
                "entity_id": a.entity_id,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in escalations
        ],
    }
