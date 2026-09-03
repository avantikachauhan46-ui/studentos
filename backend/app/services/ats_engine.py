import io
import re
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Any

# Common high-value technical keywords
KEYWORD_CATALOG = {
    "python", "sql", "machine learning", "deep learning", "pytorch",
    "tensorflow", "scikit-learn", "docker", "fastapi", "git",
    "algorithms", "data structures", "postgresql", "nlp", "pandas", "numpy"
}

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = " ".join([page.extract_text() or "" for page in reader.pages])
    return text.lower()

def analyze_resume(resume_text: str, target_jd: str) -> Dict[str, Any]:
    # 1. TF-IDF Cosine Similarity
    corpus = [resume_text, target_jd.lower()]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)
    similarity = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
    match_percentage = round(similarity * 100, 1)

    # 2. Keyword Detection & Gap Analysis
    found_keywords = [kw for kw in KEYWORD_CATALOG if re.search(r'\b' + re.escape(kw) + r'\b', resume_text)]
    jd_keywords = [kw for kw in KEYWORD_CATALOG if re.search(r'\b' + re.escape(kw) + r'\b', target_jd.lower())]
    missing_keywords = [kw for kw in jd_keywords if kw not in found_keywords]

    # 3. Measurable Impact / Metric Density Check (look for percentages, numbers, metrics)
    metrics_matches = re.findall(r'\b\d+(?:\.\d+)?%|\b\d+\b', resume_text)
    metric_score = min(100, len(metrics_matches) * 10)

    # ATS Weighted Score
    overall_score = round((match_percentage * 0.5) + (metric_score * 0.25) + (len(found_keywords) * 2.5), 1)
    overall_score = min(100.0, max(0.0, overall_score))

    return {
        "overall_score": overall_score,
        "match_percentage": match_percentage,
        "metrics_detected": len(metrics_matches),
        "found_skills": found_keywords,
        "missing_critical_skills": missing_keywords,
    }