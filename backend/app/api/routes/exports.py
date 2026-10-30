import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import Project, ExportJob, Blueprint, DatabaseSchema
from backend.app.schemas.all_schemas import ExportJobRead, ExportRequest
from backend.app.services.export_service import export_service

router = APIRouter(prefix="/exports", tags=["Exports"])

@router.get("", response_model=List[ExportJobRead])
async def list_exports(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExportJob).where(ExportJob.project_id == project_id).order_by(desc(ExportJob.created_at))
    )
    return result.scalars().all()

@router.post("/create", response_model=ExportJobRead)
async def create_export(
    project_id: str,
    data: ExportRequest,
    db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get latest blueprint
    bp = (await db.execute(
        select(Blueprint).where(Blueprint.project_id == project_id).order_by(desc(Blueprint.created_at))
    )).scalars().first()

    db_schema = (await db.execute(
        select(DatabaseSchema).where(DatabaseSchema.project_id == project_id).order_by(desc(DatabaseSchema.created_at))
    )).scalars().first()

    bp_data = {}
    if bp:
        bp_data = {
            "complete_blueprint_md": bp.complete_blueprint_md,
            "website_analysis_json": bp.website_analysis_json,
            "implementation_roadmap_md": bp.implementation_roadmap_md,
            "testing_requirements_md": bp.testing_requirements_md,
            "reconstruction_master_prompt_md": bp.reconstruction_master_prompt_md,
            "claude_prompt_md": bp.claude_prompt_md,
            "gemini_prompt_md": bp.gemini_prompt_md,
            "antigravity_prompt_md": bp.antigravity_prompt_md,
            "cursor_prompt_md": bp.cursor_prompt_md,
            "generic_prompt_md": bp.generic_prompt_md
        }

    zip_file_path = export_service.create_zip_package(
        project_id=project_id,
        project_name=project.name,
        blueprint_data=bp_data,
        er_diagram=db_schema.er_diagram_mermaid if db_schema else ""
    )

    file_size = os.path.getsize(zip_file_path) if os.path.exists(zip_file_path) else 0

    export_job = ExportJob(
        project_id=project_id,
        format=data.format,
        file_path=zip_file_path,
        file_size=file_size,
        status="completed"
    )
    db.add(export_job)
    await db.commit()
    await db.refresh(export_job)
    return export_job

@router.get("/{export_id}/download")
async def download_export(export_id: str, db: AsyncSession = Depends(get_db)):
    job = await db.get(ExportJob, export_id)
    if not job or not os.path.exists(job.file_path):
        raise HTTPException(status_code=404, detail="Export file not found")

    return FileResponse(
        path=job.file_path,
        filename=os.path.basename(job.file_path),
        media_type="application/zip"
    )
