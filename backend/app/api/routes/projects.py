from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from backend.app.database import get_db
from backend.app.models.entities import (
    Project, ScanJob, DiscoveredPage, Component, DesignToken, Asset, ApiContract, Blueprint, AuditLog
)
from backend.app.schemas.all_schemas import (
    ProjectCreate, ProjectUpdate, ProjectRead, ProjectDetail
)

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectRead])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(desc(Project.created_at)))
    return result.scalars().all()

@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(
        name=data.name,
        description=data.description,
        target_url=data.target_url,
        access_profile=data.access_profile,
        auth_config=data.auth_config or {},
        source_path=data.source_path,
        db_schema_input=data.db_schema_input,
        status="idle"
    )
    db.add(project)
    await db.flush()

    audit = AuditLog(
        project_id=project.id,
        action="create_project",
        resource_type="project",
        resource_id=project.id,
        details_json={"name": project.name, "target_url": project.target_url}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(project)
    return project

@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Counts
    scans_cnt = await db.scalar(select(func.count(ScanJob.id)).where(ScanJob.project_id == project_id)) or 0
    pages_cnt = await db.scalar(select(func.count(DiscoveredPage.id)).where(DiscoveredPage.project_id == project_id)) or 0
    comps_cnt = await db.scalar(select(func.count(Component.id)).where(Component.project_id == project_id)) or 0
    tokens_cnt = await db.scalar(select(func.count(DesignToken.id)).where(DesignToken.project_id == project_id)) or 0
    assets_cnt = await db.scalar(select(func.count(Asset.id)).where(Asset.project_id == project_id)) or 0
    apis_cnt = await db.scalar(select(func.count(ApiContract.id)).where(ApiContract.project_id == project_id)) or 0

    latest_bp = await db.execute(
        select(Blueprint.id).where(Blueprint.project_id == project_id).order_by(desc(Blueprint.created_at)).limit(1)
    )
    bp_id = latest_bp.scalar_one_or_none()

    detail_data = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "target_url": project.target_url,
        "status": project.status,
        "access_profile": project.access_profile,
        "auth_config": project.auth_config,
        "source_path": project.source_path,
        "db_schema_input": project.db_schema_input,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "scans_count": scans_cnt,
        "pages_count": pages_cnt,
        "components_count": comps_cnt,
        "tokens_count": tokens_cnt,
        "assets_count": assets_cnt,
        "apis_count": apis_cnt,
        "has_blueprint": bp_id is not None,
        "latest_blueprint_id": bp_id
    }
    return detail_data

@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(project_id: str, data: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_dict = data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(project, k, v)

    await db.commit()
    await db.refresh(project)
    return project

@router.delete("/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.delete(project)
    await db.commit()
    return {"success": True, "message": "Project deleted successfully"}
