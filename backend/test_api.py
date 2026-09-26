from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_invalid_prediction():
    response = client.post(
        "/predict",
        json={
            "hours_studied": -1,
            "previous_scores": 50,
            "sleep_hours": 7,
            "attendance": 80
        }
    )

    assert response.status_code == 422