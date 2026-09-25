from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200


def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200


def test_prediction_endpoint():
    payload = {
        "study_hours": 6,
        "attendance": 85,
        "previous_score": 75,
        "assignments_completed": 90,
        "sleep_hours": 7,
        "participation": 80,
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert "predicted_score" in data
    assert "performance" in data


def test_invalid_study_hours():
    payload = {
        "study_hours": 25,
        "attendance": 85,
        "previous_score": 75,
        "assignments_completed": 90,
        "sleep_hours": 7,
        "participation": 80,
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 422


def test_invalid_attendance():
    payload = {
        "study_hours": 6,
        "attendance": 101,
        "previous_score": 75,
        "assignments_completed": 90,
        "sleep_hours": 7,
        "participation": 80,
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 422


def test_negative_previous_score():
    payload = {
        "study_hours": 6,
        "attendance": 85,
        "previous_score": -1,
        "assignments_completed": 90,
        "sleep_hours": 7,
        "participation": 80,
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 422


def test_missing_required_field():
    payload = {
        "study_hours": 6,
        "attendance": 85,
        "previous_score": 75,
        "assignments_completed": 90,
        "sleep_hours": 7,
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 422