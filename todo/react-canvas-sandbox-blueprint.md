# React Canvas Sandbox Blueprint

## Core Idea

React Canvas is an agent-native isolated artifact workbench.

It is Storybook-like only in the sense that it provides an isolated preview and
inspection environment. Its real purpose is different: it gives agents a safe,
bounded place to generate, preview, validate, and revise UI artifacts without
polluting the app shell or reviving the old AHTML runtime.

The final architecture is:

```text
Protocol is headless.
UI is local shadcn.
Tokens are CSS variables.
Behavior is hooks.
Logic is lib.
Contracts are schema.
Data is data.
Composition is artifact.
Inspection is host.
```

## Layer Model

```text
@agent-html/react
  -> headless collaboration protocol

.agent-html/*
  -> agent-local consumable resources

.agent-html/artifacts/*
  -> artifact composition and content

packages/cli/src/host/*
  -> sandbox host, inspector, and prompt bridge
```

Each layer owns one kind of decision. The protocol layer marks collaboration
boundaries. The `.agent-html` workspace provides reusable resources. Artifacts
compose those resources into UI. The host observes and operates on the rendered
artifact through stable metadata.

## Headless Protocol

`Artifact`, `Block`, and `Action` are not visual primitives. They are the
collaboration protocol that makes artifact regions visible to the host and
operable by agents.

They should own:

- stable metadata
- host and overlay anchors
- source extraction anchors
- prompt targets
- action dispatch
- accessibility minimums
- HTML props passthrough

They should not own:

- page width
- spacing
- background or foreground color
- borders, radius, or shadow
- card or panel treatment
- dashboard grid structure
- app shell layout

The intended shape is headless:

```tsx
<main
  data-agent-html-artifact="true"
  data-agent-html-title={title}
>
  {children}
</main>
```

```tsx
<section
  data-agent-html-block="true"
  data-agent-html-block-id={id}
  data-agent-html-block-title={title ?? id}
>
  {children}
</section>
```

```tsx
<span
  data-agent-html-action="true"
  data-agent-html-action-target={target}
  role="button"
  tabIndex={disabled ? -1 : 0}
  aria-disabled={disabled}
>
  {children}
</span>
```

`className` may pass through, but the default class list should stay empty.
Visual defaults belong in artifact composition or `.agent-html/ui/*`, not in the
protocol package.

## Agent-Consumable Resources

Artifacts may consume the local sandbox resources directly:

```ts
import { Artifact, Block, Action } from "@agent-html/react"

import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { useFilter } from "../hooks/use-filter"
import { formatDate } from "../lib/format-date"
import { artifactDataSchema } from "../schema/artifact-data"
import rows from "../data/rows.json"
```

The resource model is:

```text
.agent-html/styles.css
  -> token and theme source

.agent-html/ui/*
  -> visual primitives

.agent-html/hooks/*
  -> reusable React behavior

.agent-html/lib/*
  -> pure helpers and transforms

.agent-html/schema/*
  -> typed contracts and validation

.agent-html/data/*
  -> fixtures, CSV, JSON, and local datasets

.agent-html/examples/*
  -> canonical usage examples
```

Artifacts consume style through semantic token classes such as
`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`,
`border-border`, `bg-popover`, and `bg-sidebar`. They do not import
`.agent-html/styles.css` directly.

## Artifact Composition

Artifacts are the composition layer. They decide layout explicitly by combining
the headless protocol with local resources.

```tsx
<Artifact
  title="Usage Dashboard"
  className="mx-auto flex w-full max-w-6xl flex-col gap-4 bg-background text-foreground"
>
  <Block id="summary" title="Summary">
    <Card>...</Card>
  </Block>

  <Block id="usage-table" title="Usage Table">
    <Card>...</Card>
  </Block>
</Artifact>
```

This keeps the protocol clean while still allowing artifacts to express
different shapes:

```tsx
<Artifact className="grid gap-4">
```

```tsx
<Artifact className="h-svh bg-background text-foreground">
```

```tsx
<Artifact className="mx-auto max-w-3xl">
```

```tsx
<Artifact className="grid grid-cols-[280px_1fr] gap-4">
```

`Block` should work the same way. It marks a stable region that can be located,
extracted, reviewed, and rewritten. It is not a card, panel, or section style.

## Host Role

The host is the sandbox inspector and operation bridge. It should not define the
artifact's visual language.

The host owns:

- artifact discovery
- artifact rendering
- guard issue display
- block overlay
- block source extraction
- prompt disclosure
- action event handling
- sidebar navigation

The host understands artifacts through stable metadata:

```text
[data-agent-html-artifact="true"]
[data-agent-html-block="true"]
[data-agent-html-block-id]
[data-agent-html-action="true"]
```

Host visual controls must consume React Canvas primitives from the local
playground alias:

```ts
import { Button } from "#agent-html-playground/ui/button"
import { Sheet } from "#agent-html-playground/ui/sheet"
import { Sidebar } from "#agent-html-playground/ui/sidebar"
```

The host must not import the app shell, old runtime UI, old render APIs, or a
host-local primitive layer.

## Guardrails

The sandbox should be enforced by tests and guard rules, not by review memory.

Artifact and example code may consume:

- `@agent-html/react`
- `../ui/*`
- `../hooks/*`
- `../lib/*`
- `../schema/*`
- `../data/*`
- semantic token classes

Artifact and example code must not consume:

- `apps/agent-html-app/src/*`
- `packages/cli/src/host/*`
- old AHTML runtime UI
- old render APIs
- `#agent-html-playground/*`
- raw palette classes such as `bg-blue-500`
- hand-written common primitives such as raw `<button>`, `<input>`, or `<table>`

Host code may consume:

- host-local composition modules
- CLI prompt and API helpers
- `#agent-html-playground/ui/*`

Host code must not consume:

- `@/app/*`
- `apps/agent-html-app/src/*`
- old AHTML runtime UI
- old render APIs
- `@agent-html-playground/*`
- `#agent-html-playground/*` outside `#agent-html-playground/ui/*`
- a host-local visual primitive layer

## Review Checks

A React Canvas sandbox review should confirm:

- `Artifact`, `Block`, and `Action` are treated as headless protocol.
- `.agent-html/ui/*` is the only visual primitive layer.
- `.agent-html/styles.css` is the token and theme source.
- artifact layout is explicit composition, not protocol default behavior.
- artifact examples consume `../ui`, `../hooks`, `../lib`, `../schema`, and
  `../data` before adding local helpers.
- host controls consume `#agent-html-playground/ui/*`.
- app shell, old runtime UI, old render APIs, and host-local primitives stay out
  of React Canvas.

## Non-Goals

- Do not copy `apps/agent-html-app/src/*` into React Canvas.
- Do not revive the old AHTML runtime.
- Do not make host and artifact import syntax identical for cosmetic uniformity.
- Do not add pattern templates yet.
- Do not add new primitives unless existing `.agent-html/ui/*` primitives cannot
  express the needed interaction semantics.

## Summary

React Canvas is a sandbox for agent-authored artifacts. Its stable contract is:

```text
@agent-html/react
  -> marks what the host can understand

.agent-html
  -> provides what agents can consume

artifact files
  -> compose the experience

host files
  -> inspect and operate on the result
```

`Artifact`, `Block`, and `Action` are the collaboration protocol, not the design
system. Visual decisions belong in `.agent-html/ui/*`, `.agent-html/styles.css`,
and explicit artifact composition.
