from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.pkl"
INFO_PATH = BASE_DIR / "model_info.pkl"

app = FastAPI(
    title="Student Performance Predictor API",
    description="Machine learning API for estimating student academic performance.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load(MODEL_PATH)
    model_info = joblib.load(INFO_PATH)
except Exception as exc:
    model = None
    model_info = {}
    print(f"Model loading failed: {exc}")


class StudentData(BaseModel):
    study_hours: float = Field(ge=0, le=24)
    attendance: float = Field(ge=0, le=100)
    previous_score: float = Field(ge=0, le=100)
    assignments_completed: float = Field(ge=0, le=100)
    sleep_hours: float = Field(ge=0, le=24)
    participation: float = Field(ge=1, le=10)


@app.get("/")
def home():
    return {"status": "online", "message": "Student Performance Predictor API"}


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}


@app.get("/model-info")
def get_model_info():
    if not model_info:
        raise HTTPException(status_code=503, detail="Model information is unavailable.")
    return model_info


@app.post("/predict")
def predict(data: StudentData):
    if model is None:
        raise HTTPException(status_code=503, detail="Prediction model is unavailable.")
    features = [[
        data.study_hours,
        data.attendance,
        data.previous_score,
        data.assignments_completed,
        data.sleep_hours,
        data.participation,
    ]]
    try:
        score = round(float(model.predict(features)[0]), 2)
    except Exception as exc:
        print(f"Prediction failed: {exc}")
        raise HTTPException(status_code=500, detail="Unable to generate a prediction.") from exc
    score = max(0.0, min(100.0, score))
    if score >= 90:
        performance = "Excellent"
    elif score >= 75:
        performance = "Good"
    elif score >= 60:
        performance = "Average"
    elif score >= 40:
        performance = "Needs Improvement"
    else:
        performance = "At Risk"
    return {"predicted_score": score, "performance": performance}
