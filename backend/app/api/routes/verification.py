from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.entities import Project, VisualComparison, TestRun
from backend.app.schemas.all_schemas import (
    VisualComparisonRead, VisualComparisonRequest, TestRunRead, TestRunRequest
)
from backend.app.services.visual_verifier import visual_verifier
from backend.app.services.functional_tester import functional_tester

router = APIRouter(prefix="/verification", tags=["Verification"])

@router.get("/visual", response_model=List[VisualComparisonRead])
async def list_visual_comparisons(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(VisualComparison).where(VisualComparison.project_id == project_id).order_by(desc(VisualComparison.created_at))
    )
    return result.scalars().all()

@router.post("/visual/compare", response_model=VisualComparisonRead)
async def run_visual_comparison(
    project_id: str,
    data: VisualComparisonRequest,
    db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    diff_path = settings.get_storage_path(project_id, "diffs") / f"diff_{data.viewport}.png"
    comp_res = visual_verifier.compare_screenshots(
        original_img_path=data.original_image_path,
        reconstructed_img_path=data.reconstructed_image_path,
        diff_output_path=str(diff_path),
        viewport=data.viewport
    )

    record = VisualComparison(
        project_id=project_id,
        page_id=data.page_id,
        viewport=data.viewport,
        original_image_path=data.original_image_path,
        reconstructed_image_path=data.reconstructed_image_path,
        diff_image_path=str(diff_path),
        ssim_score=comp_res.get("ssim_score", 1.0),
        pixel_diff_score=comp_res.get("pixel_diff_score", 0.0),
        discrepancies_json=comp_res.get("discrepancies", []),
        correction_report_md=comp_res.get("correction_report_md")
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record

@router.get("/tests", response_model=List[TestRunRead])
async def list_test_runs(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TestRun).where(TestRun.project_id == project_id).order_by(desc(TestRun.created_at))
    )
    return result.scalars().all()

@router.post("/tests/run", response_model=TestRunRead)
async def run_functional_tests(
    project_id: str,
    data: TestRunRequest,
    db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    target = data.target_url or project.target_url
    if not target:
        raise HTTPException(status_code=400, detail="Target URL required for functional testing.")

    test_res = await functional_tester.run_suite(target)

    record = TestRun(
        project_id=project_id,
        test_type=data.test_type,
        status=test_res.get("status", "passed"),
        results_json=test_res,
        report_md=test_res.get("report_md")
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record
