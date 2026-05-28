from __future__ import annotations

from pathlib import Path
import re


REPO_ROOT = Path(__file__).resolve().parents[4]
SOURCE_ROOT = REPO_ROOT / "packages" / "agent-html" / "src"
SKILL_ROOT = REPO_ROOT / ".agents" / "skills" / "agent-html"


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def read_registry_prompt_lines(kind: str) -> list[str]:
    registry = SOURCE_ROOT / "schema" / "component-registry.ts"
    text = registry.read_text(encoding="utf-8")
    blocks = re.findall(r"defineAgentHtmlComponent\(\{(.*?)\n  \}\)", text, re.S)
    lines: list[str] = []

    def extract_object_body(block: str, key: str) -> str | None:
        key_match = re.search(rf"\b{re.escape(key)}: \{{", block)
        if not key_match:
            return None

        start = key_match.end() - 1
        depth = 0
        for index in range(start, len(block)):
            char = block[index]
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    return block[start + 1:index]

        return None

    def extract_attrs(attrs_body: str) -> list[tuple[str, str]]:
        attrs: list[tuple[str, str]] = []
        index = 0

        while index < len(attrs_body):
            match = re.search(r"\b(\w+): \{", attrs_body[index:])
            if not match:
                break

            name = match.group(1)
            start = index + match.end() - 1
            depth = 0
            end = start

            for cursor in range(start, len(attrs_body)):
                char = attrs_body[cursor]
                if char == "{":
                    depth += 1
                elif char == "}":
                    depth -= 1
                    if depth == 0:
                        end = cursor
                        break

            attrs.append((name, attrs_body[start + 1:end]))
            index = end + 1

        return attrs

    for block in blocks:
        kind_match = re.search(r'kind: "([^"]+)"', block)
        tag_match = re.search(r'tag: "([^"]+)"', block)
        grammar_match = re.search(r'children: \{ grammar: "([^"]+)"', block)

        if not kind_match or not tag_match or not grammar_match:
            continue

        if kind_match.group(1) != kind:
            continue

        signature_match = re.search(r'promptSignature: "([^"]+)"', block)
        attrs_body = extract_object_body(block, "attrs")
        attr_lines = extract_attrs(attrs_body) if attrs_body else []
        attrs: list[str] = []
        for name, attr_block in attr_lines:
            if "prompt: false" in attr_block:
                continue

            required = "required: true" in attr_block
            marker = "" if required else "?"
            values_match = re.search(r"values: \[([^\]]+)\]", attr_block, re.S)
            type_match = re.search(r'type: "([^"]+)"', attr_block)

            if values_match:
                values = re.findall(r'"([^"]+)"', values_match.group(1))
                attrs.append(f'{name}{marker}="{"|".join(values)}"')
            elif type_match:
                attrs.append(f"{name}{marker}={type_match.group(1)}")

        signature = signature_match.group(1) if signature_match else None
        if not signature:
            attr_text = f":{', '.join(attrs)}" if attrs else ""
            signature = f"{tag_match.group(1)}{attr_text}"

        lines.append(f"- `{signature} -> {grammar_match.group(1)}`")

    return lines


def replace_section(content: str, title: str, lines: list[str]) -> str:
    pattern = rf"(## {re.escape(title)}\n\n)(.*?)(\n\n## )"
    replacement = rf"\1{chr(10).join(lines)}\3"
    return re.sub(pattern, replacement, content, flags=re.S)


def sync_grammar() -> None:
    source = SOURCE_ROOT / "schema" / "prompt.md"
    target = SKILL_ROOT / "references" / "grammar.md"
    prompt = source.read_text(encoding="utf-8").strip()
    prompt = replace_section(prompt, "Layout", read_registry_prompt_lines("layout"))
    prompt = replace_section(prompt, "UI", read_registry_prompt_lines("ui"))

    content = "\n".join(
        [
            "<!-- AUTO-GENERATED FROM packages/agent-html/src/schema/prompt.md and component-registry.ts -->",
            "# Agent-HTML Grammar",
            "",
            prompt,
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
            "<!-- AUTO-GENERATED FROM packages/agent-html/src/fixtures -->",
            "# Agent-HTML Examples",
            "",
            "Source fixtures live in:",
            "",
            "- `packages/agent-html/src/fixtures/valid/`",
            "- `packages/agent-html/src/fixtures/invalid/`",
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
            "<!-- AUTO-GENERATED FROM packages/agent-html/src/icons/README.md -->",
            source.read_text(encoding="utf-8").strip(),
            "",
        ]
    )

    write_text(target, content)


def sync_icon_script() -> None:
    source = SKILL_ROOT / "scripts" / "search_icons.py"
    generated = "\n".join(
        [
            "# AUTO-GENERATED FROM packages/agent-html/src/icons/search-icons.ts intent",
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
