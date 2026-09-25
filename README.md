# Student Performance Predictor

A full-stack machine learning application that predicts student performance from academic inputs.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **Machine Learning:** Python, scikit-learn
- **Model:** Trained regression model stored with pickle
- **API:** REST endpoint for predictions

## Project Structure

```
student-performance-predictor/
├── backend/
│   ├── dataset.csv
│   ├── main.py
│   ├── model.pkl
│   ├── model_info.pkl
│   ├── train_model.py
│   └── test.py
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

## Run Locally

### Backend

```powershell
cd backend
pip install fastapi uvicorn pandas scikit-learn
uvicorn main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Features

- Student input form
- ML-based performance prediction
- FastAPI prediction endpoint
- React-based user interface
- Separate frontend and backend architecture

## Purpose

This project is built as a beginner-friendly full-stack ML project to demonstrate how a trained machine learning model can be integrated into a web application.


## Contributors

Thanks to everyone who contributes to Student Performance Predictor! ❤️

Contributors will be listed here as the project grows.

<a href="https://github.com/mehulikhanra904-prog/student-performance-predictor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mehulikhanra904-prog/student-performance-predictor" />
</a>

Want to contribute?

Check out our open issues and look for issues labeled `good first issue` or `help wanted`.
