import pytest
from backend.app.services.database_analyzer import database_analyzer

def test_sql_ddl_parsing():
    ddl = """
    CREATE TABLE users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        created_at TIMESTAMP
    );

    CREATE TABLE projects (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """
    parsed = database_analyzer.parse_sql_ddl(ddl, "postgresql")
    assert parsed["tables_count"] == 2

    table_names = [t["table_name"] for t in parsed["tables"]]
    assert "users" in table_names
    assert "projects" in table_names

    # Check relations
    assert len(parsed["relations"]) == 1
    assert parsed["relations"][0]["from_table"] == "projects"
    assert parsed["relations"][0]["to_table"] == "users"

    # Check Mermaid ER syntax
    mermaid = parsed["er_diagram_mermaid"]
    assert "erDiagram" in mermaid
    assert "users ||--o{ projects" in mermaid
