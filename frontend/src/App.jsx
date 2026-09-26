import { useEffect, useState } from "react";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const HISTORY_KEY = "student-performance-predictions";

const fields = [
  { name: "study_hours", label: "Study hours per day", min: 0, max: 24, step: 0.5, hint: "Average time spent studying each day" },
  { name: "attendance", label: "Attendance", min: 0, max: 100, step: 1, suffix: "%", hint: "Percentage of classes attended" },
  { name: "previous_score", label: "Previous score", min: 0, max: 100, step: 1, suffix: "%", hint: "Most recent academic score" },
];

const initialValues = { study_hours: "", attendance: "", previous_score: "" };

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((item) => item && Number.isFinite(item.prediction)) : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    // Predictions still work when browser storage is unavailable.
  }
}

function categoryFor(score) {
  if (score < 40) return "At Risk";
  if (score < 60) return "Needs Improvement";
  if (score < 75) return "Average";
  if (score < 90) return "Good";
  return "Excellent";
}

function formatMetric(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === "string" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function App() {
  const [values, setValues] = useState(initialValues);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState(readHistory);
  const [modelInfo, setModelInfo] = useState(null);
  const [modelInfoUnavailable, setModelInfoUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/model-info`)
      .then((response) => {
        if (!response.ok) throw new Error("Model details are unavailable");
        return response.json();
      })
      .then((data) => {
        if (active && data && typeof data === "object" && !Array.isArray(data)) setModelInfo(data);
      })
      .catch(() => {
        if (active) setModelInfoUnavailable(true);
      });
    return () => { active = false; };
  }, []);

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = Object.fromEntries(fields.map(({ name }) => [name, Number(values[name])]));
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = typeof data.detail === "string" ? data.detail : "Please check the values and try again.";
        throw new Error(detail);
      }
      const score = Number(data.prediction);
      if (!Number.isFinite(score)) throw new Error("The prediction service returned an invalid score.");

      const entry = { id: `${Date.now()}-${Math.random()}`, prediction: Math.max(0, Math.min(100, score)), createdAt: new Date().toISOString() };
      const updatedHistory = [entry, ...history].slice(0, 5);
      setPrediction(entry);
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
    } catch (requestError) {
      setError(requestError.message || "Could not reach the prediction service. Check the API URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Student Performance Predictor home">
          <span className="brand-mark">SP</span>
          <span className="brand-copy"><strong>Student Performance</strong><small>Predictor</small></span>
        </a>
        <span className="header-status"><i /> Learning insights</span>
      </header>

      <main className="page" id="home">
        <section className="intro">
          <p className="eyebrow">A clearer view of your progress</p>
          <h1>Turn your study habits into <span>insight.</span></h1>
          <p className="intro-text">Enter a few academic indicators to get an estimated score and a useful starting point for your next steps.</p>
        </section>

        <div className="workspace">
          <section className="panel input-panel" aria-labelledby="form-title">
            <div className="panel-heading">
              <div><p className="step-label">YOUR DETAILS</p><h2 id="form-title">Academic indicators</h2></div>
              <span className="panel-number">01</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                {fields.map((field) => (
                  <label className="field" key={field.name}>
                    <span className="field-label">{field.label}</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        name={field.name}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        required
                        value={values[field.name]}
                        onChange={handleChange}
                        placeholder="0"
                      />
                      {field.suffix && <span className="input-suffix">{field.suffix}</span>}
                    </span>
                    <span className="field-hint">{field.hint}</span>
                  </label>
                ))}
              </div>
              {error && <p className="error-message" role="alert">{error}</p>}
              <button className="predict-button" type="submit" disabled={loading}>
                {loading ? <><span className="spinner" /> Calculating…</> : <>Predict my score <span aria-hidden="true">→</span></>}
              </button>
              <p className="form-note">This estimate is for learning and exploration.</p>
            </form>
          </section>

          <section className="panel result-panel" aria-live="polite" aria-labelledby="result-title">
            <div className="panel-heading">
              <div><p className="step-label">YOUR ESTIMATE</p><h2 id="result-title">Performance outlook</h2></div>
              <span className="panel-number">02</span>
            </div>
            {prediction ? (
              <div className="result-content">
                <div className="score-display">
                  <div className="score-ring" style={{ "--score": `${prediction.prediction * 3.6}deg` }}>
                    <div><strong>{prediction.prediction.toFixed(1)}</strong><span>out of 100</span></div>
                  </div>
                  <div className="score-summary"><span className="category-pill">{categoryFor(prediction.prediction)}</span><h3>Your habits give you a helpful baseline.</h3><p>Use this estimate as a guide while you keep building consistent study routines.</p></div>
                </div>
                <div className="result-tip"><span>Next step</span><p>Review your attendance and study routine regularly, then try another prediction as your habits change.</p></div>
              </div>
            ) : (
              <div className="empty-result"><span className="empty-icon" aria-hidden="true">↗</span><h3>Your estimate will appear here</h3><p>Fill in the three indicators to see your predicted score and performance category.</p></div>
            )}
          </section>
        </div>

        <section className="lower-grid">
          <section className="panel info-panel" aria-labelledby="model-title">
            <div className="panel-heading compact"><div><p className="step-label">UNDER THE HOOD</p><h2 id="model-title">Model information</h2></div></div>
            {modelInfo ? (
              <dl className="model-metrics">
                {Object.entries(modelInfo).map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{formatMetric(value)}</dd></div>)}
              </dl>
            ) : <p className="muted-copy">{modelInfoUnavailable ? "Model details could not be loaded right now." : "Loading model details…"}</p>}
          </section>

          <section className="panel history-panel" aria-labelledby="history-title">
            <div className="history-heading"><div><p className="step-label">ON THIS DEVICE</p><h2 id="history-title">Recent predictions</h2></div>{history.length > 0 && <button className="clear-button" type="button" onClick={clearHistory}>Clear</button>}</div>
            {history.length === 0 ? <p className="muted-copy">Your recent estimates will be saved in this browser.</p> : (
              <ul className="history-list">{history.map((item) => <li key={item.id}><span>{categoryFor(item.prediction)}</span><strong>{item.prediction.toFixed(1)}</strong><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time></li>)}</ul>
            )}
          </section>
        </section>
      </main>
      <footer>Estimates are based on the information entered and should not be treated as a definitive measure of ability.</footer>
    </div>
  );
}

export default App;
