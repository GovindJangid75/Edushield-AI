# app/ai_engine/risk_categorizer.py
from typing import Dict, List
from datetime import datetime, timedelta

class RiskCategorizer:
    """
    Hospital-style triage system for student risk prioritization
    
    Categories:
    🔴 CRITICAL - Immediate intervention needed
    🟠 HIGH RISK - Intervention within 3 days
    🟡 MODERATE RISK - Intervention within 1 week
    🟢 STABLE - Continue monitoring
    """
    
    def __init__(self):
        self.triage_rules = {
            'critical': {
                'color': '🔴',
                'priority': 1,
                'response_time_hours': 24,
                'criteria': [
                    'dropout_risk >= 0.75',
                    'absence_streak >= 7',
                    'marks_below_30',
                    'teacher_critical_concern',
                    'multiple_red_flags >= 3'
                ]
            },
            'high': {
                'color': '🟠',
                'priority': 2,
                'response_time_hours': 72,
                'criteria': [
                    'dropout_risk >= 0.60',
                    'absence_streak >= 4',
                    'sharp_decline_detected',
                    'teacher_high_concern',
                    'multiple_red_flags >= 2'
                ]
            },
            'moderate': {
                'color': '🟡',
                'priority': 3,
                'response_time_hours': 168,
                'criteria': [
                    'dropout_risk >= 0.40',
                    'gradual_decline_detected',
                    'hidden_student_detected',
                    'teacher_moderate_concern'
                ]
            },
            'stable': {
                'color': '🟢',
                'priority': 4,
                'response_time_hours': None,
                'criteria': [
                    'dropout_risk < 0.40',
                    'no_concerning_patterns'
                ]
            }
        }
    
    def categorize_risk(self,
                        dropout_prediction: Dict,
                        hidden_detection: Dict,
                        student_data: Dict = None) -> Dict:
        """
        Public API: categorize student risk level.
        Alias for categorize() — accepts optional student_data.
        """
        return self.categorize(dropout_prediction, hidden_detection, student_data or {})

    def categorize(self, 
                   dropout_prediction: Dict,
                   hidden_detection: Dict,
                   student_data: Dict) -> Dict:
        """
        Categorize student risk level using triage rules
        
        Returns:
            {
                'category': str,
                'priority': int,
                'color': str,
                'response_time_hours': int,
                'matched_criteria': list,
                'urgency_score': float,
                'escalation_reason': str
            }
        """
        risk_score = dropout_prediction.get('risk_score', 0)
        hidden_score = hidden_detection.get('hidden_score', 0)
        
        # Extract key metrics
        metrics = self._extract_metrics(student_data)
        
        # Check each category (from critical to stable)
        matched_category = None
        matched_criteria = []
        
        for category in ['critical', 'high', 'moderate', 'stable']:
            criteria_met = self._check_criteria(
                category, 
                risk_score, 
                hidden_score, 
                metrics
            )
            
            if criteria_met:
                matched_category = category
                matched_criteria = criteria_met
                break
        
        if not matched_category:
            matched_category = 'stable'
        
        # Calculate urgency score
        urgency_score = self._calculate_urgency(
            matched_category,
            risk_score,
            metrics
        )
        
        # Generate escalation reason
        escalation_reason = self._generate_escalation_reason(
            matched_criteria,
            metrics
        )
        
        triage_info = self.triage_rules[matched_category]
        
        return {
            'category': matched_category,
            'priority': triage_info['priority'],
            'color': triage_info['color'],
            'response_time_hours': triage_info['response_time_hours'],
            'matched_criteria': matched_criteria,
            'urgency_score': float(urgency_score),
            'escalation_reason': escalation_reason
        }
    
    def _extract_metrics(self, student_data: Dict) -> Dict:
        """Extract key metrics for triage"""
        metrics = {}
        
        # Attendance
        attendance = student_data.get('attendance', [])
        if attendance:
            recent_30d = [a for a in attendance 
                         if (datetime.now().date() - a.get('date', datetime.now().date())).days <= 30]
            
            # Calculate absence streak
            sorted_att = sorted(attendance, key=lambda x: x.get('date', datetime.min), reverse=True)
            streak = 0
            for record in sorted_att:
                if record.get('status') == 'absent':
                    streak += 1
                else:
                    break
            metrics['absence_streak'] = streak
            
            # Attendance rate
            if recent_30d:
                present = sum(1 for a in recent_30d if a.get('status') == 'present')
                metrics['attendance_rate_30d'] = present / len(recent_30d)
            else:
                metrics['attendance_rate_30d'] = 1.0
        
        # Performance
        performance = student_data.get('performance', [])
        if performance:
            recent_perf = sorted(performance, 
                               key=lambda x: x.get('assessment_date', datetime.min), 
                               reverse=True)[:5]
            
            percentages = []
            for p in recent_perf:
                if p.get('max_marks', 0) > 0:
                    pct = (p.get('obtained_marks', 0) / p['max_marks']) * 100
                    percentages.append(pct)
            
            metrics['avg_marks_recent'] = sum(percentages) / len(percentages) if percentages else 0
            
            # Check for sharp decline
            if len(percentages) >= 3:
                recent_avg = sum(percentages[:2]) / 2
                earlier_avg = sum(percentages[2:]) / len(percentages[2:])
                if earlier_avg > 0:
                    decline_pct = ((earlier_avg - recent_avg) / earlier_avg) * 100
                    metrics['performance_decline_pct'] = decline_pct
                else:
                    metrics['performance_decline_pct'] = 0
        
        # Teacher observations
        observations = student_data.get('observations', [])
        metrics['high_concern_count'] = sum(
            1 for o in observations 
            if o.get('concern_level') in ['high', 'critical']
        )
        metrics['critical_concern_count'] = sum(
            1 for o in observations 
            if o.get('concern_level') == 'critical'
        )
        
        return metrics
    
    def _check_criteria(self, 
                       category: str, 
                       risk_score: float, 
                       hidden_score: float,
                       metrics: Dict) -> List[str]:
        """Check if criteria for category are met"""
        matched = []
        
        if category == 'critical':
            if risk_score >= 0.75:
                matched.append('dropout_risk >= 0.75')
            if metrics.get('absence_streak', 0) >= 7:
                matched.append('absence_streak >= 7 days')
            if metrics.get('avg_marks_recent', 100) < 30:
                matched.append('marks_below_30')
            if metrics.get('critical_concern_count', 0) > 0:
                matched.append('teacher_critical_concern')
            
            # Multiple red flags
            red_flags = 0
            if metrics.get('attendance_rate_30d', 1) < 0.5:
                red_flags += 1
            if metrics.get('performance_decline_pct', 0) > 30:
                red_flags += 1
            if metrics.get('high_concern_count', 0) > 2:
                red_flags += 1
            if hidden_score > 0.7:
                red_flags += 1
            
            if red_flags >= 3:
                matched.append(f'multiple_red_flags ({red_flags})')
            
            return matched if len(matched) >= 2 else []
        
        elif category == 'high':
            if risk_score >= 0.60:
                matched.append('dropout_risk >= 0.60')
            if metrics.get('absence_streak', 0) >= 4:
                matched.append('absence_streak >= 4 days')
            if metrics.get('performance_decline_pct', 0) > 25:
                matched.append('sharp_performance_decline')
            if metrics.get('high_concern_count', 0) > 0:
                matched.append('teacher_high_concern')
            
            return matched if len(matched) >= 2 else []
        
        elif category == 'moderate':
            if risk_score >= 0.40:
                matched.append('dropout_risk >= 0.40')
            if metrics.get('performance_decline_pct', 0) > 15:
                matched.append('gradual_decline_detected')
            if hidden_score > 0.5:
                matched.append('hidden_student_detected')
            if metrics.get('high_concern_count', 0) > 0:
                matched.append('teacher_concern_noted')
            
            return matched if matched else []
        
        else:  # stable
            if risk_score < 0.40:
                matched.append('dropout_risk < 0.40')
            return matched
    
    def _calculate_urgency(self, category: str, risk_score: float, metrics: Dict) -> float:
        """Calculate urgency score (0-1)"""
        base_urgency = {
            'critical': 0.9,
            'high': 0.7,
            'moderate': 0.4,
            'stable': 0.1
        }
        
        urgency = base_urgency.get(category, 0.1)
        
        # Boost urgency based on specific factors
        if metrics.get('absence_streak', 0) >= 10:
            urgency = min(1.0, urgency + 0.1)
        
        if metrics.get('critical_concern_count', 0) > 0:
            urgency = min(1.0, urgency + 0.05)
        
        if metrics.get('avg_marks_recent', 100) < 25:
            urgency = min(1.0, urgency + 0.05)
        
        return urgency
    
    def _generate_escalation_reason(self, criteria: List[str], metrics: Dict) -> str:
        """Generate human-readable escalation reason"""
        if not criteria:
            return "No immediate concerns"
        
        reasons = []
        
        for criterion in criteria:
            if 'dropout_risk' in criterion:
                reasons.append("High AI-predicted dropout risk")
            elif 'absence_streak' in criterion:
                days = metrics.get('absence_streak', 0)
                reasons.append(f"Absent for {days} consecutive days")
            elif 'marks_below' in criterion:
                avg = metrics.get('avg_marks_recent', 0)
                reasons.append(f"Recent marks critically low ({avg:.1f}%)")
            elif 'decline' in criterion:
                pct = metrics.get('performance_decline_pct', 0)
                reasons.append(f"Performance declined {pct:.1f}%")
            elif 'concern' in criterion:
                reasons.append("Teacher flagged concerns")
            elif 'hidden' in criterion:
                reasons.append("Silent disengagement detected")
        
        return " | ".join(reasons[:3])  # Top 3 reasons