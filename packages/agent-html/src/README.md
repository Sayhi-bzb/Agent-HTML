# Agent-HTML DSL

This package owns the `agent-html` DSL and runtime system.

It currently owns:

- prompt and grammar notes
- parser, validator, and renderer
- runtime UI used by rendered DSL output
- runtime theme defaults
- test fixtures and error cases
- public exports from `packages/agent-html/src/index.ts`

It does not own the standalone example app surface. Keep demo panels, source comparison,
and deployable example cases in `apps/agent-html-example`.
