# app/ml_models/risk_predictor.py
"""
Risk Predictor — High-level orchestrator for the full AI risk pipeline.

Combines the SilentDropoutDetector, HiddenStudentDetector, EngagementScorer,
RiskCategorizer, InterventionRecommender, and ExplainableAI into a single
coherent predict() call that can be used from any service layer.

Designed for:
  • Single-student real-time assessment (API calls)
  • Batch nightly re-scoring of all students
  • Comparison against historical predictions
"""
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional

from app.ai_engine.dropout_detector import SilentDropoutDetector
from app.ai_engine.hidden_student_detector import HiddenStudentDetector
from app.ai_engine.risk_categorizer import RiskCategorizer
from app.ai_engine.intervention_recommender import InterventionRecommender
from app.ai_engine.explainable_ai import ExplainableAI
from app.ml_models.engagement_scorer import EngagementScorer


class RiskPredictor:
    """
    Unified risk prediction pipeline.

    Usage
    -----
    predictor = RiskPredictor()
    result = predictor.predict(student_data)

    The result is a fully self-contained risk report suitable for:
      • persisting to risk_predictions table
      • streaming to the frontend dashboard
      • driving intervention creation
    """

    def __init__(self):
        self.dropout_detector        = SilentDropoutDetector()
        self.hidden_detector         = HiddenStudentDetector()
        self.engagement_scorer       = EngagementScorer()
        self.risk_categorizer        = RiskCategorizer()
        self.intervention_recommender = InterventionRecommender()
        self.explainable_ai          = ExplainableAI()

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def predict(self, student_data: Dict) -> Dict:
        """
        Run the full AI risk pipeline for a single student.

        Parameters
        ----------
        student_data : dict
            {
              'student_id': str,
              'student_info': {'name': str, 'class': str, ...},
              'attendance': [...],
              'performance': [...],
              'homework': [...],
              'engagement': [...],
              'observations': [...],
            }

        Returns
        -------
        dict — full risk report with:
          dropout_risk        — ML/rule-based dropout probability
          hidden_patterns     — behavioral detection results
          engagement          — engagement composite score
          triage              — hospital-style priority categorisation
          interventions       — prioritised list of recommended actions
          explanation         — explainable AI narrative
          pipeline_metadata   — which models ran, timestamps
        """
        student_id   = student_data.get('student_id', 'unknown')
        student_name = (student_data.get('student_info') or {}).get('name', 'Student')

        # Stage 1 — Dropout Risk
        dropout_risk = self.dropout_detector.predict_risk(student_data)

        # Stage 2 — Hidden Student Detection
        hidden_patterns = self.hidden_detector.detect_hidden_patterns(student_data)

        # Stage 3 — Engagement Score
        engagement = self.engagement_scorer.compute_score(student_data)

        # Stage 4 — Triage Categorisation
        triage = self.risk_categorizer.categorize_risk(
            dropout_risk, hidden_patterns, student_data
        )

        # Stage 5 — Intervention Recommendations
        interventions = self.intervention_recommender.recommend_interventions(
            dropout_risk, hidden_patterns, triage, student_data
        )

        # Stage 6 — Explainable AI
        explanation = self.explainable_ai.generate_explanation(
            dropout_risk, hidden_patterns, student_data
        )

        # Composite final risk score (weighted blend)
        composite_risk = self._blend_scores(dropout_risk, hidden_patterns, engagement)

        return {
            'student_id':       student_id,
            'student_name':     student_name,
            'assessment_date':  datetime.now().isoformat(),
            'composite_risk_score': composite_risk,
            'dropout_risk':     dropout_risk,
            'hidden_patterns':  hidden_patterns,
            'engagement':       engagement,
            'triage':           triage,
            'interventions':    interventions,
            'explanation':      explanation,
            'pipeline_metadata': {
                'model_version': '1.0.0',
                'stages_completed': [
                    'dropout_detection',
                    'hidden_student_detection',
                    'engagement_scoring',
                    'triage_categorisation',
                    'intervention_recommendation',
                    'explainable_ai',
                ],
                'timestamp': datetime.now().isoformat(),
            }
        }

    def batch_predict(self, students: List[Dict], concurrency: int = 1) -> List[Dict]:
        """
        Run the full pipeline for a list of students.

        Returns results sorted by composite_risk_score (highest first).
        """
        results = []
        for student in students:
            try:
                result = self.predict(student)
                results.append(result)
            except Exception as e:
                results.append({
                    'student_id':   student.get('student_id', 'unknown'),
                    'error':        str(e),
                    'assessment_date': datetime.now().isoformat(),
                })

        results.sort(key=lambda x: x.get('composite_risk_score', 0), reverse=True)
        return results

    def quick_score(self, student_data: Dict) -> float:
        """
        Return just the composite risk score (0-1) without the full report.
        Useful for batch screening to decide which students need full analysis.
        """
        try:
            dropout = self.dropout_detector.predict_risk(student_data)
            hidden  = self.hidden_detector.detect_hidden_patterns(student_data)
            eng     = self.engagement_scorer.compute_score(student_data)
            return self._blend_scores(dropout, hidden, eng)
        except Exception:
            return 0.5  # neutral on error

    # ------------------------------------------------------------------ #
    # Score blending
    # ------------------------------------------------------------------ #

    def _blend_scores(self,
                      dropout_risk: Dict,
                      hidden_patterns: Dict,
                      engagement: Dict) -> float:
        """
        Blend three independently derived scores into a single composite.

        Weights
        -------
        dropout_risk    0.50  (ML/rule-based — most structured signal)
        hidden_score    0.25  (behavioural — catches silent students)
        engagement_gap  0.25  (1 - engagement score — captures disengagement)
        """
        dr  = float(dropout_risk.get('risk_score', 0))
        hs  = float(hidden_patterns.get('hidden_score', 0))
        eg  = float(1.0 - engagement.get('score', 0.5))   # invert: low engagement = higher risk

        composite = (dr * 0.50) + (hs * 0.25) + (eg * 0.25)
        return round(float(np.clip(composite, 0.0, 1.0)), 4)
