# app/services/realtime_monitor.py
"""
Real-time Monitor — Background service that periodically scans all students
and triggers alerts for newly detected risks.

Architecture:
  • Uses Redis as a lightweight message broker / cache layer
  • Stores latest risk scores per student in Redis (30-minute TTL)
  • Broadcasts alert payloads via Redis Pub/Sub so any connected WebSocket
    client receives them immediately
  • Runs as a background task inside FastAPI (or as a standalone Celery worker)

WebSocket flow:
  Client → ws://host/ws/alerts/{teacher_id}
    ← JSON alert payload whenever a student risk changes or a new alert fires
"""
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set

logger = logging.getLogger("edushield_ai.realtime_monitor")


# ─────────────────────────────────────────────────────────────────────────────
# Redis helpers (lazy import so the app still starts without Redis)
# ─────────────────────────────────────────────────────────────────────────────

def _get_redis_client():
    """Return a synchronous Redis client, or None if Redis is unavailable."""
    try:
        import redis as redis_lib
        from app.config import get_settings
        settings = get_settings()
        # Add 1.0s connect/socket timeouts so startup never hangs if Redis is offline
        client = redis_lib.from_url(
            settings.REDIS_URL, 
            decode_responses=True,
            socket_timeout=1.0,
            socket_connect_timeout=1.0
        )
        client.ping()
        return client
    except Exception as exc:
        logger.warning(f"Redis not available: {exc}. Real-time features degraded.")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# In-process WebSocket connection manager
# ─────────────────────────────────────────────────────────────────────────────

class ConnectionManager:
    """
    Manages active WebSocket connections grouped by teacher_id.
    Allows broadcasting targeted alerts to specific teachers.
    """

    def __init__(self):
        # teacher_id → set of WebSocket connections
        self.active_connections: Dict[str, Set] = {}

    async def connect(self, websocket, teacher_id: str):
        await websocket.accept()
        self.active_connections.setdefault(teacher_id, set()).add(websocket)
        logger.info(f"WS connected: teacher={teacher_id}")

    def disconnect(self, websocket, teacher_id: str):
        conns = self.active_connections.get(teacher_id, set())
        conns.discard(websocket)
        if not conns:
            self.active_connections.pop(teacher_id, None)
        logger.info(f"WS disconnected: teacher={teacher_id}")

    async def send_to_teacher(self, teacher_id: str, message: Dict):
        payload = json.dumps(message)
        dead = set()
        for ws in list(self.active_connections.get(teacher_id, set())):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.active_connections.get(teacher_id, set()).discard(ws)

    async def broadcast(self, message: Dict):
        """Send to ALL connected teachers."""
        for teacher_id in list(self.active_connections.keys()):
            await self.send_to_teacher(teacher_id, message)


# Module-level singleton used by the voice and alert API routers
manager = ConnectionManager()


# ─────────────────────────────────────────────────────────────────────────────
# Real-time Monitor Service
# ─────────────────────────────────────────────────────────────────────────────

class RealtimeMonitor:
    """
    Background monitoring service.

    Core responsibilities
    ---------------------
    1. Cache risk scores in Redis to detect *changes* between scan cycles.
    2. Publish Redis Pub/Sub events when risk escalates.
    3. Expose helper methods for the alert API to push instant notifications.
    """

    RISK_SCORE_TTL_SECONDS = 3600      # 1-hour cache TTL
    SCAN_INTERVAL_SECONDS  = 300       # Re-scan every 5 minutes
    ESCALATION_DELTA       = 0.10      # Alert if score rises by ≥10%

    RISK_LEVEL_ORDER = {'stable': 0, 'low': 1, 'moderate': 2, 'high': 3, 'critical': 4}

    def __init__(self):
        self.redis = _get_redis_client()
        self._running = False

    # ── Cache helpers ────────────────────────────────────────────────────

    def cache_risk_score(self, student_id: str, score: float, risk_level: str):
        """Persist latest risk score to Redis."""
        if not self.redis:
            return
        key = f"edushield:risk:{student_id}"
        payload = json.dumps({
            'score':      score,
            'risk_level': risk_level,
            'timestamp':  datetime.now().isoformat(),
        })
        self.redis.setex(key, self.RISK_SCORE_TTL_SECONDS, payload)

    def get_cached_risk(self, student_id: str) -> Optional[Dict]:
        """Retrieve cached risk data for a student."""
        if not self.redis:
            return None
        key = f"edushield:risk:{student_id}"
        raw = self.redis.get(key)
        return json.loads(raw) if raw else None

    def has_risk_escalated(self, student_id: str, new_score: float, new_level: str) -> bool:
        """Return True if the student's risk has materially worsened since last cache."""
        prev = self.get_cached_risk(student_id)
        if not prev:
            return False  # No baseline — don't alert on first scan

        prev_score = float(prev.get('score', 0))
        prev_level = prev.get('risk_level', 'stable')

        score_escalated = (new_score - prev_score) >= self.ESCALATION_DELTA
        level_escalated = (
            self.RISK_LEVEL_ORDER.get(new_level, 0) >
            self.RISK_LEVEL_ORDER.get(prev_level, 0)
        )
        return score_escalated or level_escalated

    # ── Redis Pub/Sub ────────────────────────────────────────────────────

    def publish_alert(self, channel: str, payload: Dict):
        """Publish an alert to a Redis Pub/Sub channel."""
        if not self.redis:
            return
        self.redis.publish(channel, json.dumps(payload))

    def publish_student_risk_alert(self, student_id: str, student_name: str,
                                   risk_level: str, risk_score: float,
                                   teacher_id: Optional[str] = None):
        """Publish a student risk escalation alert."""
        payload = {
            'event':        'student_risk_escalation',
            'student_id':   student_id,
            'student_name': student_name,
            'risk_level':   risk_level,
            'risk_score':   risk_score,
            'timestamp':    datetime.now().isoformat(),
        }
        channel = f"edushield:alerts:{teacher_id}" if teacher_id else "edushield:alerts:global"
        self.publish_alert(channel, payload)
        logger.info(f"Risk alert published: student={student_name}, level={risk_level}")

    # ── School-level metrics cache ───────────────────────────────────────

    def get_school_overview_cache(self) -> Optional[Dict]:
        if not self.redis:
            return None
        raw = self.redis.get("edushield:school:overview")
        return json.loads(raw) if raw else None

    def set_school_overview_cache(self, data: Dict, ttl: int = 300):
        if not self.redis:
            return
        self.redis.setex("edushield:school:overview", ttl, json.dumps(data, default=str))

    # ── Background scan loop ─────────────────────────────────────────────

    async def start_monitoring(self, db_session_factory):
        """
        Start continuous background monitoring.
        Call this from the FastAPI `startup` event with a session factory.

        Example in main.py:
            @app.on_event("startup")
            async def startup():
                from app.database import SessionLocal
                asyncio.create_task(monitor.start_monitoring(SessionLocal))
        """
        self._running = True
        logger.info("Real-time monitor started.")
        while self._running:
            try:
                await self._scan_cycle(db_session_factory)
            except Exception as exc:
                logger.error(f"Monitor scan error: {exc}")
            await asyncio.sleep(self.SCAN_INTERVAL_SECONDS)

    def stop(self):
        self._running = False
        logger.info("Real-time monitor stopped.")

    async def _scan_cycle(self, db_session_factory):
        """One complete scan of all active students."""
        from app.models.student import Student
        from app.models.risk_predictions import RiskPrediction
        from app.ml_models.risk_predictor import RiskPredictor

        db = db_session_factory()
        predictor = RiskPredictor()

        try:
            active_students = db.query(Student).filter(Student.is_active == True).limit(500).all()
            escalations = []

            for student in active_students:
                # Build minimal student_data from DB (attendance/performance already in DB)
                student_data = {
                    'student_id':   str(student.id),
                    'student_info': {'name': student.name, 'class': student.class_},
                    'attendance':   [],
                    'performance':  [],
                    'homework':     [],
                    'engagement':   [],
                    'observations': [],
                }

                quick_score = predictor.quick_score(student_data)
                latest_pred = (
                    db.query(RiskPrediction)
                    .filter(RiskPrediction.student_id == student.id, RiskPrediction.is_active == True)
                    .order_by(RiskPrediction.created_at.desc())
                    .first()
                )
                risk_level = latest_pred.risk_level if latest_pred else 'stable'

                if self.has_risk_escalated(str(student.id), quick_score, risk_level):
                    escalations.append({
                        'student_id':   str(student.id),
                        'student_name': student.name,
                        'risk_level':   risk_level,
                        'risk_score':   quick_score,
                    })

                self.cache_risk_score(str(student.id), quick_score, risk_level)

            # Broadcast escalation alerts via WebSocket
            for esc in escalations:
                await manager.broadcast({
                    'type':    'risk_alert',
                    **esc,
                    'timestamp': datetime.now().isoformat(),
                })
                self.publish_student_risk_alert(**esc)

            logger.info(
                f"Scan complete: {len(active_students)} students, "
                f"{len(escalations)} escalations."
            )

        finally:
            db.close()


# Module-level singleton
monitor = RealtimeMonitor()
