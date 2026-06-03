# React Canvas AgentHTML Playground

Date: 2026-06-03

## Decision

Use the short-path `.agent-html/` playground layout for the React Canvas
architecture.

AgentHTML is the sample room and toolkit for agents. It should not give agents
an empty room, and it should not force every artifact through a fixed template.
It should provide selected local React assets, stable collaboration markers, and
guardrails.

```text
Agent writes React.
AgentHTML guards the canvas.
```

React owns UI, state, hooks, events, and component composition. AgentHTML owns
artifact identity, block identity, localhost preview, host overlays, feedback
events, and style guardrails.

## Construction Guides

Use this folder as the construction guide for the React Canvas rebuild:

- `react-canvas-architecture-layers.md`: AgentHTML layers and ownership.
- `react-canvas-contracts.md`: minimum public contracts and boundaries.
- `react-canvas-codex-topology.md`: Codex app-server bridge topology.
- `react-canvas-v1-build-order.md`: implementation order for v1.
- `react-canvas-v1-implementation-slices.md`: executable v1 construction
  slices.
- `react-canvas-registry-suppliers.md`: registry and supplier decisions.
- `react-canvas-guard.md`: Guard checks and reporting policy.

## Playground Layout

Use this v1 structure:

```text
.agent-html/
  artifacts/
  ui/
  hooks/
  lib/
  schema/
  data/
  examples/
  AGENTS.md
  manifest.json
```

This is scheme A. Do not use `.agent-html/components/ui/` for v1. The
`.agent-html/` directory is already a dedicated playground, so `ui/` can stay
short and direct.

## Directory Roles

`artifacts/` stores agent-authored React artifacts, usually
`*.agent.tsx`.

`ui/` stores selected shadcn/ui or AgentHTML-adjusted base UI components such as
buttons, cards, tables, badges, tabs, dialogs, alerts, separators, skeletons,
tooltips, and scroll areas. Agents should use these before custom markup.

`hooks/` stores reusable React interaction hooks such as filtering, sorting,
selection, tabs, copy text, local artifact state, and debounced values.

`lib/` stores non-UI utilities such as `cn()`, formatters, sorting helpers,
filter helpers, clipboard helpers, id helpers, and artifact event helpers.

`schema/` stores artifact data schemas and validation helpers. It must not
become the old AgentHTML DSL schema. Its job is data shape, not UI tag grammar.

`data/` stores reusable artifact data such as JSON, fixtures, imported research
data, or shared tables. Small artifacts may keep data inline in TSX.

`examples/` stores sample-room artifacts that agents can read and imitate. These
examples are not templates; they are local reference implementations.

`AGENTS.md` stores agent rules for writing React artifacts inside this
playground.

`manifest.json` stores playground metadata and future host discovery data.

## Out of Scope for v1

Do not add `patterns/` yet. Patterns are higher-level work layouts such as
research matrices, decision tables, risk registers, or learning explainers. Add
them after several real artifacts prove which shapes repeat.

Do not keep `.ahtml` as the main product route. It can remain a legacy,
compatibility, or import format.

Do not make artifacts call Codex app-server or local filesystem APIs directly.
Artifacts should express intent through AgentHTML actions or host events.

## Distribution Model

Use npm for stable runtime APIs:

```tsx
import { Artifact, Block, Action } from "@agent-html/react"
```

Use shadcn registry for local source assets:

```text
.agent-html/ui/
.agent-html/hooks/
.agent-html/lib/
.agent-html/schema/
.agent-html/data/
.agent-html/examples/
.agent-html/AGENTS.md
```

The registry installs local, readable, editable source files into the user's
workspace. It is the source toolkit that reduces agent hand-rolled UI.

## Supplier Consensus

Supplier choices should stay conservative in the base playground.

The shared rule is:

```text
Suppliers provide low-level capability.
.agent-html/hooks wraps capability into artifact interactions.
.agent-html/lib wraps capability into pure utilities.
Artifacts should import local wrappers before importing third-party libraries directly.
```

Base v1 suppliers:

- `ui/`: shadcn/ui
- registry distribution: shadcn registry
- `lib/`: `clsx` and `tailwind-merge` for `cn()`
- `schema/`: Zod for artifact data schemas
- `hooks/`: AgentHTML-owned hooks first
- `data/`: JSON and local files first, with no default supplier

Do not put every useful React ecosystem library into the base playground. The
base should install only capabilities most artifacts need.

Future kit-level suppliers can include:

- table kit: TanStack Table
- chart kit: Recharts plus shadcn Chart
- form kit: React Hook Form plus Zod
- async data kit: TanStack Query
- search kit: Fuse.js
- complex client state: Zustand only when React state or reducer is insufficient

This supplier matrix is valid as v2/v3 kit planning. It is too broad for the
base playground.

## Agent Rules

Agents should write normal React.

Agents must use `Artifact` as the top-level artifact wrapper and wrap every
major semantic region in `Block`.

Block ids must be stable, unique, readable, and kebab-case.

Agents should use `.agent-html/ui/` components before custom markup, use
`.agent-html/hooks/` before rewriting common state logic, and use
`.agent-html/lib/` for shared utilities.

Agents should use semantic HTML first and keep repeated content in arrays or
objects when that makes the artifact easier to update.

Agents should not create one giant block, split every small element into a
block, use raw visual classes, use inline visual styles, invent custom visual
systems, or directly call agent backends from artifact code.

## Guard Role

AgentHTML Guard should check collaboration stability and visual stability.

Collaboration checks include:

- default export is a React component
- top-level artifact uses `Artifact`
- at least one `Block` exists
- every `Block` has an id
- block ids are unique and readable
- the artifact is not one giant block

Visual checks include:

- reject or warn on inline visual `style`
- reject or warn on raw color classes
- reject or warn on gradients, heavy shadows, large radii, custom fonts, and
  arbitrary Tailwind values
- prefer `ui/` components for buttons, cards, tables, badges, alerts, empty
  states, separators, skeletons, and dialogs

Guard should start as reporting. Automatic rewriting can come later.
