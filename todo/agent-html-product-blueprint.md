# Agent HTML Product Blueprint

Agent HTML is an agent workspace product. It gives AI agents a durable,
git-tracked local React artifact workspace named `agent-html/`.

The v1 product shape is intentionally simple:

```bash
npx agent-html init
npx agent-html dev
```

## Product Model

- `agent-html` is the public npm CLI users run.
- `agent-html/` is the workspace the CLI creates in the user's current
  project.
- `agent-html/` is source, not runtime install output.
- Users should commit `agent-html/` to git.
- Runtime, preview, guard, and host behavior come from the CLI package.

The workspace is the agent's durable operating context. It contains rules,
resources, examples, artifacts, styles, UI primitives, hooks, helpers, schema,
data, assets, and public files that agents can read, reuse, and revise.

## User Flow

Initialize a project:

```bash
npx agent-html init
```

This creates:

```text
agent-html/
```

Start the Canvas host:

```bash
npx agent-html dev
```

The host reads `agent-html/`, discovers
`agent-html/artifacts/*.artifact.tsx`, and provides artifact preview, guard
feedback, block overlay, and prompt routing.

## Init Contract

`npx agent-html init` creates a medium-complete workspace template in the
current directory.

The generated workspace includes:

- `AGENTS.md`
- `README.md`
- `components/`
- `styles/`
- `examples/`
- `artifacts/`
- `hooks/`
- `lib/`
- `schema/`
- `data/`
- `assets/`
- `public/`

If `agent-html/` already exists, `init` fails without changing files. v1 does
not overwrite, merge, or upgrade an existing workspace.

Generated workspaces must not include `node_modules`, lockfiles, generated
bundles, `.vite`, `dist`, `build`, or vendored dependency folders.

## Dev Contract

`npx agent-html dev` reads `agent-html/` from the current directory by default.

It starts the Canvas host and serves the local workspace without integrating
with the user's app. The host owns preview, guard display, block inspection,
floating prompt handling, theme presets, and stylesheet loading.

Artifacts remain isolated React source. They use `@agent-html/react` protocol
primitives and local Canvas resources from `agent-html/`.

## V1 Boundaries

V1 does not integrate with the user's application.

Do not add behavior that imports from user app source, depends on user React,
Tailwind, shadcn, or build configuration, injects routes into the user's app,
or merges generated code into app-owned files.

V1 also does not include automatic upgrade, template merge, export, deploy, or
app integration commands. Those are future product decisions.

## Implementation Direction

Use the current repo shape as the intended source:

- `agent-html/` is the workspace template source.
- `packages/cli` owns `init`, `dev`, and `guard`.
- `packages/react` owns `@agent-html/react`, including `Artifact`, `Block`,
  and interaction events.

Keep the public command name `agent-html`.

## Acceptance Checks

- Running `npx agent-html init` in an empty project creates `agent-html/`.
- The generated workspace contains the medium-complete template.
- Running `npx agent-html init` again fails without changing files.
- Running `npx agent-html dev` serves artifacts from the generated workspace.
- The generated workspace contains no installs, lockfiles, build output, Vite
  cache, or vendored dependency folders.
