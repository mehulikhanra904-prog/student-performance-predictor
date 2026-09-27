import { useEffect, useState } from "react";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const initial = { study_hours: "", attendance: "", previous_score: "", assignments_completed: "", sleep_hours: "", participation: "" };
const fields = [
  ["study_hours", "Study hours per day", "0", "24", "e.g. 6"],
  ["attendance", "Attendance (%)", "0", "100", "e.g. 85"],
  ["previous_score", "Previous score", "0", "100", "e.g. 72"],
  ["assignments_completed", "Assignments completed", "0", "100", "e.g. 8"],
  ["sleep_hours", "Sleep hours per day", "0", "24", "e.g. 7"],
  ["participation", "Class participation (1–10)", "1", "10", "e.g. 8"],
];

function App() {
  const [values, setValues] = useState(initial);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("student_prediction_history") || "[]"); } catch { return []; }
  });
  const [model, setModel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!API_URL) return;
    fetch(API_URL + "/model-info").then((r) => r.ok ? r.json() : Promise.reject()).then(setModel).catch(() => {});
  }, []);
  useEffect(() => { try { localStorage.setItem("student_prediction_history", JSON.stringify(history)); } catch {} }, [history]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(""); setResult(null);
    try {
      if (!API_URL) throw new Error("Prediction service is not configured yet. Add the backend URL as VITE_API_URL in Vercel.");
      const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)]));
      const response = await fetch(API_URL + "/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Prediction failed. Please try again.");
      setResult(data);
      setHistory((items) => [{ id: Date.now(), score: data.predicted_score, level: data.performance, date: new Date().toLocaleString() }, ...items].slice(0, 10));
    } catch (err) { setError(err.message || "Could not reach the prediction service."); }
    finally { setBusy(false); }
  }

  function clearHistory() { setHistory([]); }

  return <div className="app-shell">
    <div className="starfield" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div>
    <header className="site-header"><a className="brand" href="#"><span className="brand-mark">✦</span><span><b>PerformanceAI</b><small>Student success, in focus</small></span></a><span className="status"><i/>Learning insights</span></header>
    <main className="page">
      <section className="hero"><p className="eyebrow">✧ A clearer view of your progress ✧</p><h1>Your effort, turned<br/><span>into insight.</span></h1><p>Explore how your study habits and academic indicators shape an estimated performance score.</p></section>
      <div className="workspace">
        <section className="card form-card"><div className="card-heading"><div><span className="overline">YOUR DETAILS</span><h2>Academic indicators</h2><p>A few details are all it takes to begin.</p></div><span className="step">01</span></div>
          <form onSubmit={submit}><div className="field-grid">{fields.map(([name,label,min,max,placeholder],i)=><label className="field" key={name}><span className="field-title"><i>{["◷","◉","◎","▤","☾","✧"][i]}</i>{label}</span><input type="number" name={name} min={min} max={max} step={name==="study_hours"||name==="sleep_hours"?"0.5":"1"} required value={values[name]} placeholder={placeholder} onChange={(e)=>setValues({...values,[name]:e.target.value})}/></label>)}</div>
          {error && <p className="error" role="alert">{error}</p>}<button className="predict" disabled={busy}>{busy?<><span className="spinner"/>Calculating…</>:<>Predict my score <span>→</span></>}</button><p className="fineprint">A supportive estimate for learning and exploration.</p></form>
        </section>
        <section className="card result-card" aria-live="polite"><div className="card-heading"><div><span className="overline">YOUR ESTIMATE</span><h2>Performance outlook</h2><p>Your personalized snapshot appears here.</p></div><span className="step">02</span></div>
          {result ? <div className="result-body"><div className="score-ring" style={{"--score":Math.max(0,Math.min(100,Number(result.predicted_score)||0))*3.6+"deg"}}><div><strong>{Number(result.predicted_score).toFixed(1)}</strong><small>out of 100</small></div></div><span className="level">{result.performance}</span><h3>Keep building on your progress.</h3><p>Small, consistent habits can make a meaningful difference over time.</p></div>:<div className="empty-result"><span className="sparkle">✧</span><h3>Your score is waiting to be discovered</h3><p>Complete the six indicators and your prediction will appear here.</p><div className="dots"><i/><i/><i/></div></div>}
        </section>
      </div>
      <div className="lower-grid"><section className="card"><div className="card-heading"><div><span className="overline">MODEL SNAPSHOT</span><h2>Behind the estimate</h2></div><span className="icon-bubble">⌘</span></div>{model?<div className="metrics">{[["Model",model.model],["MAE",model.mae],["RMSE",model.rmse],["R² score",model.r2_score],["Training samples",model.training_samples],["Testing samples",model.testing_samples]].map(([k,v])=><div key={k}><small>{k}</small><strong>{v ?? "—"}</strong></div>)}</div>:<p className="muted">{API_URL?"Model details are temporarily unavailable.":"Connect the prediction service to view model metrics."}</p>}</section>
      <section className="card"><div className="history-heading"><div><span className="overline">SAVED ON THIS DEVICE</span><h2>Recent predictions</h2></div>{history.length>0&&<button className="clear" onClick={clearHistory} type="button">Clear</button>}</div>{history.length?<ul className="history">{history.map(x=><li key={x.id}><span>{x.level}</span><b>{x.score}/100</b><time>{x.date}</time></li>)}</ul>:<p className="muted">Your estimates will be saved here in this browser.</p>}</section></div>
    </main><footer>Built for learning. Predictions are estimates, not a definitive measure of ability.</footer>
  </div>;
}
export default App;
