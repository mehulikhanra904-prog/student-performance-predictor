import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200


def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model" in data or isinstance(data, dict)


def test_prediction_endpoint():
    payload = {
        "study_hours": 6,
        "attendance": 85,
        "previous_score": 75,
        "assignments_complete": 90,
        "sleep_hours": 7,
        "participation": 80,
    }

    response = client.post("/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "prediction" in data
