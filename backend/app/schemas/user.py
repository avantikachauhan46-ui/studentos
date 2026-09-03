from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class SkillProficiency(BaseModel):
    skill_id: int
    proficiency_level: int = Field(ge=1, le=5)

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    target_role: Optional[str] = Field(default="Machine Learning Engineer")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str
    email: EmailStr

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    target_role: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True