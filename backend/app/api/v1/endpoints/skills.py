from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.skill import Skill

router = APIRouter()

STANDARD_SKILLS = [
    {"name": "Python", "category": "Programming"},
    {"name": "SQL", "category": "Database"},
    {"name": "Machine Learning", "category": "AI/ML"},
    {"name": "Deep Learning", "category": "AI/ML"},
    {"name": "Data Structures & Algorithms", "category": "Core CS"},
    {"name": "Git & GitHub", "category": "DevOps"},
    {"name": "Docker", "category": "DevOps"},
    {"name": "FastAPI", "category": "Backend"},
    {"name": "PostgreSQL", "category": "Database"},
    {"name": "PyTorch", "category": "AI/ML"},
]

@router.post("/seed", status_code=201)
async def seed_skills(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Skill))
    existing = result.scalars().all()
    if existing:
        return {"message": "Skills already seeded", "total": len(existing)}

    for item in STANDARD_SKILLS:
        db.add(Skill(name=item["name"], category=item["category"]))
    
    await db.commit()
    return {"message": "Standard skill catalog successfully seeded!"}

@router.get("/", status_code=200)
async def get_all_skills(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Skill))
    return result.scalars().all()