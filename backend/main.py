from pathlib import Path
import re
from typing import List

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from skills import extract_skills

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Resume-to-job-description matching and skill gap analysis API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def extract_pdf_text(content: bytes) -> str:
    try:
        reader = PdfReader(content)
        pages = [(page.extract_text() or "") for page in reader.pages]
        return clean_text("\n".join(pages))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not read this PDF. Please upload a text-based PDF.") from exc


def text_similarity(resume_text: str, job_description: str) -> float:
    if not resume_text or not job_description:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = vectorizer.fit_transform([resume_text, job_description])
        return round(float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0]) * 100, 1)
    except ValueError:
        return 0.0


def find_keywords(job_description: str) -> List[str]:
    words = re.findall(r"\b[a-zA-Z][a-zA-Z+#.-]{2,}\b", job_description.lower())
    stop_words = {
        "the", "and", "with", "for", "that", "this", "from", "your", "you",
        "are", "will", "our", "have", "has", "into", "about", "work", "team",
        "role", "job", "years", "year", "using", "must", "should", "their",
        "they", "who", "not", "but", "can", "all", "also", "more", "than",
    }
    counts = {}
    for word in words:
        if word not in stop_words:
            counts[word] = counts.get(word, 0) + 1
    return [word for word, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:12]]


def build_recommendations(missing_skills: List[str], missing_keywords: List[str]) -> List[str]:
    recommendations = []
    for skill in missing_skills[:5]:
        recommendations.append(f"Add evidence of {skill} through a project, internship, certification, or relevant coursework.")
    for keyword in missing_keywords[:3]:
        recommendations.append(f"Consider naturally mentioning '{keyword}' if it accurately describes your experience.")
    if not recommendations:
        recommendations.append("Your resume covers the detected requirements well. Focus on measurable impact and concise project descriptions.")
    return recommendations


@app.get("/")
def home():
    return {"status": "online", "message": "AI Resume Analyzer API", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF resume.")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume must be smaller than 10 MB.")

    resume_text = extract_pdf_text(content)
    if len(resume_text) < 80:
        raise HTTPException(status_code=400, detail="Very little text was detected. Please upload a text-based PDF.")

    job_text = clean_text(job_description)
    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_text))

    matched_skills = sorted(resume_skills & job_skills)
    missing_skills = sorted(job_skills - resume_skills)

    resume_lower = resume_text.lower()
    job_keywords = find_keywords(job_text)
    matched_keywords = [word for word in job_keywords if word in resume_lower]
    missing_keywords = [word for word in job_keywords if word not in resume_lower]

    similarity = text_similarity(resume_text, job_text)
    skill_coverage = (len(matched_skills) / len(job_skills) * 100) if job_skills else similarity
    keyword_coverage = (len(matched_keywords) / len(job_keywords) * 100) if job_keywords else similarity

    score = round((similarity * 0.45) + (skill_coverage * 0.4) + (keyword_coverage * 0.15), 1)

    return {
        "filename": file.filename,
        "match_score": score,
        "text_similarity": similarity,
        "skill_coverage": round(skill_coverage, 1),
        "keyword_coverage": round(keyword_coverage, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "resume_text_length": len(resume_text),
        "recommendations": build_recommendations(missing_skills, missing_keywords),
    }
