# Frontend Design Constitution

## Purpose

This document is the highest-level implementation contract for frontend design in this app.
It defines where design decisions may originate, how they flow through the system, and how the
team governs exceptions.

## Ownership

This document owns system-level rules.
It does not define detailed token scales, typography roles, page layouts, or component-family
standards. Those belong to the specialized documents in `design/`.

The keywords `MUST`, `SHOULD`, and `MUST NOT` are normative.

## Scope

This constitution applies to:

- token and theme definitions
- shadcn primitive usage
- composite component construction
- page-level UI implementation
- light, dark, and system theme behavior

## Layer Model

The frontend design system has four layers.
Dependencies MUST flow downward only.

1. Foundation tokens
2. Semantic tokens
3. Primitives / atoms
4. Composites / page composition

### Foundation Tokens

Foundation tokens are the intended source of reusable raw design values. Current implementation gaps
are tracked in `tokens.md`.

They MUST:

- define scale-based raw values
- remain generic
- avoid page or component naming

### Semantic Tokens

Semantic tokens translate foundation tokens into UI roles.

They MUST:

- consume foundation tokens
- present a stable interface across themes
- be the token layer components depend on directly

### Primitives / Atoms

`apps/agent-html-app/src/shared/ui/*` is the primitive layer.
These components are the only allowed atomic UI building blocks in the app.

They MUST:

- consume semantic tokens
- preserve accessibility behavior
- remain generic and reusable

### Composites / Page Composition

Components outside `apps/agent-html-app/src/shared/ui/*` assemble primitives into stable product patterns.
Page code assembles composites and primitives into route-level screens.

They MUST:

- compose rather than reimplement primitives
- avoid creating a second primitive layer
- avoid inventing system-wide visual truth at the page layer

## Theme Rule

The app theme model is `light`, `dark`, and `system`.
All theme modes MUST expose the same semantic token interface.

Theme adaptation MUST happen through semantic remapping, not through separate per-theme component
implementations.

## State Rule

Interactive UI MUST account for the relevant subset of:

- default
- hover
- active
- focus-visible
- disabled
- invalid
- open / selected / expanded where applicable

State behavior must remain coherent across the system.

## Governance Rule

The following changes require explicit justification in review:

- introducing new foundation tokens
- changing semantic token mappings
- rewriting shared primitive behavior
- introducing a new primitive
- introducing a reusable composite
- bypassing the token system with local visual constants

## Exception Rule

Every exception MUST state:

- why the constitution cannot be followed directly
- whether the exception is temporary or permanent
- what the cleanup or normalization path is

Schedule pressure is not sufficient justification for creating a parallel design system.

## Source of Truth

Detailed implementation rules are delegated as follows:

- `tokens.md` owns token taxonomy, naming, and consumption
- [`apps/agent-html-app/src/gallery/preview/rule/typography.md`](../apps/agent-html-app/src/gallery/preview/rule/typography.md) owns preview text hierarchy and text-role rules
- `layout.md` owns shell structure and responsive layout rules
- `components.md` owns component-family standards
- `code-structure.md` owns code placement and implementation review rules
