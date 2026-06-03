# React Canvas Registry Suppliers

Date: 2026-06-03

## Supplier Rule

Suppliers provide low-level capability. `.agent-html/` provides the local
wrappers agents should use.

```text
supplier library
  -> local ui / hooks / lib / schema wrapper
  -> artifact imports local wrapper
```

Agents should prefer local imports:

```tsx
import { Button } from "../ui/button"
import { useFilter } from "../hooks/use-filter"
import { formatDate } from "../lib/format-date"
```

Agents should not import random third-party libraries directly unless the local
playground has no wrapper and the task explicitly needs that capability.

## Base Suppliers

Keep the base playground conservative.

- `ui/`: shadcn/ui
- registry distribution: shadcn registry
- `lib/`: `clsx` and `tailwind-merge` for `cn()`
- `schema/`: Zod for artifact data schemas
- `hooks/`: AgentHTML-owned hooks first
- `data/`: JSON and local files first

The base should install only capabilities most artifacts need.

## Kit-Level Suppliers

These suppliers are valid, but they belong in future kits rather than base:

- table kit: TanStack Table
- chart kit: Recharts plus shadcn Chart
- form kit: React Hook Form plus Zod
- async data kit: TanStack Query
- search kit: Fuse.js
- complex client state: Zustand only when React state or reducer is insufficient

## Registry Role

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

The registry installs source files into the user's workspace. This makes the
toolbox visible to agents and editable by users.

## Base Playground Item

The first registry item should be `base-playground`.

It should install:

```text
.agent-html/
  AGENTS.md
  manifest.json
  ui/
  hooks/
  lib/
  schema/
  data/
  examples/
  artifacts/
```

It should not install `patterns/`.

## Review Rule

Registry items are source code. Installation should be reviewable.

Support workflows like:

```text
npx shadcn@latest view @agent-html/base-playground
npx shadcn@latest add @agent-html/base-playground --dry-run
```

Pin public installs to a version or commit once the registry is public.
