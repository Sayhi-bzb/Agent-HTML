# AUTO-GENERATED FROM src/agent-html/icons/search-icons.ts intent
from pathlib import Path
import re
import sys


def load_icon_names() -> list[str]:
    repo_root = Path(__file__).resolve().parents[3]
    dynamic_file = repo_root / "node_modules" / "lucide-react" / "dist" / "esm" / "dynamicIconImports.mjs"
    text = dynamic_file.read_text(encoding="utf-8")
    return re.findall(r'"([^"]+)": \(\) => import', text)


def search_icons(query: str, limit: int = 24) -> list[str]:
    names = load_icon_names()
    query = query.strip().lower()
    if not query:
        return names[:limit]

    exact = [name for name in names if name == query]
    prefix = [name for name in names if name != query and name.startswith(query)]
    contains = [
        name
        for name in names
        if name != query and not name.startswith(query) and query in name
    ]
    return (exact + prefix + contains)[:limit]


def main() -> int:
    query = sys.argv[1] if len(sys.argv) > 1 else ""
    for name in search_icons(query):
        print(name)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
