# app/ai_engine/dropout_detector.py
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

# Sklearn will be lazily imported when training/loading to ensure the backend starts
# and operates in rule-based mode even in environments without scikit-learn (e.g. Python 3.14)
try:
    from sklearn.ensemble import GradientBoostingClassifier
    SKLEARN_AVAILABLE = True
except ImportError:
    GradientBoostingClassifier = None
    SKLEARN_AVAILABLE = False

try:
    import joblib
except ImportError:
    joblib = None
from app.config import get_settings

settings = get_settings()

class SilentDropoutDetector:
    """
    Detects students at risk of silent dropout using:
    - Attendance decline patterns
    - Performance degradation
    - Engagement reduction
    - Behavioral anomalies
    """
    
    def __init__(self):
        self.model = None
        self.feature_names = [
            'attendance_rate_30d',
            'attendance_decline_rate',
            'attendance_consistency',
            'avg_marks_30d',
            'marks_decline_rate',
            'marks_volatility',
            'homework_completion_rate',
            'homework_quality_avg',
            'homework_decline_rate',
            'participation_score_avg',
            'participation_decline_rate',
            'questions_asked_avg',
            'days_since_last_question',
            'absence_streak_max',
            'late_submission_rate',
            'teacher_concern_score',
            'behavioral_flags_count',
            'social_interaction_score',
            'performance_consistency'
        ]
        
    def load_model(self, model_path: str = None):
        """Load pre-trained model"""
        if not SKLEARN_AVAILABLE:
            self.model = None
            return

        if model_path and joblib:
            try:
                self.model = joblib.load(model_path)
            except Exception:
                self.model = None
        else:
            # Initialize with default model if sklearn is present
            if GradientBoostingClassifier:
                self.model = GradientBoostingClassifier(
                    n_estimators=200,
                    learning_rate=0.05,
                    max_depth=5,
                    random_state=42
                )
            else:
                self.model = None
    
    def extract_features(self, student_data: Dict) -> np.ndarray:
        """
        Extract engineered features for dropout prediction
        
        Args:
            student_data: Dict containing attendance, performance, engagement data
            
        Returns:
            Feature vector
        """
        features = {}
        
        # Attendance features
        attendance = student_data.get('attendance', [])
        features['attendance_rate_30d'] = self._calculate_attendance_rate(attendance, days=30)
        features['attendance_decline_rate'] = self._calculate_decline_rate(attendance, 'status')
        features['attendance_consistency'] = self._calculate_consistency(attendance)
        features['absence_streak_max'] = self._calculate_max_streak(attendance, 'absent')
        
        # Performance features
        performance = student_data.get('performance', [])
        features['avg_marks_30d'] = self._calculate_avg_marks(performance, days=30)
        features['marks_decline_rate'] = self._calculate_marks_decline(performance)
        features['marks_volatility'] = self._calculate_volatility(performance, 'percentage')
        features['performance_consistency'] = self._calculate_consistency(performance)
        
        # Homework features
        homework = student_data.get('homework', [])
        features['homework_completion_rate'] = self._calculate_completion_rate(homework)
        features['homework_quality_avg'] = self._calculate_avg_quality(homework)
        features['homework_decline_rate'] = self._calculate_decline_rate(homework, 'quality_score')
        features['late_submission_rate'] = self._calculate_late_rate(homework)
        
        # Engagement features
        engagement = student_data.get('engagement', [])
        features['participation_score_avg'] = self._calculate_avg_participation(engagement)
        features['participation_decline_rate'] = self._calculate_decline_rate(engagement, 'participation_score')
        features['questions_asked_avg'] = self._calculate_avg_questions(engagement)
        features['days_since_last_question'] = self._days_since_last_question(engagement)
        
        # Behavioral features
        observations = student_data.get('observations', [])
        features['teacher_concern_score'] = self._calculate_concern_score(observations)
        features['behavioral_flags_count'] = self._count_behavioral_flags(observations)
        features['social_interaction_score'] = self._calculate_social_score(observations)
        
        # Convert to array
        feature_vector = [features.get(fname, 0.0) for fname in self.feature_names]
        return np.array(feature_vector).reshape(1, -1)
    
    def _is_model_fitted(self) -> bool:
        """Check if the sklearn model has been fitted."""
        try:
            from sklearn.utils.validation import check_is_fitted
            check_is_fitted(self.model)
            return True
        except Exception:
            return False

    def _rule_based_risk_score(self, features: np.ndarray) -> float:
        """
        Compute a weighted rule-based risk score when no trained model is available.
        Feature order matches self.feature_names.
        """
        idx = {name: i for i, name in enumerate(self.feature_names)}
        f = features  # convenience

        score = 0.0

        # Attendance contributes 30%
        attendance_rate = f[idx.get('attendance_rate_30d', 0)]
        attendance_decline = f[idx.get('attendance_decline_rate', 1)]
        absence_streak = f[idx.get('absence_streak_max', 13)]

        score += (1.0 - attendance_rate) * 0.18
        score += min(1.0, attendance_decline) * 0.07
        score += min(1.0, absence_streak / 10.0) * 0.05

        # Performance contributes 25%
        avg_marks = f[idx.get('avg_marks_30d', 3)]
        marks_decline = f[idx.get('marks_decline_rate', 4)]
        perf_consistency = f[idx.get('performance_consistency', 18)]

        marks_norm = max(0.0, 1.0 - (avg_marks / 100.0))  # low marks → high risk
        score += marks_norm * 0.15
        score += min(1.0, marks_decline) * 0.07
        score += (1.0 - min(1.0, perf_consistency)) * 0.03

        # Homework contributes 15%
        hw_completion = f[idx.get('homework_completion_rate', 6)]
        hw_decline = f[idx.get('homework_decline_rate', 8)]

        score += (1.0 - hw_completion) * 0.10
        score += min(1.0, hw_decline) * 0.05

        # Engagement contributes 20%
        participation = f[idx.get('participation_score_avg', 9)]
        participation_decline = f[idx.get('participation_decline_rate', 10)]
        days_no_question = f[idx.get('days_since_last_question', 12)]

        score += (1.0 - participation) * 0.12
        score += min(1.0, participation_decline) * 0.05
        score += min(1.0, days_no_question / 30.0) * 0.03

        # Teacher concern contributes 10%
        concern = f[idx.get('teacher_concern_score', 15)]
        flags = f[idx.get('behavioral_flags_count', 16)]

        score += concern * 0.06
        score += min(1.0, flags / 3.0) * 0.04

        return float(min(1.0, max(0.0, score)))

    def predict_risk(self, student_data: Dict) -> Dict:
        """
        Predict dropout risk for a student.

        Uses a trained ML model if available; otherwise falls back to a
        deterministic rule-based scoring engine so the system works
        out-of-the-box without a pre-trained model file.

        Returns:
            {
                'risk_score': float,
                'risk_level': str,
                'confidence': float,
                'contributing_factors': dict,
                'factors': dict,           # alias for contributing_factors
                'reasoning': str,
                'prediction_horizon_days': int
            }
        """
        features = self.extract_features(student_data)

        # Try ML model first; fall back to rule-based scorer
        if self._is_model_fitted():
            risk_score = float(self.model.predict_proba(features)[0][1])
        else:
            risk_score = self._rule_based_risk_score(features[0])

        risk_level = self._categorize_risk(risk_score)
        contributing_factors = self._calculate_feature_importance(features[0])
        reasoning = self._generate_reasoning(contributing_factors, student_data)
        confidence = self._calculate_confidence(contributing_factors)

        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'confidence': float(confidence),
            'contributing_factors': contributing_factors,
            'factors': contributing_factors,   # alias used by intervention recommender
            'reasoning': reasoning,
            'prediction_horizon_days': settings.SHORT_TERM_DAYS
        }

    
    def _categorize_risk(self, score: float) -> str:
        """Categorize risk based on score"""
        if score >= settings.CRITICAL_RISK_THRESHOLD:
            return 'critical'
        elif score >= settings.HIGH_RISK_THRESHOLD:
            return 'high'
        elif score >= settings.MODERATE_RISK_THRESHOLD:
            return 'moderate'
        else:
            return 'low'
    
    def _calculate_feature_importance(self, features: np.ndarray) -> Dict[str, float]:
        """Calculate which features contributed most to the prediction"""
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
        else:
            # Fallback: use feature magnitudes
            importances = np.abs(features) / (np.sum(np.abs(features)) + 1e-10)
        
        # Normalize and filter
        factor_dict = {}
        for fname, importance, fvalue in zip(self.feature_names, importances, features):
            if importance >= settings.MIN_FEATURE_IMPORTANCE:
                factor_dict[fname] = {
                    'importance': float(importance),
                    'value': float(fvalue)
                }
        
        # Sort by importance
        sorted_factors = dict(sorted(factor_dict.items(), 
                                    key=lambda x: x[1]['importance'], 
                                    reverse=True))
        return sorted_factors
    
    def _generate_reasoning(self, factors: Dict, student_data: Dict) -> str:
        """Generate human-readable reasoning"""
        reasons = []
        
        # Get top 3 factors
        top_factors = list(factors.items())[:3]
        
        for factor_name, factor_data in top_factors:
            value = factor_data['value']
            
            if 'attendance' in factor_name:
                if value < 0.7:
                    reasons.append(f"Attendance has dropped to {value*100:.1f}%")
                elif 'decline' in factor_name and value > 0.2:
                    reasons.append("Attendance showing declining trend")
            
            elif 'marks' in factor_name:
                if 'decline' in factor_name and value > 0.15:
                    reasons.append("Academic performance declining significantly")
                elif value < 50:
                    reasons.append(f"Recent average marks at {value:.1f}%")
            
            elif 'homework' in factor_name:
                if 'completion' in factor_name and value < 0.6:
                    reasons.append(f"Homework completion rate only {value*100:.1f}%")
                elif 'late' in factor_name and value > 0.3:
                    reasons.append("Frequent late homework submissions")
            
            elif 'participation' in factor_name:
                if value < 0.4:
                    reasons.append("Very low class participation")
                elif 'decline' in factor_name and value > 0.2:
                    reasons.append("Participation declining over time")
            
            elif 'concern' in factor_name and value > 0.5:
                reasons.append("Teachers have expressed concerns")
        
        if not reasons:
            reasons.append("Multiple subtle indicators suggest disengagement")
        
        return " | ".join(reasons)
    
    def _calculate_confidence(self, factors: Dict) -> float:
        """Calculate confidence based on factor strength and consistency"""
        if not factors:
            return 0.5
        
        # More strong factors = higher confidence
        factor_count = len(factors)
        avg_importance = np.mean([f['importance'] for f in factors.values()])
        
        confidence = min(0.95, 0.5 + (factor_count * 0.05) + (avg_importance * 0.3))
        return confidence
    
    def _safe_date(self, x: Dict, field: str = 'date') -> datetime.date:
        from datetime import date, datetime as dt
        d = x.get(field)
        if d is None:
            return date(1, 1, 1)
        if isinstance(d, date):
            return d
        if isinstance(d, dt):
            return d.date()
        if isinstance(d, str):
            try:
                if 'T' in d:
                    return dt.fromisoformat(d.split('T')[0]).date()
                return dt.strptime(d[:10], '%Y-%m-%d').date()
            except Exception:
                return date(1, 1, 1)
        return date(1, 1, 1)

    # Helper functions for feature extraction
    def _calculate_attendance_rate(self, attendance: List[Dict], days: int = 30) -> float:
        """Calculate attendance rate for last N days"""
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        recent = [a for a in attendance if a.get('date') is not None and self._safe_date(a) >= cutoff_date]
        
        if not recent:
            return 1.0  # Assume good if no data
        
        present = sum(1 for a in recent if a.get('status') == 'present')
        return present / len(recent)
    
    def _calculate_decline_rate(self, data: List[Dict], field: str) -> float:
        """Calculate rate of decline in a metric"""
        if len(data) < 2:
            return 0.0
        
        # Sort by date
        sorted_data = sorted(data, key=self._safe_date)
        
        # Split into first half and second half
        mid = len(sorted_data) // 2
        first_half = sorted_data[:mid]
        second_half = sorted_data[mid:]
        
        def get_avg(subset, field):
            values = []
            for item in subset:
                if field == 'status':
                    values.append(1.0 if item.get(field) == 'present' else 0.0)
                else:
                    val = item.get(field)
                    if val is not None:
                        values.append(float(val))
            return np.mean(values) if values else 0.0
        
        avg_first = get_avg(first_half, field)
        avg_second = get_avg(second_half, field)
        
        if avg_first == 0:
            return 0.0
        
        decline = (avg_first - avg_second) / avg_first
        return max(0.0, decline)  # Only positive decline
    
    def _calculate_consistency(self, data: List[Dict]) -> float:
        """Calculate consistency (inverse of volatility)"""
        if len(data) < 3:
            return 1.0
        
        values = []
        for item in data:
            if 'status' in item:
                values.append(1.0 if item['status'] == 'present' else 0.0)
            elif 'obtained_marks' in item and 'max_marks' in item:
                if item['max_marks'] > 0:
                    values.append(item['obtained_marks'] / item['max_marks'])
        
        if not values:
            return 1.0
        
        std = np.std(values)
        consistency = 1.0 / (1.0 + std)
        return consistency
    
    def _calculate_max_streak(self, attendance: List[Dict], status: str) -> int:
        """Calculate maximum consecutive streak of a status"""
        sorted_att = sorted(attendance, key=self._safe_date)
        
        max_streak = 0
        current_streak = 0
        
        for record in sorted_att:
            if record.get('status') == status:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
        
        return max_streak
    
    def _calculate_avg_marks(self, performance: List[Dict], days: int = 30) -> float:
        """Calculate average marks percentage"""
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        recent = [p for p in performance if p.get('assessment_date') is not None and self._safe_date(p, 'assessment_date') >= cutoff_date]
        
        percentages = []
        for p in recent:
            if p.get('max_marks', 0) > 0:
                pct = (p.get('obtained_marks', 0) / p['max_marks']) * 100
                percentages.append(pct)
        
        return np.mean(percentages) if percentages else 0.0
    
    def _calculate_marks_decline(self, performance: List[Dict]) -> float:
        """Calculate marks decline rate"""
        return self._calculate_decline_rate(performance, 'percentage')
    
    def _calculate_volatility(self, data: List[Dict], field: str) -> float:
        """Calculate volatility (standard deviation)"""
        values = [item.get(field, 0) for item in data if field in item]
        return np.std(values) if len(values) > 1 else 0.0
    
    def _calculate_completion_rate(self, homework: List[Dict]) -> float:
        """Calculate homework completion rate"""
        if not homework:
            return 1.0
        
        completed = sum(1 for h in homework if h.get('status') in ['submitted', 'late'])
        return completed / len(homework)
    
    def _calculate_avg_quality(self, homework: List[Dict]) -> float:
        """Calculate average homework quality"""
        qualities = [h.get('quality_score', 0) for h in homework if 'quality_score' in h]
        return np.mean(qualities) if qualities else 0.0
    
    def _calculate_late_rate(self, homework: List[Dict]) -> float:
        """Calculate late submission rate"""
        if not homework:
            return 0.0
        
        late = sum(1 for h in homework if h.get('status') == 'late')
        return late / len(homework)
    
    def _calculate_avg_participation(self, engagement: List[Dict]) -> float:
        """Calculate average participation score"""
        scores = [e.get('participation_score', 0) for e in engagement]
        return np.mean(scores) if scores else 0.0
    
    def _calculate_avg_questions(self, engagement: List[Dict]) -> float:
        """Calculate average questions asked per day"""
        questions = [e.get('questions_asked', 0) for e in engagement]
        return np.mean(questions) if questions else 0.0
    
    def _days_since_last_question(self, engagement: List[Dict]) -> int:
        """Days since student last asked a question"""
        with_questions = [e for e in engagement if e.get('questions_asked', 0) > 0]
        
        if not with_questions:
            return 999  # Very high number
        
        latest = max(with_questions, key=self._safe_date)
        latest_date = self._safe_date(latest)
        if latest_date == datetime.min.date():
            return 999
        days = (datetime.now().date() - latest_date).days
        return days
    
    def _calculate_concern_score(self, observations: List[Dict]) -> float:
        """Calculate teacher concern score from observations"""
        concern_map = {
            'none': 0.0,
            'low': 0.25,
            'medium': 0.5,
            'high': 0.75,
            'critical': 1.0
        }
        
        concerns = [concern_map.get(o.get('concern_level', 'none'), 0) for o in observations]
        return np.mean(concerns) if concerns else 0.0
    
    def _count_behavioral_flags(self, observations: List[Dict]) -> int:
        """Count behavioral flags"""
        flags = sum(1 for o in observations if o.get('concern_level') in ['high', 'critical'])
        return flags
    
    def _calculate_social_score(self, observations: List[Dict]) -> float:
        """Calculate social interaction score from observations"""
        # Extract from insights if available
        social_keywords = ['silent', 'quiet', 'isolated', 'withdrawn', 'alone']
        
        negative_count = 0
        for obs in observations:
            text = (obs.get('transcribed_text', '') + ' ' + obs.get('original_text', '')).lower()
            if any(keyword in text for keyword in social_keywords):
                negative_count += 1
        
        if not observations:
            return 0.5  # Neutral
        
        social_score = 1.0 - (negative_count / len(observations))
        return max(0.0, social_score)