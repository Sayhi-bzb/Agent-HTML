---
name: agent-html
description: Use when editing AgentHTML artifacts, .agent-html files, Gallery Preview DSL, blocks, components, sections, prompt schema, or runtime-rendered artifact content. Before editing AgentHTML content, read references/prompt-schema.md for the current DSL contract and enabled component grammar.
---

# agent-html

Write `agent-html` DSL, not JSX or HTML.

## Workflow

1. Read `references/prompt-schema.md` for the supported tags, attrs, defaults, and forbidden constructs.
2. Reuse the closest valid fixture pattern from `references/examples.md` before inventing new structure.
3. Stay within the currently supported runtime tags unless the user explicitly wants a future-target draft.
4. When an icon is needed, run the icon search helper instead of guessing names.
5. In an AgentHTML workspace, edit user-facing artifacts at `projects/{project-id}/{section-id}/artifact.agent-html`.

## Rules

- Output only `agent-html` DSL.
- Use `PascalCase` tags.
- Root must be `<Page>`.
- Use quoted scalar attrs like `columns="2"` or `value="82"`.
- Do not use `class`, `className`, `style`, imports, hooks, JS expressions, or raw HTML tags.
- Do not invent tags or attrs not present in the grammar reference.
- Do not put bare text directly under `Page`, `Stack`, `Cluster`, or `Grid`.

## References

- Runtime contract and prompt schema: `references/prompt-schema.md`
- Valid and invalid fixture patterns: `references/examples.md`
- Icon lookup notes: `references/icons.md`

`references/prompt-schema.md` is the runtime contract surface. In an AgentHTML
workspace, the app rewrites it from the current enabled component set.

## Scripts

- Search Lucide icon names: `scripts/search_icons.py "<query>"`
