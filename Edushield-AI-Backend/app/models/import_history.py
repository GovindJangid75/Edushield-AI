# app/models/import_history.py
from sqlalchemy import Column, String, Integer, DateTime, Text
from datetime import datetime
import uuid

from app.database import Base


class ImportHistory(Base):
    __tablename__ = "import_history"

    id              = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    upload_type     = Column(String(50), nullable=False)    # attendance, assessments, students
    filename        = Column(String(500), nullable=False)
    rows_processed  = Column(Integer, default=0)
    rows_failed     = Column(Integer, default=0)
    rows_skipped    = Column(Integer, default=0)
    status          = Column(String(20), default='processing')  # processing, completed, failed
    uploaded_by     = Column(String(36))                     # teacher_id or admin identifier
    error_summary   = Column(Text)
    created_at      = Column(DateTime, default=datetime.utcnow)
    completed_at    = Column(DateTime)
