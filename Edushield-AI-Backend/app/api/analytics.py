# app/api/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.models.student import Student
from app.models.risk_predictions import RiskPrediction
from app.models.interventions import Intervention
from app.models.school_health_metrics import SchoolHealthMetric

router = APIRouter()

@router.get("/dashboard/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """
    Get overall school health dashboard
    
    Returns key metrics for admin dashboard
    """
    total_students = db.query(Student).filter(Student.is_active == True).count()
    
    # At-risk students
    critical_students = db.query(RiskPrediction).filter(
        RiskPrediction.is_active == True,
        RiskPrediction.risk_level == 'critical'
    ).count()
    
    high_risk_students = db.query(RiskPrediction).filter(
        RiskPrediction.is_active == True,
        RiskPrediction.risk_level == 'high'
    ).count()
    
    moderate_risk_students = db.query(RiskPrediction).filter(
        RiskPrediction.is_active == True,
        RiskPrediction.risk_level == 'moderate'
    ).count()
    
    # Pending interventions
    pending_interventions = db.query(Intervention).filter(
        Intervention.status.in_(['recommended', 'planned'])
    ).count()
    
    # Intervention success rate (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    completed_interventions = db.query(Intervention).filter(
        Intervention.status == 'completed',
        Intervention.completed_date >= thirty_days_ago
    ).all()
    
    if completed_interventions:
        successful = sum(1 for i in completed_interventions 
                        if i.outcome in ['successful', 'partially_successful'])
        success_rate = (successful / len(completed_interventions)) * 100
    else:
        success_rate = 0.0
    
    return {
        'total_students': total_students,
        'at_risk_summary': {
            'critical': critical_students,
            'high': high_risk_students,
            'moderate': moderate_risk_students,
            'total_at_risk': critical_students + high_risk_students + moderate_risk_students
        },
        'interventions': {
            'pending': pending_interventions,
            'success_rate_30d': round(success_rate, 1)
        },
        'overall_health_score': calculate_school_health_score(
            total_students,
            critical_students + high_risk_students + moderate_risk_students
        ),
        'last_updated': datetime.now().isoformat()
    }

@router.get("/dashboard/trends")
def get_risk_trends(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get risk trend over time"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Group by date and risk level
    trends = db.query(
        RiskPrediction.prediction_date,
        RiskPrediction.risk_level,
        func.count(RiskPrediction.id).label('count')
    ).filter(
        RiskPrediction.prediction_date >= cutoff_date.date()
    ).group_by(
        RiskPrediction.prediction_date,
        RiskPrediction.risk_level
    ).order_by(RiskPrediction.prediction_date).all()
    
    # Format for charting
    trend_data = {}
    for date, level, count in trends:
        date_str = date.isoformat()
        if date_str not in trend_data:
            trend_data[date_str] = {'critical': 0, 'high': 0, 'moderate': 0, 'low': 0}
        trend_data[date_str][level] = count
    
    return {
        'period_days': days,
        'trends': trend_data
    }

@router.get("/dashboard/class-breakdown")
def get_class_breakdown(db: Session = Depends(get_db)):
    """Get risk breakdown by class"""
    students_by_class = db.query(
        Student.class_,
        func.count(Student.id).label('total')
    ).filter(Student.is_active == True).group_by(Student.class_).all()
    
    class_data = []
    for class_name, total in students_by_class:
        # Get at-risk count for this class
        at_risk = db.query(RiskPrediction).join(Student).filter(
            Student.class_ == class_name,
            RiskPrediction.is_active == True,
            RiskPrediction.risk_level.in_(['moderate', 'high', 'critical'])
        ).count()
        
        class_data.append({
            'class': class_name,
            'total_students': total,
            'at_risk_students': at_risk,
            'at_risk_percentage': round((at_risk / total * 100), 1) if total > 0 else 0
        })
    
    return {
        'class_breakdown': sorted(class_data, key=lambda x: x['at_risk_percentage'], reverse=True)
    }

@router.get("/reports/intervention-effectiveness")
def intervention_effectiveness_report(
    days: int = 90,
    db: Session = Depends(get_db)
):
    """Analyze intervention effectiveness"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    interventions = db.query(Intervention).filter(
        Intervention.status == 'completed',
        Intervention.completed_date >= cutoff_date.date()
    ).all()
    
    # Group by intervention type
    effectiveness = {}
    for intervention in interventions:
        itype = intervention.intervention_type
        if itype not in effectiveness:
            effectiveness[itype] = {
                'total': 0,
                'successful': 0,
                'partially_successful': 0,
                'unsuccessful': 0
            }
        
        effectiveness[itype]['total'] += 1
        outcome = intervention.outcome or 'unknown'
        if outcome in effectiveness[itype]:
            effectiveness[itype][outcome] += 1
    
    # Calculate success rates
    for itype, data in effectiveness.items():
        if data['total'] > 0:
            success_rate = ((data['successful'] + data['partially_successful'] * 0.5) / data['total']) * 100
            data['success_rate'] = round(success_rate, 1)
    
    return {
        'period_days': days,
        'total_interventions': len(interventions),
        'effectiveness_by_type': effectiveness
    }

def calculate_school_health_score(total_students: int, at_risk_students: int) -> float:
    """Calculate overall school health score (0-100)"""
    if total_students == 0:
        return 100.0
    
    at_risk_percentage = (at_risk_students / total_students) * 100
    
    # Score = 100 - (at_risk_percentage * 2)
    # So if 10% are at risk, score = 80
    health_score = max(0, 100 - (at_risk_percentage * 2))
    
    return round(health_score, 1)


@router.get("/dashboard/engagement-overview")
def engagement_overview(
    class_filter: str = None,
    db: Session = Depends(get_db)
):
    """
    Aggregate engagement statistics across the school.
    Returns per-class engagement distribution for heatmap rendering.
    """
    from app.models.engagement_logs import EngagementLog
    from app.models.student import Student as StudentModel
    from sqlalchemy import func as sqlfunc
    from datetime import datetime, timedelta

    cutoff = datetime.now().date() - timedelta(days=30)

    query = (
        db.query(
            StudentModel.class_,
            sqlfunc.avg(EngagementLog.participation_score).label("avg_participation"),
            sqlfunc.avg(EngagementLog.questions_asked).label("avg_questions"),
            sqlfunc.count(EngagementLog.id).label("record_count"),
        )
        .join(EngagementLog, EngagementLog.student_id == StudentModel.id)
        .filter(StudentModel.is_active == True, EngagementLog.date >= cutoff)
    )

    if class_filter:
        query = query.filter(StudentModel.class_ == class_filter)

    results = query.group_by(StudentModel.class_).all()

    return {
        "period_days": 30,
        "class_engagement": [
            {
                "class":            r.class_,
                "avg_participation": round(float(r.avg_participation or 0), 3),
                "avg_questions":    round(float(r.avg_questions or 0), 3),
                "record_count":     r.record_count,
                "engagement_level": (
                    "high"   if (r.avg_participation or 0) >= 0.65 else
                    "medium" if (r.avg_participation or 0) >= 0.40 else
                    "low"
                ),
            }
            for r in results
        ],
    }


@router.get("/dashboard/teacher-burnout-heatmap")
def teacher_burnout_heatmap(db: Session = Depends(get_db)):
    """
    Return burnout scores for every active teacher.
    Used to render the teacher heatmap on the admin dashboard.
    """
    from app.models.teacher import Teacher
    from app.models.teacher_workload import TeacherWorkload
    from app.models.interventions import Intervention
    from app.models.risk_predictions import RiskPrediction
    from app.ai_engine.teacher_burnout_analyzer import TeacherBurnoutAnalyzer

    analyzer = TeacherBurnoutAnalyzer()
    teachers = db.query(Teacher).filter(Teacher.is_active == True).all()

    results = []
    for teacher in teachers:
        workload_records = (
            db.query(TeacherWorkload)
            .filter(TeacherWorkload.teacher_id == teacher.id)
            .order_by(TeacherWorkload.date.desc())
            .limit(60)
            .all()
        )
        interventions_handled = (
            db.query(Intervention)
            .filter(Intervention.assigned_to == teacher.id)
            .all()
        )
        at_risk_count = (
            db.query(RiskPrediction)
            .filter(
                RiskPrediction.is_active == True,
                RiskPrediction.risk_level.in_(["high", "critical"]),
            )
            .count()
        )

        teacher_data = {
            "workload": [
                {
                    "date":                   w.date,
                    "classes_taught":         w.classes_taught,
                    "assignments_corrected":  w.assignments_corrected,
                    "interventions_handled":  w.interventions_handled,
                    "hours_worked":           float(w.hours_worked or 0),
                    "stress_level":           w.stress_level,
                }
                for w in workload_records
            ],
            "interventions_handled": [
                {"status": i.status, "outcome": i.outcome}
                for i in interventions_handled
            ],
            "at_risk_students_count": at_risk_count,
        }

        burnout = analyzer.analyze_burnout_risk(teacher_data)
        results.append({
            "teacher_id":   str(teacher.id),
            "teacher_name": teacher.name,
            "subject":      teacher.subject,
            **burnout,
        })

    results.sort(key=lambda x: x["burnout_score"], reverse=True)
    return {"teachers": results, "generated_at": datetime.now().isoformat()}


@router.get("/dashboard/wellbeing-trend")
def wellbeing_trend(days: int = 60, db: Session = Depends(get_db)):
    """
    Return a time-series of average risk scores and engagement over the
    requested period — used to plot the 'school wellbeing' line chart.
    """
    from app.models.risk_predictions import RiskPrediction
    from app.models.engagement_logs import EngagementLog
    from sqlalchemy import func as sqlfunc

    cutoff = (datetime.now() - timedelta(days=days)).date()

    risk_series = (
        db.query(
            RiskPrediction.prediction_date.label("date"),
            sqlfunc.avg(RiskPrediction.risk_score).label("avg_risk"),
            sqlfunc.count(RiskPrediction.id).label("count"),
        )
        .filter(RiskPrediction.prediction_date >= cutoff)
        .group_by(RiskPrediction.prediction_date)
        .order_by(RiskPrediction.prediction_date)
        .all()
    )

    engagement_series = (
        db.query(
            EngagementLog.date.label("date"),
            sqlfunc.avg(EngagementLog.participation_score).label("avg_engagement"),
        )
        .filter(EngagementLog.date >= cutoff)
        .group_by(EngagementLog.date)
        .order_by(EngagementLog.date)
        .all()
    )

    eng_map = {str(r.date): float(r.avg_engagement or 0) for r in engagement_series}

    timeline = []
    for r in risk_series:
        date_str = str(r.date)
        timeline.append({
            "date":           date_str,
            "avg_risk_score": round(float(r.avg_risk or 0), 4),
            "engagement":     round(eng_map.get(date_str, 0), 4),
            "wellbeing":      round(1.0 - float(r.avg_risk or 0), 4),  # inverse of risk
            "student_count":  r.count,
        })

    return {"period_days": days, "timeline": timeline}


@router.get("/dashboard/school-health-score")
def school_health_score_breakdown(db: Session = Depends(get_db)):
    """
    Return a weighted school health score with component breakdown.

    Components
    ----------
    attendance_health   30 %
    academic_health     30 %
    engagement_health   20 %
    intervention_health 20 %
    """
    from app.models.attendance import Attendance
    from app.models.performance import Performance
    from app.models.engagement_logs import EngagementLog
    from sqlalchemy import func as sqlfunc

    cutoff = (datetime.now() - timedelta(days=30)).date()

    # Attendance health
    total_att  = db.query(Attendance).filter(Attendance.date >= cutoff).count() or 1
    present    = db.query(Attendance).filter(Attendance.date >= cutoff, Attendance.status == "present").count()
    att_health = round((present / total_att) * 100, 1)

    # Academic health (avg marks %)
    perfs = db.query(Performance).filter(Performance.assessment_date >= cutoff).all()
    if perfs:
        pcts = [
            (float(p.obtained_marks) / float(p.max_marks)) * 100
            for p in perfs if p.max_marks and float(p.max_marks) > 0
        ]
        acad_health = round(sum(pcts) / len(pcts), 1) if pcts else 0
    else:
        acad_health = 0

    # Engagement health
    avg_eng = db.query(
        sqlfunc.avg(EngagementLog.participation_score)
    ).filter(EngagementLog.date >= cutoff).scalar()
    eng_health = round(float(avg_eng or 0) * 100, 1)

    # Intervention health (success rate)
    from app.models.interventions import Intervention
    completed = db.query(Intervention).filter(
        Intervention.status == "completed",
        Intervention.completed_date >= cutoff,
    ).all()
    if completed:
        successful = sum(1 for i in completed if i.outcome in ["successful", "partially_successful"])
        int_health = round((successful / len(completed)) * 100, 1)
    else:
        int_health = 50.0  # neutral default

    # Weighted composite
    composite = round(
        att_health  * 0.30 +
        acad_health * 0.30 +
        eng_health  * 0.20 +
        int_health  * 0.20,
        1,
    )

    return {
        "composite_score":  composite,
        "grade":            "A" if composite >= 80 else "B" if composite >= 65 else "C" if composite >= 50 else "D",
        "components": {
            "attendance_health":    att_health,
            "academic_health":      acad_health,
            "engagement_health":    eng_health,
            "intervention_health":  int_health,
        },
        "weights": {"attendance": 0.30, "academic": 0.30, "engagement": 0.20, "intervention": 0.20},
        "period_days": 30,
        "generated_at": datetime.now().isoformat(),
    }