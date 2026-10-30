import re
from typing import Dict, List, Any

class DatabaseAnalyzer:
    @staticmethod
    def parse_sql_ddl(ddl_text: str, dialect: str = "postgresql") -> Dict[str, Any]:
        """
        Statically parses SQL DDL statements to extract tables, columns, primary keys,
        foreign keys, and outputs Mermaid ER diagram.
        """
        tables = []
        relations = []
        mermaid_lines = ["erDiagram"]

        # Regex for CREATE TABLE statements
        table_blocks = re.findall(
            r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_\.\"]+)\s*\((.*?)\);',
            ddl_text,
            re.DOTALL | re.IGNORECASE
        )

        for table_raw, body in table_blocks:
            table_name = table_raw.replace('"', '').replace('`', '').split('.')[-1].strip()
            columns = []
            primary_keys = []
            foreign_keys = []

            # Parse lines in table definition
            lines = [l.strip() for l in body.split('\n') if l.strip()]
            for line in lines:
                line_clean = line.rstrip(',')

                # Foreign Key Constraint check
                fk_match = re.search(
                    r'FOREIGN\s+KEY\s*\(([a-zA-Z0-9_]+)\)\s+REFERENCES\s+([a-zA-Z0-9_]+)\s*\(([a-zA-Z0-9_]+)\)',
                    line_clean,
                    re.IGNORECASE
                )
                if fk_match:
                    fk_col, ref_table, ref_col = fk_match.groups()
                    foreign_keys.append({"column": fk_col, "ref_table": ref_table, "ref_column": ref_col})
                    relations.append({"from_table": table_name, "to_table": ref_table, "from_col": fk_col, "to_col": ref_col})
                    mermaid_lines.append(f'    {ref_table} ||--o{{ {table_name} : "has ({fk_col})"')
                    continue

                # Primary Key constraint line check
                pk_line_match = re.search(r'PRIMARY\s+KEY\s*\(([a-zA-Z0-9_,\s]+)\)', line_clean, re.IGNORECASE)
                if pk_line_match:
                    pks = [c.strip() for c in pk_line_match.group(1).split(',')]
                    primary_keys.extend(pks)
                    continue

                # Normal Column check: name type constraints
                col_match = re.match(r'^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_\(\)]+)(.*)$', line_clean)
                if col_match:
                    col_name, col_type, constraints = col_match.groups()
                    is_pk = "PRIMARY KEY" in constraints.upper() or col_name in primary_keys
                    is_nullable = "NOT NULL" not in constraints.upper() and not is_pk

                    if is_pk and col_name not in primary_keys:
                        primary_keys.append(col_name)

                    columns.append({
                        "name": col_name,
                        "type": col_type,
                        "is_primary": is_pk,
                        "is_nullable": is_nullable
                    })

            tables.append({
                "table_name": table_name,
                "columns": columns,
                "primary_keys": primary_keys,
                "foreign_keys": foreign_keys
            })

            # Append to Mermaid diagram
            mermaid_lines.append(f"    {table_name} {{")
            for col in columns:
                pk_flag = "PK" if col["is_primary"] else ""
                mermaid_lines.append(f'        {col["type"]} {col["name"]} {pk_flag}'.strip())
            mermaid_lines.append("    }")

        return {
            "dialect": dialect,
            "tables_count": len(tables),
            "tables": tables,
            "relations": relations,
            "er_diagram_mermaid": "\n".join(mermaid_lines)
        }

database_analyzer = DatabaseAnalyzer()
