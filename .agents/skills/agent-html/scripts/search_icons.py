from pathlib import Path
import re
import sys


def find_repo_root(start: Path) -> Path:
    for directory in [start, *start.parents]:
        package_json = directory / "package.json"
        if package_json.exists() and (
            (directory / ".git").exists() or (directory / "packages").exists()
        ):
            return directory
        if (directory / ".git").exists():
            return directory
    return start


def is_development_repo_root(path: Path) -> bool:
    package_json = path / "package.json"
    return package_json.exists() and ((path / ".git").exists() or (path / "packages").exists())


def lucide_metadata_candidates(repo_root: Path) -> list[Path]:
    return [
        repo_root
        / "node_modules"
        / "lucide-react"
        / "dynamicIconImports.mjs",
        repo_root
        / "node_modules"
        / "lucide-react"
        / "dynamicIconImports.js",
        repo_root
        / "node_modules"
        / "lucide-react"
        / "dynamic.mjs",
        repo_root
        / "node_modules"
        / "lucide-react"
        / "dynamic.js",
        repo_root
        / "node_modules"
        / "lucide-react"
        / "dist"
        / "esm"
        / "dynamicIconImports.mjs",
        repo_root
        / "node_modules"
        / "lucide-react"
        / "dist"
        / "cjs"
        / "dynamicIconImports.js",
        repo_root
        / "node_modules"
        / "lucide-react"
        / "dynamic"
        / "dynamicIconImports.mjs",
        repo_root
        / "node_modules"
        / "lucide-react"
        / "dynamic"
        / "dynamicIconImports.js",
    ]


def extract_icon_names(text: str) -> list[str]:
    icon_names = re.search(r"iconNames\s*=\s*\[([^\]]*)\]", text, re.DOTALL)
    if icon_names:
        return re.findall(r'"([^"]+)"', icon_names.group(1))

    names = re.findall(r'"([^"]+)": \(\) => import', text)
    if names:
        return names

    return re.findall(r"'([^']+)': \(\) => import", text)


def read_metadata_text(path: Path) -> tuple[Path, str]:
    text = path.read_text(encoding="utf-8")
    re_export = re.search(r"export\s+\{\s*default\s*\}\s+from\s+['\"]([^'\"]+)['\"]", text)
    if re_export:
        target = (path.parent / re_export.group(1)).resolve()
        if target.exists():
            return target, target.read_text(encoding="utf-8")
    return path, text


def bundled_icon_names_path() -> Path:
    return Path(__file__).resolve().parent.parent / "references" / "icon-names.txt"


def load_bundled_icon_names() -> list[str]:
    path = bundled_icon_names_path()
    if not path.exists():
        return []

    return [
        line.strip()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]


def load_icon_names() -> list[str]:
    bundled_names = load_bundled_icon_names()
    if bundled_names:
        return bundled_names

    repo_root = find_repo_root(Path(__file__).resolve().parent)
    if not is_development_repo_root(repo_root):
        raise FileNotFoundError(
            "Unable to load AgentHTML icon names.\n"
            f"Bundled icon list: {bundled_icon_names_path()}\n"
            f"Detected root: {repo_root}\n"
            "Runtime skills must include references/icon-names.txt. "
            "The lucide-react metadata fallback is only available inside the AgentHTML development repository."
        )

    lucide_root = repo_root / "node_modules" / "lucide-react"
    candidates = lucide_metadata_candidates(repo_root)
    dynamic_file = next((path for path in candidates if path.exists()), None)
    if dynamic_file is None:
        attempted = "\n".join(f"  - {path}" for path in candidates)
        install_hint = (
            "lucide-react is not installed under this repo root."
            if not lucide_root.exists()
            else "lucide-react is installed, but no supported metadata file was found."
        )
        raise FileNotFoundError(
            "Unable to find lucide-react icon metadata.\n"
            f"Repo root: {repo_root}\n"
            f"Lucide root: {lucide_root}\n"
            f"{install_hint}\n"
            "Tried:\n"
            f"{attempted}\n"
            f"Bundled icon list: {bundled_icon_names_path()}\n"
            "Runtime skills should include references/icon-names.txt. "
            "In a development repo, install project dependencies with `npm install`, then rerun this script."
        )

    metadata_file, text = read_metadata_text(dynamic_file)
    names = extract_icon_names(text)
    if not names:
        raise ValueError(
            "Unable to parse lucide-react icon metadata.\n"
            f"Metadata file: {metadata_file}"
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
