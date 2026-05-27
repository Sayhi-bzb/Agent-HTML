# Agent Intent Bridge

This document describes the first-version Agent-HTML interaction loop.

## UX Loop

```text
Agent-HTML App
  -> user opens a block input or performs a runtime interaction
  -> user clicks Send
  -> App posts an Agent Context Event to the local bridge
  -> bridge delivers or logs the request
```

The App sends to `VITE_AGENT_HTML_BRIDGE_URL` when set. Otherwise it defaults to:

```text
http://127.0.0.1:51278/agent-html/events
```

## Local Log Bridge

Use this when developing the App UX or validating payloads without Claude Code:

```bash
npm run bridge:agent
npm run dev
```

Optional event log:

```bash
AGENT_HTML_EVENT_LOG=.tmp/agent-html-events.jsonl npm run bridge:agent
```

On Windows PowerShell:

```powershell
$env:AGENT_HTML_EVENT_LOG = ".tmp/agent-html-events.jsonl"
npm run bridge:agent
```

## Claude Code Channel Bridge

Use this when Claude Code should receive Agent-HTML events in the active session.

Register the bridge as a Claude Code MCP server from the repo root:

```bash
claude mcp add agent-html-channel -- node tools/agent-html-claude-channel-bridge.mjs
```

Then start Claude Code in the project. When Agent-HTML posts to the bridge, the MCP server sends:

```text
notifications/claude/channel
```

The channel content is the formatted prompt. The metadata includes the Agent-HTML event id, project id, section id, block path, and block tag.

## App Test Flow

1. Start the channel bridge through Claude Code, or start `npm run bridge:agent`.
2. Start the App with `npm run dev`.
3. Open a block input in the preview.
4. Type a request and click Send.
5. Expected App feedback:
   - `Sent to local agent bridge.` when the bridge accepts the event.
   - `Agent bridge unavailable. Prompt copied.` when the bridge is unavailable and clipboard fallback succeeds.

## Current Boundary

This is the first-version bridge. It proves the product loop:

```text
select/operate in App -> Send -> backend agent channel receives structured context
```

It does not yet implement a full in-app agent transcript, execution status streaming, or automatic diff review UI.
