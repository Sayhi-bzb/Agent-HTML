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

- `/` renders the main operating shell from `apps/agent-html-app/src/App.tsx`.
- `apps/agent-html-example` owns the standalone Agent-HTML example website.

The default shell and the example website are separate deployable surfaces.
Shared behavior should move into stable modules instead of being copied between
these surfaces. Cloud deployment rules for the example website are defined in
[`deployment.md`](./deployment.md).

## Module Ownership

### `packages/agent-html/src`

Owns the Agent-HTML DSL core and runtime system:

- AST types
- parser
- validator
- schema metadata
- runtime renderer
- runtime UI used by rendered DSL output
- shared runtime host helpers used by app and example render surfaces
- runtime theme helpers
- fixtures and DSL-focused tests
- public exports from `packages/agent-html/src/index.ts`

This module is the stable boundary for Agent-HTML consumers. External surfaces
should use the public exports instead of reaching into internal parser,
validator, schema, or runtime files unless they are extending the DSL itself.
Consumers that render Agent-HTML must include the package source in their
Tailwind scanning and provide their own app-level CSS token context; the runtime
package stays neutral and does not preload example presets.

The package public surface is intentionally layered:

- `@/agent-html` is the stable contract for DSL core and production runtime host
  APIs.
- `@/agent-html/runtime` exposes the runtime host contract for consumers that
  want explicit runtime imports.
- `@/agent-html/runtime/block` is for advanced block-host internals such as
  hover state and drag/drop geometry.
- `@/agent-html/source` is demo/source-analysis support for source comparison
  surfaces. It is not part of the production runtime host contract.

### `apps/agent-html-example`

Owns the standalone runtime demo website:

- demo page shell
- source comparison UI
- example cases
- static runtime showcase behavior
- example-only public assets
- example-only CSS entry

It may consume `packages/agent-html` public APIs. It must not become the owner of DSL
schema, parser, validator, or runtime rules.

### `apps/agent-html-app/src/gallery`

Owns the Gallery feature domain:

- gallery view registry
- gallery view composition
- gallery view-local sidebar content
- gallery scene definitions
- gallery preview content
- gallery editor metadata
- gallery panel composition
- preview-only showcase assets

Gallery code may compose shared shell and primitive components. It must not
become a second primitive UI library, and gallery-specific content should not be
stored inside generic shell components.

### `apps/agent-html-app/src/shared/ui`

Owns shared primitive UI components. These are the base interactive and visual
building blocks used by app, shell, and feature code.

Primitive changes have broad impact. Prefer additive variants and preserve
accessibility semantics when changing this layer.

### `apps/agent-html-app/src/shell`

Owns reusable composite and shell components:

- sidebar and navigation modules
- header and tab rail
- search and settings surfaces
- reusable product-level composition built from primitives

Composite components may coordinate primitives and feature-facing UI patterns.
They should not store feature-specific registries or DSL-specific rules. When
shell components host feature content, app-level orchestration should pass that
content through slots instead of having shell code import the feature directly.

### `apps/agent-html-app/src/App.tsx`

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

- `packages/agent-html/src` must not depend on `apps/agent-html-example` or `apps/agent-html-app/src/gallery`.
- `apps/agent-html-example` may depend on `packages/agent-html` public APIs.
- `apps/agent-html-example` must not import `apps/agent-html-app/src` or app CSS.
- Gallery may depend on shared components, but shared components should not
  depend on Gallery content.
- App orchestration may compose feature domains, but feature domains should not
  depend on app-local state.
- Runtime UI under `packages/agent-html/src/runtime/ui` belongs to rendered DSL output and
  should not be treated as the general app primitive layer.
- Source comparison, source metrics, and formatted HTML output belong to
  example/debug support even when their helpers live in the package for reuse.
  They should not be promoted through the stable top-level package contract.

## Structural Change Rules

Before making structural changes, classify the change by owner:

- DSL semantics, schema, parsing, validation, or rendering belong in
  `packages/agent-html/src`.
- Demo-only source comparison or showcase behavior belongs in
  `apps/agent-html-example`.
- Gallery scene or editor behavior belongs in `apps/agent-html-app/src/gallery`.
- Gallery view registries, market placeholders, and view-local editor
  composition belong in `apps/agent-html-app/src/gallery`.
- Shared primitive interaction belongs in `apps/agent-html-app/src/shared/ui`.
- Reusable shell composition belongs in `apps/agent-html-app/src/shell`.
- Cross-surface state wiring belongs in `apps/agent-html-app/src/App.tsx`.
- App-level selection and cursor policy belongs in the app CSS root and shared
  primitive boundaries. Runtime selectable content boundaries belong in the
  runtime viewport and runtime UI controls.

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
