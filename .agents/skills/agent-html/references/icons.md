# AgentHTML Icons

`Icon:name=string -> none` uses Lucide icon names.

Do not guess icon names. Search with:

```bash
python .agents/skills/agent-html/scripts/search_icons.py "alert"
```

Prefer exact returned names such as `alert-circle`, `check`, or `sparkles`.

The search script first reads the skill-local offline index at
`.agents/skills/agent-html/references/icon-names.txt`. Runtime workspaces do not
need `node_modules`.

Inside the AgentHTML development repository only, the script can fall back to
Lucide metadata from `node_modules/lucide-react`. It does not require or use
`.agents/node_modules`. Do not guess new icon names when lookup fails.
