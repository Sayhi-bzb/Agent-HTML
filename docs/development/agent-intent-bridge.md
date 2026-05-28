# Agent Intent Bridge

Agent-HTML sends structured workspace intent to Codex through the official Codex
App Server protocol. The app is a thin host: it owns lifecycle, workspace
context, and UI routing, while Codex owns auth, model selection, sandbox,
approvals, MCP, skills, plugins, and conversation semantics through its official
configuration layers.

## Current Product Loop

```text
Agent-HTML App
  -> user selects a block or performs an interaction
  -> user enters a request and clicks Send
  -> Tauri host starts codex app-server --listen stdio://
  -> Tauri sends initialize / initialized once
  -> App sends Agent-HTML context as turn/start input
  -> Tauri forwards Codex notifications to the frontend
```

Agent-HTML does not inject messages into an already open Codex TUI. It is a
Codex App Server client and uses the official Thread / Turn / Item model.

## Codex Boundary

Agent-HTML may:

- start, stop, restart, and health-check the local Codex App Server process
- generate a prompt from the selected Agent-HTML block/document context
- call `thread/start` and `turn/start`
- forward raw Codex notifications into the app event bus
- store optional local JSONL diagnostics

Agent-HTML must not duplicate Codex configuration UI for:

- model or provider selection
- auth mode or account state
- sandbox and approval policy
- MCP servers, apps/connectors, plugins, or skills
- profiles and project trust

Those settings come from official Codex config files and App Server RPCs.

## Optional Bridges

Local log bridge:

```powershell
$env:AGENT_HTML_EVENT_LOG = ".tmp\agent-html-events.jsonl"
npm run bridge:agent
```

Use this to validate payloads without running a real backend agent.

Claude Code channel bridge:

```bash
claude mcp add agent-html-channel -- node tools/agent-html-claude-channel-bridge.mjs
```

This remains optional and separate from the Codex main path.

## Current Boundary

Implemented:

- App auto-starts a local Codex App Server in the Tauri desktop runtime.
- Agent-HTML context is sent to Codex as official `turn/start` input.
- Raw Codex notifications are forwarded to the frontend event bus.
- Optional local logs can capture prompt delivery and Codex JSON-RPC messages.

Not implemented yet:

- In-app streaming transcript of Codex responses.
- In-app display of tool calls, approvals, and final task status.
- Automatic diff review UI after agent edits.
