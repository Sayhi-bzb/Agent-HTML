---
name: agent-html
description: Write valid `agent-html` DSL pages for this project's preview runtime. Use when Codex needs to compose XML-like preview layouts with `Page`, `Stack`, `Cluster`, `Grid`, and the supported UI tags under `packages/agent-html/src/runtime/ui/*`; use it to draft new pages, adapt existing fixtures, or choose valid Lucide icon names without falling back to JSX, className, or raw HTML.
---

# agent-html

Write `agent-html` DSL, not JSX or HTML.

## Workflow

1. Read `references/grammar.md` for the supported tags, attrs, defaults, and forbidden constructs.
2. Reuse the closest valid fixture pattern from `references/examples.md` before inventing new structure.
3. Stay within the currently supported runtime tags unless the user explicitly wants a future-target draft.
4. When an icon is needed, run the icon search helper instead of guessing names.

## Rules

- Output only `agent-html` DSL.
- Use `PascalCase` tags.
- Root must be `<Page>`.
- Use quoted scalar attrs like `columns="2"` or `value="82"`.
- Do not use `class`, `className`, `style`, imports, hooks, JS expressions, or raw HTML tags.
- Do not invent tags or attrs not present in the grammar reference.
- Do not put bare text directly under `Page`, `Stack`, `Cluster`, or `Grid`.

## References

- Grammar and canonical syntax: `references/grammar.md`
- Valid and invalid fixture patterns: `references/examples.md`
- Icon lookup notes: `references/icons.md`

These files are generated from `packages/agent-html/src/`.
Do not hand-edit generated reference files.
When the source changes, rerun the sync script.

## Scripts

- Search Lucide icon names: `scripts/search_icons.py "<query>"`
- Sync generated skill resources from project sources:
  `python packages/agent-html/src/scripts/sync_skill.py`
