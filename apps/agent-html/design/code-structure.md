# UI Code Structure Specification

## Purpose

This document defines how frontend design decisions map onto code structure.
It exists so the design system remains enforceable in implementation.

## Ownership

This document owns directory responsibilities, class-usage rules, variant management, promotion
rules, and review anti-patterns.
It does not define visual philosophy, typography roles, or component-family appearance rules.

## Directory Roles

### `src/app/gallery/*`

This directory is the Gallery feature domain.

It owns:

- gallery scene definitions
- gallery preview/example assets
- gallery editor-panel metadata
- gallery-specific content registries and adapters

It exists so Gallery can grow like an editor asset library without polluting either the primitive
layer or the generic composite layer.

It MUST NOT become a second primitive UI library.

Top-level `src/app/gallery/*` should remain preview-agnostic orchestration first.

It SHOULD own:

- editor state and controls
- preview scene selection and domain metadata
- panel composition
- feature-level types and registries

It SHOULD NOT own preview-local primitives, preview token CSS, or preview showcase card files.

### `src/app/gallery/preview/*`

This directory is the Gallery preview subdomain.

It owns:

- preview showcase cards
- preview-local workspace surface rendering
- preview-only themed primitives under `preview/ui/*`
- preview-only token CSS under `preview/styles/*`
- preview-only adaptation rules under `preview/rule/*`

`src/app/gallery/preview/ui/*` exists only for preview showcase consumption.
It MUST NOT become a second gallery-wide primitive layer.
Top-level gallery editor and panel code MUST continue to consume `src/components/ui/*`.

### `src/index.css`

This file is the token and theme-mapping entrypoint.

It owns:

- font setup
- semantic CSS variables
- light and dark theme mappings
- shared base-layer application rules

It MUST NOT become a dumping ground for page-specific styles.

### `src/components/ui/*`

This directory is the primitive UI layer.

It owns:

- shadcn-derived primitives
- primitive variants
- primitive slot styling
- shared interaction surfaces

### `src/app/shell/*`

This directory is the composite UI layer.

It owns:

- shell components
- navigation modules
- reusable feature-facing composition
- stable product patterns built from primitives

Current stable examples include:

- `AppSidebar`
- `SiteHeader`
- `NavProjects`
- `SearchCommand`
- `GalleryPanel`
- `GalleryEditorPanel`

It MUST NOT become a second primitive library.
It also MUST NOT become the long-term storage area for gallery asset data that belongs in
`src/app/gallery/*`.

### Page / App Layer

The page layer owns:

- data shaping
- mode state and orchestration
- local content ordering
- feature composition at the app root

It MUST NOT define new system-wide visual truth.

The current app layer is responsible for:

- project and tab state
- operating mode state (`workspace` vs `gallery`)
- scene selection state
- wiring shell composites together
- connecting shell composites to gallery-domain assets

## Styling Source of Truth

Design decisions should originate from this order:

1. token and theme mapping
2. primitive variants and slots
3. composites built from primitives
4. page-level composition

If a page needs repeated local visual overrides, the rule probably belongs higher in the system.

The current shell already proves that mode-aware behavior belongs in composites before it belongs
in page-local one-offs.

## Class Usage Rules

Tailwind utility usage is allowed, but it MUST remain system-led.

- prefer semantic token-backed utilities
- prefer existing primitive variants before adding local overrides
- prefer composition over local restyling
- use arbitrary values sparingly and only when no sanctioned token or constant exists
- avoid repeating the same utility bundle across multiple files when it should become a primitive
  or composite concern

## Variant Management

Variants belong to primitives first.

- if multiple screens need the same interaction surface in different visual forms, add or refine a
  primitive variant
- if the pattern is a reusable arrangement of primitives, create a composite
- if the pattern is unique to one screen, keep it local until reuse is proven

## Layout Constant Management

Structural constants such as shell heights and widths MUST be centralized.

- layout constants SHOULD be declared close to the shell primitive that owns them
- page code MUST NOT redefine shell structure constants ad hoc
- if a structural value becomes reused beyond one shell context, evaluate whether it should be
  promoted into a more explicit system constant

## Primitive Change Policy

When editing a primitive:

- assume the blast radius is global
- evaluate downstream consumers
- prefer additive variants over breaking stylistic rewrites
- preserve accessibility and interaction semantics

## Composite Promotion Policy

A page-level UI block should be promoted to a composite when:

- it appears on multiple screens
- it encodes a stable interaction pattern
- it would otherwise duplicate layout or state logic

It should stay local when:

- it is a one-off placeholder
- it is purely contextual
- its reuse model is still unclear

The following are no longer placeholders in the current app and should be treated as stable
composites:

- the mode-aware sidebar
- the mode-aware header tab rail
- the gallery scene panel
- the gallery color editor panel

Gallery asset content, however, should live in `src/app/gallery/*` even when those composites render
it.

## Review Checklist

A UI review should verify:

- no raw visual values bypass the token model
- no new parallel primitive was created
- no page is styling around primitives when a variant should exist
- no composite is leaking page-specific assumptions into the system
- no shell constants are copied into random files
- no accessibility behavior was lost during visual customization
- no mode-specific shell behavior was implemented by forking the shell instead of extending the
  existing composites

## Anti-Patterns

The following should be rejected by default:

- duplicating button or input behavior outside `src/components/ui/*`
- creating a second sidebar implementation with custom markup
- creating a second mode-specific header or sidebar instead of extending `SiteHeader` or
  `AppSidebar`
- hard-coding colors in feature components
- encoding typography decisions ad hoc in every page
- growing page-local utility bundles into a shadow design system
- storing gallery scene/example data ad hoc inside generic shell components when it belongs in
  `src/app/gallery/*`
- importing `src/app/gallery/preview/ui/*` into top-level gallery editor or shell orchestration code
