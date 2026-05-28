# app/ai_engine/hidden_student_detector.py
import numpy as np
from typing import Dict, List
from datetime import datetime, timedelta

class HiddenStudentDetector:
    """
    Detects students who are:
    - Quiet/silent in class
    - Low confidence
    - Socially disconnected
    - Not asking questions
    - Slowly becoming inactive
    
    Focus: Behavioral patterns, NOT just marks
    """
    
    def __init__(self):
        self.detection_patterns = {
            'silent_student': {
                'weight': 0.25,
                'indicators': [
                    'low_questions_asked',
                    'low_participation',
                    'teacher_noted_silence'
                ]
            },
            'low_confidence': {
                'weight': 0.20,
                'indicators': [
                    'reluctant_participation',
                    'avoids_presentations',
                    'teacher_noted_hesitation'
                ]
            },
            'social_disconnect': {
                'weight': 0.25,
                'indicators': [
                    'isolated_behavior',
                    'no_peer_interactions',
                    'teacher_noted_isolation'
                ]
            },
            'slow_disengagement': {
                'weight': 0.30,
                'indicators': [
                    'decreasing_participation',
                    'decreasing_questions',
                    'increasing_silence'
                ]
            }
        }
    
    def detect_hidden_patterns(self, student_data: Dict) -> Dict:
        """
        Detect if student is 'hidden' - at risk but not obvious
        
        Returns:
            {
                'is_hidden': bool,
                'hidden_score': float,
                'patterns_detected': list,
                'evidence': dict,
                'recommendation': str
            }
        """
        engagement = student_data.get('engagement', [])
        observations = student_data.get('observations', [])
        
        pattern_scores = {}
        
        # Detect each pattern
        pattern_scores['silent_student'] = self._detect_silent_pattern(engagement, observations)
        pattern_scores['low_confidence'] = self._detect_confidence_pattern(engagement, observations)
        pattern_scores['social_disconnect'] = self._detect_social_pattern(observations)
        pattern_scores['slow_disengagement'] = self._detect_disengagement_pattern(engagement)
        
        # Calculate weighted score
        hidden_score = sum(
            score * self.detection_patterns[pattern]['weight']
            for pattern, score in pattern_scores.items()
        )
        
        # Identify detected patterns
        patterns_detected = [
            pattern for pattern, score in pattern_scores.items()
            if score > 0.5
        ]
        
        is_hidden = hidden_score > 0.5 and len(patterns_detected) >= 2
        
        # Generate evidence
        evidence = self._generate_evidence(student_data, pattern_scores)
        
        # Generate recommendation
        recommendation = self._generate_recommendation(patterns_detected)
        
        return {
            'is_hidden': is_hidden,
            'hidden_score': float(hidden_score),
            'patterns_detected': patterns_detected,
            'pattern_scores': {k: float(v) for k, v in pattern_scores.items()},
            'evidence': evidence,
            'recommendation': recommendation
        }
    
    def _detect_silent_pattern(self, engagement: List[Dict], observations: List[Dict]) -> float:
        """Detect if student is consistently silent"""
        score = 0.0
        
        # Check questions asked
        recent_engagement = self._get_recent_data(engagement, days=30)
        if recent_engagement:
            avg_questions = np.mean([e.get('questions_asked', 0) for e in recent_engagement])
            if avg_questions < 0.5:  # Less than 1 question every 2 days
                score += 0.4
        
        # Check participation
        if recent_engagement:
            avg_participation = np.mean([e.get('participation_score', 0) for e in recent_engagement])
            if avg_participation < 0.3:
                score += 0.3
        
        # Check teacher observations
        silence_keywords = ['silent', 'quiet', 'doesn\'t speak', 'नहीं बोलता', 'चुप रहता']
        for obs in observations:
            text = (obs.get('transcribed_text', '') + ' ' + obs.get('original_text', '')).lower()
            if any(keyword in text for keyword in silence_keywords):
                score += 0.3
                break
        
        return min(1.0, score)
    
    def _detect_confidence_pattern(self, engagement: List[Dict], observations: List[Dict]) -> float:
        """Detect low confidence indicators"""
        score = 0.0
        
        # Check interaction level
        recent_engagement = self._get_recent_data(engagement, days=30)
        low_interaction_count = sum(
            1 for e in recent_engagement 
            if e.get('class_interaction_level') in ['low', 'none']
        )
        
        if recent_engagement and low_interaction_count / len(recent_engagement) > 0.7:
            score += 0.5
        
        # Check teacher observations
        confidence_keywords = ['hesitant', 'shy', 'nervous', 'scared', 'डरता', 'झिझकता']
        for obs in observations:
            text = (obs.get('transcribed_text', '') + ' ' + obs.get('original_text', '')).lower()
            if any(keyword in text for keyword in confidence_keywords):
                score += 0.5
                break
        
        return min(1.0, score)
    
    def _detect_social_pattern(self, observations: List[Dict]) -> float:
        """Detect social disconnection"""
        score = 0.0
        
        social_keywords = [
            'alone', 'isolated', 'no friends', 'withdrawn',
            'अकेला', 'अलग रहता', 'दोस्त नहीं'
        ]
        
        isolation_mentions = 0
        for obs in observations:
            text = (obs.get('transcribed_text', '') + ' ' + obs.get('original_text', '')).lower()
            if any(keyword in text for keyword in social_keywords):
                isolation_mentions += 1
        
        if isolation_mentions > 0:
            score = min(1.0, isolation_mentions * 0.3)
        
        return score
    
    def _detect_disengagement_pattern(self, engagement: List[Dict]) -> float:
        """Detect gradual disengagement trend"""
        if len(engagement) < 10:
            return 0.0
        
        sorted_engagement = sorted(engagement, key=lambda x: x.get('date', datetime.min))
        
        # Split into periods
        third = len(sorted_engagement) // 3
        period1 = sorted_engagement[:third]
        period2 = sorted_engagement[third:2*third]
        period3 = sorted_engagement[2*third:]
        
        def get_avg_engagement(period):
            if not period:
                return 0.5
            scores = [e.get('participation_score', 0) for e in period]
            questions = [e.get('questions_asked', 0) for e in period]
            return (np.mean(scores) + (np.mean(questions) / 10)) / 2
        
        avg1 = get_avg_engagement(period1)
        avg2 = get_avg_engagement(period2)
        avg3 = get_avg_engagement(period3)
        
        # Check if declining
        if avg1 > avg2 > avg3 and (avg1 - avg3) > 0.2:
            decline_rate = (avg1 - avg3) / avg1
            return min(1.0, decline_rate * 1.5)
        
        return 0.0
    
    def _get_recent_data(self, data: List[Dict], days: int = 30) -> List[Dict]:
        """Get data from last N days"""
        cutoff = datetime.now() - timedelta(days=days)
        return [d for d in data if d.get('date') and d['date'] >= cutoff]
    
    def _generate_evidence(self, student_data: Dict, pattern_scores: Dict) -> Dict:
        """Generate evidence for detected patterns"""
        engagement = student_data.get('engagement', [])
        observations = student_data.get('observations', [])
        
        evidence = {}
        
        # Questions evidence
        recent_engagement = self._get_recent_data(engagement, days=30)
        if recent_engagement:
            total_questions = sum(e.get('questions_asked', 0) for e in recent_engagement)
            evidence['total_questions_30d'] = total_questions
            evidence['avg_questions_per_day'] = total_questions / 30
        
        # Participation evidence
        if recent_engagement:
            participation_scores = [e.get('participation_score', 0) for e in recent_engagement]
            evidence['avg_participation_score'] = float(np.mean(participation_scores))
            evidence['low_participation_days'] = sum(1 for s in participation_scores if s < 0.3)
        
        # Teacher observations
        evidence['teacher_observations_count'] = len(observations)
        evidence['high_concern_observations'] = sum(
            1 for o in observations if o.get('concern_level') in ['high', 'critical']
        )
        
        return evidence
    
    def _generate_recommendation(self, patterns: List[str]) -> str:
        """Generate actionable recommendation"""
        if not patterns:
            return "Continue monitoring engagement levels"
        
        recommendations = []
        
        if 'silent_student' in patterns:
            recommendations.append("One-on-one interaction to understand barriers")
        
        if 'low_confidence' in patterns:
            recommendations.append("Build confidence through small group activities")
        
        if 'social_disconnect' in patterns:
            recommendations.append("Facilitate peer buddy system")
        
        if 'slow_disengagement' in patterns:
            recommendations.append("Early intervention before complete withdrawal")
        
        return " | ".join(recommendations)