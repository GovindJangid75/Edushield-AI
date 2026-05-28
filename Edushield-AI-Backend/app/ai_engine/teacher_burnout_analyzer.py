# app/ai_engine/teacher_burnout_analyzer.py
import numpy as np
from typing import Dict, List
from datetime import datetime, timedelta

class TeacherBurnoutAnalyzer:
    """
    Analyze teacher workload and detect burnout risk
    
    Teachers are the heroes - we need to protect them too!
    """
    
    def __init__(self):
        self.workload_thresholds = {
            'classes_per_day': 6,
            'students_per_teacher': 50,
            'interventions_per_week': 10,
            'working_hours_per_day': 8
        }
        
        self.burnout_indicators = {
            'excessive_workload': 0.3,
            'high_stress_reports': 0.25,
            'too_many_at_risk_students': 0.2,
            'long_working_hours': 0.15,
            'low_intervention_success': 0.1
        }
    
    def analyze_burnout_risk(self, teacher_data: Dict) -> Dict:
        """
        Analyze teacher burnout risk
        
        Returns:
            {
                'burnout_risk': str,  # low, moderate, high, critical
                'burnout_score': float,
                'contributing_factors': dict,
                'recommendations': list,
                'support_needed': list
            }
        """
        workload = teacher_data.get('workload', [])
        interventions = teacher_data.get('interventions_handled', [])
        students_at_risk = teacher_data.get('at_risk_students_count', 0)
        
        # Calculate burnout score
        factors = {}
        
        # Workload factor
        factors['excessive_workload'] = self._calculate_workload_factor(workload)
        
        # Stress factor
        factors['high_stress_reports'] = self._calculate_stress_factor(workload)
        
        # Student burden factor
        factors['too_many_at_risk_students'] = self._calculate_student_burden_factor(students_at_risk)
        
        # Working hours factor
        factors['long_working_hours'] = self._calculate_hours_factor(workload)
        
        # Success rate factor (low success = more burnout)
        factors['low_intervention_success'] = self._calculate_success_factor(interventions)
        
        # Calculate weighted burnout score
        burnout_score = sum(
            factors[indicator] * weight 
            for indicator, weight in self.burnout_indicators.items()
        )
        
        # Categorize risk
        burnout_risk = self._categorize_burnout(burnout_score)
        
        # Generate recommendations
        recommendations = self._generate_teacher_support(factors, burnout_risk)
        
        # Support needed
        support_needed = self._identify_support_needs(factors)
        
        return {
            'burnout_risk': burnout_risk,
            'burnout_score': float(burnout_score),
            'contributing_factors': {k: float(v) for k, v in factors.items()},
            'recommendations': recommendations,
            'support_needed': support_needed,
            'analysis_date': datetime.now().isoformat()
        }
    
    def _calculate_workload_factor(self, workload: List[Dict]) -> float:
        """Calculate workload burden factor"""
        if not workload:
            return 0.0
        
        recent_workload = [w for w in workload 
                          if (datetime.now().date() - w.get('date', datetime.now().date())).days <= 30]
        
        if not recent_workload:
            return 0.0
        
        # Average daily workload metrics
        avg_classes = np.mean([w.get('classes_taught', 0) for w in recent_workload])
        avg_assignments = np.mean([w.get('assignments_corrected', 0) for w in recent_workload])
        avg_interventions = np.mean([w.get('interventions_handled', 0) for w in recent_workload])
        
        # Normalize against thresholds
        classes_burden = min(1.0, avg_classes / self.workload_thresholds['classes_per_day'])
        interventions_burden = min(1.0, (avg_interventions * 7) / self.workload_thresholds['interventions_per_week'])
        
        # Combined burden
        workload_factor = (classes_burden * 0.4 + interventions_burden * 0.6)
        return workload_factor
    
    def _calculate_stress_factor(self, workload: List[Dict]) -> float:
        """Calculate stress level factor"""
        if not workload:
            return 0.0
        
        recent_workload = [w for w in workload 
                          if (datetime.now().date() - w.get('date', datetime.now().date())).days <= 14]
        
        if not recent_workload:
            return 0.0
        
        stress_map = {'low': 0.1, 'moderate': 0.4, 'high': 0.7, 'critical': 1.0}
        stress_scores = [stress_map.get(w.get('stress_level', 'moderate'), 0.4) 
                        for w in recent_workload]
        
        return np.mean(stress_scores)
    
    def _calculate_student_burden_factor(self, students_at_risk: int) -> float:
        """Calculate burden from at-risk students"""
        # More than 10 at-risk students is high burden
        burden = min(1.0, students_at_risk / 10)
        return burden
    
    def _calculate_hours_factor(self, workload: List[Dict]) -> float:
        """Calculate long working hours factor"""
        if not workload:
            return 0.0
        
        recent_workload = [w for w in workload 
                          if (datetime.now().date() - w.get('date', datetime.now().date())).days <= 30]
        
        if not recent_workload:
            return 0.0
        
        avg_hours = np.mean([w.get('hours_worked', 8) for w in recent_workload])
        
        # Normalize (8 hours = normal, 12+ = critical)
        hours_factor = min(1.0, max(0.0, (avg_hours - 8) / 4))
        return hours_factor
    
    def _calculate_success_factor(self, interventions: List[Dict]) -> float:
        """Calculate factor based on intervention success rate"""
        if not interventions:
            return 0.0
        
        completed = [i for i in interventions if i.get('status') == 'completed']
        
        if not completed:
            return 0.5  # No data = moderate concern
        
        successful = sum(1 for i in completed 
                        if i.get('outcome') in ['successful', 'partially_successful'])
        
        success_rate = successful / len(completed)
        
        # Low success rate = higher burnout (inverted)
        return 1.0 - success_rate
    
    def _categorize_burnout(self, score: float) -> str:
        """Categorize burnout risk level"""
        if score >= 0.75:
            return 'critical'
        elif score >= 0.55:
            return 'high'
        elif score >= 0.35:
            return 'moderate'
        else:
            return 'low'
    
    def _generate_teacher_support(self, factors: Dict, risk_level: str) -> List[str]:
        """Generate support recommendations for teacher"""
        recommendations = []
        
        if factors['excessive_workload'] > 0.6:
            recommendations.append("Redistribute workload: Assign some classes to other teachers temporarily")
            recommendations.append("Provide teaching assistant or student volunteer support")
        
        if factors['too_many_at_risk_students'] > 0.6:
            recommendations.append("Form intervention support team - don't handle all at-risk cases alone")
            recommendations.append("Leverage peer mentoring to reduce direct intervention burden")
        
        if factors['high_stress_reports'] > 0.6:
            recommendations.append("Schedule mandatory wellness break")
            recommendations.append("Provide access to counseling/mental health support")
        
        if factors['long_working_hours'] > 0.5:
            recommendations.append("Enforce work-hour limits: No work after 6 PM")
            recommendations.append("Automate repetitive tasks (attendance, grading with rubrics)")
        
        if factors['low_intervention_success'] > 0.5:
            recommendations.append("Provide intervention training workshop")
            recommendations.append("Pair with mentor teacher for guidance")
        
        if risk_level == 'critical':
            recommendations.insert(0, "🚨 URGENT: Immediate administrative support required")
            recommendations.insert(1, "Consider temporary leave or reduced responsibilities")
        
        return recommendations
    
    def _identify_support_needs(self, factors: Dict) -> List[str]:
        """Identify specific support needs"""
        needs = []
        
        top_factors = sorted(factors.items(), key=lambda x: x[1], reverse=True)[:3]
        
        for factor, value in top_factors:
            if value > 0.5:
                if 'workload' in factor:
                    needs.append("Additional teaching staff or workload distribution")
                elif 'stress' in factor:
                    needs.append("Mental health and wellness support")
                elif 'students' in factor:
                    needs.append("Intervention team or counselor support")
                elif 'hours' in factor:
                    needs.append("Task automation and time management tools")
                elif 'success' in factor:
                    needs.append("Professional development and mentorship")
        
        return needs