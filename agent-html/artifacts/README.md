# Artifacts

This directory owns Canvas artifact source.

Use it after reading `../README.md` and `../AGENTS.md`. `AGENTS.md` owns hard artifact protocol rules; this file only routes artifact source reading.

## Read Route

- New artifact or broad artifact edit: start from this route and the closest existing artifact entry.
- New or renamed artifact/block: read `../AGENTS.md` and `../../rule/artifact.md`.
- Existing split artifact: open the `*.artifact.tsx` artifact entry before opening block files.
- Large block file: read `../index/large-files.md`, the artifact entry, and the block name first, then open only the block that owns the requested change.
- UI choice: read `../components/README.md`, then `../TASTE.md` for component judgment.
- Reusable hooks, helpers, schemas, shared data, or rich components: read `../index/reuse-surface.md`, then `../index/api-surface.md`, before adding local code.

## Data Placement

- Read `../../rule/data.md` before adding, splitting, or moving artifact data.
- Put typed contracts and validation in `../schema`.
- Put pure parsing, normalization, and transforms in `../lib`.
- Keep tiny block-only constants inside the block when they do not create a reusable data surface.

## Boundary

Do not cold-start in a large block file. Large blocks are implementation details behind an artifact entry, the large-file route, and a named semantic block route.
