from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import Project, AIAnalysis, DiscoveredPage, Component, DesignToken, ApiContract
from backend.app.schemas.all_schemas import AIAnalysisRead, AIAnalysisRequest
from backend.app.services.ai_engine import ai_engine

router = APIRouter(prefix="/ai-analyses", tags=["AI Analysis"])

@router.get("", response_model=List[AIAnalysisRead])
async def list_ai_analyses(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AIAnalysis).where(AIAnalysis.project_id == project_id).order_by(desc(AIAnalysis.created_at))
    )
    return result.scalars().all()

@router.post("/run", response_model=AIAnalysisRead)
async def run_ai_analysis(project_id: str, data: AIAnalysisRequest, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Assemble structured evidence context from database
    pages_res = await db.execute(select(DiscoveredPage).where(DiscoveredPage.project_id == project_id))
    comps_res = await db.execute(select(Component).where(Component.project_id == project_id))
    tokens_res = await db.execute(select(DesignToken).where(DesignToken.project_id == project_id))
    apis_res = await db.execute(select(ApiContract).where(ApiContract.project_id == project_id))

    structured_ctx = {
        "project_name": project.name,
        "target_url": project.target_url,
        "pages": [{"path": p.path, "title": p.title, "page_type": p.page_type, "status": p.http_status} for p in pages_res.scalars().all()],
        "components": [{"name": c.name, "category": c.category, "selector": c.dom_selector, "bounding_box": c.bounding_box_json} for c in comps_res.scalars().all()],
        "tokens": [{"type": t.token_type, "name": t.name, "value": t.value} for t in tokens_res.scalars().all()[:30]],
        "api_contracts": [{"method": a.method, "path": a.endpoint_path, "schema": a.response_schema_json} for a in apis_res.scalars().all()]
    }

    ai_result = await ai_engine.execute_analysis_task(
        task_type=data.task_type,
        structured_context=structured_ctx,
        provider=data.provider,
        model=data.model,
        custom_prompt=data.custom_prompt
    )

    analysis_record = AIAnalysis(
        project_id=project_id,
        task_type=data.task_type,
        provider=ai_result.get("provider", "gemini"),
        model=ai_result.get("model", "gemini-2.5-flash"),
        prompt_tokens=ai_result.get("prompt_tokens", 0),
        completion_tokens=ai_result.get("completion_tokens", 0),
        cost_estimate=ai_result.get("cost_estimate", 0.0),
        raw_response=ai_result.get("raw_response"),
        findings_json=ai_result.get("findings", []),
        status="completed"
    )
    db.add(analysis_record)
    await db.commit()
    await db.refresh(analysis_record)
    return analysis_record
