# React Canvas Codex Topology

Date: 2026-06-03

## Purpose

Codex app-server is an optional execution backend for AgentHTML. It is not the
React Canvas runtime and it is not required for artifact preview.

AgentHTML should first build a stable bridge interface. Codex app-server can
then be connected as one adapter behind that interface.

Official references:

- https://developers.openai.com/codex/app-server
- https://developers.openai.com/codex/cli/features#connect-the-tui-to-a-remote-app-server
- https://developers.openai.com/codex/cli/reference#codex-interactive

## Default Topology

```text
Browser
  -> AgentHTML host
  -> .agent-html/artifacts/*.agent.tsx
```

This works without Codex. The user can preview artifacts, click blocks, inspect
payloads, and copy formatted prompts.

## Bridge Topology

```text
Browser
  -> AgentHTML host
  -> AgentBridge
      -> debug adapter
      -> clipboard adapter
      -> codex-app-server adapter
  -> .agent-html/artifacts/*.agent.tsx
```

The host packages block-aware prompt payloads. Adapters decide what to do with
them.

## Codex App Server Topology

When the Codex adapter is enabled:

```text
AgentHTML host
  -> Codex app-server transport
  -> initialize
  -> initialized
  -> thread/start or thread/resume
  -> turn/start
  -> notifications
  -> artifact file changes
  -> AgentHTML host reloads preview
```

Codex app-server owns threads, turns, items, auth, approvals, sandbox behavior,
MCP, skills, and streamed agent events.

AgentHTML owns artifact discovery, React rendering, block overlays, prompt
packaging, bridge adapter selection, and preview reload.

## Transport Decision

Use `stdio` as the default local Codex adapter transport when AgentHTML starts
and owns the child process.

Official docs list supported transports:

- `stdio`: default transport for `codex app-server`
- `websocket`: `--listen ws://IP:PORT`, experimental and unsupported
- Unix socket: `--listen unix://` or `--listen unix://PATH`
- `off`: no local transport

Use Unix socket only when stdio ownership is awkward.

Use WebSocket only for local debugging, SSH port-forwarding, or explicit remote
control. Do not make unauthenticated non-loopback WebSocket part of the default
AgentHTML topology. Remote WebSocket needs auth and TLS.

Do not use Codex TUI remote mode as the main AgentHTML integration. `codex
--remote ...` connects the Codex TUI to an app-server endpoint; AgentHTML is a
separate host.

## Boundary Rules

React artifacts must never call Codex app-server directly.

Correct flow:

```text
Artifact interaction
  -> AgentHTML host
  -> AgentBridge adapter
  -> optional Codex app-server
```

Incorrect flow:

```text
Artifact interaction
  -> Codex app-server
```

AgentHTML must not duplicate Codex auth, model selection, sandbox, approvals,
MCP, skills, thread semantics, or conversation history.

## V1 Decision

V1 should debug the interface, not depend on Codex.

V1 adapters:

- `debug`: show payload and formatted prompt
- `clipboard`: copy formatted prompt

V1.1 adapter:

- `codex-app-server`: connect over stdio by default and drive `initialize`,
  `thread/start` or `thread/resume`, `turn/start`, and notifications
