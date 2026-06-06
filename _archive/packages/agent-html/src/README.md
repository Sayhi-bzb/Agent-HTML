# Agent-HTML DSL

This package owns the `agent-html` DSL and runtime system.

It currently owns:

- prompt and grammar notes
- parser, validator, and renderer
- runtime UI used by rendered DSL output
- shared runtime host helpers for rendered DSL output
- runtime theme defaults
- test fixtures and error cases
- public exports from `packages/agent-html/src/index.ts`

It does not own the standalone example app surface. Keep demo panels, source comparison,
and deployable example cases in `apps/agent-html-example`.

## Public Boundaries

Use `packages/agent-html/src/index.ts` as the stable consumer contract. It should
only expose DSL core APIs and production runtime host APIs.

- Stable DSL core: AST public types, parsing, validation, serialization, and
  document editing helpers.
- Stable runtime host: renderer, interactive renderer, runtime theme, runtime
  viewport, and block runtime provider.
- Advanced runtime internals: low-level block hooks, block handles, and drag
  geometry helpers stay under explicit subpaths such as `runtime/block`.
- Demo/source support: source metrics and formatted HTML source helpers stay
  under `source`; they support example source comparison and are not runtime
  host contract.

## Runtime Host Contract

Consumers that render Agent-HTML output should use the public runtime exports
instead of copying app-specific host code:

- `AgentHtmlRuntimeTheme` provides the runtime CSS variable surface. Consumers
  may pass their own color variables, but the package default remains neutral.
- `AgentHtmlRuntimeViewport` owns the scroll viewport, render padding, content
  mount point, block indicator, and overlay registration surface.
- `AgentHtmlBlockRuntimeProvider` owns block drag/drop state.
- `renderInteractiveAgentHtml` wires `inferAgentHtmlInteractionUnits`,
  `AgentHtmlBlockWrapper`, and the standard block-highlight render options.

Consumers using Tailwind must include the package source in their stylesheet so
runtime classes are generated:

```css
@source "../../../packages/agent-html/src";
```

Each consumer still owns its app-level CSS token context. The package must not
preload example presets or depend on `apps/agent-html-example`.
