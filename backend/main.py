from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib


BASE_DIR = Path(__file__).resolve().parent


model = joblib.load(BASE_DIR / "model.pkl")
model_info = joblib.load(BASE_DIR / "model_info.pkl")


app = FastAPI(
    title="Student Performance Predictor API",
    description="API for predicting student performance",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentData(BaseModel):
    study_hours: float = Field(..., ge=0)
    attendance: float = Field(..., ge=0, le=100)
    previous_score: float = Field(..., ge=0, le=100)


@app.get("/")
def home():
    return {
        "status": "online",
        "message": "Student Performance Predictor API"
    }


@app.get("/model-info")
def get_model_info():
    return model_info


@app.post("/predict")
def predict(data: StudentData):

    features = [[
        data.study_hours,
        data.attendance,
        data.previous_score
    ]]

    prediction = model.predict(features)[0]

    return {
        "prediction": float(prediction)
    }