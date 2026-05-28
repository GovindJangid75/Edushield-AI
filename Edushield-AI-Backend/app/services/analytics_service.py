# app/services/analytics_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, List
import numpy as np

from app.models.student import Student
from app.models.attendance import Attendance
from app.models.performance import Performance
from app.models.risk_predictions import RiskPrediction
from app.models.interventions import Intervention


class AnalyticsService:
    """Advanced analytics and reporting service."""

    def generate_school_health_report(self, db: Session, days: int = 30) -> Dict:
        cutoff_date = datetime.now() - timedelta(days=days)
        total_students = db.query(Student).filter(Student.is_active == True).count()
        attendance_stats = self._calculate_attendance_stats(db, cutoff_date)
        performance_stats = self._calculate_performance_stats(db, cutoff_date)
        risk_distribution = self._calculate_risk_distribution(db)
        intervention_stats = self._calculate_intervention_effectiveness(db, cutoff_date)
        trends = self._calculate_trends(db, days)
        return {
            'report_period_days': days,
            'generated_at': datetime.now().isoformat(),
            'total_students': total_students,
            'attendance': attendance_stats,
            'performance': performance_stats,
            'risk_distribution': risk_distribution,
            'interventions': intervention_stats,
            'trends': trends
        }

    def _calculate_attendance_stats(self, db: Session, cutoff_date: datetime) -> Dict:
        total_records = db.query(Attendance).filter(Attendance.date >= cutoff_date.date()).count()
        present_records = db.query(Attendance).filter(
            Attendance.date >= cutoff_date.date(), Attendance.status == 'present'
        ).count()
        absent_records = db.query(Attendance).filter(
            Attendance.date >= cutoff_date.date(), Attendance.status == 'absent'
        ).count()
        attendance_rate = (present_records / total_records * 100) if total_records > 0 else 0
        return {
            'overall_attendance_rate': round(attendance_rate, 2),
            'total_present': present_records,
            'total_absent': absent_records,
            'total_records': total_records
        }

    def _calculate_performance_stats(self, db: Session, cutoff_date: datetime) -> Dict:
        performances = db.query(Performance).filter(
            Performance.assessment_date >= cutoff_date.date()
        ).all()
        if not performances:
            return {'average_percentage': 0, 'total_assessments': 0}
        percentages = [
            float(p.obtained_marks) / float(p.max_marks) * 100
            for p in performances if p.max_marks and float(p.max_marks) > 0
        ]
        return {
            'average_percentage': round(np.mean(percentages), 2) if percentages else 0,
            'median_percentage': round(float(np.median(percentages)), 2) if percentages else 0,
            'total_assessments': len(performances),
            'students_below_50': sum(1 for p in percentages if p < 50)
        }

    def _calculate_risk_distribution(self, db: Session) -> Dict:
        risk_counts = db.query(
            RiskPrediction.risk_level, func.count(RiskPrediction.id).label('count')
        ).filter(RiskPrediction.is_active == True).group_by(RiskPrediction.risk_level).all()
        distribution = {level: 0 for level in ['critical', 'high', 'moderate', 'low', 'stable']}
        for level, count in risk_counts:
            if level in distribution:
                distribution[level] = count
        return distribution

    def _calculate_intervention_effectiveness(self, db: Session, cutoff_date: datetime) -> Dict:
        completed = db.query(Intervention).filter(
            Intervention.status == 'completed',
            Intervention.completed_date >= cutoff_date.date()
        ).all()
        if not completed:
            return {'success_rate': 0, 'total_completed': 0}
        successful = sum(1 for i in completed if i.outcome in ['successful', 'partially_successful'])
        success_rate = (successful / len(completed)) * 100
        return {
            'total_completed': len(completed),
            'successful': successful,
            'success_rate': round(success_rate, 2),
            'average_completion_time_days': self._calculate_avg_completion_time(completed)
        }

    def _calculate_avg_completion_time(self, interventions: List) -> float:
        times = []
        for i in interventions:
            if i.scheduled_date and i.completed_date:
                days = (i.completed_date - i.scheduled_date).days
                if days >= 0:
                    times.append(days)
        return round(np.mean(times), 1) if times else 0

    def _calculate_trends(self, db: Session, days: int) -> Dict:
        cutoff = datetime.now() - timedelta(days=days)
        predictions_by_week = db.query(
            func.date_trunc('week', RiskPrediction.prediction_date).label('week'),
            func.avg(RiskPrediction.risk_score).label('avg_risk')
        ).filter(
            RiskPrediction.prediction_date >= cutoff.date()
        ).group_by('week').order_by('week').all()
        weekly_trends = [
            {
                'week': week.isoformat() if week else None,
                'average_risk_score': float(avg_risk) if avg_risk else 0
            }
            for week, avg_risk in predictions_by_week
        ]
        return {'weekly_risk_trends': weekly_trends}
