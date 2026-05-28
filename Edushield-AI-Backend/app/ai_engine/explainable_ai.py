# app/ai_engine/explainable_ai.py
import numpy as np
from typing import Dict, List, Tuple
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64

class ExplainableAI:
    """
    Make AI predictions explainable and trustworthy
    
    - Feature importance visualization
    - Decision reasoning
    - Confidence intervals
    - Human-readable explanations
    """
    
    def generate_explanation(self, 
                             prediction_data_or_dropout_risk: Dict,
                             hidden_patterns_or_student_data: Dict,
                             student_data: Dict = None) -> Dict:
        """
        Generate comprehensive explanation for a prediction.

        Can be called as:
          generate_explanation(prediction_data, student_data)          # legacy 2-arg
          generate_explanation(dropout_risk, hidden_patterns, student_data)  # 3-arg from students API
        """
        if student_data is None:
            # Legacy 2-arg call: (prediction_data, student_data)
            prediction_data = prediction_data_or_dropout_risk
            sd = hidden_patterns_or_student_data
        else:
            # 3-arg call: merge dropout_risk + hidden_patterns into a unified prediction dict
            dropout_risk = prediction_data_or_dropout_risk
            hidden_patterns = hidden_patterns_or_student_data
            sd = student_data
            prediction_data = {
                **dropout_risk,
                'hidden_patterns': hidden_patterns,
                'prediction_date': 'today',
            }

        risk_score = prediction_data.get('risk_score', 0)
        risk_level = prediction_data.get('risk_level', 'unknown')
        contributing_factors = prediction_data.get('contributing_factors', {})

        summary = self._generate_summary(risk_score, risk_level, sd)
        why = self._explain_prediction_reasoning(contributing_factors, sd)
        key_factors = self._format_key_factors(contributing_factors)
        what_changed = self._identify_recent_changes(sd)
        confidence_explanation = self._explain_confidence(
            prediction_data.get('confidence', 0.5),
            contributing_factors
        )
        visualizations = self._generate_visualizations(contributing_factors, sd)

        return {
            'summary': summary,
            'why_this_prediction': why,
            'key_factors': key_factors,
            'what_changed': what_changed,
            'confidence_explanation': confidence_explanation,
            'visualizations': visualizations,
            'prediction_details': {
                'risk_score': risk_score,
                'risk_level': risk_level,
                'prediction_date': prediction_data.get('prediction_date', 'unknown')
            }
        }

    
    def _generate_summary(self, risk_score: float, risk_level: str, student_data: Dict) -> str:
        """Generate plain-English summary"""
        student_name = student_data.get('name', 'Student')
        
        risk_descriptions = {
            'critical': f"{student_name} is at CRITICAL RISK of dropping out. Immediate intervention required.",
            'high': f"{student_name} is at HIGH RISK of disengagement. Action needed within 3 days.",
            'moderate': f"{student_name} shows MODERATE RISK signs. Monitor closely and plan intervention.",
            'low': f"{student_name} shows LOW RISK. Continue regular monitoring.",
            'stable': f"{student_name} is STABLE. No immediate concerns."
        }
        
        summary = risk_descriptions.get(risk_level, f"{student_name} risk level: {risk_level}")
        summary += f" (AI Confidence: {risk_score*100:.1f}%)"
        
        return summary
    
    def _explain_prediction_reasoning(self, factors: Dict, student_data: Dict) -> str:
        """Explain why AI made this prediction"""
        if not factors:
            return "Insufficient data for detailed reasoning."
        
        explanations = []
        
        # Get top 3 factors
        sorted_factors = sorted(factors.items(), 
                               key=lambda x: x[1]['importance'], 
                               reverse=True)[:3]
        
        for factor_name, factor_data in sorted_factors:
            importance_pct = factor_data['importance'] * 100
            value = factor_data['value']
            
            if 'attendance' in factor_name:
                if 'rate' in factor_name:
                    explanations.append(
                        f"Attendance rate of {value*100:.1f}% is concerning "
                        f"(contributes {importance_pct:.0f}% to risk score)"
                    )
                elif 'decline' in factor_name:
                    explanations.append(
                        f"Attendance declining at {value*100:.1f}% rate "
                        f"(contributes {importance_pct:.0f}% to risk)"
                    )
            
            elif 'marks' in factor_name:
                if 'decline' in factor_name:
                    explanations.append(
                        f"Academic performance declining by {value*100:.1f}% "
                        f"(contributes {importance_pct:.0f}% to risk)"
                    )
                else:
                    explanations.append(
                        f"Recent marks average at {value:.1f}% "
                        f"(contributes {importance_pct:.0f}% to risk)"
                    )
            
            elif 'homework' in factor_name:
                if 'completion' in factor_name:
                    explanations.append(
                        f"Homework completion rate only {value*100:.1f}% "
                        f"(contributes {importance_pct:.0f}% to risk)"
                    )
            
            elif 'participation' in factor_name:
                explanations.append(
                    f"Class participation very low ({value*100:.1f}%) "
                    f"(contributes {importance_pct:.0f}% to risk)"
                )
        
        reasoning = "AI identified these key patterns: " + " | ".join(explanations)
        return reasoning
    
    def _format_key_factors(self, factors: Dict) -> List[Dict]:
        """Format factors in user-friendly way"""
        formatted = []
        
        sorted_factors = sorted(factors.items(), 
                               key=lambda x: x[1]['importance'], 
                               reverse=True)[:5]
        
        for factor_name, factor_data in sorted_factors:
            # Make factor name human-readable
            readable_name = self._humanize_factor_name(factor_name)
            
            formatted.append({
                'factor': readable_name,
                'importance': f"{factor_data['importance']*100:.1f}%",
                'current_value': self._format_factor_value(factor_name, factor_data['value']),
                'status': self._get_factor_status(factor_name, factor_data['value'])
            })
        
        return formatted
    
    def _humanize_factor_name(self, factor_name: str) -> str:
        """Convert technical factor name to readable name"""
        name_map = {
            'attendance_rate_30d': 'Attendance (Last 30 Days)',
            'attendance_decline_rate': 'Attendance Trend',
            'avg_marks_30d': 'Recent Academic Performance',
            'marks_decline_rate': 'Academic Trend',
            'homework_completion_rate': 'Homework Completion',
            'homework_quality_avg': 'Homework Quality',
            'participation_score_avg': 'Class Participation',
            'questions_asked_avg': 'Question Asking Frequency',
            'teacher_concern_score': 'Teacher Concern Level',
            'absence_streak_max': 'Longest Absence Streak',
            'late_submission_rate': 'Late Submission Rate',
            'behavioral_flags_count': 'Behavioral Flags',
            'social_interaction_score': 'Social Engagement'
        }
        
        return name_map.get(factor_name, factor_name.replace('_', ' ').title())
    
    def _format_factor_value(self, factor_name: str, value: float) -> str:
        """Format factor value for display"""
        if 'rate' in factor_name or 'score' in factor_name:
            return f"{value*100:.1f}%"
        elif 'streak' in factor_name or 'count' in factor_name:
            return f"{int(value)} days" if 'streak' in factor_name else f"{int(value)}"
        elif 'marks' in factor_name:
            return f"{value:.1f}%"
        else:
            return f"{value:.2f}"
    
    def _get_factor_status(self, factor_name: str, value: float) -> str:
        """Get status emoji for factor"""
        # Define thresholds for different factors
        if 'attendance' in factor_name and 'decline' not in factor_name:
            if value >= 0.9:
                return '🟢 Good'
            elif value >= 0.75:
                return '🟡 Moderate'
            else:
                return '🔴 Poor'
        
        elif 'decline' in factor_name:
            if value >= 0.3:
                return '🔴 Steep Decline'
            elif value >= 0.15:
                return '🟡 Declining'
            else:
                return '🟢 Stable'
        
        elif 'marks' in factor_name:
            if value >= 75:
                return '🟢 Good'
            elif value >= 50:
                return '🟡 Average'
            else:
                return '🔴 Poor'
        
        elif 'homework' in factor_name:
            if value >= 0.8:
                return '🟢 Good'
            elif value >= 0.6:
                return '🟡 Moderate'
            else:
                return '🔴 Poor'
        
        else:
            return '⚪ Neutral'
    
    def _identify_recent_changes(self, student_data: Dict) -> str:
        """Identify what changed recently"""
        changes = []
        
        # Check attendance changes
        attendance = student_data.get('attendance', [])
        if attendance:
            recent_7d = [a for a in attendance[-7:]]
            absences_recent = sum(1 for a in recent_7d if a.get('status') == 'absent')
            if absences_recent >= 3:
                changes.append(f"Absent {absences_recent} times in last 7 days")
        
        # Check performance changes
        performance = student_data.get('performance', [])
        if len(performance) >= 2:
            recent = performance[-1]
            previous = performance[-2]
            
            if recent.get('max_marks', 0) > 0 and previous.get('max_marks', 0) > 0:
                recent_pct = (recent.get('obtained_marks', 0) / recent['max_marks']) * 100
                previous_pct = (previous.get('obtained_marks', 0) / previous['max_marks']) * 100
                
                diff = recent_pct - previous_pct
                if abs(diff) > 10:
                    direction = "improved" if diff > 0 else "dropped"
                    changes.append(f"Marks {direction} by {abs(diff):.1f}% in last assessment")
        
        # Check teacher observations
        observations = student_data.get('observations', [])
        recent_obs = [o for o in observations if o.get('concern_level') in ['high', 'critical']]
        if recent_obs:
            changes.append(f"Teacher flagged {len(recent_obs)} concerning observation(s) recently")
        
        if not changes:
            return "No significant recent changes detected"
        
        return " | ".join(changes)
    
    def _explain_confidence(self, confidence: float, factors: Dict) -> str:
        """Explain AI confidence level"""
        if confidence >= 0.8:
            explanation = "HIGH CONFIDENCE: Multiple strong indicators align consistently."
        elif confidence >= 0.6:
            explanation = "MODERATE CONFIDENCE: Several indicators present, but some variability."
        else:
            explanation = "LOWER CONFIDENCE: Limited data or conflicting indicators. Monitor closely."
        
        # Add factor count
        factor_count = len(factors)
        explanation += f" Based on {factor_count} analyzed factors."
        
        return explanation
    
    def _generate_visualizations(self, factors: Dict, student_data: Dict) -> Dict:
        """Generate base64 encoded visualizations"""
        visualizations = {}
        
        # 1. Factor importance bar chart
        if factors:
            visualizations['factor_importance'] = self._create_factor_chart(factors)
        
        # 2. Attendance trend
        attendance = student_data.get('attendance', [])
        if attendance:
            visualizations['attendance_trend'] = self._create_attendance_trend(attendance)
        
        # 3. Performance trend
        performance = student_data.get('performance', [])
        if performance:
            visualizations['performance_trend'] = self._create_performance_trend(performance)
        
        return visualizations
    
    def _create_factor_chart(self, factors: Dict) -> str:
        """Create factor importance bar chart"""
        try:
            sorted_factors = sorted(factors.items(), 
                                   key=lambda x: x[1]['importance'], 
                                   reverse=True)[:8]
            
            names = [self._humanize_factor_name(f[0]) for f in sorted_factors]
            importances = [f[1]['importance'] * 100 for f in sorted_factors]
            
            plt.figure(figsize=(10, 6))
            plt.barh(names, importances, color='#FF6B6B')
            plt.xlabel('Importance (%)')
            plt.title('Key Risk Factors')
            plt.tight_layout()
            
            # Convert to base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        
        except Exception as e:
            return ""
    
    def _create_attendance_trend(self, attendance: List[Dict]) -> str:
        """Create attendance trend line chart"""
        try:
            # Take last 30 days
            recent = sorted(attendance, key=lambda x: x.get('date', ''))[-30:]
            
            dates = [a.get('date').strftime('%m/%d') if a.get('date') else '' for a in recent]
            statuses = [1 if a.get('status') == 'present' else 0 for a in recent]
            
            # Calculate rolling average
            window = 5
            rolling_avg = np.convolve(statuses, np.ones(window)/window, mode='valid')
            
            plt.figure(figsize=(10, 4))
            plt.plot(dates[window-1:], rolling_avg, marker='o', color='#4ECDC4', linewidth=2)
            plt.axhline(y=0.75, color='red', linestyle='--', label='Concern Threshold')
            plt.xlabel('Date')
            plt.ylabel('Attendance Rate (5-day avg)')
            plt.title('Attendance Trend')
            plt.xticks(rotation=45)
            plt.legend()
            plt.tight_layout()
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        
        except Exception as e:
            return ""
    
    def _create_performance_trend(self, performance: List[Dict]) -> str:
        """Create performance trend chart"""
        try:
            # Take last 10 assessments
            recent = sorted(performance, 
                          key=lambda x: x.get('assessment_date', ''))[-10:]
            
            names = [p.get('assessment_name', '')[:15] for p in recent]
            percentages = []
            
            for p in recent:
                if p.get('max_marks', 0) > 0:
                    pct = (p.get('obtained_marks', 0) / p['max_marks']) * 100
                    percentages.append(pct)
                else:
                    percentages.append(0)
            
            plt.figure(figsize=(10, 4))
            plt.plot(range(len(names)), percentages, marker='o', color='#95E1D3', linewidth=2)
            plt.axhline(y=50, color='orange', linestyle='--', label='Pass Mark')
            plt.axhline(y=75, color='green', linestyle='--', label='Good Performance')
            plt.xlabel('Assessment')
            plt.ylabel('Percentage (%)')
            plt.title('Academic Performance Trend')
            plt.xticks(range(len(names)), names, rotation=45, ha='right')
            plt.legend()
            plt.tight_layout()
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        
        except Exception as e:
            return ""