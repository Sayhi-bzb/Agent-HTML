# Design Standards

This directory contains implementation-facing design and context governance for `agent-html`.

The current product model is a dual-mode operating shell:

- `workspace` mode for project-backed work tabs and the main working surface
- `gallery` mode for design-study surfaces, fixed view tabs, theme editing, and component-market
  review

These documents should describe the real shell, not a historical placeholder concept.

## Ownership

This package owns app design governance and project code-context governance routes.
High-level visual philosophy is defined in [`DESIGN.md`](./DESIGN.md). Project-level code-context
governance is defined in [`context-governance.md`](./context-governance.md). The remaining files
translate those principles into narrower implementation-facing rules.

## Reading Order

1. [`DESIGN.md`](./DESIGN.md) for product feel and operating-shell philosophy
2. [`context-governance.md`](./context-governance.md) for project code-context governance
3. [`constitution.md`](./constitution.md) for global design-system law
4. [`tokens.md`](./tokens.md) for token layers, semantic interfaces, and shell constants
5. [`../apps/agent-html-app/src/gallery/preview/rule/typography.md`](../apps/agent-html-app/src/gallery/preview/rule/typography.md) for preview text roles and hierarchy
6. [`layout.md`](./layout.md) for shell modes, spacing, and responsive structure
7. [`components.md`](./components.md) for component-family standards
8. [`code-structure.md`](./code-structure.md) for implementation boundaries and review rules

## Which Document Answers What

- If the question is "what should this product feel like," read `DESIGN.md`.
- If the question is "how should code and architecture shape future development context," read
  `context-governance.md`.
- If the question is "what is globally allowed or forbidden," read `constitution.md`.
- If the question is "where does this visual value come from," read `tokens.md`.
- If the question is "what preview text role should this use," read [`../apps/agent-html-app/src/gallery/preview/rule/typography.md`](../apps/agent-html-app/src/gallery/preview/rule/typography.md).
- If the question is "how should this shell or mode be structured," read `layout.md`.
- If the question is "how should this component family behave," read `components.md`.
- If the question is "where should App UI code live," read `code-structure.md`.

## Boundary Rule

Each file in this directory should answer one class of question.
If a rule is fully specified in one file, other files should link to it rather than restate it.

When the operating shell changes, the corresponding rules in this directory should be updated in
the same stream rather than left behind as aspirational design text.
