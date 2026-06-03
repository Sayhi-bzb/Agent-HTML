# React Canvas Architecture Layers

Date: 2026-06-03

## Purpose

AgentHTML turns agent-authored React into a local AI canvas.

The system has three layers:

```text
asset layer
  -> collaboration layer
  -> host layer
```

React makes the artifact interactive. AgentHTML makes it addressable,
reviewable, and reusable across agent turns.

## Asset Layer

The asset layer is the local `.agent-html/` playground.

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

This layer gives agents selected materials instead of an empty React file.

- `ui/` is selected furniture: Button, Card, Table, Dialog, Badge, Tabs, Alert,
  Separator, Skeleton, Tooltip, and similar shadcn/ui components.
- `hooks/` is interaction tooling: filtering, sorting, selection, tabs, copy
  text, local artifact state, and debounced values.
- `lib/` is utility tooling: `cn()`, formatting, grouping, sorting, clipboard,
  ids, and prompt/event helpers.
- `schema/` is data shape and validation. It is not the old AgentHTML DSL
  schema.
- `data/` stores reusable local data for charts, tables, matrices, and examples.
- `examples/` stores sample-room artifacts that agents can imitate.
- `AGENTS.md` stores construction rules.

The asset layer optimizes for reuse and consistent local source that agents can
read.

## Collaboration Layer

The collaboration layer is the minimum AgentHTML React contract.

```tsx
import { Artifact, Block, Action } from "@agent-html/react"
```

- `Artifact` means this React component is an AI work product.
- `Block` means this region can be named, reviewed, selected, referenced,
  prompted against, and rewritten.
- `Action` means this UI exposes an AI intent for the host to convert into an
  agent request.

`Block` is not a UI component library. It is a collaboration boundary. A block
can contain normal React, shadcn/ui components, native HTML, charts, forms,
tables, or local components.

`Action` must not call Codex, the filesystem, or any agent backend directly. It
expresses intent. The host decides how to send that intent to an execution
backend.

## Host Layer

The host layer is the local runtime surface.

It owns:

- scanning `.agent-html/artifacts/*.agent.tsx`
- showing an artifact list
- rendering the selected React artifact
- running Guard and showing warnings
- registering block ids and titles
- rendering block hover and selection overlays
- copying block-aware prompts
- opening block message inputs
- packaging implicit-address prompts with file path, block path, selected source,
  and request
- receiving `Action` events
- forwarding user intent to a pluggable `AgentBridge`

The host does not own artifact content, React component design, Codex auth,
model selection, sandbox, approvals, MCP, skills, or conversation semantics.

## Bridge Boundary

The host owns the bridge boundary. Artifacts do not.

```text
Block input or Action
  -> Host packages structured prompt payload
  -> AgentBridge adapter receives payload
  -> Adapter displays, copies, or sends it
```

V1 should implement the bridge interface before wiring Codex app-server.

Initial adapters:

- `debug`: show the structured payload and formatted prompt for inspection
- `clipboard`: copy the formatted prompt for manual agent use

Later adapter:

- `codex-app-server`: send the formatted prompt through Codex app-server

This keeps Block UI, Action UI, and prompt packaging stable while execution
backends change.

## Layer Rule

```text
Assets give agents materials.
Collaboration gives humans and agents shared names.
Host gives artifacts a reviewable canvas.
```
