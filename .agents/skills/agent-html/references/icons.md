# Agent-HTML Icons

Do not embed the Lucide icon list into DSL output or prompt text.

## Rule

- Write only:
  - `<Icon name="alert-circle" />`

## Name Source

Project icon utilities live in:

- `src/agent-html/icons/icon-registry.ts`
- `src/agent-html/icons/search-icons.ts`

## Query

Use the helper script:

```bash
python .agents/skills/agent-html/scripts/search_icons.py "alert"
```

Prefer exact names returned by the helper.
