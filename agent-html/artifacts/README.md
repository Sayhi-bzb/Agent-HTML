# Artifacts

This directory owns Canvas artifact source.

Use it after reading `../README.md` and `../AGENTS.md`. `AGENTS.md` owns hard artifact protocol rules; this file only routes artifact source reading.

## Read Route

- New artifact or broad artifact edit: start from `../examples/example.agent.tsx`.
- Compact interaction example: read `interaction-state.agent.tsx`.
- Existing split artifact: open the `*.agent.tsx` overview before opening block files.
- Large block file: read `../index/large-files.md`, the artifact overview, and the block name first, then open only the block that owns the requested change.
- UI choice: read `../components/README.md`, then `../../docs/ui/README.md`.
- Reusable hooks, helpers, schemas, data, or rich components: read `../index/reuse-surface.md`, then `../index/api-surface.md`, before adding local code.
- Prompt debug wiring in `interaction-state/prompt-display.block.tsx` is a special host debug bridge for that example only. Do not copy it into ordinary artifacts.

## Boundary

Do not cold-start in a large block file. Large blocks are implementation details behind an artifact overview, the large-file route, and a named semantic block route.
