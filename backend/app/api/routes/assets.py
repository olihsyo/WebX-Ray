from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import Asset
from backend.app.schemas.all_schemas import AssetRead

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.get("", response_model=List[AssetRead])
async def list_assets(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Asset).where(Asset.project_id == project_id).order_by(desc(Asset.created_at))
    )
    return result.scalars().all()
