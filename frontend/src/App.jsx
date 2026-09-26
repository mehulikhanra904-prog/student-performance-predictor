import { useState } from "react";

import Header from "./components/Header";
import ResumeUpload from "./components/ResumeUpload";
import JobDescription from "./components/JobDescription";
import AnalyzeButton from "./components/AnalyzeButton";
import MatchOverview from "./components/MatchOverview";
import SkillsSection from "./components/SkillsSection";
import EmptyState from "./components/EmptyState";
import SkillGapChart from "./components/SkillGapChart";

import { analyzeResume } from "./services/api";

import "./App.css";


function App() {
  const [file, setFile] = useState(null);

  const [jobDescription, setJobDescription] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError("");
  };


  const handleAnalyze = async () => {

    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please add a job description.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF resumes are supported.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {

      const data = await analyzeResume(
        file,
        jobDescription
      );

      setResult(data);

    } catch (err) {

      setError(
        err.message ||
        "Something went wrong while analyzing the resume."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="app">

      {/* Header */}
      <Header />


      <main className="page">

        {/* Intro Section */}
        <section className="intro">

          <p className="eyebrow">
            RESUME ANALYSIS
          </p>

          <h2>
            Understand how your resume
            <br />
            fits the role.
          </h2>

          <p className="intro-text">
            Compare your resume with a job description
            using NLP-based text similarity and skill
            matching.
          </p>

        </section>


        {/* Main Workspace */}
        <div className="workspace">


          {/* =========================
              LEFT SIDE
          ========================== */}

          <div className="input-column">

            {/* Resume Upload */}
            <ResumeUpload
              file={file}
              onFileChange={handleFileChange}
            />


            {/* Job Description */}
            <JobDescription
              value={jobDescription}
              onChange={(value) => {
                setJobDescription(value);
                setError("");
              }}
            />


            {/* Error Message */}
            {error && (
              <div className="error-message">

                <strong>
                  Something needs your attention.
                </strong>

                <span>
                  {error}
                </span>

              </div>
            )}


            {/* Analyze Button */}
            <AnalyzeButton
              loading={loading}
              disabled={
                !file ||
                !jobDescription.trim()
              }
              onClick={handleAnalyze}
            />

          </div>


          {/* =========================
              RIGHT SIDE
          ========================== */}

          <div className="results-column">

            {result ? (
              <>

                {/* Resume Match Score */}
                <MatchOverview
                  result={result}
                />


                {/* Skill Gap Visualization */}
                <SkillGapChart
                  result={result}
                />


                {/* Matched & Missing Skills */}
                <SkillsSection
                  result={result}
                />

              </>
            ) : (

              /* Empty State */
              <EmptyState />

            )}

          </div>

        </div>

      </main>


      {/* Footer */}
      <footer>
        ResumeLens · Built with React,
        FastAPI and scikit-learn
      </footer>

    </div>
  );
}


export default App;