import numpy as np
from typing import Dict, List, Tuple

# Industry standard benchmark requirements (Proficiency: 1 to 5)
ROLE_BENCHMARKS: Dict[str, Dict[str, int]] = {
    "Machine Learning Engineer": {
        "Python": 5,
        "SQL": 4,
        "Machine Learning": 5,
        "Deep Learning": 4,
        "Data Structures & Algorithms": 4,
        "Git & GitHub": 4,
        "Docker": 3,
        "PyTorch": 4,
    },
    "Data Analyst": {
        "Python": 4,
        "SQL": 5,
        "Machine Learning": 2,
        "Deep Learning": 1,
        "Data Structures & Algorithms": 2,
        "Git & GitHub": 3,
        "Docker": 1,
        "PyTorch": 1,
    },
    "Backend Developer": {
        "Python": 5,
        "SQL": 5,
        "FastAPI": 5,
        "PostgreSQL": 4,
        "Data Structures & Algorithms": 4,
        "Docker": 4,
        "Git & GitHub": 4,
        "Machine Learning": 1,
    },
}

def compute_career_analytics(
    user_skills: Dict[str, int], 
    target_role: str
) -> Tuple[float, List[Dict[str, any]], List[Dict[str, any]]]:
    # Fallback to ML Engineer if role not found
    benchmark = ROLE_BENCHMARKS.get(target_role, ROLE_BENCHMARKS["Machine Learning Engineer"])
    
    skill_keys = list(benchmark.keys())
    target_vec = np.array([benchmark[k] for k in skill_keys], dtype=float)
    user_vec = np.array([user_skills.get(k, 0) for k in skill_keys], dtype=float)

    # 1. Cosine Similarity Calculation
    dot_product = np.dot(user_vec, target_vec)
    norm_u = np.linalg.norm(user_vec)
    norm_t = np.linalg.norm(target_vec)

    similarity = 0.0 if (norm_u == 0 or norm_t == 0) else (dot_product / (norm_u * norm_t))
    readiness_score = round(float(similarity) * 100, 1)

    # 2. Skill Gap Extraction
    gaps = []
    strengths = []
    for skill, req_lvl in benchmark.items():
        curr_lvl = user_skills.get(skill, 0)
        diff = req_lvl - curr_lvl
        skill_data = {
            "skill": skill,
            "current_level": curr_lvl,
            "required_level": req_lvl,
            "deficit": max(0, diff)
        }
        if diff > 0:
            gaps.append(skill_data)
        else:
            strengths.append(skill_data)

    # Sort gaps by highest deficit first
    gaps.sort(key=lambda x: x["deficit"], reverse=True)

    return readiness_score, gaps, strengths