# app/ml_models/feature_engineering.py
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List


class FeatureEngineer:
    """Feature engineering for dropout prediction."""

    def __init__(self):
        self.feature_names = [
            # Attendance (6)
            'attendance_rate_30d', 'attendance_rate_60d', 'attendance_decline_rate',
            'attendance_consistency', 'absence_streak_max', 'absence_frequency',
            # Performance (6)
            'avg_marks_30d', 'avg_marks_60d', 'marks_decline_rate',
            'marks_volatility', 'marks_trend', 'failing_subjects_count',
            # Homework (5)
            'homework_completion_rate', 'homework_quality_avg', 'homework_decline_rate',
            'late_submission_rate', 'missing_homework_streak',
            # Engagement (6)
            'participation_score_avg', 'participation_decline_rate', 'questions_asked_avg',
            'questions_decline_rate', 'days_since_last_question', 'low_engagement_days_pct',
            # Behavioral (4)
            'teacher_concern_score', 'behavioral_flags_count',
            'critical_observations_count', 'social_interaction_score',
            # Meta (3)
            'performance_consistency', 'engagement_consistency', 'overall_decline_trend',
        ]

    def extract_all_features(self, student_data: Dict) -> np.ndarray:
        features = []
        features.extend(self._extract_attendance_features(student_data.get('attendance', [])))
        features.extend(self._extract_performance_features(student_data.get('performance', [])))
        features.extend(self._extract_homework_features(student_data.get('homework', [])))
        features.extend(self._extract_engagement_features(student_data.get('engagement', [])))
        features.extend(self._extract_behavioral_features(student_data.get('observations', [])))
        features.extend(self._extract_meta_features(student_data))
        return np.array(features, dtype=float)

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

    def _extract_attendance_features(self, attendance: List[Dict]) -> List[float]:
        if not attendance:
            return [1.0, 1.0, 0.0, 1.0, 0.0, 0.0]
        sorted_att = sorted(attendance, key=self._safe_date)
        rate_30d = self._calc_attendance_rate(sorted_att, days=30)
        rate_60d = self._calc_attendance_rate(sorted_att, days=60)
        binary = [1.0 if a.get('status') == 'present' else 0.0 for a in sorted_att]
        decline = self._calc_decline_rate(binary)
        consistency = self._calc_consistency(binary)
        max_streak = self._calc_max_streak([a.get('status') for a in sorted_att], 'absent')
        absence_freq = sum(1 for a in sorted_att if a.get('status') == 'absent') / len(sorted_att)
        return [rate_30d, rate_60d, decline, consistency, max_streak, absence_freq]

    def _extract_performance_features(self, performance: List[Dict]) -> List[float]:
        if not performance:
            return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        percentages = [
            (p.get('obtained_marks', 0) / p['max_marks']) * 100
            for p in performance if p.get('max_marks', 0) > 0
        ]
        if not percentages:
            return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        avg_30d = float(np.mean(percentages[-5:])) if len(percentages) >= 5 else float(np.mean(percentages))
        avg_60d = float(np.mean(percentages))
        decline = self._calc_decline_rate(percentages)
        volatility = float(np.std(percentages)) if len(percentages) > 1 else 0.0
        trend = self._calc_trend(percentages)
        failing = sum(1 for p in percentages if p < 40)
        return [avg_30d, avg_60d, decline, volatility, trend, float(failing)]

    def _extract_homework_features(self, homework: List[Dict]) -> List[float]:
        if not homework:
            return [1.0, 1.0, 0.0, 0.0, 0.0]
        completed = sum(1 for h in homework if h.get('status') in ['submitted', 'late'])
        completion_rate = completed / len(homework)
        qualities = [h.get('quality_score', 0) for h in homework if 'quality_score' in h]
        quality_avg = float(np.mean(qualities)) if qualities else 0.5
        quality_decline = self._calc_decline_rate(qualities) if len(qualities) > 2 else 0.0
        late_rate = sum(1 for h in homework if h.get('status') == 'late') / len(homework)
        missing_streak = float(self._calc_max_streak([h.get('status') for h in homework], 'missing'))
        return [completion_rate, quality_avg, quality_decline, late_rate, missing_streak]

    def _extract_engagement_features(self, engagement: List[Dict]) -> List[float]:
        if not engagement:
            return [0.0, 0.0, 0.0, 0.0, 999.0, 0.0]
        scores = [e.get('participation_score', 0) for e in engagement]
        questions = [e.get('questions_asked', 0) for e in engagement]
        low_eng = sum(1 for s in scores if s < 0.3)
        return [
            float(np.mean(scores)),
            self._calc_decline_rate(scores),
            float(np.mean(questions)),
            self._calc_decline_rate(questions),
            self._days_since_last_event(engagement, 'questions_asked'),
            low_eng / len(scores)
        ]

    def _extract_behavioral_features(self, observations: List[Dict]) -> List[float]:
        if not observations:
            return [0.0, 0.0, 0.0, 0.5]
        concern_map = {'none': 0.0, 'low': 0.25, 'medium': 0.5, 'high': 0.75, 'critical': 1.0}
        concerns = [concern_map.get(o.get('concern_level', 'none'), 0) for o in observations]
        flags = sum(1 for o in observations if o.get('concern_level') in ['high', 'critical'])
        critical = sum(1 for o in observations if o.get('concern_level') == 'critical')
        social_kw = ['silent', 'isolated', 'alone', 'withdrawn']
        neg_social = sum(
            1 for o in observations
            if any(kw in o.get('transcribed_text', '').lower() for kw in social_kw)
        )
        social_score = 1.0 - (neg_social / len(observations))
        return [float(np.mean(concerns)), float(flags), float(critical), social_score]

    def _extract_meta_features(self, student_data: Dict) -> List[float]:
        perf = student_data.get('performance', [])
        eng = student_data.get('engagement', [])
        att = student_data.get('attendance', [])
        decline_scores = []
        if att:
            att_vals = [1.0 if a.get('status') == 'present' else 0.0 for a in att]
            decline_scores.append(self._calc_decline_rate(att_vals))
        if perf:
            pct = [(p.get('obtained_marks', 0) / p.get('max_marks', 1)) * 100 for p in perf if p.get('max_marks', 0) > 0]
            if pct:
                decline_scores.append(self._calc_decline_rate(pct) / 100)
        if eng:
            eng_vals = [e.get('participation_score', 0) for e in eng]
            decline_scores.append(self._calc_decline_rate(eng_vals))
        return [
            self._calc_overall_consistency(perf),
            self._calc_overall_consistency(eng),
            float(np.mean(decline_scores)) if decline_scores else 0.0
        ]

    # ---- helpers ----

    def _calc_attendance_rate(self, attendance: List[Dict], days: int = 30) -> float:
        cutoff = (datetime.now() - timedelta(days=days)).date()
        recent = [a for a in attendance if a.get('date') is not None and self._safe_date(a) >= cutoff]
        if not recent:
            return 1.0
        present = sum(1 for a in recent if a.get('status') == 'present')
        return present / len(recent)

    def _calc_decline_rate(self, values: List[float]) -> float:
        if len(values) < 2:
            return 0.0
        mid = len(values) // 2
        first_avg = float(np.mean(values[:mid])) if values[:mid] else 0.0
        second_avg = float(np.mean(values[mid:])) if values[mid:] else 0.0
        if first_avg == 0:
            return 0.0
        return max(0.0, (first_avg - second_avg) / first_avg)

    def _calc_consistency(self, values: List[float]) -> float:
        if len(values) < 2:
            return 1.0
        mean = float(np.mean(values))
        std = float(np.std(values))
        if mean == 0:
            return 0.0
        return 1.0 / (1.0 + std / mean)

    def _calc_max_streak(self, statuses: List, target_status: str) -> int:
        max_s, cur = 0, 0
        for s in statuses:
            if s == target_status:
                cur += 1
                max_s = max(max_s, cur)
            else:
                cur = 0
        return max_s

    def _calc_trend(self, values: List[float]) -> float:
        if len(values) < 2:
            return 0.0
        x = np.arange(len(values))
        return float(np.polyfit(x, values, 1)[0])

    def _days_since_last_event(self, data: List[Dict], field: str) -> float:
        events = [d for d in data if d.get(field, 0) > 0]
        if not events:
            return 999.0
        latest = max(events, key=self._safe_date)
        latest_date = self._safe_date(latest)
        if latest_date == datetime.min.date():
            return 999.0
        days = (datetime.now().date() - latest_date).days
        return float(days)

    def _calc_overall_consistency(self, data: List[Dict]) -> float:
        if len(data) < 3:
            return 1.0
        values = []
        for d in data:
            if 'obtained_marks' in d and d.get('max_marks', 0) > 0:
                values.append(d['obtained_marks'] / d['max_marks'])
            elif 'participation_score' in d:
                values.append(d['participation_score'])
        return self._calc_consistency(values) if values else 1.0

    def get_feature_names(self) -> List[str]:
        return self.feature_names
