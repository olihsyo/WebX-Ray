import pytest

@pytest.mark.asyncio
async def test_health_check(client):
    res = await client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "WebX-Ray AI"

@pytest.mark.asyncio
async def test_projects_crud_workflow(client):
    # 1. Create Project
    payload = {
        "name": "Integration Test Target",
        "description": "Automated verification test project",
        "target_url": "https://example.com",
        "access_profile": "public"
    }
    create_res = await client.post("/api/projects", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["name"] == "Integration Test Target"
    project_id = created["id"]

    # 2. List Projects
    list_res = await client.get("/api/projects")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Get Project Detail
    detail_res = await client.get(f"/api/projects/{project_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["scans_count"] == 0

    # 4. Update Project
    update_res = await client.put(f"/api/projects/{project_id}", json={"name": "Renamed Target"})
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Renamed Target"

    # 5. Delete Project
    del_res = await client.delete(f"/api/projects/{project_id}")
    assert del_res.status_code == 200

    # Verify not found
    get_again = await client.get(f"/api/projects/{project_id}")
    assert get_again.status_code == 404

@pytest.mark.asyncio
async def test_settings_endpoints(client):
    res = await client.get("/api/settings")
    assert res.status_code == 200
    data = res.json()
    assert "default_ai_provider" in data
    assert "ssrf_protection" in data

    # Update settings
    update_res = await client.post("/api/settings", json={"default_ai_provider": "local"})
    assert update_res.status_code == 200
    assert update_res.json()["default_ai_provider"] == "local"
