# Canvas Codex Thread Workbench

This note is an implementation blueprint for connecting Canvas block prompts to
Codex app-server. It is not Canvas law. Current Canvas docs remain the source of
truth for host, protocol, workspace, and archive boundaries.

## Current State

`packages/react/src` only owns the portable protocol:

- `Artifact` renders artifact metadata and the readable root container.
- `Block` renders block metadata and remains protocol-only.
- interaction helpers emit `agent-html:state-change`.

It does not own Codex, app-server, filesystem access, host actions, or thread
selection.

The previous block prompt path was host-owned clipboard copy:

```text
Block Send
  -> packages/cli/src/host/app.tsx submitBlockPrompt
  -> fetchBlockImplementation
  -> formatBlockPrompt
  -> navigator.clipboard.writeText
```

The current retained path is:

```text
Block Send
  -> Canvas host formats the block prompt packet
  -> Canvas dev server sends it to Codex app-server
  -> Codex starts or resumes the current page-session thread
  -> Codex starts a turn
  -> Codex edits durable workspace source
  -> Canvas host refreshes and rebundles the artifact
```

The durable result is source under `agent-html`, not a chat response stored in
the browser.

## Thread Association

Canvas no longer exposes a host-level Codex thread selector in the current v1.
The frontend keeps only the last returned thread id in page-session state.

Default selection:

```text
New thread
```

Backend routes still expose root-cwd thread listing for future host/tooling
surfaces. Existing selections, when a future surface uses them, should come from
Codex threads associated with the repository root.
Canvas source lives under:

```text
root/agent-html
```

The Codex working directory must be the parent repository root:

```text
root
```

Do not associate threads with `root/agent-html`. Codex app-server `thread/list`
uses an exact `cwd` filter, so the wrong path hides the threads users expect.

Current frontend thread behavior:

- A fresh page starts with no active thread id.
- The first Send calls `thread/start` with `cwd: root`, then stores the returned
  `threadId`.
- Later Sends in the same page session call `thread/resume` with that `threadId`,
  then call `turn/start`.

Future thread selector behavior, if reintroduced:

- Include root-cwd threads from `appServer`, `vscode`, and `cli` sources.
- `thread/name/set` is the app-server method to use for rename.

Minimum app-server calls:

```json
{
  "method": "thread/list",
  "params": {
    "cwd": "<absolute repo root>",
    "limit": 25,
    "sortKey": "updated_at",
    "sourceKinds": ["appServer", "vscode", "cli"]
  }
}
```

```json
{
  "method": "thread/start",
  "params": {
    "cwd": "<absolute repo root>",
    "serviceName": "agent_html"
  }
}
```

```json
{
  "method": "thread/resume",
  "params": {
    "cwd": "<absolute repo root>",
    "threadId": "thr_..."
  }
}
```

```json
{
  "method": "turn/start",
  "params": {
    "threadId": "thr_...",
    "input": [
      {
        "type": "text",
        "text": "<formatted block prompt packet>"
      }
    ]
  }
}
```

Use `thread/turns/list` with `itemsView: "full"` for read-only transcript
history. Use `turn/interrupt` for later cancellation support.

## Host Integration

Keep all Codex integration inside `packages/cli`.

The browser host should call Canvas dev server routes. It should not connect
directly to Codex app-server, because browser WebSocket auth is awkward and
because the dev server already owns local orchestration.

Add a small dev-server bridge:

```text
packages/cli/src/dev-server/routes.mjs
  /__agent-html/codex/threads
  /__agent-html/codex/threads/:id/transcript
  /__agent-html/codex/turn
```

The exact route shape can stay query/body based to match existing host routes.
The route owner must:

- resolve the current Canvas `root`;
- use that `root` as Codex `cwd`;
- start or connect to `codex app-server`;
- initialize the app-server connection once;
- proxy thread list, resume, start, turn start, and transcript calls;
- stream or poll turn notifications back to the host for status display.

The host-side `submitBlockPrompt` does not call
`navigator.clipboard.writeText` in the normal path. It posts to the Codex turn
route. Clipboard can return later only as an explicit copy action.

The block prompt packet remains the same:

```text
filePath
blockId
implementationPath?
interactionSnapshot?
Request
```

## Temporary Thread Window

The temporary host thread window was removed from the current implementation.
Keep the backend transcript route available, but do not render thread history in
the Canvas host until a new host surface is deliberately designed.

If a transcript UI returns later, build it as host chrome, not artifact content,
and do not import archived UI/runtime code.

## Reference Code

Current Canvas code:

- `packages/react/src/index.tsx` - `Artifact`, `Block`, and interaction events.
- `packages/cli/src/host/app.tsx` - current `submitBlockPrompt` Codex turn path.
- `packages/cli/src/host/floating-prompt.tsx` - block prompt composer.
- `packages/cli/src/host/block-overlay.tsx` - host overlay and block action
  placement.
- `packages/cli/src/host/api.ts` - host API wrapper pattern.
- `packages/cli/src/dev-server/routes.mjs` - current dev-server route owner.
- `packages/cli/src/react-canvas/prompt.mjs` - prompt packet formatter.
- `packages/cli/src/react-canvas/paths.mjs` - Canvas root and artifact path
  conventions.

OpenAI docs:

- `https://developers.openai.com/codex/app-server`

Docs facts to preserve:

- `thread/list` supports `cwd` exact filtering.
- `thread/start` creates a thread and can receive `cwd`.
- `thread/resume` continues an existing thread by id.
- `turn/start` starts a Codex turn for a thread.
- `thread/turns/list` reads stored turn history.

Archived reference-only code:

- `_archive/apps/agent-html-app/src/codex/connection/thread-service.ts`
- `_archive/apps/agent-html-app/src/codex/connection/thread-list.ts`
- `_archive/apps/agent-html-app/src/workspace/thread-transcript.ts`
- `_archive/apps/agent-html-app/src/pet/host/pet-thread-panel-content.tsx`
- `_archive/apps/agent-html-app/src/pet/host/pet-thread-transcript-content.tsx`
- `_archive/apps/agent-html-app/src/pet/host/thread-panel-app-window-host.tsx`

Use archived code only to understand shape and edge cases. Do not import from
`_archive`, and do not revive archived app/runtime architecture.

## Test Targets

Add tests when implementing code:

- thread list uses the absolute repository root as `cwd`;
- `New thread` starts a thread, stores the returned `threadId`, then starts a
  turn;
- existing thread selection resumes before `turn/start`;
- block prompt packets keep `filePath`, `blockId`, optional
  `implementationPath`, and optional compact interaction snapshot;
- backend transcript loading uses `thread/turns/list` and handles transient
  empty rollout reads;
- host bundle does not import archived app/runtime paths;
- `packages/react/src` remains free of Codex, fetch, filesystem, and host API
  dependencies.
