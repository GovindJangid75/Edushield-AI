# app/ml_models/model_trainer.py
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib
from datetime import datetime

from app.ml_models.feature_engineering import FeatureEngineer


class DropoutModelTrainer:
    """Train and evaluate dropout prediction models."""

    def __init__(self):
        self.feature_engineer = FeatureEngineer()
        self.model = None
        self.feature_names = None

    def prepare_training_data(self, student_data: list) -> tuple:
        X_list, y_list = [], []
        for student in student_data:
            features = self.feature_engineer.extract_all_features(student)
            X_list.append(features)
            y_list.append(1 if student.get('dropped_out', False) else 0)
        X = np.array(X_list)
        y = np.array(y_list)
        self.feature_names = self.feature_engineer.get_feature_names()
        return X, y, self.feature_names

    def train_model(self, X, y, model_type='gradient_boosting'):
        print(f"Training {model_type} model on {len(X)} samples (dropout rate: {np.mean(y)*100:.2f}%)")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        if model_type == 'gradient_boosting':
            self.model = GradientBoostingClassifier(
                n_estimators=200, learning_rate=0.05, max_depth=5,
                min_samples_split=20, min_samples_leaf=10, subsample=0.8, random_state=42
            )
        else:
            self.model = RandomForestClassifier(
                n_estimators=200, max_depth=10, min_samples_split=20, random_state=42
            )
        self.model.fit(X_train, y_train)
        self._evaluate_model(X_test, y_test)
        return self.model

    def _evaluate_model(self, X_test, y_test):
        y_pred = self.model.predict(X_test)
        y_proba = self.model.predict_proba(X_test)[:, 1]
        print("\n" + "="*50 + "\nMODEL EVALUATION\n" + "="*50)
        print(classification_report(y_test, y_pred, target_names=['Not At Risk', 'At Risk']))
        print(f"ROC AUC: {roc_auc_score(y_test, y_proba):.4f}")
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        if hasattr(self.model, 'feature_importances_'):
            self._print_feature_importance()

    def _print_feature_importance(self):
        importances = self.model.feature_importances_
        indices = np.argsort(importances)[::-1]
        print("\nTop 10 Features:")
        for i in range(min(10, len(importances))):
            idx = indices[i]
            print(f"  {i+1}. {self.feature_names[idx]}: {importances[idx]:.4f}")

    def save_model(self, filepath: str, version: str = "1.0.0"):
        joblib.dump({
            'model': self.model,
            'feature_names': self.feature_names,
            'version': version,
            'trained_at': datetime.now().isoformat()
        }, filepath)
        print(f"Model saved to: {filepath}")

    def load_model(self, filepath: str):
        data = joblib.load(filepath)
        self.model = data['model']
        self.feature_names = data['feature_names']
        print(f"Model loaded: version {data.get('version', 'unknown')}")
        return self.model


if __name__ == "__main__":
    historical_data = []  # Load your training data here
    trainer = DropoutModelTrainer()
    X, y, feature_names = trainer.prepare_training_data(historical_data)
    model = trainer.train_model(X, y, model_type='gradient_boosting')
    trainer.save_model('models/dropout_predictor_v1.pkl', version='1.0.0')
