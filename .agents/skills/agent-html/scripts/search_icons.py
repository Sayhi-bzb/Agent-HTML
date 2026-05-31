from pathlib import Path
import sys


def bundled_icon_names_path() -> Path:
    return Path(__file__).resolve().parent.parent / "references" / "icon-names.txt"


def load_icon_names() -> list[str]:
    path = bundled_icon_names_path()
    if not path.is_file():
        raise FileNotFoundError(
            "Unable to load AgentHTML icon names.\n"
            f"Bundled icon list: {path}\n"
            "Runtime skills must include references/icon-names.txt."
        )

    names = [
        line.strip()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]
    if not names:
        raise RuntimeError(
            "Unable to load AgentHTML icon names.\n"
            f"Bundled icon list is empty: {path}"
        )
    return names


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
