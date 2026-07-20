# Canvas Design Taste

## Purpose

Canvas should feel like a calm operating workbench for building, inspecting,
and revising React artifacts. It is not a marketing surface, decorative
showcase, or document reader.

This file is the current design route. Historical app-bound design notes live
in `_archive/design`.

## Inherited Taste

Current Canvas taste inherits these concepts from the older design corpus:

- calm operating workbench feel
- neutral-first surfaces with sparse accent
- token-led hierarchy through spacing, alignment, type, and density
- compact utility density
- restrained typography
- quiet but legible interaction feedback
- low-chrome layered planes
- primitives before local restyling
- examples as copyable policy
- code and file shape as prompt infrastructure

These are inherited as current judgment, not as old product structure.

## Workbench Feel

The emotional tone is restrained:

- quiet rather than expressive
- technical rather than lifestyle-driven
- structured rather than decorative
- compact rather than spacious-for-effect

Canvas should be neutral-first, borderless by default, low-glare in dark mode, and sparse
with accent color. Accent supports orientation, state, and action priority; it
should not create a saturated brand surface.

## Spatial Model

Canvas preserves three spatial roles:

- host frame: global orientation, artifact selection, prompts, tools, overlays,
  diagnostics, and inspection chrome
- artifact surface: the rendered work plane for the selected artifact
- artifact content: blocks, modules, data, and local interactions inside the
  artifact

The host orients. The artifact surface carries the work. Artifact content owns
its own composition. Block overlays are inspection affordances, not artifact UI.

The artifact surface should feel hosted inside the workbench, not pasted onto a
blank page. Use stable planes, spacing, alignment, and type before adding a
boundary or container.

## System Rules

Canvas design decisions flow through four layers:

1. foundation values
2. semantic tokens
3. primitives
4. host and artifact composition

Lower layers define reusable constraints; higher layers compose them for a
specific surface. Higher layers should not invent system-wide visual truth.

Theme modes should expose the same semantic interface. Theme adaptation should
happen through token remapping, not separate per-theme component structures.

Interactive UI should account for the relevant subset of default, hover,
active, focus-visible, disabled, invalid, open, selected, and expanded states.
State treatment should remain coherent across host controls, primitives, and
artifact content.

Any exception should state why the rule cannot be followed, whether the
exception is temporary or permanent, and what normalization path exists.

Schedule pressure is not enough reason to create a parallel design system,
duplicate primitive family, or bypass semantic tokens.

## Visual System

Use semantic tokens before raw values. Light and dark themes should expose the
same semantic interface. Components should consume role tokens such as
`background`, `foreground`, `card`, `popover`, `muted`, `accent`, `destructive`,
`border`, `input`, and `ring`.

Structural values such as host header height, sidebar width, artifact reading
width, block overlay spacing, and floating prompt width are constants owned by
their source layer. They should not become local one-off values scattered
through artifact code.

Prefer:

- neutral surfaces over brand-colored surfaces
- spacing and foreground emphasis over routine borders
- compact utility spacing over theatrical whitespace
- token-driven boundaries only for state or spatial ambiguity
- stable planes over nested container depth

Avoid raw colors, decorative gradients, arbitrary visual values, oversized
radius, heavy shadows, and marketing-scale type in ordinary Canvas surfaces.

## Token Rules

Foundation values should remain generic and scale-based. They should describe
raw color, radius, spacing, type, icon, shadow, and layer values without naming
specific artifacts, host panels, or components.

Semantic tokens translate foundation values into UI roles. Component code should
consume semantic tokens directly. Floating surfaces consume `popover` and
`popover-foreground`; interactive states inside floating surfaces consume
`accent` and `accent-foreground`.

Structural constants are not general-purpose style tokens. Host header height,
sidebar width, artifact reading width, block overlay spacing, standard control
height, and floating prompt width should be centrally owned by the layer that
uses them.

Use this consumption order:

1. semantic token
2. structural constant
3. local utility only when the value is compositional and not reusable

Do not create local spacing, radius, color, or shadow scales in artifact or host
composition.

## Component Law

Component families should be chosen by behavior, not visual resemblance:

- `Tooltip` explains briefly; it is not an interactive container.
- `Popover` hosts local metadata, compact editors, pickers, or inspectors.
- `DropdownMenu` lists commands or choices.
- `Select` sets one field value.
- `Dialog` hosts blocking tasks that require completion, save, cancel, or test.
- `AlertDialog` confirms destructive, irreversible, discard, overwrite, or
  leave-with-unsaved-work decisions.
- `Sheet` hosts edge-attached drawers, mobile navigation, or large auxiliary
  panels.
- `Accordion` groups multiple peer disclosure sections.

Navigation rows, tabs, menu items, and select items should keep one primary
target with optional supporting slots. Labels should compress inside `min-w-0`;
icons, status, and actions should not be compressed by long labels.

## Component Judgment

Prefer local `agent-html/components/ui` primitives before hand-writing common
buttons, cards, badges, tables, sidebars, inputs, disclosures, menus, or
overlays.

Primitives should stay generic, accessible, token-led, and independent from
host internals or artifact-specific state. Rich components should compose
primitives and remain portable inside Canvas artifacts unless their owner is
explicitly host-only.

Component behavior should remain compact, neutral, task-oriented, accessible,
and predictable:

- buttons are utility controls, not promotional objects
- inputs are dense, quiet, and selectable
- cards carry real modules, objects, list items, placeholders, disclosures, or
  data groups
- floating surfaces use popover semantics and should not borrow sidebar tokens
- loading state should resemble final structure through quiet skeletons or
  local pending treatment
- text, code, generated output, artifact content, and editable fields should
  remain selectable

Create or refine a primitive when a repeated interaction family appears. Create
a rich component when a reusable arrangement of primitives appears. Keep a
pattern local when it is contextual or its reuse model is unclear.

## Layout Judgment

Canvas layouts should preserve orientation, task flow, and scan speed.

Host chrome should remain compact and consistent. It should not rival artifact
content or recreate artifact layout. Artifact source should not render host-only
block prompt actions, overlays, prompt controls, or privileged runtime behavior.

Artifact content should use modules, panels, tables, lists, cards, and
disclosures only when they express object identity, structure, placeholder
state, or interaction scope. Long operational content should become scannable
modules instead of one undifferentiated reading flow.

Use responsive changes that preserve the same spatial roles:

- columns to rows
- persistent navigation to disclosure or sheet
- split panels to stacked panels
- dense controls before new component identity

Reject hero banners inside the workbench, unrelated card blocks for host
chrome, oversized whitespace bands, card-inside-card depth without object
identity, and bespoke breakpoint logic without a structural reason.

## Layout Rules

Layouts should preserve the same spatial roles across viewport sizes. Responsive
behavior changes delivery before it changes identity.

Host frame rules:

- keep global controls compact and persistent when space allows
- keep prompts, overlays, and diagnostics visually separate from artifact source
- avoid turning host controls into unrelated card blocks

Artifact surface rules:

- preserve readable width and clear hierarchy
- use neutral contrast, margin, radius, and restrained borders to establish the
  work plane
- avoid relying on `Artifact` or `Block` root props for layout treatment

Artifact content rules:

- align repeated objects across rows and columns
- use panels only for real sections, objects, placeholders, disclosures, or
  interaction scopes
- prefer spacing, headings, separators, alignment, and state markers before
  adding another visible container layer

Spacing should support density and orientation. Large gaps, tall minimum
heights, and decorative whitespace should not substitute for hierarchy.

## Source Ownership

Current Canvas source ownership:

- `agent-html/artifacts`: artifact entrypoints and block composition
- `agent-html/components/ui`: primitive layer
- `agent-html/components`: reusable rich components
- `agent-html/styles`: Canvas CSS, semantic tokens, content classes, and
  internal host/artifact styling boundaries
- `packages/react/src`: thin protocol surface for `Artifact`, `Block`, and
  interaction helpers
- `packages/cli/src/host`: host UI, overlays, prompts, theme controls, and
  inspection behavior
- `packages/cli/src/react-canvas`: discovery, guards, generated indexes, and
  workspace validation

Bridge files should make cross-boundary ownership explicit through names,
props, events, or exported contracts. Host behavior belongs in host code.
Artifact layout belongs in artifact source. Protocol packages should stay thin.

Bridge modules should name both sides of the boundary they connect. Do not hide
architecture inside broad utility folders, helper functions, or tests that only
a maintainer can decode.

## Context Judgment

Files and examples are prompt infrastructure. They teach future agents what to
copy.

Keep routes narrow:

- one cold-start file
- one generated decision layer where useful
- one compact API surface where useful
- source code only after a route points there

Avoid adding design files for one-off rules. A new design note should exist
only if it removes a real decision from future work.

Examples should be short, orthogonal, and easy to imitate. A broad showcase can
be useful for coverage, but it should not become the primary example agents
copy.

## Review Checklist

Before accepting Canvas UI work, check:

- no retired app, example, or runtime assumptions are treated as current law
- no raw visual values bypass semantic tokens
- no duplicate primitive family was created
- no host-only chrome appears in artifact source
- no artifact layout ownership moved into the host
- no local utility bundle is becoming a shadow design system
- no accessibility behavior was lost during visual customization
- no text that should be selectable became host chrome
- no extra design document was added where an existing route already owns the
  question
