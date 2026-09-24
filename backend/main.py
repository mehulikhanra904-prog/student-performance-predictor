from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib


# =========================================================
# CREATE FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Student Performance Predictor",
    description="ML-based student performance prediction API",
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# LOAD TRAINED ML MODEL
# =========================================================

model = joblib.load("model.pkl")

# Load model evaluation information
model_info = joblib.load("model_info.pkl")


# =========================================================
# INPUT DATA STRUCTURE
# =========================================================

class StudentData(BaseModel):
    study_hours: float
    attendance: float
    previous_score: float
    assignments_completed: float
    sleep_hours: float
    participation: float


# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Student Performance Predictor API is running"
    }


# =========================================================
# PREDICTION ROUTE
# =========================================================

@app.post("/predict")
def predict(data: StudentData):

    # Generate prediction using trained ML model
    prediction = model.predict([
        [
            data.study_hours,
            data.attendance,
            data.previous_score,
            data.assignments_completed,
            data.sleep_hours,
            data.participation
        ]
    ])

    # Convert prediction to a normal number
    score = round(float(prediction[0]), 2)

    # Keep score between 0 and 100
    score = max(0, min(100, score))


    # =====================================================
    # PERFORMANCE CATEGORY
    # =====================================================

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


    # =====================================================
    # RETURN PREDICTION
    # =====================================================

    return {
        "predicted_score": score,
        "performance": performance
    }


# =========================================================
# MODEL INFORMATION ROUTE
# =========================================================

@app.get("/model-info")
def get_model_info():

    return model_info