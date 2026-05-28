# tests/test_ai_engine.py
import pytest
from app.ai_engine.dropout_detector import SilentDropoutDetector
from app.ai_engine.hidden_student_detector import HiddenStudentDetector
from app.ai_engine.risk_categorizer import RiskCategorizer
from app.ai_engine.intervention_recommender import InterventionRecommender
from app.ml_models.feature_engineering import FeatureEngineer


EMPTY_STUDENT = {
    'student_id': 'test-001',
    'student_info': {'name': 'Test Student', 'class': '10'},
    'attendance': [],
    'performance': [],
    'homework': [],
    'engagement': [],
    'observations': [],
}

AT_RISK_STUDENT = {
    'student_id': 'test-002',
    'student_info': {'name': 'At Risk Student', 'class': '10'},
    'attendance': [
        {'date': None, 'status': 'absent', 'reason': None}
        for _ in range(15)
    ] + [
        {'date': None, 'status': 'present', 'reason': None}
        for _ in range(5)
    ],
    'performance': [
        {'subject': 'Math', 'assessment_type': 'exam', 'max_marks': 100, 'obtained_marks': 28, 'assessment_date': None},
        {'subject': 'Science', 'assessment_type': 'exam', 'max_marks': 100, 'obtained_marks': 35, 'assessment_date': None},
    ],
    'homework': [
        {'status': 'missing', 'quality_score': 0.1} for _ in range(8)
    ],
    'engagement': [
        {'participation_score': 0.1, 'questions_asked': 0} for _ in range(10)
    ],
    'observations': [
        {'concern_level': 'high', 'transcribed_text': 'student is very silent and isolated', 'sentiment': 'negative'}
    ],
}


def test_dropout_detector_empty_data():
    detector = SilentDropoutDetector()
    prediction = detector.predict_risk(EMPTY_STUDENT)
    assert 'risk_score' in prediction
    assert 'risk_level' in prediction
    assert 0.0 <= prediction['risk_score'] <= 1.0


def test_dropout_detector_at_risk():
    detector = SilentDropoutDetector()
    prediction = detector.predict_risk(AT_RISK_STUDENT)
    assert 'risk_score' in prediction
    # At-risk student should have higher score than empty baseline
    empty_pred = detector.predict_risk(EMPTY_STUDENT)
    assert prediction['risk_score'] >= empty_pred['risk_score']


def test_hidden_student_detector():
    detector = HiddenStudentDetector()
    result = detector.detect_hidden_patterns(EMPTY_STUDENT)
    assert 'is_hidden' in result
    assert 'hidden_score' in result


def test_hidden_student_detector_at_risk():
    detector = HiddenStudentDetector()
    result = detector.detect_hidden_patterns(AT_RISK_STUDENT)
    assert 'is_hidden' in result
    assert isinstance(result['hidden_score'], (int, float))


def test_risk_categorizer():
    detector = SilentDropoutDetector()
    hidden = HiddenStudentDetector()
    categorizer = RiskCategorizer()
    dropout_risk = detector.predict_risk(AT_RISK_STUDENT)
    hidden_patterns = hidden.detect_hidden_patterns(AT_RISK_STUDENT)
    triage = categorizer.categorize_risk(dropout_risk, hidden_patterns)
    assert 'category' in triage
    assert triage['category'] in ['critical', 'high', 'moderate', 'low', 'stable']


def test_intervention_recommender():
    detector = SilentDropoutDetector()
    hidden = HiddenStudentDetector()
    categorizer = RiskCategorizer()
    recommender = InterventionRecommender()
    dropout_risk = detector.predict_risk(AT_RISK_STUDENT)
    hidden_patterns = hidden.detect_hidden_patterns(AT_RISK_STUDENT)
    triage = categorizer.categorize_risk(dropout_risk, hidden_patterns)
    interventions = recommender.recommend_interventions(dropout_risk, hidden_patterns, triage)
    assert isinstance(interventions, list)


def test_feature_engineer():
    fe = FeatureEngineer()
    features = fe.extract_all_features(AT_RISK_STUDENT)
    assert len(features) == len(fe.get_feature_names())
    assert all(isinstance(f, (int, float)) for f in features)


def test_feature_engineer_empty():
    fe = FeatureEngineer()
    features = fe.extract_all_features(EMPTY_STUDENT)
    assert len(features) == len(fe.get_feature_names())
