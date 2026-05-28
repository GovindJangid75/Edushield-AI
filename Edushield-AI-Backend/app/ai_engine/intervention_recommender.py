# app/ai_engine/intervention_recommender.py
from typing import Dict, List
import openai
from app.config import get_settings

settings = get_settings()

class InterventionRecommender:
    """
    AI-powered intervention recommendation engine
    
    Suggests practical, explainable actions for teachers
    """
    
    def __init__(self):
        self.intervention_library = {
            'parent_communication': {
                'name': 'Parent Communication',
                'effort': 'low',
                'impact': 'high',
                'triggers': ['attendance_low', 'marks_declining', 'behavioral_concern']
            },
            'one_on_one_mentoring': {
                'name': 'One-on-One Mentoring',
                'effort': 'medium',
                'impact': 'high',
                'triggers': ['hidden_student', 'confidence_low', 'silent_pattern']
            },
            'peer_buddy_system': {
                'name': 'Peer Buddy Assignment',
                'effort': 'low',
                'impact': 'medium',
                'triggers': ['social_disconnect', 'low_confidence', 'new_student']
            },
            'counseling_referral': {
                'name': 'Counseling Referral',
                'effort': 'low',
                'impact': 'high',
                'triggers': ['behavioral_concern', 'emotional_distress', 'critical_risk']
            },
            'study_material_support': {
                'name': 'Bilingual/Simplified Study Material',
                'effort': 'medium',
                'impact': 'medium',
                'triggers': ['language_barrier', 'comprehension_issues', 'marks_low']
            },
            'workload_adjustment': {
                'name': 'Temporary Workload Reduction',
                'effort': 'low',
                'impact': 'medium',
                'triggers': ['overwhelmed', 'multiple_subjects_failing', 'stress_indicators']
            },
            'revision_planning': {
                'name': 'Personalized Revision Plan',
                'effort': 'medium',
                'impact': 'medium',
                'triggers': ['exam_approaching', 'marks_declining', 'homework_incomplete']
            },
            'attendance_intervention': {
                'name': 'Attendance Recovery Plan',
                'effort': 'medium',
                'impact': 'high',
                'triggers': ['absence_streak', 'attendance_low']
            },
            'positive_reinforcement': {
                'name': 'Recognition & Encouragement',
                'effort': 'low',
                'impact': 'medium',
                'triggers': ['low_confidence', 'recent_improvement', 'effort_noted']
            },
            'small_group_activity': {
                'name': 'Small Group Participation',
                'effort': 'medium',
                'impact': 'medium',
                'triggers': ['silent_pattern', 'low_confidence', 'peer_learning']
            }
        }
    
    def recommend_interventions(self,
                                risk_data: Dict,
                                hidden_data: Dict,
                                triage_data: Dict,
                                student_data: Dict = None) -> List[Dict]:
        """
        Public API: generate prioritized intervention recommendations.
        Alias for recommend() with optional student_data.
        """
        return self.recommend(risk_data, hidden_data, triage_data, student_data or {})

    def recommend(self, 
                  risk_data: Dict,
                  hidden_data: Dict,
                  triage_data: Dict,
                  student_data: Dict) -> List[Dict]:
        """
        Generate prioritized intervention recommendations
        
        Returns:
            List of recommended interventions with reasoning
        """
        # Extract triggers from analysis
        triggers = self._extract_triggers(risk_data, hidden_data, triage_data, student_data)
        
        # Match interventions
        matched_interventions = self._match_interventions(triggers)
        
        # Prioritize interventions
        prioritized = self._prioritize_interventions(
            matched_interventions,
            triage_data['category'],
            triggers
        )
        
        # Generate detailed recommendations
        recommendations = []
        for intervention_key in prioritized[:5]:  # Top 5
            intervention = self.intervention_library[intervention_key]
            
            # Generate reasoning
            reasoning = self._generate_reasoning(intervention_key, triggers, student_data)
            
            # Generate actionable steps
            action_steps = self._generate_action_steps(intervention_key, student_data)
            
            recommendations.append({
                'intervention_type': intervention_key,
                'name': intervention['name'],
                'priority': self._get_priority_level(intervention_key, triage_data['category']),
                'effort_level': intervention['effort'],
                'expected_impact': intervention['impact'],
                'reasoning': reasoning,
                'action_steps': action_steps,
                'timeline': self._get_timeline(intervention_key, triage_data['category']),
                'success_indicators': self._get_success_indicators(intervention_key)
            })
        
        return recommendations
    
    def _extract_triggers(self, risk_data, hidden_data, triage_data, student_data) -> List[str]:
        """Extract intervention triggers from analysis"""
        triggers = []
        
        # From risk prediction
        contributing_factors = risk_data.get('contributing_factors', {})
        for factor_name, factor_data in contributing_factors.items():
            if 'attendance' in factor_name and factor_data['value'] < 0.7:
                triggers.append('attendance_low')
                if factor_data['value'] < 0.5:
                    triggers.append('absence_streak')
            
            if 'marks' in factor_name:
                if 'decline' in factor_name and factor_data['value'] > 0.2:
                    triggers.append('marks_declining')
                if factor_data['value'] < 40:
                    triggers.append('marks_low')
            
            if 'homework' in factor_name and factor_data['value'] < 0.6:
                triggers.append('homework_incomplete')
        
        # From hidden detection
        patterns = hidden_data.get('patterns_detected', [])
        for pattern in patterns:
            if pattern == 'silent_student':
                triggers.append('silent_pattern')
            elif pattern == 'low_confidence':
                triggers.append('confidence_low')
            elif pattern == 'social_disconnect':
                triggers.append('social_disconnect')
        
        # From triage
        if triage_data['category'] in ['critical', 'high']:
            triggers.append('critical_risk')
        
        for criterion in triage_data.get('matched_criteria', []):
            if 'concern' in criterion:
                triggers.append('behavioral_concern')
        
        # From observations
        observations = student_data.get('observations', [])
        for obs in observations:
            if obs.get('concern_level') in ['high', 'critical']:
                triggers.append('behavioral_concern')
        
        return list(set(triggers))  # Remove duplicates
    
    def _match_interventions(self, triggers: List[str]) -> List[str]:
        """Match triggers to interventions"""
        matched = {}
        
        for intervention_key, intervention in self.intervention_library.items():
            match_score = 0
            for trigger in triggers:
                if trigger in intervention['triggers']:
                    match_score += 1
            
            if match_score > 0:
                matched[intervention_key] = match_score
        
        # Sort by match score
        sorted_matches = sorted(matched.items(), key=lambda x: x[1], reverse=True)
        return [k for k, v in sorted_matches]
    
    def _prioritize_interventions(self, interventions: List[str], category: str, triggers: List[str]) -> List[str]:
        """Prioritize interventions based on urgency and impact"""
        priority_scores = {}
        
        for intervention_key in interventions:
            intervention = self.intervention_library[intervention_key]
            
            # Base score from impact
            impact_score = {'high': 3, 'medium': 2, 'low': 1}
            score = impact_score.get(intervention['impact'], 1)
            
            # Boost low-effort interventions for critical cases
            if category == 'critical' and intervention['effort'] == 'low':
                score += 2
            
            # Boost high-impact for high/critical
            if category in ['critical', 'high'] and intervention['impact'] == 'high':
                score += 1
            
            # Specific triggers boost specific interventions
            if intervention_key == 'parent_communication' and 'attendance_low' in triggers:
                score += 2
            
            if intervention_key == 'counseling_referral' and 'critical_risk' in triggers:
                score += 3
            
            priority_scores[intervention_key] = score
        
        sorted_interventions = sorted(priority_scores.items(), key=lambda x: x[1], reverse=True)
        return [k for k, v in sorted_interventions]
    
    def _generate_reasoning(self, intervention_key: str, triggers: List[str], student_data: Dict) -> str:
        """Generate human-readable reasoning for recommendation"""
        student_name = student_data.get('name', 'Student')
        
        reasoning_templates = {
            'parent_communication': f"Reaching out to {student_name}'s parents can provide context on attendance/behavioral changes and create home-school alignment.",
            'one_on_one_mentoring': f"Personal attention can help {student_name} open up about challenges and rebuild engagement.",
            'peer_buddy_system': f"A peer buddy can help {student_name} feel more connected and comfortable in class.",
            'counseling_referral': f"{student_name} may benefit from professional support to address underlying concerns.",
            'study_material_support': f"Simplified or bilingual materials can help {student_name} better understand concepts.",
            'workload_adjustment': f"Temporary reduction in workload can prevent {student_name} from feeling overwhelmed.",
            'revision_planning': f"A structured revision plan can help {student_name} catch up on missed concepts.",
            'attendance_intervention': f"Focused effort on improving attendance can prevent {student_name} from falling further behind.",
            'positive_reinforcement': f"Recognition and encouragement can boost {student_name}'s confidence and motivation.",
            'small_group_activity': f"Small group settings provide safer space for {student_name} to participate."
        }
        
        return reasoning_templates.get(intervention_key, "This intervention can help address current concerns.")
    
    def _generate_action_steps(self, intervention_key: str, student_data: Dict) -> List[str]:
        """Generate specific action steps"""
        student_name = student_data.get('name', 'Student')
        
        action_steps_map = {
            'parent_communication': [
                f"Schedule phone call with {student_name}'s parents within 24-48 hours",
                "Share specific attendance/performance concerns with data",
                "Ask about any home situations affecting student",
                "Create joint action plan with parent involvement",
                "Schedule follow-up call in 1 week"
            ],
            'one_on_one_mentoring': [
                f"Schedule 15-minute private conversation with {student_name}",
                "Ask open-ended questions about challenges",
                "Listen without judgment",
                "Identify 1-2 specific areas for support",
                "Set next check-in date"
            ],
            'peer_buddy_system': [
                "Identify empathetic, responsible peer in same class",
                f"Brief buddy on supporting {student_name} (without revealing sensitive info)",
                "Arrange seating to facilitate interaction",
                "Monitor buddy relationship weekly",
                "Recognize buddy's efforts"
            ],
            'counseling_referral': [
                f"Speak with {student_name} about counseling support (normalize it)",
                "Get parent consent if required",
                "Connect with school counselor or partner NGO",
                "Facilitate first session introduction",
                "Follow up on counseling progress"
            ],
            'study_material_support': [
                f"Identify subjects where {student_name} struggles most",
                "Provide bilingual notes or simplified explanations",
                "Share visual aids/diagrams",
                "Recommend YouTube channels or apps in preferred language",
                "Check understanding in next class"
            ],
            'workload_adjustment': [
                f"Temporarily reduce homework quantity for {student_name}",
                "Focus on core concepts only",
                "Allow extra time for submissions",
                "Gradually increase workload as student catches up",
                "Monitor stress levels weekly"
            ],
            'revision_planning': [
                f"Create subject-wise revision checklist with {student_name}",
                "Break topics into small daily goals",
                "Provide past papers/practice questions",
                "Schedule brief daily check-ins (5 min)",
                "Celebrate completion of each milestone"
            ],
            'attendance_intervention': [
                "Call parent immediately if absent 2 consecutive days",
                f"Create attendance tracker visible to {student_name}",
                "Reward consistent attendance (verbal praise, certificate)",
                "Understand barriers to attendance (transport, home duties, etc.)",
                "Provide makeup classes for missed content"
            ],
            'positive_reinforcement': [
                f"Publicly acknowledge {student_name}'s effort (even small wins)",
                "Send positive note home to parents",
                "Display student's work (with permission)",
                "Assign small classroom responsibility",
                "Verbal encouragement at least 3x per week"
            ],
            'small_group_activity': [
                f"Include {student_name} in 3-4 student group for next activity",
                "Assign specific role (note-taker, presenter, etc.)",
                "Choose supportive group members",
                "Provide clear instructions and time limits",
                "Debrief with student after activity"
            ]
        }
        
        return action_steps_map.get(intervention_key, ["Implement intervention", "Monitor progress"])
    
    def _get_priority_level(self, intervention_key: str, category: str) -> str:
        """Get priority level for intervention"""
        if category == 'critical':
            if intervention_key in ['parent_communication', 'counseling_referral', 'attendance_intervention']:
                return 'immediate'
            return 'high'
        elif category == 'high':
            return 'high'
        elif category == 'moderate':
            return 'medium'
        else:
            return 'low'
    
    def _get_timeline(self, intervention_key: str, category: str) -> str:
        """Get recommended timeline"""
        if category == 'critical':
            return 'Start within 24 hours'
        elif category == 'high':
            return 'Start within 3 days'
        elif category == 'moderate':
            return 'Start within 1 week'
        else:
            return 'Start within 2 weeks'
    
    def _get_success_indicators(self, intervention_key: str) -> List[str]:
        """Define success indicators for intervention"""
        indicators_map = {
            'parent_communication': [
                "Parent engaged in conversation",
                "Home situation better understood",
                "Joint action plan created"
            ],
            'one_on_one_mentoring': [
                "Student opened up about challenges",
                "Specific support areas identified",
                "Student feeling heard and supported"
            ],
            'peer_buddy_system': [
                "Student interacting more with buddy",
                "Increased social connection observed",
                "Student participating more in class"
            ],
            'counseling_referral': [
                "Student attended counseling session",
                "Student comfortable with counselor",
                "Progress noted by counselor"
            ],
            'study_material_support': [
                "Student using provided materials",
                "Better understanding of concepts",
                "Improved assignment quality"
            ],
            'workload_adjustment': [
                "Student completing adjusted workload",
                "Reduced stress indicators",
                "Quality of work maintained or improved"
            ],
            'revision_planning': [
                "Student following revision plan",
                "Topics covered as per schedule",
                "Improved test performance"
            ],
            'attendance_intervention': [
                "Attendance rate improved",
                "Consecutive absences reduced",
                "Student catching up on missed work"
            ],
            'positive_reinforcement': [
                "Student showing more confidence",
                "Increased effort observed",
                "Student responding positively to praise"
            ],
            'small_group_activity': [
                "Student participated in group",
                "Student spoke/contributed ideas",
                "Student seemed comfortable"
            ]
        }
        
        return indicators_map.get(intervention_key, ["Positive change observed"])