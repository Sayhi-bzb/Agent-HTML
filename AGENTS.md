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
