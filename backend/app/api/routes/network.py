from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import NetworkObservation, ApiContract
from backend.app.schemas.all_schemas import NetworkObservationRead, ApiContractRead

router = APIRouter(tags=["Network & APIs"])

@router.get("/network", response_model=List[NetworkObservationRead])
async def list_network_observations(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NetworkObservation).where(NetworkObservation.project_id == project_id).order_by(desc(NetworkObservation.created_at)).limit(200)
    )
    return result.scalars().all()

@router.get("/api-contracts", response_model=List[ApiContractRead])
async def list_api_contracts(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ApiContract).where(ApiContract.project_id == project_id).order_by(ApiContract.endpoint_path)
    )
    return result.scalars().all()
