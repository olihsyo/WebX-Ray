from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import Project, SourceArchive
from backend.app.schemas.all_schemas import SourceArchiveRead
from backend.app.services.source_analyzer import source_analyzer

router = APIRouter(prefix="/backend-analysis", tags=["Backend Analysis"])

@router.get("", response_model=List[SourceArchiveRead])
async def list_source_archives(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SourceArchive).where(SourceArchive.project_id == project_id).order_by(desc(SourceArchive.created_at))
    )
    return result.scalars().all()

@router.post("/run", response_model=SourceArchiveRead)
async def run_backend_source_analysis(project_id: str, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    source_path = project.source_path or "."
    analysis_res = source_analyzer.analyze_source_directory(source_path)

    archive = SourceArchive(
        project_id=project_id,
        source_type="folder",
        original_filename=source_path,
        extracted_path=source_path,
        detected_stack_json=analysis_res.get("detected_stack", {}),
        routes_json=analysis_res.get("routes", []),
        controllers_json=analysis_res.get("controllers", []),
        middleware_json=analysis_res.get("middleware", []),
        analysis_summary_json=analysis_res
    )
    db.add(archive)
    await db.commit()
    await db.refresh(archive)
    return archive
