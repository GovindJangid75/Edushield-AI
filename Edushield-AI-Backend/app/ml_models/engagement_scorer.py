# app/ml_models/engagement_scorer.py
"""
Engagement Scorer — Quantifies student engagement into a single composite score.

The engagement score feeds directly into the dropout risk model and the
hidden-student detector. It is computed from:
  • Class participation frequency and quality
  • Questions asked (curiosity signal)
  • Homework submission consistency
  • Trend direction (is engagement rising or falling?)

Score range: 0.0 (fully disengaged) → 1.0 (highly engaged)
"""
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional


class EngagementScorer:
    """
    Compute a composite engagement score for a student from raw behavioural data.

    Weights (should sum to 1.0):
      participation  0.35
      questions      0.25
      homework       0.25
      trend          0.15
    """

    WEIGHTS = {
        'participation': 0.35,
        'questions':     0.25,
        'homework':      0.25,
        'trend':         0.15,
    }

    # Thresholds for the categorical engagement level labels
    LEVELS = [
        (0.80, 'high'),
        (0.55, 'medium'),
        (0.30, 'low'),
        (0.00, 'disengaged'),
    ]

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def compute_score(self, student_data: Dict) -> Dict:
        """
        Compute and return a full engagement report for one student.

        Parameters
        ----------
        student_data : dict
            Keys expected:
              'engagement' : list[dict]   – daily engagement log records
              'homework'   : list[dict]   – homework submission records

        Returns
        -------
        dict with keys:
          score           float   0-1 composite score
          level           str     'high' | 'medium' | 'low' | 'disengaged'
          components      dict    per-dimension scores
          trend           str     'improving' | 'stable' | 'declining'
          trend_delta     float   Δ between recent and earlier window
          insights        list    Human-readable bullet points
          is_at_risk      bool    True when score < 0.40
        """
        engagement_logs = student_data.get('engagement', [])
        homework_records = student_data.get('homework', [])

        # --- Per-dimension scores ---
        participation_score = self._score_participation(engagement_logs)
        question_score      = self._score_questions(engagement_logs)
        homework_score      = self._score_homework(homework_records)
        trend_score, trend_direction, trend_delta = self._score_trend(engagement_logs)

        components = {
            'participation': round(participation_score, 4),
            'questions':     round(question_score, 4),
            'homework':      round(homework_score, 4),
            'trend':         round(trend_score, 4),
        }

        # --- Composite ---
        composite = sum(
            components[dim] * weight
            for dim, weight in self.WEIGHTS.items()
        )
        composite = round(float(np.clip(composite, 0.0, 1.0)), 4)

        level = self._categorize_level(composite)
        insights = self._generate_insights(components, trend_direction, student_data)

        return {
            'score':       composite,
            'level':       level,
            'components':  components,
            'trend':       trend_direction,
            'trend_delta': round(float(trend_delta), 4),
            'insights':    insights,
            'is_at_risk':  composite < 0.40,
        }

    def batch_score(self, students: List[Dict]) -> List[Dict]:
        """Score a list of students and return ranked results (lowest score first)."""
        results = []
        for s in students:
            sid  = s.get('student_id', 'unknown')
            name = s.get('student_info', {}).get('name', 'Unknown')
            report = self.compute_score(s)
            results.append({'student_id': sid, 'name': name, **report})
        results.sort(key=lambda x: x['score'])
        return results

    # ------------------------------------------------------------------ #
    # Dimension scorers
    # ------------------------------------------------------------------ #

    def _score_participation(self, logs: List[Dict]) -> float:
        """Score based on average participation_score in recent 30 days."""
        if not logs:
            return 0.5  # neutral default — not enough evidence

        recent = self._filter_recent(logs, days=30)
        if not recent:
            recent = logs  # fall back to all data

        scores = [float(e.get('participation_score', 0)) for e in recent]
        avg = float(np.mean(scores))

        # Bonus for high-interaction days
        high_days = sum(1 for e in recent if e.get('class_interaction_level') == 'high')
        bonus = min(0.10, high_days / max(len(recent), 1) * 0.15)

        return min(1.0, avg + bonus)

    def _score_questions(self, logs: List[Dict]) -> float:
        """
        Score curiosity via questions_asked.
        Normalised against a 'good' baseline of 1 question every 2 days.
        """
        if not logs:
            return 0.3  # slightly penalise — no data is a mild red flag

        recent = self._filter_recent(logs, days=30)
        if not recent:
            recent = logs

        total_questions = sum(int(e.get('questions_asked', 0)) for e in recent)
        days = len(recent)

        # Questions per day → normalise against baseline of 0.5 q/day
        q_per_day = total_questions / max(days, 1)
        normalized = min(1.0, q_per_day / 0.5)

        # Recency bonus: questions in last 7 days weighted more
        last_7 = self._filter_recent(logs, days=7)
        recent_q = sum(int(e.get('questions_asked', 0)) for e in last_7)
        recency_bonus = min(0.10, recent_q * 0.02)

        return min(1.0, normalized + recency_bonus)

    def _score_homework(self, records: List[Dict]) -> float:
        """Score homework submission consistency and quality."""
        if not records:
            return 0.5

        n = len(records)
        completed   = sum(1 for h in records if h.get('status') in ['submitted', 'late'])
        on_time     = sum(1 for h in records if h.get('status') == 'submitted')
        missing     = sum(1 for h in records if h.get('status') == 'missing')
        qualities   = [float(h['quality_score']) for h in records if h.get('quality_score') is not None]

        completion_rate = completed / n
        on_time_rate    = on_time / n
        missing_penalty = min(0.30, missing / n * 0.40)
        quality_avg     = float(np.mean(qualities)) if qualities else 0.5

        raw = (completion_rate * 0.40
               + on_time_rate   * 0.30
               + quality_avg    * 0.30
               - missing_penalty)

        return float(np.clip(raw, 0.0, 1.0))

    def _score_trend(self, logs: List[Dict]):
        """
        Score whether engagement is improving or declining.

        Returns (trend_score: float, direction: str, delta: float)
        """
        if len(logs) < 6:
            return 0.5, 'stable', 0.0

        sorted_logs = sorted(logs, key=lambda x: x.get('date', datetime.min))
        mid = len(sorted_logs) // 2
        early  = sorted_logs[:mid]
        recent = sorted_logs[mid:]

        def avg_eng(subset):
            if not subset:
                return 0.5
            p = [float(e.get('participation_score', 0)) for e in subset]
            q = [int(e.get('questions_asked', 0)) for e in subset]
            return (float(np.mean(p)) + min(1.0, float(np.mean(q)) / 0.5)) / 2

        early_avg  = avg_eng(early)
        recent_avg = avg_eng(recent)
        delta = recent_avg - early_avg

        if delta > 0.10:
            direction = 'improving'
            trend_score = min(1.0, 0.5 + delta * 2)
        elif delta < -0.10:
            direction = 'declining'
            trend_score = max(0.0, 0.5 + delta * 2)
        else:
            direction = 'stable'
            trend_score = 0.5

        return trend_score, direction, delta

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    def _filter_recent(self, data: List[Dict], days: int) -> List[Dict]:
        cutoff = (datetime.now() - timedelta(days=days)).date()
        return [d for d in data if d.get('date') and d['date'] >= cutoff]

    def _categorize_level(self, score: float) -> str:
        for threshold, label in self.LEVELS:
            if score >= threshold:
                return label
        return 'disengaged'

    def _generate_insights(self,
                           components: Dict,
                           trend: str,
                           student_data: Dict) -> List[str]:
        """Generate human-readable bullet-point insights."""
        insights = []

        if components['participation'] < 0.35:
            insights.append("⚠️ Class participation is critically low — student rarely engages in lessons.")

        if components['questions'] < 0.25:
            insights.append("⚠️ Student is not asking questions — may be confused or disengaged.")

        if components['homework'] < 0.40:
            insights.append("⚠️ Homework submission rate is poor — follow up with student and parents.")

        if trend == 'declining':
            insights.append("📉 Engagement is on a downward trend — early intervention recommended.")

        if trend == 'improving':
            insights.append("📈 Engagement is improving — continue current support strategies.")

        if components['participation'] > 0.75 and components['questions'] > 0.60:
            insights.append("✅ Student is actively participating and asking questions — healthy engagement.")

        if not insights:
            insights.append("ℹ️ Engagement is moderate. Continue monitoring for changes.")

        return insights
