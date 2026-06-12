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
- Keep one source of truth for each fact, principle, or decision; link to it instead of restating it.
- Keep one stable name for each concept.
- Keep route files narrow: one page should own one kind of question.
- Write docs as agent context routes and owner maps. Human-readable prose is the
  interface agents parse, cite, and follow.
- Avoid human-oriented background or tutorial framing unless it changes the
  next correct agent action.
- Prefer restrained, minimal, sufficient writing over exhaustive explanation.

# Content Routes

Use the smallest route for the task before searching broadly.

- Canvas: `apps/docs/content/docs/index.mdx`, then `agent-html/README.md`
- Taste and agent ergonomics: `taste/README.md`
- Archive: `_archive/README.md`

# Canvas Constitution

Canonical source: `apps/docs/content/docs/index.mdx`.

Canvas governs the current isolated React artifact workspace for agents. Use
the canonical source before changing Canvas docs, `agent-html`, artifact/block
composition, local resources, host inspection, or block prompt behavior.

# Archive Rule

`_archive/*` is historical reference only. Do not use archived material as a
current architecture source, package target, product route, navigation target,
or implementation path.
