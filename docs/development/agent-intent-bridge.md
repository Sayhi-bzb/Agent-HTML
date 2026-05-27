# Agent Intent Bridge

Agent-HTML 的 bridge 负责把 App 里的结构化用户意图送到本地 agent。当前主线是 Codex App Server；本地日志 bridge 和 Claude Code channel bridge 保留为调试/可选适配。

## Current Product Loop

```text
Agent-HTML App
  -> user selects a block or performs an interaction
  -> user enters a request and clicks Send
  -> App posts an Agent Context Event to a local bridge
  -> bridge delivers the request to a backend agent
```

当前已验证的 Codex 链路：

```text
Agent-HTML App Send
  -> POST /agent-html/events
  -> local Codex bridge
  -> codex app-server --listen stdio://
  -> thread/start
  -> turn/start
  -> Codex response / local file edit
```

## Recommended: Codex App Server

Start the Codex bridge:

```powershell
$env:AGENT_HTML_CODEX_COMMAND = "C:\Users\Administrator\AppData\Roaming\npm\codex.cmd"
npm run bridge:codex-app
```

Start the App against that bridge:

```powershell
$env:VITE_AGENT_HTML_BRIDGE_URL = "http://127.0.0.1:51279/agent-html/events"
npm run dev
```

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:51279/health
```

Expected fields:

```text
provider         : codex_app_server
appServerRunning : True
connected        : True
threadId         : <codex-thread-id>
```

Optional logs:

```powershell
$env:AGENT_HTML_EVENT_LOG = ".tmp\agent-html-codex-events.jsonl"
$env:AGENT_HTML_CODEX_EVENT_LOG = ".tmp\agent-html-codex-app-server-events.jsonl"
npm run bridge:codex-app
```

The Codex bridge does not inject messages into an already open Codex TUI. Agent-HTML acts as a Codex App Server client and owns its thread/turn flow.

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

This is only useful when Claude Code Channels are available in the user's Claude Code/account/provider environment. Third-party Anthropic-compatible providers may show the MCP server as connected while Channels remain unavailable.

## Current Boundary

Implemented:

- App can submit structured Agent-HTML context to a local bridge.
- Codex App Server can receive the request, produce a response, and edit files in the local workspace.
- Local log and Claude channel adapters remain available for debugging or compatible environments.

Not implemented yet:

- In-app streaming transcript of Codex responses.
- In-app display of tool calls, approvals, and final task status.
- Automatic diff review UI after agent edits.
