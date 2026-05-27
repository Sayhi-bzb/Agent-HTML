# Runtime Extraction Surgery Plan

Example is the current visual reference for Agent-HTML runtime rendering. The
goal is not to move the example website into the runtime package. The goal is to
move shared runtime host responsibilities into `packages/agent-html` so app and
example render the same AHTML through the same contract.

## Goals

- Keep example as the visual reference while removing hidden example-only
  runtime behavior.
- Make app and example each provide CSS token/source setup required by runtime.
- Keep runtime default behavior neutral; do not preload example theme presets.
- Move reusable viewport and interactive runtime host behavior into
  `packages/agent-html`.
- Keep demo shell, source comparison, cases, and website routing inside example.

## Move Into Runtime

- Runtime CSS/source contract:
  - Consumers must include package runtime sources in Tailwind scanning.
  - App and example should each provide their own CSS token context to runtime.
  - The contract should be documented or exposed through a runtime CSS entry.

- Shared runtime viewport/render frame:
  - Scroll viewport.
  - Render padding/frame.
  - Runtime content mount point.
  - Overlay registration surface when interaction mode is enabled.

- Interactive block runtime host:
  - Standard wiring for `inferAgentHtmlInteractionUnits`.
  - `AgentHtmlBlockRuntimeProvider`.
  - `AgentHtmlBlockWrapper`.
  - `AgentHtmlBlockIndicator`.
  - Standard `renderAgentHtml` options for interactive/block-highlight mode.

## Keep In Example

- `RuntimeHeader`.
- `SourceDialog`.
- AHTML/HTML/React source comparison panel.
- `block-summary-code` and demo hover-card explanatory content.
- Example cases.
- Example website routing/history/localStorage locale logic.

## Do Not Do

- Do not make `packages/agent-html` depend on `apps/agent-html-example`.
- Do not move example cases into runtime package.
- Do not install example presets as runtime defaults.
- Do not make app reach into example source files for production runtime
  behavior.
- Do not treat demo source comparison UI as runtime contract.

## Acceptance Notes

- The same AHTML should render consistently in app and example once both consume
  the shared runtime host contract.
- Example may still add demo-only chrome around the shared runtime host.
- App workspace should not need to duplicate example runtime wiring by hand.

## Boundary Convergence Notes

- Keep the top-level package entry focused on stable DSL core and production
  runtime host APIs.
- Keep low-level block hooks and handles under explicit `runtime/block` imports.
- Keep source metrics and formatted HTML helpers under `source`; they support
  example source comparison and are not runtime host contract.
- Do not use public export convenience as a reason to move example-only demo
  behavior into the runtime package.
