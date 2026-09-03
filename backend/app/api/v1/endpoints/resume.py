from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.services.ats_engine import extract_text_from_pdf, analyze_resume

router = APIRouter()

DEFAULT_JD = """
Looking for a Machine Learning Engineer with strong Python, SQL, and Deep Learning skills.
Experience with PyTorch, Scikit-learn, Git, Docker, and PostgreSQL.
Must understand Data Structures & Algorithms and deployment via FastAPI.
"""

@router.post("/scan", status_code=status.HTTP_200_OK)
async def scan_resume(
    file: UploadFile = File(...),
    job_description: str = Form(default=DEFAULT_JD)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume uploads are currently supported."
        )

    content = await file.read()
    raw_text = extract_text_from_pdf(content)

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to extract text from the provided PDF."
        )

    results = analyze_resume(raw_text, job_description)
    return results