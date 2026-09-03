from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.user import User
from app.models.skill import UserSkill, Skill
from app.services.analytics import compute_career_analytics

router = APIRouter()

@router.get("/readiness/{user_id}")
async def get_readiness_report(user_id: str, db: AsyncSession = Depends(get_db)):
    # Fetch user with their skills
    query = (
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.skills).selectinload(UserSkill.skill))
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_skills = {us.skill.name: us.proficiency_level for us in user.skills}
    
    score, gaps, strengths = compute_career_analytics(
        user_skills=user_skills,
        target_role=user.target_role or "Machine Learning Engineer"
    )

    return {
        "user_id": user.id,
        "target_role": user.target_role,
        "readiness_score": score,
        "skill_gaps": gaps,
        "strengths": strengths
    }