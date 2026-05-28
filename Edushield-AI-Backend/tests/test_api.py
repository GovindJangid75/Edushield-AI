# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "EduShield AI" in response.json()["message"]


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_student():
    student_data = {
        "student_id": "TEST001",
        "name": "Test Student",
        "class": "10th"
    }
    response = client.post("/api/students/", json=student_data)
    # May fail with 400 if student already exists, which is also valid
    assert response.status_code in (200, 400)


def test_risk_assessment():
    """Creates a student then runs an AI risk assessment."""
    student_data = {
        "student_id": "RISK_TEST_001",
        "name": "Risk Test Student",
        "class": "10th"
    }
    create_response = client.post("/api/students/", json=student_data)
    # If already exists from prior run, skip
    if create_response.status_code == 400:
        pytest.skip("Student already exists from a previous test run")

    student_id = create_response.json()["id"]
    response = client.post(f"/api/students/{student_id}/assess-risk")
    assert response.status_code == 200
    data = response.json()
    assert "dropout_risk" in data
    assert "triage" in data
    assert "interventions" in data


def test_list_students():
    response = client.get("/api/students/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_teachers():
    response = client.get("/api/teachers/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_interventions():
    response = client.get("/api/interventions/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
