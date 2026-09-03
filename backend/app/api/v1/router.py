from fastapi import APIRouter
from app.api.v1.endpoints import auth, skills, analytics, resume, applications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Readiness"])
api_router.include_router(resume.router, prefix="/resume", tags=["Resume Intelligence"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications Pipeline"])

@api_router.get("/ping")
async def ping():
    return {"message": "API v1 active"}