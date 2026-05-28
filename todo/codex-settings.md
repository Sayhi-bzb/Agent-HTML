# Codex Settings Connection TODO

## Goal

Agent-HTML should be a thin Codex host. The desktop app starts and manages
`codex app-server --listen stdio://` directly through Tauri, then sends
Agent-HTML workspace context as official Codex `turn/start` input.

Codex owns auth, model/provider selection, sandbox, approvals, MCP, skills,
plugins, profiles, and project trust through official config files and App
Server RPCs. Agent-HTML should not duplicate those settings.

## Current Main Path

```text
Settings
  -> configure Codex command / logs
  -> Tauri starts codex app-server --listen stdio://
  -> Tauri sends initialize / initialized
  -> App calls official thread/start through generic RPC
  -> App sends Agent-HTML prompt context as turn/start input
  -> Tauri forwards raw Codex notifications to frontend listeners
```

Implemented files:

- `src-tauri/src/codex_host.rs`
- `apps/agent-html-app/src/codex/connection.tsx`
- `apps/agent-html-app/src/workspace/agent-intent.ts`
- `docs/development/agent-intent-bridge.md`

## Settings UX

Visible settings should stay small:

- Codex command
- Enable event logs
- Event log path
- Codex event log path

Visible status:

- disconnected
- starting
- connected
- error
- stopped

Visible health details:

- provider
- appServerRunning
- connected
- threadId
- Codex command
- cwd
- last error / stderr

Actions:

- Test connection
- Stop
- Restart
- Open logs

## Next Event UX Work

The event bus is only the transport foundation. UI should still follow the
three-layer event model:

```text
Drawer = thread full timeline
Turn   = block interaction group
Pet    = current item / current status
```

Next milestones:

- Build a Codex activity adapter that consumes raw `codex://notification`.
- Map raw Thread / Turn / Item notifications into `PetPresence`.
- Add a Drawer timeline that stores raw details and grouped summaries.
- Add block-scoped comment markers only for meaningful completed items.

## Validation

Manual validation:

- App auto-starts Codex in Tauri.
- Health reaches connected and shows a thread id after the app starts one.
- Sending a block prompt starts a Codex turn.
- Codex notifications reach frontend listeners.
- Stop / Restart does not leave orphaned processes.
- App close cleans up the Codex child process.

Automated validation:

- `cargo check`
- `npm run typecheck`
- `npm test`
- `rg "agent-html-codex-app-server-bridge|bridge:codex-app|VITE_AGENT_HTML_BRIDGE_URL|/agent-html/events|codex_turn_start|canManageBridge"`
