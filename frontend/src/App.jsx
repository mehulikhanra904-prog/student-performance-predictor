import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // =====================================================
  // INITIAL FORM
  // =====================================================

  const initialForm = {
    study_hours: "",
    attendance: "",
    previous_score: "",
    assignments_completed: "",
    sleep_hours: "",
    participation: "",
  };


  // =====================================================
  // STATES
  // =====================================================

  const [formData, setFormData] = useState(initialForm);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [modelInfo, setModelInfo] = useState(null);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(
      "student_prediction_history"
    );

    return saved ? JSON.parse(saved) : [];
  });


  // =====================================================
  // SAVE HISTORY TO LOCAL STORAGE
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "student_prediction_history",
      JSON.stringify(history)
    );
  }, [history]);


  // =====================================================
  // LOAD MODEL INFORMATION
  // =====================================================

  useEffect(() => {
    fetch(`${API_URL}/model-info`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load model information");
        }

        return response.json();
      })
      .then((data) => {
        setModelInfo(data);
      })
      .catch((error) => {
        console.error(
          "Could not load model information:",
          error
        );
      });
  }, []);


  // =====================================================
  // HANDLE INPUT CHANGES
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // =====================================================
  // PERSONALIZED RECOMMENDATIONS
  // =====================================================

  const getRecommendations = () => {
    const recommendations = [];

    if (Number(formData.study_hours) < 5) {
      recommendations.push(
        "Try increasing your daily study time gradually."
      );
    }

    if (Number(formData.attendance) < 75) {
      recommendations.push(
        "Improve your attendance to maintain academic consistency."
      );
    }

    if (Number(formData.assignments_completed) < 7) {
      recommendations.push(
        "Complete more assignments to strengthen your preparation."
      );
    }

    if (Number(formData.sleep_hours) < 6) {
      recommendations.push(
        "Maintain a healthier sleep schedule."
      );
    }

    if (Number(formData.participation) < 6) {
      recommendations.push(
        "Participate more actively in classes."
      );
    }

    if (Number(formData.previous_score) < 60) {
      recommendations.push(
        "Focus on strengthening your core concepts."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Your current habits look consistent. Keep maintaining them."
      );
    }

    return recommendations;
  };


  // =====================================================
  // PREDICTION
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/predict`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            study_hours: Number(formData.study_hours),

            attendance: Number(formData.attendance),

            previous_score: Number(
              formData.previous_score
            ),

            assignments_completed: Number(
              formData.assignments_completed
            ),

            sleep_hours: Number(
              formData.sleep_hours
            ),

            participation: Number(
              formData.participation
            ),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();

      setResult(data);


      // =================================================
      // SAVE PREDICTION TO HISTORY
      // =================================================

      const newPrediction = {
        id: Date.now(),

        score: data.predicted_score,

        performance: data.performance,

        date: new Date().toLocaleString(),
      };

      setHistory((prev) =>
        [newPrediction, ...prev].slice(0, 10)
      );

    } catch (error) {
      console.error(error);

      setError(
        "Could not connect to the prediction server. Make sure FastAPI is running on port 8000."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData(initialForm);

    setResult(null);

    setError("");
  };


  // =====================================================
  // CLEAR HISTORY
  // =====================================================

  const clearHistory = () => {
    setHistory([]);

    localStorage.removeItem(
      "student_prediction_history"
    );
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">

        <div className="logo">
          🎓 PerformanceAI
        </div>

        <div className="nav-text">
          Student Performance Prediction System
        </div>

      </header>


      <main className="container">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">

          <p className="tag">
            AI-POWERED ACADEMIC ANALYSIS
          </p>

          <h1>
            Predict Your
            <span> Academic Performance</span>
          </h1>

          <p className="subtitle">
            Analyze academic and lifestyle factors using
            a machine learning model to estimate your
            expected final score.
          </p>

        </section>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="content">


          {/* =================================================
              STUDENT INFORMATION
          ================================================= */}

          <section className="card form-card">

            <div className="card-header">

              <h2>
                Student Information
              </h2>

              <p>
                Enter your current academic details
              </p>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="form-grid">


                {/* STUDY HOURS */}

                <div className="input-group">

                  <label>
                    Study Hours / Day
                  </label>

                  <input
                    type="number"
                    name="study_hours"
                    placeholder="e.g. 6"
                    min="0"
                    max="24"
                    step="0.1"
                    value={formData.study_hours}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* ATTENDANCE */}

                <div className="input-group">

                  <label>
                    Attendance (%)
                  </label>

                  <input
                    type="number"
                    name="attendance"
                    placeholder="e.g. 85"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.attendance}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* PREVIOUS SCORE */}

                <div className="input-group">

                  <label>
                    Previous Score
                  </label>

                  <input
                    type="number"
                    name="previous_score"
                    placeholder="e.g. 72"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.previous_score}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* ASSIGNMENTS */}

                <div className="input-group">

                  <label>
                    Assignments Completed
                  </label>

                  <input
                    type="number"
                    name="assignments_completed"
                    placeholder="e.g. 8"
                    min="0"
                    step="1"
                    value={
                      formData.assignments_completed
                    }
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* SLEEP */}

                <div className="input-group">

                  <label>
                    Sleep Hours / Day
                  </label>

                  <input
                    type="number"
                    name="sleep_hours"
                    placeholder="e.g. 7"
                    min="0"
                    max="24"
                    step="0.1"
                    value={formData.sleep_hours}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* PARTICIPATION */}

                <div className="input-group">

                  <label>
                    Participation (1–10)
                  </label>

                  <input
                    type="number"
                    name="participation"
                    placeholder="e.g. 8"
                    min="1"
                    max="10"
                    step="1"
                    value={formData.participation}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}


              {/* BUTTONS */}

              <div className="button-row">

                <button
                  className="predict-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Analyzing..."
                    : "🔮 Predict Performance"}
                </button>


                <button
                  className="reset-btn"
                  type="button"
                  onClick={resetForm}
                >
                  Reset
                </button>

              </div>

            </form>

          </section>


          {/* =================================================
              PREDICTION RESULT
          ================================================= */}

          <section className="card result-card">

            <div className="card-header">

              <h2>
                Prediction Result
              </h2>

              <p>
                Machine learning prediction
              </p>

            </div>


            {!result ? (

              <div className="empty-result">

                <div className="empty-icon">
                  📊
                </div>

                <h3>
                  Ready to Predict
                </h3>

                <p>
                  Enter your information and run the
                  model to see your expected performance.
                </p>

              </div>

            ) : (

              <div className="result">


                {/* SCORE */}

                <div className="score-circle">

                  <strong>
                    {result.predicted_score}
                  </strong>

                  <small>
                    / 100
                  </small>

                </div>


                {/* PERFORMANCE */}

                <div className="performance">

                  <span>
                    Performance Level
                  </span>

                  <h3>
                    {result.performance}
                  </h3>

                </div>


                {/* SCORE BAR */}

                <div className="score-bar">

                  <div
                    className="score-fill"
                    style={{
                      width: `${result.predicted_score}%`,
                    }}
                  ></div>

                </div>


                {/* RECOMMENDATIONS */}

                <div className="recommendation">

                  <h3>
                    💡 Personalized Recommendations
                  </h3>

                  <ul>

                    {getRecommendations().map(
                      (item, index) => (

                        <li key={index}>
                          {item}
                        </li>

                      )
                    )}

                  </ul>

                </div>

              </div>

            )}

          </section>

        </div>


        {/* =================================================
            PREDICTION HISTORY
        ================================================= */}

        <section className="card history-card">

          <div className="history-header">

            <div>

              <h2>
                📈 Prediction History
              </h2>

              <p>
                Your last 10 predictions are stored locally.
              </p>

            </div>


            {history.length > 0 && (

              <button
                className="clear-btn"
                onClick={clearHistory}
              >
                Clear History
              </button>

            )}

          </div>


          {history.length === 0 ? (

            <div className="history-empty">

              No predictions yet. Run your first
              prediction above.

            </div>

          ) : (

            <div className="history-list">

              {history.map((item) => (

                <div
                  className="history-item"
                  key={item.id}
                >

                  <div>

                    <strong>
                      {item.score}/100
                    </strong>

                    <span>
                      {item.performance}
                    </span>

                  </div>

                  <small>
                    {item.date}
                  </small>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* =================================================
            MODEL EVALUATION
        ================================================= */}

        <section className="card model-card">

          <div className="card-header">

            <h2>
              🧠 Model Evaluation
            </h2>

            <p>
              Performance of the machine learning model
            </p>

          </div>


          {modelInfo ? (

            <>

              {/* MODEL NAME */}

              <div className="model-name">

                <span>
                  Model
                </span>

                <strong>
                  {modelInfo.model}
                </strong>

              </div>


              {/* METRICS */}

              <div className="metrics-grid">


                {/* MAE */}

                <div className="metric-card">

                  <span>
                    MAE
                  </span>

                  <strong>
                    {modelInfo.mae}
                  </strong>

                  <small>
                    Mean Absolute Error
                  </small>

                </div>


                {/* RMSE */}

                <div className="metric-card">

                  <span>
                    RMSE
                  </span>

                  <strong>
                    {modelInfo.rmse}
                  </strong>

                  <small>
                    Root Mean Squared Error
                  </small>

                </div>


                {/* R2 */}

                <div className="metric-card">

                  <span>
                    R² Score
                  </span>

                  <strong>
                    {modelInfo.r2_score}
                  </strong>

                  <small>
                    Coefficient of Determination
                  </small>

                </div>

              </div>


              {/* DATASET INFORMATION */}

              <div className="dataset-info">

                <div>

                  <strong>
                    {modelInfo.training_samples}
                  </strong>

                  <span>
                    Training Samples
                  </span>

                </div>


                <div>

                  <strong>
                    {modelInfo.testing_samples}
                  </strong>

                  <span>
                    Testing Samples
                  </span>

                </div>

              </div>


              {/* NOTE */}

              <p className="model-note">

                Metrics are calculated using the current
                dataset and test split. A larger dataset
                should be used for more reliable real-world
                evaluation.

              </p>

            </>

          ) : (

            <p className="loading-model">
              Loading model information...
            </p>

          )}

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        Student Performance Predictor • React + FastAPI
        + Machine Learning

      </footer>

    </div>
  );
}

export default App;
