# AgentHTML Decision Blueprint

Status: decision blueprint, not implementation documentation.

This directory records the product and architecture turn that led to React Canvas.
Use this file as the authoritative blueprint summary. Files under `appendix/` are
supporting references and historical research; do not treat them as current
implementation law.

## Context

AgentHTML moved away from chat-flow output and from `.ahtml` as the main product
authoring route. The durable direction is to let agents write normal React
artifacts while AgentHTML provides collaboration protocol, guardrails, local
preview, and host inspection.

The current implementation docs remain the source of truth:

- Canvas: `apps/docs/content/docs/canvas`
- App: `apps/docs/content/docs/app`
- Runtime: `apps/docs/content/docs/runtime`
- Code-context governance: `design/context-governance.md`

## Decision

AgentHTML's main artifact route is React-first Canvas.

- `.agent-html/` is the durable local artifact workspace.
- Agents author `.agent-html/artifacts/*.agent.tsx` with ordinary React and
  TypeScript.
- `@agent-html/react` provides the collaboration protocol surface:
  `Artifact`, `Block`, and interaction state events.
- `Artifact` owns the readable root container and rendered metadata.
- `Block` is protocol-only. It marks stable, addressable semantic regions and
  does not own layout or visual styling.
- Canvas host owns artifact discovery, preview rendering, guard issue display,
  block overlay, floating prompt bridge, theme preset application, and
  stylesheet compilation.
- Artifact source must not call filesystem, shell, MCP, Codex app-server, or
  privileged host APIs.
- Artifact visual language must flow through local Canvas resources: semantic
  classes, CSS tokens, `.agent-html/ui/*`, hooks, helpers, schemas, data, and
  examples.

## Consequences

React owns UI composition, state, hooks, events, and local component behavior.
AgentHTML owns collaboration boundaries, durable source, block identity,
inspection metadata, guardrails, and host feedback loops.

The result should be:

- local-first artifact work
- addressable review surfaces
- stable block-level feedback
- reusable local UI resources
- portable source files rather than chat state or runtime memory

## Non-Goals

This blueprint does not make AgentHTML:

- a replacement for React
- a new JSX or HTML DSL
- a general app framework
- a Codex replacement
- a source of model selection, auth, permissions, or agent orchestration
- a marketplace or package manager

## Runtime and DSL Boundary

The `.ahtml` Runtime remains valid for the Runtime documentation route:

- parsing
- schema
- validation
- rendering
- runtime host integration
- DSL compatibility

It is not the main Canvas artifact authoring route. Canvas authors normal React;
Runtime preserves and evolves the Agent-HTML DSL pipeline.

## Codex Boundary

Codex and other agents are execution backends or authoring surfaces, not the
AgentHTML source of truth.

AgentHTML may use Codex through host-controlled bridges, but artifact source
must not call Codex app-server or local privileged APIs directly. Codex owns
auth, model selection, approvals, task execution, MCP/tool orchestration, and
thread state.

## Registry Boundary

shadcn registry is a possible source distribution layer for Canvas resources.
It can install local UI primitives, hooks, patterns, examples, and agent rules.

Registry is not a v1 runtime requirement and should not become a second
AgentHTML package manager. npm packages provide stable runtime boundaries;
registry-style source kits provide local reusable source when the project needs
them.

## Appendix References

Read appendix files only when reconstructing the reasoning behind this
blueprint:

- `appendix/react-canvas-architecture.md`: original React Canvas architecture
  turn.
- `appendix/codex-market-research.md`: Codex positioning and localhost-first
  rationale.
- `appendix/hci-interaction-market-research.md`: artifact-based interaction
  rationale and market framing.
- `appendix/shadcn-registry-distribution-report.md`: source distribution and
  registry research.
- `appendix/concept-map.md`: historical metaphor and world model notes.

Appendices may contain outdated wording, exploratory examples, or assumptions
that have been superseded by Canvas, App, Runtime, and design docs.
