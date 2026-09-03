from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdateStatus, ApplicationResponse

router = APIRouter()

@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).order_by(Application.created_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(payload: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    app_entry = Application(
        company_name=payload.company_name,
        role_title=payload.role_title,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(app_entry)
    await db.commit()
    await db.refresh(app_entry)
    return app_entry

@router.patch("/{app_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    app_id: str, 
    payload: ApplicationUpdateStatus, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Application).where(Application.id == app_id))
    app_entry = result.scalar_one_or_none()

    if not app_entry:
        raise HTTPException(status_code=404, detail="Application record not found")

    app_entry.status = payload.status
    await db.commit()
    await db.refresh(app_entry)
    return app_entry

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(app_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.id == app_id))
    app_entry = result.scalar_one_or_none()

    if not app_entry:
        raise HTTPException(status_code=404, detail="Application record not found")

    await db.delete(app_entry)
    await db.commit()