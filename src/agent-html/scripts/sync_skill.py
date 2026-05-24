from __future__ import annotations

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
SOURCE_ROOT = REPO_ROOT / "src" / "agent-html"
SKILL_ROOT = REPO_ROOT / ".codex" / "skills" / "agent-html"


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def sync_grammar() -> None:
    source = SOURCE_ROOT / "schema" / "prompt.md"
    target = SKILL_ROOT / "references" / "grammar.md"

    content = "\n".join(
        [
            "<!-- AUTO-GENERATED FROM src/agent-html/schema/prompt.md -->",
            "# Agent-HTML Grammar",
            "",
            source.read_text(encoding="utf-8").strip(),
            "",
        ]
    )

    write_text(target, content)


def sync_examples() -> None:
    valid_dir = SOURCE_ROOT / "fixtures" / "valid"
    invalid_dir = SOURCE_ROOT / "fixtures" / "invalid"
    target = SKILL_ROOT / "references" / "examples.md"

    def summarize(directory: Path, title: str) -> list[str]:
        lines = [f"## {title}", ""]
        for path in sorted(directory.glob("*.xml")):
            lines.append(f"- `{path.name}`")
        lines.append("")
        return lines

    content = "\n".join(
        [
            "<!-- AUTO-GENERATED FROM src/agent-html/fixtures -->",
            "# Agent-HTML Examples",
            "",
            "Source fixtures live in:",
            "",
            "- `src/agent-html/fixtures/valid/`",
            "- `src/agent-html/fixtures/invalid/`",
            "",
            "Use the closest valid fixture before inventing new structure.",
            "",
            *summarize(valid_dir, "Valid Patterns"),
            *summarize(invalid_dir, "Invalid Patterns"),
        ]
    )

    write_text(target, content)


def sync_icons_reference() -> None:
    source = SOURCE_ROOT / "icons" / "README.md"
    target = SKILL_ROOT / "references" / "icons.md"

    content = "\n".join(
        [
            "<!-- AUTO-GENERATED FROM src/agent-html/icons/README.md -->",
            source.read_text(encoding="utf-8").strip(),
            "",
        ]
    )

    write_text(target, content)


def sync_icon_script() -> None:
    source = SKILL_ROOT / "scripts" / "search_icons.py"
    generated = "\n".join(
        [
            "# AUTO-GENERATED FROM src/agent-html/icons/search-icons.ts intent",
            "from pathlib import Path",
            "import re",
            "import sys",
            "",
            "",
            "def load_icon_names() -> list[str]:",
            "    repo_root = Path(__file__).resolve().parents[3]",
            "    dynamic_file = repo_root / \"node_modules\" / \"lucide-react\" / \"dist\" / \"esm\" / \"dynamicIconImports.mjs\"",
            "    text = dynamic_file.read_text(encoding=\"utf-8\")",
            "    return re.findall(r'\"([^\"]+)\": \\(\\) => import', text)",
            "",
            "",
            "def search_icons(query: str, limit: int = 24) -> list[str]:",
            "    names = load_icon_names()",
            "    query = query.strip().lower()",
            "    if not query:",
            "        return names[:limit]",
            "",
            "    exact = [name for name in names if name == query]",
            "    prefix = [name for name in names if name != query and name.startswith(query)]",
            "    contains = [",
            "        name",
            "        for name in names",
            "        if name != query and not name.startswith(query) and query in name",
            "    ]",
            "    return (exact + prefix + contains)[:limit]",
            "",
            "",
            "def main() -> int:",
            "    query = sys.argv[1] if len(sys.argv) > 1 else \"\"",
            "    for name in search_icons(query):",
            "        print(name)",
            "    return 0",
            "",
            "",
            "if __name__ == \"__main__\":",
            "    raise SystemExit(main())",
            "",
        ]
    )

    write_text(source, generated)


def main() -> int:
    sync_grammar()
    sync_examples()
    sync_icons_reference()
    sync_icon_script()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
