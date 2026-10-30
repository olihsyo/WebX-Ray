from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import Component
from backend.app.schemas.all_schemas import ComponentRead

router = APIRouter(prefix="/components", tags=["Components"])

@router.get("", response_model=List[ComponentRead])
async def list_components(
    project_id: str,
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Component).where(Component.project_id == project_id)
    if category:
        stmt = stmt.where(Component.category == category)
    stmt = stmt.order_by(desc(Component.reusability_score))
    result = await db.execute(stmt)
    return result.scalars().all()
