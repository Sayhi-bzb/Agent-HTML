# Artifact Rules

This file owns artifact and block naming rules.

`agent-html/AGENTS.md` owns Canvas protocol rules. This file owns the naming
signals that shape future artifact authors.

## Naming Contract

- Name an artifact after its subject, not after its format. Avoid `demo`,
  `example`, `page`, `dashboard`, and other template labels unless the subject
  itself uses that word.
- Name a block after its semantic work area, not its visual position, component
  shape, or narrative flourish.
- Keep split artifact naming isomorphic: `*.block.tsx` file name, component
  name, `Block id`, and `Block title` must identify the same work area.
- Use stable, readable, kebab-case `Block id` values.
- Use `PascalCaseBlock` component names derived from the same words as the
  block id.

## Good Block Names

Use domain object plus responsibility:

- `mission-overview`
- `launch-system`
- `route-planner`
- `recovery-validation`
- `crew-manifest`
- `high-density-route`
- `quiet-route`
- `open-loop-notes`
- `media-sources`

These names tell a cold-start agent what the block owns before it opens the
implementation.

## Weak Naming Signals

Avoid names that teach agents to copy layout or template structure:

- Position names: `header`, `hero`, `footer`, `top`, `bottom`.
- Container names: `section`, `panel`, `card`, `grid`, `view`.
- Abstract layer names: `layer`, `console`, `surface`, `module`.
- Generic support names: `sources`, `references`, `notes`, `summary`.
- Numbered or placeholder names: `section-1`, `block-a`, `content`.

Use a narrower domain name when support content is necessary: `media-sources`,
`clinical-references`, `data-sources`, or another subject-specific owner.

## Normative Weight

Artifacts and examples are copyable policy. A weak name in a first-route
artifact can train future agents more strongly than an abstract rule.

When adding or renaming artifact blocks, prefer boring semantic precision over
poetic labels, visual labels, or reusable page templates.
