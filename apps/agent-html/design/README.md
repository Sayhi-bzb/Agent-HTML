# Design Standards

This directory contains the working frontend design standards for the `agent-html` app.

## Ownership

This package owns the implementation-facing design rules for the app frontend.
It does not own the high-level visual philosophy, which remains in [`../DESIGN.md`](../DESIGN.md).

## Reading Order

1. [`../DESIGN.md`](../DESIGN.md) for visual philosophy and product feel
2. [`constitution.md`](./constitution.md) for global design-system law
3. [`tokens.md`](./tokens.md) for token layers, naming, and consumption
4. [`typography.md`](./typography.md) for text roles and hierarchy
5. [`layout.md`](./layout.md) for shell, spacing, and responsive structure
6. [`components.md`](./components.md) for component-family standards
7. [`code-structure.md`](./code-structure.md) for implementation boundaries and review rules

## Which Document Answers What

- If the question is "what should this product feel like," read `../DESIGN.md`.
- If the question is "what is globally allowed or forbidden," read `constitution.md`.
- If the question is "where does this visual value come from," read `tokens.md`.
- If the question is "what text role should this use," read `typography.md`.
- If the question is "how should this page be structured," read `layout.md`.
- If the question is "how should this component family behave," read `components.md`.
- If the question is "where should this code live," read `code-structure.md`.

## Boundary Rule

Each file in this directory should answer one class of question.
If a rule is fully specified in one file, other files should link to it rather than restate it.
