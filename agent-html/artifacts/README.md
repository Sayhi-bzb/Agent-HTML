# Artifacts

This directory owns Canvas artifact source.

Use it after reading `../README.md` and `../AGENTS.md`. `AGENTS.md` owns hard artifact protocol rules; this file only routes artifact source reading.

## Read Route

- New artifact or broad artifact edit: start from `../examples/example.agent.tsx`.
- Compact interaction example: read `interaction-state.agent.tsx`.
- Existing split artifact: open the `*.agent.tsx` overview before opening block files.
- Large block file: read the artifact overview and block name first, then open only the block that owns the requested change.
- UI choice: read `../components/README.md`, then `../../docs/ui/README.md`.
- Reusable hooks, helpers, schemas, or rich components: read `../index/api-surface.md` before adding local code.

## Boundary

Do not cold-start in a large block file. Large blocks are implementation details behind an artifact overview and a named semantic block route.
