# Design Standards

This directory contains the implementation-facing design standards for the `agent-html` app as it
exists today.

The current product model is a dual-mode operating shell:

- `workspace` mode for project-backed work tabs and the main working surface
- `gallery` mode for design-study scenes, scene tabs, and a color-focused sidebar editor

These documents should describe the real shell, not a historical placeholder concept.

## Ownership

This package owns the frontend design rules for the app.
High-level visual philosophy is defined in [`DESIGN.md`](./DESIGN.md), while the rest of this
directory translates that philosophy into implementation-facing rules.

## Reading Order

1. [`DESIGN.md`](./DESIGN.md) for product feel and operating-shell philosophy
2. [`constitution.md`](./constitution.md) for global design-system law
3. [`tokens.md`](./tokens.md) for token layers, semantic interfaces, and shell constants
4. [`../../apps/agent-html-app/src/gallery/preview/rule/typography.md`](../../apps/agent-html-app/src/gallery/preview/rule/typography.md) for preview text roles and hierarchy
5. [`layout.md`](./layout.md) for shell modes, spacing, and responsive structure
6. [`components.md`](./components.md) for component-family standards
7. [`code-structure.md`](./code-structure.md) for implementation boundaries and review rules

## Which Document Answers What

- If the question is "what should this product feel like," read `DESIGN.md`.
- If the question is "what is globally allowed or forbidden," read `constitution.md`.
- If the question is "where does this visual value come from," read `tokens.md`.
- If the question is "what preview text role should this use," read [`../../apps/agent-html-app/src/gallery/preview/rule/typography.md`](../../apps/agent-html-app/src/gallery/preview/rule/typography.md).
- If the question is "how should this shell or mode be structured," read `layout.md`.
- If the question is "how should this component family behave," read `components.md`.
- If the question is "where should this code live," read `code-structure.md`.

## Boundary Rule

Each file in this directory should answer one class of question.
If a rule is fully specified in one file, other files should link to it rather than restate it.

When the operating shell changes, the corresponding rules in this directory should be updated in
the same stream rather than left behind as aspirational design text.
