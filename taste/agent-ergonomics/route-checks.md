# Route Checks

Route Check is the AE audit method for testing whether a cold-start agent can
follow the intended context path without broad search, duplicate truth, or
wrong-layer drift.

A route check is not a link check. It is a task script that asks whether the
workspace makes the next correct action cheaper than the wrong action.

## Script Shape

Each route script should name:

- task prompt;
- expected route;
- avoid route;
- pass criteria;
- failure smells.

Use scripts to review workspace changes that add directories, move source,
change route files, introduce examples, or regenerate indexes.

## Mainline Scripts

### Cold Start Route

Task prompt: "I need to work in this repository."

Expected route:

```text
README.md or AGENTS.md
  -> content routes
  -> task-owned workspace
  -> source only after the route identifies it
```

Avoid route: broad search, archive-first reading, generated output before route
files.

Pass: the agent can identify the current product surface, archived material,
and the first task-owned anchor without inspecting unrelated directories.

Failure smells: multiple root entrypoints claim the same role; archived material
looks current; README repeats rules instead of routing.

### Artifact Authoring Route

Task prompt: "Create or edit a Canvas artifact."

Expected route:

```text
agent-html/README.md
  -> agent-html/AGENTS.md
  -> agent-html/examples
  -> agent-html/artifacts
  -> agent-html/components/README.md when UI is needed
```

Avoid route: host internals, theme tokens, old runtime surfaces, broad component
scans.

Pass: the agent can create or edit an artifact using `Artifact`, `Block`, a
copyable example, and local resources without styling protocol markers.

Failure smells: `className` on `Artifact` or `Block`; one-off primitive markup;
opening style internals for ordinary content work.

### Block Editing Route

Task prompt: "Change one block in an existing artifact."

Expected route:

```text
artifact entry
  -> named block implementation
  -> interaction state only if the block records local control changes
```

Avoid route: editing the host overlay, rewriting the artifact entry, or loading
unrelated block implementations.

Pass: the agent keeps the change scoped to the block and preserves protocol
metadata.

Failure smells: broad artifact rewrites; host APIs in artifact source; unrelated
block changes.

### UI Choice Route

Task prompt: "Add a control or display component to an artifact."

Expected route:

```text
agent-html/components/README.md
  -> docs/ui/README.md
  -> agent-html/index/api-surface.md
  -> source only if exports and examples are insufficient
```

Avoid route: scanning every file in `components/ui`, treating rich workflow
components as primitives, or using menus for form values.

Pass: the agent can choose between primitive, rich workflow component, and
custom composition before opening source.

Failure smells: button loops for segmented controls; `DropdownMenu` for form
selection; `Kanban` for ordinary lists; `components/ui/kanban`.

### Reuse Route

Task prompt: "Add filtering, selection, parsing, schema validation, or fixture
data."

Expected route:

```text
agent-html/index/api-surface.md
  -> hooks, lib, schema, or data
  -> source only after the API surface identifies a likely owner
```

Avoid route: ad hoc helpers inside artifacts, duplicate schemas, or new local
state machinery before checking reusable resources.

Pass: the agent reuses or extends the existing owner layer when one exists.

Failure smells: repeated parsing logic; artifact-local schema definitions;
hooks duplicated under blocks.

### Style Route

Task prompt: "Change spacing, color, theme, density, radius, font, or host
chrome."

Expected route:

```text
agent-html/styles/README.md
  -> content.css for artifact-consumable classes
  -> tokens/* for semantic values
  -> internal/* for locked Canvas chrome
```

Avoid route: raw palette classes in artifacts, token changes for content-only
work, or host chrome styles inside artifact source.

Pass: the agent enters the narrow style layer owned by the task.

Failure smells: theme work during content tasks; arbitrary values in artifacts;
sidebar tokens used for prompt UI.

### Large File Route

Task prompt: "Inspect or change a large component or artifact."

Expected route:

```text
agent-html/index/large-files.md
  -> suggested route file
  -> API surface or component route
  -> source
```

Avoid route: opening large files as the first context.

Pass: the agent reads a map before implementation detail.

Failure smells: cold-starting in `kanban.tsx`, `sidebar.tsx`, or broad coverage
artifacts.

### Generated Index Route

Task prompt: "Find exports, dependency gravity, or large files."

Expected route:

```text
agent-html/index/README.md
  -> api-surface.md, dependency-summary.md, or large-files.md
```

Avoid route: treating generated indexes as design intent or editing generated
files by hand.

Pass: generated indexes answer one question each and point back to source.

Failure smells: full graph dumps committed as context; generated declarations
treated as rules; two indexes answer the same question.
