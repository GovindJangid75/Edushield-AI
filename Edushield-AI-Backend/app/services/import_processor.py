# app/services/import_processor.py
"""
CSV / Excel Import Processor

Handles parsing, validation, column-mapping and bulk-insertion
of attendance, assessment, and student enrollment spreadsheets.
"""
import csv
import io
import uuid
import logging
from datetime import datetime, date
from typing import Dict, List, Tuple, Optional

from sqlalchemy.orm import Session

logger = logging.getLogger("edushield_ai.import_processor")


# ---------------------------------------------------------------------------
# Column mapping — fuzzy-match common Indian school spreadsheet headers
# ---------------------------------------------------------------------------

ATTENDANCE_COLUMN_MAP = {
    # target_column: list of acceptable header names (lowered)
    "student_id": ["student_id", "student id", "admission_no", "admission no", "roll_no", "roll no", "id", "stu_id"],
    "date":       ["date", "attendance_date", "att_date", "day"],
    "status":     ["status", "attendance", "present_absent", "present/absent", "att_status", "p/a"],
    "reason":     ["reason", "remark", "remarks", "note", "comment"],
}

ASSESSMENT_COLUMN_MAP = {
    "student_id":       ["student_id", "student id", "admission_no", "roll_no", "id"],
    "subject":          ["subject", "sub", "subject_name"],
    "assessment_type":  ["type", "assessment_type", "exam_type", "test_type"],
    "assessment_name":  ["name", "assessment_name", "exam_name", "test_name", "exam"],
    "max_marks":        ["max_marks", "total_marks", "total", "max", "out_of"],
    "obtained_marks":   ["obtained_marks", "marks", "score", "obtained", "marks_obtained"],
    "assessment_date":  ["date", "assessment_date", "exam_date", "test_date"],
}

STUDENT_COLUMN_MAP = {
    "student_id":     ["student_id", "student id", "admission_no", "roll_no", "id"],
    "name":           ["name", "student_name", "full_name", "student name"],
    "class_":         ["class", "class_", "grade", "standard", "std"],
    "section":        ["section", "sec", "division", "div"],
    "gender":         ["gender", "sex", "m/f"],
    "phone":          ["phone", "mobile", "contact", "parent_phone", "guardian_phone"],
    "date_of_birth":  ["dob", "date_of_birth", "birth_date", "birthdate"],
    "address":        ["address", "addr", "location"],
}


def _normalize_header(header: str) -> str:
    """Lowercase, strip whitespace/special chars."""
    return header.strip().lower().replace("-", "_").replace(".", "_")


def _map_columns(headers: List[str], column_map: Dict[str, List[str]]) -> Dict[str, Optional[int]]:
    """
    Map spreadsheet column headers to our target fields.
    Returns {target_field: column_index} or None if not found.
    """
    normalized = [_normalize_header(h) for h in headers]
    mapping: Dict[str, Optional[int]] = {}

    for target_field, acceptable_names in column_map.items():
        mapping[target_field] = None
        for acceptable in acceptable_names:
            if acceptable in normalized:
                mapping[target_field] = normalized.index(acceptable)
                break

    return mapping


def _parse_date(value: str) -> Optional[date]:
    """Try several common date formats used in Indian schools."""
    if not value or not value.strip():
        return None
    value = value.strip()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d", "%d.%m.%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def _parse_float(value: str) -> Optional[float]:
    """Safely parse a float."""
    if not value or not value.strip():
        return None
    try:
        return float(value.strip())
    except ValueError:
        return None


def _normalize_status(value: str) -> str:
    """Normalize attendance status to one of: present, absent, late, excused."""
    v = value.strip().lower()
    if v in ("p", "present", "1", "yes", "y"):
        return "present"
    if v in ("a", "absent", "0", "no", "n"):
        return "absent"
    if v in ("l", "late", "tardy"):
        return "late"
    if v in ("e", "excused", "ex"):
        return "excused"
    return "absent"  # default


# ---------------------------------------------------------------------------
# File readers
# ---------------------------------------------------------------------------

def read_csv_rows(file_bytes: bytes) -> Tuple[List[str], List[List[str]]]:
    """Read a CSV file and return (headers, rows)."""
    text = file_bytes.decode("utf-8-sig")  # handles BOM
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        return [], []
    return rows[0], rows[1:]


def read_excel_rows(file_bytes: bytes) -> Tuple[List[str], List[List[str]]]:
    """Read an Excel file and return (headers, rows)."""
    try:
        import openpyxl
    except ImportError:
        raise ImportError("openpyxl is required for Excel imports. Install with: pip install openpyxl")

    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    ws = wb.active
    all_rows = []
    for row in ws.iter_rows(values_only=True):
        all_rows.append([str(cell) if cell is not None else "" for cell in row])
    wb.close()

    if not all_rows:
        return [], []
    return all_rows[0], all_rows[1:]


def read_file(file_bytes: bytes, filename: str) -> Tuple[List[str], List[List[str]]]:
    """Detect file type and read."""
    lower = filename.lower()
    if lower.endswith((".xlsx", ".xls")):
        return read_excel_rows(file_bytes)
    return read_csv_rows(file_bytes)


# ---------------------------------------------------------------------------
# Processors
# ---------------------------------------------------------------------------

def process_attendance_import(
    file_bytes: bytes,
    filename: str,
    db: Session,
) -> Dict:
    """
    Parse attendance CSV/Excel and bulk-insert into the attendance table.
    Returns summary dict with row counts and errors.
    """
    from app.models.attendance import Attendance
    from app.models.student import Student

    headers, rows = read_file(file_bytes, filename)
    col_map = _map_columns(headers, ATTENDANCE_COLUMN_MAP)

    if col_map["student_id"] is None:
        return {"success": False, "error": "Could not find a student ID column. Expected one of: student_id, admission_no, roll_no"}
    if col_map["date"] is None:
        return {"success": False, "error": "Could not find a date column. Expected one of: date, attendance_date"}
    if col_map["status"] is None:
        return {"success": False, "error": "Could not find a status column. Expected one of: status, attendance, present_absent"}

    # Cache student lookup
    all_students = db.query(Student).filter(Student.is_active == True).all()
    student_lookup = {s.student_id: s.id for s in all_students}

    processed = 0
    failed = 0
    skipped = 0
    errors: List[str] = []

    for row_idx, row in enumerate(rows, start=2):
        try:
            if not any(cell.strip() for cell in row):
                skipped += 1
                continue

            raw_sid = row[col_map["student_id"]].strip()
            raw_date = row[col_map["date"]].strip()
            raw_status = row[col_map["status"]].strip()

            # Resolve student
            internal_id = student_lookup.get(raw_sid)
            if not internal_id:
                errors.append(f"Row {row_idx}: Student ID '{raw_sid}' not found in system")
                failed += 1
                continue

            att_date = _parse_date(raw_date)
            if not att_date:
                errors.append(f"Row {row_idx}: Invalid date '{raw_date}'")
                failed += 1
                continue

            status = _normalize_status(raw_status)
            reason = row[col_map["reason"]].strip() if col_map["reason"] is not None and col_map["reason"] < len(row) else None

            # Check for duplicate
            existing = db.query(Attendance).filter(
                Attendance.student_id == internal_id,
                Attendance.date == att_date,
            ).first()
            if existing:
                existing.status = status
                if reason:
                    existing.reason = reason
                processed += 1
                continue

            record = Attendance(
                id=str(uuid.uuid4()),
                student_id=internal_id,
                date=att_date,
                status=status,
                reason=reason,
            )
            db.add(record)
            processed += 1

        except Exception as e:
            errors.append(f"Row {row_idx}: {str(e)}")
            failed += 1

    db.commit()

    return {
        "success": True,
        "rows_processed": processed,
        "rows_failed": failed,
        "rows_skipped": skipped,
        "total_rows": len(rows),
        "errors": errors[:20],  # cap errors list
        "column_mapping": {k: headers[v] if v is not None else None for k, v in col_map.items()},
    }


def process_assessment_import(
    file_bytes: bytes,
    filename: str,
    db: Session,
) -> Dict:
    """Parse assessment CSV/Excel and bulk-insert into the performance table."""
    from app.models.performance import Performance
    from app.models.student import Student

    headers, rows = read_file(file_bytes, filename)
    col_map = _map_columns(headers, ASSESSMENT_COLUMN_MAP)

    if col_map["student_id"] is None:
        return {"success": False, "error": "Could not find a student ID column."}
    if col_map["obtained_marks"] is None:
        return {"success": False, "error": "Could not find a marks/score column."}

    all_students = db.query(Student).filter(Student.is_active == True).all()
    student_lookup = {s.student_id: s.id for s in all_students}

    processed = 0
    failed = 0
    skipped = 0
    errors: List[str] = []

    for row_idx, row in enumerate(rows, start=2):
        try:
            if not any(cell.strip() for cell in row):
                skipped += 1
                continue

            raw_sid = row[col_map["student_id"]].strip()
            internal_id = student_lookup.get(raw_sid)
            if not internal_id:
                errors.append(f"Row {row_idx}: Student ID '{raw_sid}' not found")
                failed += 1
                continue

            obtained = _parse_float(row[col_map["obtained_marks"]])
            if obtained is None:
                errors.append(f"Row {row_idx}: Invalid marks value")
                failed += 1
                continue

            max_marks = _parse_float(row[col_map["max_marks"]]) if col_map["max_marks"] is not None else 100.0
            subject = row[col_map["subject"]].strip() if col_map["subject"] is not None and col_map["subject"] < len(row) else "General"
            a_type = row[col_map["assessment_type"]].strip() if col_map["assessment_type"] is not None and col_map["assessment_type"] < len(row) else "exam"
            a_name = row[col_map["assessment_name"]].strip() if col_map["assessment_name"] is not None and col_map["assessment_name"] < len(row) else "Uploaded Assessment"
            a_date_raw = row[col_map["assessment_date"]].strip() if col_map["assessment_date"] is not None and col_map["assessment_date"] < len(row) else ""
            a_date = _parse_date(a_date_raw) or date.today()

            record = Performance(
                id=str(uuid.uuid4()),
                student_id=internal_id,
                subject=subject,
                assessment_type=a_type,
                assessment_name=a_name,
                max_marks=max_marks or 100.0,
                obtained_marks=obtained,
                assessment_date=a_date,
            )
            db.add(record)
            processed += 1

        except Exception as e:
            errors.append(f"Row {row_idx}: {str(e)}")
            failed += 1

    db.commit()

    return {
        "success": True,
        "rows_processed": processed,
        "rows_failed": failed,
        "rows_skipped": skipped,
        "total_rows": len(rows),
        "errors": errors[:20],
        "column_mapping": {k: headers[v] if v is not None else None for k, v in col_map.items()},
    }


def process_student_import(
    file_bytes: bytes,
    filename: str,
    db: Session,
) -> Dict:
    """Parse student enrollment CSV/Excel and bulk-insert."""
    from app.models.student import Student

    headers, rows = read_file(file_bytes, filename)
    col_map = _map_columns(headers, STUDENT_COLUMN_MAP)

    if col_map["student_id"] is None:
        return {"success": False, "error": "Could not find a student ID column."}
    if col_map["name"] is None:
        return {"success": False, "error": "Could not find a student name column."}

    existing_ids = {s.student_id for s in db.query(Student.student_id).all()}

    processed = 0
    failed = 0
    skipped = 0
    errors: List[str] = []

    for row_idx, row in enumerate(rows, start=2):
        try:
            if not any(cell.strip() for cell in row):
                skipped += 1
                continue

            raw_sid = row[col_map["student_id"]].strip()
            raw_name = row[col_map["name"]].strip()

            if not raw_sid or not raw_name:
                errors.append(f"Row {row_idx}: Missing student ID or name")
                failed += 1
                continue

            if raw_sid in existing_ids:
                skipped += 1
                continue

            class_val = row[col_map["class_"]].strip() if col_map["class_"] is not None and col_map["class_"] < len(row) else ""
            section = row[col_map["section"]].strip() if col_map["section"] is not None and col_map["section"] < len(row) else "A"
            gender = row[col_map["gender"]].strip() if col_map["gender"] is not None and col_map["gender"] < len(row) else ""
            phone = row[col_map["phone"]].strip() if col_map["phone"] is not None and col_map["phone"] < len(row) else ""
            dob_raw = row[col_map["date_of_birth"]].strip() if col_map["date_of_birth"] is not None and col_map["date_of_birth"] < len(row) else ""
            address = row[col_map["address"]].strip() if col_map["address"] is not None and col_map["address"] < len(row) else ""

            student = Student(
                id=str(uuid.uuid4()),
                student_id=raw_sid,
                name=raw_name,
                class_=class_val,
                section=section,
                gender=gender.upper()[:1] if gender else None,
                phone=phone,
                date_of_birth=_parse_date(dob_raw),
                address=address,
                enrollment_date=date.today(),
                is_active=True,
            )
            db.add(student)
            existing_ids.add(raw_sid)
            processed += 1

        except Exception as e:
            errors.append(f"Row {row_idx}: {str(e)}")
            failed += 1

    db.commit()

    return {
        "success": True,
        "rows_processed": processed,
        "rows_failed": failed,
        "rows_skipped": skipped,
        "total_rows": len(rows),
        "errors": errors[:20],
        "column_mapping": {k: headers[v] if v is not None else None for k, v in col_map.items()},
    }
