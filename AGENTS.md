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

# App Constitution

Canonical source: `apps/docs/content/docs/app/index.mdx`.

App governs human-agent collaboration around artifacts. Runtime governs artifact source, schema, rendering, and host behavior.

Apply these rules when changing app docs, workspace behavior, shell UI, gallery, pets, or agent-facing app operations.

- Human-Agent Collaboration: app exists to make human-agent collaboration the primary working mode.
- Cognitive Bandwidth: app abstracts model capability into surfaces humans can scan, compare, judge, and steer within their cognitive limits.
- Parallel Work Surface: app replaces serial chat flow with a canvas-like workspace for persistent, parallel task context.
- Shared Agency: app must be legible to humans and operable by agents through stable objects, routes, states, and actions.

# Runtime Constitution

Canonical source: `apps/docs/content/docs/runtime/index.mdx`.

Apply these rules when changing runtime docs, schema, rendering, host integration, or artifact behavior.

- Durable Source: artifact state lives in durable source files, not chat state or runtime memory.
- Semantic Contract: LLMs express meaning through stable tags, blocks, and attributes, not ad hoc layout or styling.
- Block Composition: artifacts are composed from addressable blocks that can be inserted, removed, reordered, and regenerated.
- Portable Inspection: artifacts can be shared, reopened, validated, and inspected across hosts, runtime versions, and agent sessions.
