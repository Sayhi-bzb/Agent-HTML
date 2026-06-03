# React Canvas Contracts

Date: 2026-06-03

## Source Contract

The v1 source contract is:

```text
.agent-html/artifacts/*.agent.tsx
```

Each artifact file should default export a React component.

Artifact files may import local assets from:

```text
../ui/*
../hooks/*
../lib/*
../schema/*
../data/*
```

The `.agent-html/` playground uses short paths. Do not use
`.agent-html/components/ui/` for v1.

## React API Contract

The minimum public API is:

```tsx
import { Artifact, Block, Action } from "@agent-html/react"
```

`Artifact` required props:

- `title`

`Block` required props:

- `id`

`Block` recommended props:

- `title`

`Action` minimum intent props:

- `target`
- `prompt`

The implementation may add props later, but v1 examples and Guard should rely
only on this minimum.

## Block Contract

Block ids must be:

- stable
- unique within one artifact
- readable
- kebab-case
- semantic, not positional

Good ids:

```text
summary
competitor-map
risk-table
next-steps
```

Bad ids:

```text
block1
section2
temp
top
```

Major semantic regions should be blocks. Individual buttons, tiny labels, and
every paragraph should not become blocks.

## Action Contract

An `Action` expresses user intent for an agent. It does not execute the agent.

Correct boundary:

```text
Action
  -> host event
  -> host builds block-aware prompt
  -> optional Codex / Claude / Gemini bridge
  -> agent edits artifact source
  -> host reloads preview
```

Artifact code must not call Codex app-server, local filesystem APIs, shell
commands, MCP servers, or privileged host APIs directly.

## Prompt Context Contract

Block prompts should guide agents implicitly through addresses and selected
source, not through verbose procedural instructions.

The interaction pattern is:

```text
user clicks block input icon
  -> host opens message input
  -> user submits request
  -> host packages filePath, blockPath, target status, selected source, and request
  -> optional agent bridge receives compact prompt
```

Addresses are the instruction. `filePath` tells the agent where to read or edit
if more context is needed. `blockPath` points to the intended region. The
selected source is the first context slice. Do not add long instructions that
tell the agent how to read progressively.

React Canvas prompt shape:

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
Add Claude Code and Gemini CLI.
````

The exact source fence language follows the artifact source. React Canvas uses
`tsx`; legacy `.ahtml` prompts may use `ahtml`.

## Bridge Contract

The host should submit structured payloads to a bridge. Adapters should format
or deliver those payloads.

Conceptual payload:

```ts
type BlockPromptPayload = {
  filePath: string
  blockPath: string
  targetStatus: "selected_block" | "missing_block"
  selectedSource: string | null
  request: string
}
```

Conceptual bridge:

```ts
type AgentBridgeResult =
  | { ok: true; provider: string }
  | { error: string; ok: false; provider: string }

type AgentBridge = {
  submitPrompt(payload: BlockPromptPayload): Promise<AgentBridgeResult>
}
```

Use one prompt formatter for debug, clipboard, and future Codex adapters. Do not
let each adapter invent its own prompt shape.

V1 adapters:

- `debug`: displays the payload and formatted prompt
- `clipboard`: copies the formatted prompt

V1.1 adapter:

- `codex-app-server`: sends the formatted prompt to Codex app-server

## Legacy Contract

`.ahtml` is not the main React Canvas source contract.

It may remain as:

- legacy rendering support
- compatibility input
- import or migration format

Do not build new v1 React Canvas behavior around `Cell -> Layout -> Block -> UI`.
