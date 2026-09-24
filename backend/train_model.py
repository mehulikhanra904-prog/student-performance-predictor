import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# Load dataset
data = pd.read_csv("dataset.csv")

# Input features
X = data[
    [
        "study_hours",
        "attendance",
        "previous_score",
        "assignments_completed",
        "sleep_hours",
        "participation",
    ]
]

# Target
y = data["final_score"]


# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# Create model
model = LinearRegression()

# Train model
model.fit(X_train, y_train)


# Predictions
predictions = model.predict(X_test)


# Evaluation metrics
mae = mean_absolute_error(y_test, predictions)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)


# Save model
joblib.dump(model, "model.pkl")


# Save model information
model_info = {
    "model": "Linear Regression",
    "training_samples": len(X_train),
    "testing_samples": len(X_test),
    "mae": round(float(mae), 2),
    "rmse": round(float(rmse), 2),
    "r2_score": round(float(r2), 3),
}

joblib.dump(model_info, "model_info.pkl")


print("\nModel Training Completed!")
print("--------------------------------")
print(f"Training samples : {len(X_train)}")
print(f"Testing samples  : {len(X_test)}")
print(f"MAE              : {mae:.2f}")
print(f"RMSE             : {rmse:.2f}")
print(f"R² Score         : {r2:.3f}")
print("--------------------------------")
print("model.pkl saved successfully.")
print("model_info.pkl saved successfully.")