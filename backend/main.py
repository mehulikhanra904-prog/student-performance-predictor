from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import fitz

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from skills import extract_skills


app = FastAPI(
    title="AI Resume Analyzer API",
    description="Resume and job description analysis API",
    version="1.0.0"
)


# Allow the React development server to communicate
# with the FastAPI backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "status": "online",
        "message": "AI Resume Analyzer API"
    }


@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):

    # -------------------------
    # Validate uploaded file
    # -------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was selected."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported."
        )

    if not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    # -------------------------
    # Read PDF
    # -------------------------

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    try:
        pdf = fitz.open(
            stream=contents,
            filetype="pdf"
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file could not be read as a PDF."
        )

    # -------------------------
    # Extract resume text
    # -------------------------

    resume_text = ""

    for page in pdf:
        resume_text += page.get_text()

    pdf.close()

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text was found in the PDF."
        )

    # -------------------------
    # TF-IDF similarity
    # -------------------------

    documents = [
        resume_text,
        job_description
    ]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2)
    )

    vectors = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(
        vectors[0:1],
        vectors[1:2]
    )[0][0]

    text_score = similarity * 100

    # -------------------------
    # Skill extraction
    # -------------------------

    resume_skills = extract_skills(resume_text)
    required_skills = extract_skills(job_description)

    matched_skills = [
        skill
        for skill in required_skills
        if skill in resume_skills
    ]

    missing_skills = [
        skill
        for skill in required_skills
        if skill not in resume_skills
    ]

    # -------------------------
    # Combined score
    # -------------------------

    if required_skills:

        skill_score = (
            len(matched_skills) /
            len(required_skills)
        ) * 100

        # Text similarity gives context,
        # skill overlap gives a more interpretable signal.
        final_score = (
            text_score * 0.6 +
            skill_score * 0.4
        )

    else:
        final_score = text_score

    final_score = round(
        min(final_score, 100),
        2
    )

    return {
        "filename": file.filename,
        "match_score": final_score,
        "text_similarity": round(text_score, 2),
        "resume_skills": resume_skills,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }