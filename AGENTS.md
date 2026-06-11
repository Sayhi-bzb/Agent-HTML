<!-- gitnexus:start -->
# GitNexus

This repo is indexed by GitNexus as **Agent-HTML**. Use GitNexus MCP for code exploration, impact analysis, and change verification.

Rules:
- Before editing any function, class, method, or shared API, run `gitnexus_impact({ target: "<symbol>", direction: "upstream" })`.
- Before finishing a code-change task, run `gitnexus_detect_changes({ scope: "all" })` and confirm the affected scope is expected.
- If the index is stale, re-index only with `npx gitnexus analyze --skip-agents-md`.
- Do not run bare `npx gitnexus analyze`; it rewrites the GitNexus sections in `AGENTS.md` and `CLAUDE.md`.

Useful resources:
- `gitnexus://repo/Agent-HTML/context`
- `gitnexus://repo/Agent-HTML/processes`
- `gitnexus://repo/Agent-HTML/process/{name}`

<!-- gitnexus:end -->

# Docs Writing Rules

Apply these rules when writing or editing docs.

- Use high-information wording that locks direction with the fewest sufficient terms.
- Do not add broad, repeated, or low-marginal words when existing terms already identify the concept.
- Keep docs orthogonal: one page should own one kind of question.
- Maintain navigation and context routes so readers and agents load only the context needed for the current task.
- Keep a single source of truth for each key fact, principle, or decision.
- Link to the authoritative source instead of restating or rewording the same rule elsewhere.
- Use stable vocabulary: one concept gets one name across docs.
- Do not introduce a new rule, label, or concept when an existing one explains the point.
- Prefer restrained, minimal, sufficient writing over exhaustive explanation.

# Content Routes

Use these routes before searching broadly.

- Canvas constitution: `apps/docs/content/docs/index.mdx`
- Canvas docs: `apps/docs/content/docs`
- Canvas architecture: `apps/docs/content/docs/architecture/index.mdx`
- Canvas workspace: `apps/docs/content/docs/workspace/index.mdx`
- Canvas workspace source: `agent-html/README.md`
- Canvas host: `apps/docs/content/docs/host/index.mdx`
- Canvas reference: `apps/docs/content/docs/reference/index.mdx`
- Artifact rules: `rule/artifact.md`
- Data rules: `rule/data.md`
- Taste: `taste/README.md`
- Taste Design: `taste/design/README.md`
- Agent Ergonomics: `taste/agent-ergonomics/README.md`
- AE route checks: `taste/agent-ergonomics/route-checks.md`
- Archive: `_archive/README.md`
- Archived App docs: `_archive/docs/app`
- Archived Runtime docs: `_archive/docs/runtime`
- Archived App code: `_archive/apps/agent-html-app`
- Archived Example code: `_archive/apps/agent-html-example`
- Archived Runtime code: `_archive/packages/agent-html`

# Canvas Constitution

Canonical source: `apps/docs/content/docs/index.mdx`.

Canvas governs the current isolated React artifact workspace for agents.

Apply these rules when changing artifact source, block composition, Canvas docs, `agent-html`, local Canvas resources, host inspection, block prompts, or artifact/block pipeline behavior.

- Agent Operating Context: `agent-html` is durable operating context for agents, not chat state.
- Isolated Artifact Workbench: Canvas lets agents generate, preview, validate, and revise React artifacts without importing retired app or runtime surfaces.
- Headless Protocol: `Artifact` and `Block` mark collaboration boundaries through stable metadata, titles, ids, and children.
- Local Resource Consumption: artifacts consume local Canvas UI primitives, hooks, helpers, schemas, data, examples, and semantic token classes.
- Inspectable Host Boundary: the host discovers artifacts, overlays blocks, routes prompts, applies theme presets, and observes artifact metadata instead of owning artifact layout.

# Archive Rule

`_archive/docs/app`, `_archive/docs/runtime`, `_archive/apps/agent-html-app`, `_archive/apps/agent-html-example`, `_archive/packages/agent-html`, and `_archive/.agents/skills/agent-html` are historical references only. Do not use archived App, Example, Runtime, or AgentHTML runtime skill material as current architecture sources, package targets, product routes, navigation targets, or agent operating paths.
