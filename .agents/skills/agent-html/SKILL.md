---
name: agent-html
description: Use when editing AgentHTML artifacts, .agent-html files, Gallery Preview DSL, blocks, components, sections, prompt schema, or runtime-rendered artifact content. Before editing AgentHTML content, read `.agents/skills/agent-html/references/prompt-schema.md` for the current DSL contract and enabled component grammar.
---

# agent-html

Write `agent-html` DSL, not JSX or HTML.

## Workflow

1. Read `.agents/skills/agent-html/references/prompt-schema.md` for the supported tags, attrs, defaults, and forbidden constructs.
2. Reuse the closest valid fixture pattern from `.agents/skills/agent-html/references/examples.md` before inventing new structure.
3. Stay within the currently supported runtime tags unless the user explicitly wants a future-target draft.
4. When an icon is needed, run `.agents/skills/agent-html/scripts/search_icons.py "<query>"` instead of guessing names.
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

- Runtime contract and prompt schema: `.agents/skills/agent-html/references/prompt-schema.md`
- Valid and invalid fixture patterns: `.agents/skills/agent-html/references/examples.md`
- Icon lookup notes: `.agents/skills/agent-html/references/icons.md`

`.agents/skills/agent-html/references/prompt-schema.md` is the runtime contract
surface. In an AgentHTML workspace, the app rewrites it from the current enabled
component set.

## Scripts

- Search Lucide icon names: `.agents/skills/agent-html/scripts/search_icons.py "<query>"`
