from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib

app = FastAPI(title="Student Performance Predictor", description="ML-based student performance prediction API", version="1.1.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

try:
    model = joblib.load("model.pkl")
    model_info = joblib.load("model_info.pkl")
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
    participation: float = Field(ge=0, le=100)


@app.get("/")
def home():
    return {"message": "Student Performance Predictor API is running"}


@app.post("/predict")
def predict(data: StudentData):
    if model is None:
        raise HTTPException(status_code=503, detail="Prediction model is currently unavailable.")

    try:
        prediction = model.predict([[
            data.study_hours, data.attendance, data.previous_score,
            data.assignments_completed, data.sleep_hours, data.participation
        ]])
    except Exception as exc:
        print(f"Prediction failed: {exc}")
        raise HTTPException(status_code=500, detail="Unable to generate prediction.")

    score = round(float(prediction[0]), 2)
    score = max(0, min(100, score))

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


@app.get("/model-info")
def get_model_info():
    if not model_info:
        raise HTTPException(status_code=503, detail="Model information is currently unavailable.")
    return model_info
