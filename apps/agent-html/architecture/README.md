# Agent-HTML Architecture

## Purpose

This document defines the engineering structure of the Agent-HTML app. It owns
module boundaries, dependency direction, and structural change rules.

It does not define product purpose, visual design, component styling, or usage
instructions. Product direction belongs in [`blueprint/index.md`](../blueprint/index.md).
Frontend design rules belong in [`design/README.md`](../design/README.md).

## Application Entrypoints

The app has two top-level surfaces selected in `src/main.tsx`.

- `/` renders the main operating shell from `src/app/App.tsx`.
- `/agent-html` lazy-loads the standalone Agent-HTML runtime demo from
  `src/agent-html-example/entry.tsx`.

The default shell and the runtime demo are separate surfaces. Shared behavior
should move into stable modules instead of being copied between these surfaces.

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

### `src/agent-html-example`

Owns the standalone runtime demo surface:

- demo page shell
- source comparison UI
- example cases
- static runtime showcase behavior

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
They should not store feature-specific registries or DSL-specific rules.

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

- `src/agent-html` must not depend on `src/agent-html-example` or `src/app/gallery`.
- `src/agent-html-example` may depend on `src/agent-html` public APIs.
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
  `src/agent-html-example`.
- Gallery scene or editor behavior belongs in `src/app/gallery`.
- Shared primitive interaction belongs in `src/app/shared/ui`.
- Reusable shell composition belongs in `src/app/shell`.
- Cross-surface state wiring belongs in `src/app/App.tsx`.

Do not fix a surface by bypassing its owning layer. If a change requires behavior
from another layer, move the behavior to the appropriate shared owner and have
the surface consume it through that boundary.

## Non-Goals

This document does not own:

- product mission or positioning
- visual style, tokens, typography, or layout standards
- component appearance rules
- user-facing setup instructions
- temporary implementation notes
- release planning
