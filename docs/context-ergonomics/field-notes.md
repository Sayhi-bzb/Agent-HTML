# Field Notes

## `.agent-html` Is an Agent Workspace

The `.agent-html` directory is not only a source folder. It is an agent office.

Its structure should help an agent answer:

- what can I edit now;
- what should I consume instead of rewriting;
- what is host-owned;
- what is runtime-owned;
- what is style pipeline infrastructure;
- what should remain hidden unless the user asks for that layer.

## CSS Split

The old shape had two high-noise anchors:

- `styles.css`
- `styles/theme.css`

This made style lookup simple but too broad. Agents could see content classes, theme values, host chrome, block highlighting, and token details in the same context.

The current shape separates the route:

- `styles/index.css` is the pipeline map;
- `styles/content.css` is the public artifact style API;
- `styles/internal/artifact.css` owns readable artifact container behavior;
- `styles/internal/host.css` owns host chrome and block hover behavior;
- `styles/tokens/*` owns explicit token values;
- `styles/tokens/tailwind.css` maps semantic values into Tailwind.

This lets ordinary artifact work avoid CSS entirely, while style work can enter the exact feature or token file.

## Artifact Work Route

For a normal request such as "make a visual explanation page", the expected route is:

```text
.agent-html/AGENTS.md
  -> .agent-html/artifacts
  -> .agent-html/examples
  -> .agent-html/ui
  -> .agent-html/hooks, lib, schema, data if needed
```

The agent should not inspect token internals unless the request mentions theme, scale, color, density, font, radius, or host chrome.

## Locked Protocol Markers

`Artifact`, `Block`, and `Action` are protocol markers.

The current direction is:

- `Artifact` remains unstyled in source and receives reading layout from the artifact feature pipeline;
- `Block` remains protocol-only and receives host inspection hover from host chrome;
- visual treatment belongs inside block content through local primitives and semantic utilities.

This keeps collaboration structure separate from visual design.

## Directory Quality Test

A directory structure is healthy when an agent can answer these questions without broad search:

- Where do I start?
- Which file is the source of truth?
- Which layer owns this behavior?
- Is this task content, style, theme, host, runtime, or configuration?
- What should I avoid opening for this task?

If the answer requires opening many unrelated files, the structure needs better context ergonomics.
