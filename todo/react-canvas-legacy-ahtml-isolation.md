# React Canvas Legacy AHTML Isolation

Date: 2026-06-03

## Purpose

Isolate the old AHTML system before removing it.

The old system is not only a renderer. It also owns the legacy file format,
workspace storage path, prompt schema, block path format, and Codex prompt
builder. Treat it as a compatibility box until React Canvas replaces each
responsibility.

## Legacy Box

Legacy AHTML owns:

- `projects/{project-id}/{section-id}/artifact.agent-html`
- `<Cell>`, `<Block>`, `<Stack>`, `<Section>`, and the XML-like DSL
- `parseAgentHtml`
- `validateAgentHtml`
- `renderAgentHtml`
- `renderInteractiveAgentHtml`
- `prompt-schema.md`
- old block paths such as `/Cell/Stack[0]/Block[0]`
- old prompt payloads with fenced `ahtml` source

Legacy AHTML remains available for existing workspaces, imports, compatibility
preview, and old tests.

It is no longer the main product direction.

## React Canvas Mainline

React Canvas owns:

- `.agent-html/artifacts/*.agent.tsx`
- `<Artifact>`
- `<Block id="...">`
- `<Action>`
- `AgentBridge`
- `.agent-html/ui`
- `.agent-html/hooks`
- `.agent-html/lib`
- `.agent-html/schema`
- `.agent-html/data`
- block prompts with fenced `tsx` source

New artifacts should be generated in `.agent-html/artifacts/`, not in
`projects/*/*/artifact.agent-html`.

## Adapter Boundary

The app should not directly call old parse, validate, render, block lookup, or
prompt builder code from workspace surfaces.

Introduce an artifact adapter boundary:

```ts
type ArtifactAdapter = {
  kind: "legacy-ahtml" | "react-canvas"
  canLoad(filePath: string): boolean
  render(source: string): React.ReactNode
  findBlock(source: string, blockPath: string): ArtifactBlock | null
  buildPromptPayload(input: BlockPromptInput): string
}
```

The exact TypeScript shape can change during implementation. The architectural
rule should not change: artifact format details stay behind adapters.

## Prompt Isolation

Legacy adapter prompt:

````text
---
filePath: projects/project-1/section-1/artifact.agent-html
blockPath: /Cell/Stack[0]/Block[0]
targetStatus: selected_explicit_block
---

```ahtml
<Block>
  ...
</Block>
```

Request:
...
````

React Canvas adapter prompt:

````text
---
filePath: .agent-html/artifacts/market-research.agent.tsx
blockPath: competitor-map
targetStatus: selected_block
---

```tsx
<Block id="competitor-map" title="Competitor Map">
  ...
</Block>
```

Request:
...
````

Do not add procedural instructions to the prompt. The file path, block path,
selected source, and request are the implicit guidance.

## Public API Rule

New React Canvas code must not import:

- `parseAgentHtml`
- `validateAgentHtml`
- `renderAgentHtml`
- `renderInteractiveAgentHtml`
- `AgentHtmlDocument`
- old prompt-schema APIs

Long-term package direction:

```text
@agent-html/legacy-ahtml
@agent-html/react
```

The current `@/agent-html` surface should be treated as legacy compatibility
until the package split exists.

## Dismantle Order

1. Name the old system `legacy-ahtml` in TODO and architecture docs.
2. Add the artifact adapter boundary.
3. Move old workspace rendering behind the legacy adapter.
4. Move old block prompt building behind the legacy adapter.
5. Add the React Canvas adapter for `.agent-html/artifacts/*.agent.tsx`.
6. Make new artifact creation use React Canvas paths by default.
7. Keep old workspace files readable through compatibility preview.
8. Remove old DSL internals only after React Canvas owns rendering, prompt
   packaging, docs, examples, and default workspace creation.

## Acceptance Checks

- Existing `artifact.agent-html` workspace documents still open.
- Existing AHTML block prompts still produce fenced `ahtml` source.
- React Canvas block prompts produce fenced `tsx` source.
- New React Canvas files do not import legacy DSL APIs.
- Workspace surfaces depend on artifact adapters, not directly on
  `parseAgentHtml -> validateAgentHtml -> renderInteractiveAgentHtml`.
- Docs and TODOs describe legacy AHTML as compatibility, not the future mainline.
