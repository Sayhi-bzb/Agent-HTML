# React Canvas v1 Implementation Slices

Date: 2026-06-03

## Purpose

Turn the React Canvas architecture into executable v1 slices.

This file is the main construction checklist for reaching a useful local result:
a React artifact can be written in `.agent-html/artifacts/`, previewed on
localhost, checked by Guard, selected by block, and converted into a compact
block prompt.

## V1 Result

V1 is complete when a user or agent can:

1. install or create a base `.agent-html/` playground
2. write `.agent-html/artifacts/example.agent.tsx`
3. import `Artifact`, `Block`, and `Action` from `@agent-html/react`
4. reuse local `.agent-html/ui`, `hooks`, `lib`, `schema`, and `data`
5. run report-only Guard against the artifact
6. run a local dev host that scans and renders the artifact
7. click a block icon, enter a request, and inspect or copy a formatted `tsx`
   block prompt

Codex app-server is not required for v1. It is a v1.1 bridge adapter.

## Slice 1: React API Package

Create the minimum public React API:

```tsx
import { Artifact, Block, Action } from "@agent-html/react"
```

Default package landing:

```text
packages/react
```

Minimum behavior:

- `Artifact` renders children and exposes artifact metadata to the host.
- `Block` renders children and exposes stable block metadata to the host.
- `Action` renders an intent trigger or exposes action metadata to the host.

Minimum props:

- `Artifact`: `title`
- `Block`: `id`, optional `title`
- `Action`: `target`, `prompt`

Do not put old AHTML parser, validator, renderer, or schema code in this
package.

Acceptance:

- package typechecks
- example artifact can import the three components
- rendered output is normal React children when no host is present

## Slice 2: Base Playground

Create the base `.agent-html/` playground layout:

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

Minimum base item:

- `artifacts/example.agent.tsx`
- `ui/button.tsx`
- `ui/card.tsx`
- `ui/badge.tsx`
- `ui/alert.tsx`
- `ui/separator.tsx`
- `hooks/use-filter.ts`
- `hooks/use-selection.ts`
- `lib/cn.ts`
- `lib/format-date.ts`
- `schema/artifact-data.ts`
- `data/example-items.json`
- `examples/research-summary.agent.tsx`
- `AGENTS.md`
- `manifest.json`

Use shadcn/ui as the UI supplier and local source files as the agent-facing
toolbox. Keep base suppliers conservative.

Acceptance:

- example artifact imports local `ui`, `hooks`, and `lib`
- no `patterns/` directory exists in the base playground
- `schema/` contains data validation helpers, not old DSL grammar

## Slice 3: Guard Report

Add report-only Guard.

Default command target:

```text
agent-html guard
```

Minimum checks:

- artifact file has a default export
- default export appears to be a React component
- artifact uses `Artifact`
- artifact uses at least one `Block`
- every `Block` has an `id`
- block ids are unique
- block ids are readable kebab-case
- unstable ids such as `block1`, `section2`, `temp`, and `top` warn
- obvious one-giant-block artifacts warn
- visual `style`, raw visual `className`, raw color classes, gradients, heavy
  shadows, large radii, arbitrary Tailwind values, custom fonts, and
  hand-rolled common UI warn

Guard should report file path, severity, location when available, reason, and
suggested fix.

Acceptance:

- fixture with missing `Artifact` reports a collaboration issue
- fixture with duplicate block ids reports both ids
- fixture with unsafe visual classes reports a visual issue
- Guard does not rewrite files

## Slice 4: Dev Host

Add a local React Canvas host.

Default command target:

```text
agent-html dev
```

Minimum behavior:

- scan `.agent-html/artifacts/*.agent.tsx`
- show an artifact list
- render the selected artifact
- show source file path
- show Guard warnings
- reload on source changes

The host should work without the desktop app and without Codex app-server.

Acceptance:

- `agent-html dev` renders `example.agent.tsx`
- changing artifact source reloads the preview
- Guard warnings are visible in the host
- host does not import old AHTML parse, validate, or render APIs

## Slice 5: Block Overlay

Add block-aware collaboration affordances.

Minimum behavior:

- collect `Block` metadata from the rendered artifact
- show block hover state
- show block selection state
- show block id or title
- show a block icon for message input
- copy a block reference
- keep block overlays outside artifact source

Block ids are semantic addresses. They should not be generated from render
position.

Acceptance:

- hovering a block shows a stable overlay
- selecting a block records its `id`
- duplicate ids are surfaced through Guard
- overlay UI still works if the block contains shadcn/ui components

## Slice 6: Prompt Bridge

Add prompt formatting and bridge adapters.

Conceptual payload:

```ts
type BlockPromptPayload = {
  filePath: string
  blockPath: string
  targetStatus: "selected_block" | "missing_block"
  selectedSource: string | null
  request: string
}
```

Formatted React Canvas prompt:

````text
---
filePath: .agent-html/artifacts/example.agent.tsx
blockPath: summary
targetStatus: selected_block
---

```tsx
<Block id="summary" title="Summary">
  ...
</Block>
```

Request:
...
````

V1 adapters:

- `debug`: displays structured payload and formatted prompt
- `clipboard`: copies formatted prompt

Use one formatter for both adapters. Do not put procedural guidance in the
prompt. The path, block id, selected source, and request are the guidance.

Acceptance:

- selected block prompt includes `filePath`, `blockPath`, selected source, and
  request
- missing block prompt includes `selectedSource: null` behavior in payload and
  omits source content in formatted prompt
- debug and clipboard adapters use identical formatting

## Slice 7: Legacy Adapter

Keep old AHTML readable through a compatibility adapter.

Legacy adapter owns:

- `projects/{project-id}/{section-id}/artifact.agent-html`
- old `<Cell>` DSL
- old block paths such as `/Cell/Stack[0]/Block[0]`
- old fenced `ahtml` prompt output

React Canvas code must not import legacy internals directly.

Acceptance:

- existing `artifact.agent-html` documents still open
- existing AHTML block prompts still produce fenced `ahtml` source
- React Canvas artifacts use fenced `tsx` source
- new React Canvas code does not import `parseAgentHtml`,
  `validateAgentHtml`, or `renderInteractiveAgentHtml`

## Package And Command Defaults

Use these defaults unless implementation discovers a hard repo constraint:

- `packages/react`: `@agent-html/react`
- `packages/cli`: `agent-html guard` and `agent-html dev`
- `packages/agent-html`: legacy AHTML compatibility until package split
- `.agent-html/`: local source playground and registry-installed assets

The stable API comes from npm packages. The readable local toolbox comes from
shadcn registry distribution.

## Acceptance Matrix

V1 should pass these checks:

- React API package typechecks
- base playground example imports local assets
- Guard fixture tests cover collaboration and visual warnings
- dev host scans and renders a fixture artifact
- block overlay can select a block by id
- prompt formatter snapshots cover selected and missing block targets
- debug and clipboard bridge adapters share one formatter
- legacy AHTML compatibility remains intact

## Out of Scope

Do not include in v1:

- Codex app-server adapter
- remote WebSocket topology
- automatic Guard rewriting
- `patterns/`
- table, chart, form, query, search, or Zustand kits
- full migration from old workspace projects to React Canvas
- removal of old AHTML runtime
