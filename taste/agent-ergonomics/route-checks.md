# Route Checks

Route Check is the AE audit method for testing whether a cold-start agent can
follow the intended context path without broad search, duplicate truth, or
wrong-layer drift.

A route check is not a link check. It is a task script that asks whether the
workspace makes the next correct action cheaper than the wrong action.

## Context Route

A Context Route is the default path from a task prompt to the smallest useful
context.

It should identify:

- the first route anchor;
- the next likely context;
- the layer that owns the behavior;
- the contexts to avoid unless the task asks for them.

Routes are defaults, not rails. They reduce broad search while preserving room
to enter deeper layers when the task requires it.

## Script Shape

Each route script should name:

- task prompt;
- expected route;
- constraint level;
- avoid route;
- pass criteria;
- failure smells.

Use scripts to review workspace changes that add directories, move source,
change route files, introduce examples, or regenerate indexes.

Constraint levels follow `vocabulary.md`: hard rule, route default, practice,
heuristic, and smell. Route scripts should not turn every smell into a failure.

## Current Project Application

These scripts currently audit `agent-html`. The method is general; concrete
paths are project details. Hard rules remain in `agent-html/AGENTS.md`.

### AgentHTML Route Governance

Strong constraint placement:

- `agent-html/AGENTS.md` owns hard executable rules.
- `agent-html/README.md` routes by task condition and must not repeat full
  rules.
- `agent-html/components/README.md` owns component source routing.
- `docs/ui/README.md` owns component choice guidance.
- `agent-html/index/*` owns generated decision summaries, not design intent.
- `examples/*` owns copyable patterns and should stay compact.

Low-token constraint pattern:

- Put a hard rule once in its owning file.
- Make route files point to the owner instead of restating the rule.
- Let route checks verify the path and failure smells.
- Do not repeat the same constraint across README, guide, examples, index, and
  AGENTS.

Constraint strength policy:

- Hard rules: protocol boundaries, host boundaries, forbidden imports,
  generated-file editing, and source ownership.
- Route defaults: first read path, expected route anchors, and generated index
  before large source files.
- Practices: component choice, reuse preference, and examples as copyable
  policy.
- Heuristics: large-file token thresholds and first-search-space reducers.
- Smells: wrong-layer drift, broad scans, duplicated helpers, and guide/API
  duplication.

Priority route checks:

- Highest priority: Cold Start, Artifact Authoring, UI Choice, and Reuse.
- Regular checks: Block Editing, Style, Large File, and Generated Index.
- Run route checks when changing workspace directories, route files, examples,
  generated indexes, component layout, style ownership, or hard-rule surfaces.

Artifact work should usually route through:

```text
agent-html/README.md
  -> agent-html/AGENTS.md
  -> agent-html/examples
  -> agent-html/artifacts
  -> agent-html/components/README.md when UI is needed
  -> agent-html/index/api-surface.md when exports are needed
```

Style work should enter through `agent-html/styles/README.md`. Generated
decision work should enter through `agent-html/index/README.md`.

Applied boundaries:

- `README.md` files route. They should not become rulebooks.
- `AGENTS.md` owns hard operating rules.
- `components/README.md` owns the component source route.
- `docs/ui/README.md` owns component choice guidance.
- `index/api-surface.md` owns compact exports.
- `index/large-files.md` owns large-file reading cost and suggested routes.
- `examples/` carries copyable policy, so examples should stay compact and
  orthogonal.

Current route checks with the highest value are Artifact Authoring, Block
Editing, UI Choice, Reuse, Style, Large File, and Generated Index.

Application smells:

- A README repeats hard rules instead of pointing to `AGENTS.md`.
- A guide duplicates the API surface.
- A generated index becomes design intent.
- A rich workflow component is treated as a visual primitive.
- A normal artifact task enters tokens, host chrome, or runtime internals.
- A large source file is opened before its route file.

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

Constraint level: route default.

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

Constraint level: route default, with hard-rule checks for protocol marker
styling and host boundary violations.

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

Constraint level: route default, with hard-rule checks for host APIs in artifact
source.

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

Constraint level: practice and route default. Treat primitive bypasses and
wrong-layer component choices as smells unless they break a hard boundary.

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

Constraint level: practice.

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

Constraint level: route default, with hard-rule checks for artifact protocol
markers and host chrome leakage.

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

Constraint level: heuristic and route default.

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

Constraint level: route default. Editing generated files by hand is a hard-rule
failure when the generated file declares itself generated.

Avoid route: treating generated indexes as design intent or editing generated
files by hand.

Pass: generated indexes answer one question each and point back to source.

Failure smells: full graph dumps committed as context; generated declarations
treated as rules; two indexes answer the same question.
