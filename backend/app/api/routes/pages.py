from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import DiscoveredPage, PageSnapshot
from backend.app.schemas.all_schemas import DiscoveredPageRead, PageSnapshotRead

router = APIRouter(prefix="/pages", tags=["Pages"])

@router.get("", response_model=List[DiscoveredPageRead])
async def list_pages(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DiscoveredPage).where(DiscoveredPage.project_id == project_id).order_by(DiscoveredPage.depth, DiscoveredPage.path)
    )
    return result.scalars().all()

@router.get("/{page_id}", response_model=DiscoveredPageRead)
async def get_page(page_id: str, db: AsyncSession = Depends(get_db)):
    page = await db.get(DiscoveredPage, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@router.get("/{page_id}/snapshots", response_model=List[PageSnapshotRead])
async def get_page_snapshots(page_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PageSnapshot).where(PageSnapshot.page_id == page_id).order_by(desc(PageSnapshot.created_at))
    )
    return result.scalars().all()
