# React Canvas shadcn Pipeline Goal

## Core Idea

We are not building a new UI system.
We are making `.agent-html` behave like a local shadcn workspace for agents and
the React Canvas host.

The goal is that host surfaces and agent-authored artifacts look like they come
from the same shadcn project because they consume the same token file and the
same primitive layer.

## shadcn Model

A normal shadcn project has this shape:

```text
components.json
  -> declares where ui components live
  -> declares which CSS file owns tokens

globals.css / styles.css
  -> owns semantic tokens and theme mappings

components/ui/*
  -> owns primitives, variants, slots, and interaction behavior
  -> consumes semantic tokens instead of inventing local visuals

pages and feature components
  -> compose primitives
```

The important shadcn idea is not only the component appearance.
The important idea is:

```text
source components + one CSS token entrypoint + stable import aliases
```

## AgentHTML Mapping

React Canvas uses the same model inside `.agent-html`:

```text
.agent-html/styles.css
  -> token and theme entrypoint

.agent-html/ui/*
  -> only primitive layer

.agent-html/hooks/*
.agent-html/lib/*
.agent-html/data/*
.agent-html/schema/*
  -> reusable artifact tools

packages/cli/src/host/*
  -> host composites and host app composition

.agent-html/artifacts/*.agent.tsx
  -> artifact content
```

Host and artifacts should both consume `.agent-html/ui` and
`.agent-html/styles.css`.

Host code imports primitives through the explicit playground alias:

```ts
import { Button } from "@agent-html-playground/ui/button"
```

Artifact code imports local primitives from the artifact workspace:

```ts
import { Button } from "../ui/button"
```

The import syntax is intentionally different because the boundary is different:
the host is an outside preview shell consuming the playground furniture, while
artifacts are content written inside the playground.

## Pipeline Contract

Every React Canvas pipeline stage should agree on the same contract:

- shadcn installs UI primitives into `.agent-html/ui`.
- shadcn writes theme tokens into `.agent-html/styles.css`.
- the host CSS route serves compiled `.agent-html/styles.css`.
- the CSS compiler scans both `.agent-html` source and host source.
- host code imports primitives from `@agent-html-playground/ui/*`.
- artifact code imports primitives from local `../ui/*`.
- guard prevents artifacts from hand-writing common primitives.
- boundary tests prevent host code from importing the app shell or old runtime.

This is the pipeline we are converging toward:

```text
.agent-html/styles.css
  -> .agent-html/ui primitives
  -> packages/cli/src/host composites
  -> .agent-html/artifacts content
```

The pipeline should not rely on each file inventing its own styling rules.
If a visual primitive is needed, add or install it under `.agent-html/ui`.
If a host surface is needed, compose `.agent-html/ui` inside the host.
If an artifact needs UI, import from `../ui`.

## Non-Goals

- Do not copy the app shell implementation into React Canvas.
- Do not revive the old AHTML runtime.
- Do not create a second UI primitive layer in host code.
- Do not make host and artifact import syntax identical only for cosmetic
  uniformity.
- Do not build pattern templates yet.

## Developer Rule of Thumb

If repeated visual decisions appear outside `.agent-html/ui`, the pipeline is
drifting.

If host code starts hand-writing buttons, cards, inputs, sidebars, tables, or
status surfaces, move the primitive concern back to `.agent-html/ui` or compose
an existing primitive in a host-local composite.

If artifact code starts hand-writing common UI or utility logic, prefer
`.agent-html/ui`, `.agent-html/hooks`, `.agent-html/lib`, `.agent-html/schema`,
or `.agent-html/data` first.
