from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import Project, DatabaseSchema
from backend.app.schemas.all_schemas import DatabaseSchemaRead
from backend.app.services.database_analyzer import database_analyzer

router = APIRouter(prefix="/database-analysis", tags=["Database Analysis"])

@router.get("", response_model=List[DatabaseSchemaRead])
async def list_database_schemas(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DatabaseSchema).where(DatabaseSchema.project_id == project_id).order_by(desc(DatabaseSchema.created_at))
    )
    return result.scalars().all()

@router.post("/parse", response_model=DatabaseSchemaRead)
async def parse_database_ddl(
    project_id: str,
    ddl_text: str = Body(..., embed=True),
    dialect: str = Body("postgresql", embed=True),
    db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    parsed = database_analyzer.parse_sql_ddl(ddl_text, dialect)

    db_schema = DatabaseSchema(
        project_id=project_id,
        dialect=dialect,
        tables_json=parsed.get("tables", []),
        relations_json=parsed.get("relations", []),
        indexes_json=[],
        orm_models_json=[],
        er_diagram_mermaid=parsed.get("er_diagram_mermaid")
    )
    db.add(db_schema)
    await db.commit()
    await db.refresh(db_schema)
    return db_schema
