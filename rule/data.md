# Data Rules

This file owns artifact-local data structure and boundaries.

`rule/artifact.md` owns artifact and block naming. This file owns where data
lives and how agents should reach the smallest useful data owner.

## Core Contract

- Keep artifact data artifact-local by default.
- Use a single `data.ts` only for small artifacts with a small data surface.
- Treat `data.ts` entering `index/large-files.md` as a split smell.
- Do not let `data.ts` become a junk drawer for domain facts, media assets,
  source links, block copy, generated records, and helper functions.
- Do not create workspace-level `agent-html/data` unless multiple artifacts
  consume the same fixture or dataset.

## Preferred Shape

For broad artifacts, use a local `data/` directory:

```text
artifacts/<artifact>/
  <block-id>.block.tsx
  data/
    types.ts
    media.ts
    sources.ts
    <block-id>.ts
    generated-<subject>.ts
```

Use only the files the artifact needs. Do not create empty structure.

## File Roles

- `types.ts`: artifact-local shared types.
- `media.ts`: image, video, alt text, caption, credit, and media source data.
- `sources.ts`: citation, attribution, reference, and support links.
- `<block-id>.ts`: data owned by one semantic block.
- `generated-*.ts`: generated or raw statistical data that should not be
  casually edited as authored copy.

Name support files by subject when generic names would blur ownership, such as
`health-literacy-sources.ts`, `nasa-media-sources.ts`, or
`taxi-source-metadata.ts`.

## Import Route

- A block should import the smallest data owner it needs.
- Prefer `./data/<block-id>` for block-owned data.
- Prefer `./data/media` or a subject-specific media file for media assets.
- Prefer `./data/sources` or a subject-specific source file for support links.
- Avoid defaulting to `./data` barrels; barrels recreate the junk drawer
  surface.

## Ownership Thresholds

- Tiny constants used by one block may stay inside that block.
- Data used by one block belongs inside the block or `data/<block-id>.ts`.
- Data used by multiple blocks belongs in a named artifact-local data file.
- Data used by multiple artifacts may move to a workspace-level owner only with
  an explicit route and consumer.

## Generated Data

Generated data must be named as generated and kept separate from authored
interpretation.

Use names like `generated-taxi-stats.ts` for machine-derived records and names
like `city-rhythm.ts` for authored block interpretation. This tells agents
which files are data products and which files are narrative or UI judgment.
