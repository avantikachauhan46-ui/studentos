from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ApplicationBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=120)
    role_title: str = Field(..., min_length=1, max_length=120)
    status: str = Field(default="SAVED", pattern="^(SAVED|APPLIED|INTERVIEW|OFFER|REJECTED)$")
    notes: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdateStatus(BaseModel):
    status: str = Field(..., pattern="^(SAVED|APPLIED|INTERVIEW|OFFER|REJECTED)$")

class ApplicationResponse(ApplicationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True