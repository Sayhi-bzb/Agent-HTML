# Architecture

## Purpose

This document defines the engineering structure of the Agent-HTML app. It owns
module boundaries, dependency direction, and structural change rules.
Runtime gesture and hit-testing boundaries are defined in
[`runtime-interactions.md`](./runtime-interactions.md).

It does not define product purpose, visual design, component styling, or usage
instructions. Product direction belongs in [`blueprint/index.md`](../blueprint/index.md).
Frontend design rules belong in [`design/README.md`](../design/README.md).

## Application Entrypoints

The repository has two top-level web surfaces with separate ownership.

- `/` renders the main operating shell from `src/app/App.tsx`.
- `apps/agent-html-example` owns the standalone Agent-HTML example website.

The default shell and the example website are separate deployable surfaces.
Shared behavior should move into stable modules instead of being copied between
these surfaces. Cloud deployment rules for the example website are defined in
[`deployment.md`](./deployment.md).

## Module Ownership

### `src/agent-html`

Owns the Agent-HTML DSL core and runtime system:

- AST types
- parser
- validator
- schema metadata
- runtime renderer
- runtime UI used by rendered DSL output
- runtime theme helpers
- fixtures and DSL-focused tests
- public exports from `src/agent-html/index.ts`

This module is the stable boundary for Agent-HTML consumers. External surfaces
should use the public exports instead of reaching into internal parser,
validator, schema, or runtime files unless they are extending the DSL itself.

### `apps/agent-html-example`

Owns the standalone runtime demo website:

- demo page shell
- source comparison UI
- example cases
- static runtime showcase behavior
- example-only public assets
- example-only CSS entry

It may consume `src/agent-html` public APIs. It must not become the owner of DSL
schema, parser, validator, or runtime rules.

### `src/app/gallery`

Owns the Gallery feature domain:

- gallery scene definitions
- gallery preview content
- gallery editor metadata
- gallery panel composition
- preview-only showcase assets

Gallery code may compose shared shell and primitive components. It must not
become a second primitive UI library, and gallery-specific content should not be
stored inside generic shell components.

### `src/app/shared/ui`

Owns shared primitive UI components. These are the base interactive and visual
building blocks used by app, shell, and feature code.

Primitive changes have broad impact. Prefer additive variants and preserve
accessibility semantics when changing this layer.

### `src/app/shell`

Owns reusable composite and shell components:

- sidebar and navigation modules
- header and tab rail
- search and settings surfaces
- reusable product-level composition built from primitives

Composite components may coordinate primitives and feature-facing UI patterns.
They should not store feature-specific registries or DSL-specific rules. When
shell components host feature content, app-level orchestration should pass that
content through slots instead of having shell code import the feature directly.

### `src/app/App.tsx`

Owns app-level orchestration:

- workspace vs gallery mode state
- project and tab state
- active scene state
- composition of shell, gallery, and workspace surfaces

App-level code may wire modules together, but it should not become the source of
system-wide visual rules or DSL behavior.

## Dependency Direction

The intended dependency flow is:

```text
app orchestration
  -> composites / feature domains
  -> primitives / shared utilities
```

Agent-HTML DSL flow is:

```text
source string
  -> parseAgentHtml
  -> validateAgentHtml
  -> renderAgentHtml
  -> runtime UI
```

Rules:

- `src/agent-html` must not depend on `apps/agent-html-example` or `src/app/gallery`.
- `apps/agent-html-example` may depend on `src/agent-html` public APIs.
- `apps/agent-html-example` must not import `src/app` or `src/app/index.css`.
- Gallery may depend on shared components, but shared components should not
  depend on Gallery content.
- App orchestration may compose feature domains, but feature domains should not
  depend on app-local state.
- Runtime UI under `src/agent-html/runtime/ui` belongs to rendered DSL output and
  should not be treated as the general app primitive layer.

## Structural Change Rules

Before making structural changes, classify the change by owner:

- DSL semantics, schema, parsing, validation, or rendering belong in
  `src/agent-html`.
- Demo-only source comparison or showcase behavior belongs in
  `apps/agent-html-example`.
- Gallery scene or editor behavior belongs in `src/app/gallery`.
- Shared primitive interaction belongs in `src/app/shared/ui`.
- Reusable shell composition belongs in `src/app/shell`.
- Cross-surface state wiring belongs in `src/app/App.tsx`.

Do not fix a surface by bypassing its owning layer. If a change requires behavior
from another layer, move the behavior to the appropriate shared owner and have
the surface consume it through that boundary.

Runtime interactions that combine pointer movement, scroll, floating layers, or
layout feedback must follow
[`runtime-interactions.md`](./runtime-interactions.md). In particular, runtime
hit-testing should use browser client pointers and live DOM geometry instead of
third-party drag transforms or overlay positions.

## Non-Goals

This document does not own:

- product mission or positioning
- visual style, tokens, typography, or layout standards
- component appearance rules
- user-facing setup instructions
- temporary implementation notes
- release planning
