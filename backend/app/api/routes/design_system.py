from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import DesignToken
from backend.app.schemas.all_schemas import DesignTokenRead

router = APIRouter(prefix="/design-tokens", tags=["Design System"])

@router.get("", response_model=List[DesignTokenRead])
async def list_design_tokens(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DesignToken).where(DesignToken.project_id == project_id).order_by(desc(DesignToken.usage_count))
    )
    return result.scalars().all()
