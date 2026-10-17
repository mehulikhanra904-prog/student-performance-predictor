from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def valid_prediction_data():
    return {
        "study_hours": 5,
        "attendance": 80,
        "previous_score": 70,
        "assignments_completed": 85,
        "sleep_hours": 7,
        "participation": 8,
    }


def test_negative_study_hours_returns_clear_error():
    data = valid_prediction_data()
    data["study_hours"] = -1

    response = client.post("/predict", json=data)

    assert response.status_code == 422
    assert "Study hours must be at least 0" in response.json()["detail"]


def test_attendance_above_limit_returns_clear_error():
    data = valid_prediction_data()
    data["attendance"] = 101

    response = client.post("/predict", json=data)

    assert response.status_code == 422
    assert "Attendance must be at most 100" in response.json()["detail"]


def test_missing_required_field_returns_clear_error():
    data = valid_prediction_data()
    del data["study_hours"]

    response = client.post("/predict", json=data)

    assert response.status_code == 422
    assert "Study hours is required" in response.json()["detail"]


def test_invalid_number_returns_clear_error():
    data = valid_prediction_data()
    data["study_hours"] = "abc"

    response = client.post("/predict", json=data)

    assert response.status_code == 422
    assert "Study hours must be a valid number" in response.json()["detail"]