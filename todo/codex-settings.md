# Codex Settings Connection TODO

## Goal

在 Agent-HTML 的 Settings 中加入 Codex 连接能力。第一版目标不是让用户手动启动 bridge 后再粘贴 URL，而是由 App/Tauri 负责启动和管理 Codex bridge：

```text
Settings
  -> configure Codex command / workspace / port
  -> App starts local bridge
  -> bridge starts codex app-server --listen stdio://
  -> App sends Agent Context Events to Codex
```

这条路线不注入已经打开的 Codex TUI。Agent-HTML 会作为 Codex App Server client，管理自己的 thread / turn 生命周期。

## Docs / Links

Official docs:

- Codex App Server: https://developers.openai.com/codex/app-server
- Codex MCP: https://developers.openai.com/codex/mcp
- Codex non-interactive mode: https://developers.openai.com/codex/noninteractive
- Codex remote connections: https://developers.openai.com/codex/remote-connections

Project docs:

- `docs/development/agent-intent-bridge.md`
- `ref-tmp/agent-html-agent-protocol-research-report.md`
- `ref-tmp/event.md`

Current implementation:

- `tools/agent-html-codex-app-server-bridge.mjs`
- `apps/agent-html-app/src/workspace/agent-intent.ts`
- `apps/agent-html-app/src/shell/settings-menu.tsx`
- `package.json` script: `bridge:codex-app`

## Current Interfaces

### npm script

```text
npm run bridge:codex-app
```

Runs:

```text
node tools/agent-html-codex-app-server-bridge.mjs
```

### Bridge HTTP API

Health:

```http
GET http://127.0.0.1:51279/health
```

Expected response shape:

```json
{
  "ok": true,
  "provider": "codex_app_server",
  "appServerRunning": true,
  "connected": true,
  "threadId": "..."
}
```

Send event:

```http
POST http://127.0.0.1:51279/agent-html/events
Content-Type: application/json
```

Current response shape:

```json
{
  "ok": true,
  "eventId": "...",
  "delivery": {
    "provider": "codex_app_server",
    "state": "turn_started",
    "threadId": "...",
    "turnId": "..."
  }
}
```

### Frontend bridge URL

Current App send path reads:

```text
VITE_AGENT_HTML_BRIDGE_URL
```

Fallback default:

```text
http://127.0.0.1:51278/agent-html/events
```

For Codex bridge:

```text
http://127.0.0.1:51279/agent-html/events
```

### Bridge environment variables

```text
AGENT_HTML_BRIDGE_HOST
AGENT_HTML_BRIDGE_PORT
AGENT_HTML_CODEX_COMMAND
AGENT_HTML_CODEX_CWD
AGENT_HTML_EVENT_LOG
AGENT_HTML_CODEX_EVENT_LOG
```

Windows command example:

```powershell
$env:AGENT_HTML_CODEX_COMMAND = "C:\Users\Administrator\AppData\Roaming\npm\codex.cmd"
```

## Target Settings UX

Add a Codex Connection section to Settings.

Fields:

- Codex command
- Workspace cwd
- Bridge host
- Bridge port
- Auto start bridge
- Enable event logs
- Event log path
- Codex event log path

Status:

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
- bridge URL
- last error

Actions:

- Test connection
- Start
- Stop
- Restart
- Open logs

Recommended first-version behavior:

```text
User opens Settings
  -> configure Codex command / cwd / port
  -> click Start
  -> Tauri starts bridge process
  -> App polls /health
  -> status becomes connected
  -> App sends future Agent Context Events to Codex bridge URL
```

## Settings Data Model

Suggested persisted shape:

```ts
type CodexConnectionSettings = {
  codexCommand: string
  workspaceCwd: string
  bridgeHost: string
  bridgePort: number
  autoStart: boolean
  eventLogEnabled: boolean
  eventLogPath: string
  codexEventLogPath: string
  lastHealth?: CodexBridgeHealth
}
```

Health shape:

```ts
type CodexBridgeHealth = {
  ok: boolean
  provider?: "codex_app_server"
  appServerRunning?: boolean
  connected?: boolean
  threadId?: string | null
  error?: string
}
```

## Tauri Commands TODO

Add Tauri-side process management for the bridge.

Commands:

```text
codex_bridge_start(settings)
codex_bridge_stop()
codex_bridge_restart(settings)
codex_bridge_health()
codex_bridge_logs()
```

Responsibilities:

- Spawn `node tools/agent-html-codex-app-server-bridge.mjs`.
- Pass environment variables from Settings.
- Track process pid and status.
- Avoid starting duplicate bridge processes on the same port.
- Stop the child process when App exits.
- Return startup errors clearly to the frontend.

Open questions for implementation:

- Whether the packaged Tauri app should bundle the bridge script or resolve it from the workspace path.
- Whether logs should live under project `.tmp/` during development and app data directory in packaged builds.
- Whether bridge process should be per workspace or global per app window.

## Frontend TODO

Settings UI:

- Add a Codex Connection section under the existing Settings surface.
- Show editable fields for command, cwd, host, port, auto start, logs.
- Show status badge and health details.
- Add Start / Stop / Restart / Test connection buttons.
- Disable Send-to-Codex behavior when disconnected.

App integration:

- When connected, set the active agent bridge URL to:

```text
http://{bridgeHost}:{bridgePort}/agent-html/events
```

- Prefer runtime settings over build-time `VITE_AGENT_HTML_BRIDGE_URL`.
- Keep `VITE_AGENT_HTML_BRIDGE_URL` as dev fallback.
- Surface connection status in the workspace UI and Pet layer later.

## Bridge TODO

Current bridge already supports:

- `GET /health`
- `POST /agent-html/events`
- `initialize`
- `thread/start`
- `turn/start`
- optional event logs

Next bridge improvements:

- Expose latest turn status.
- Expose latest agent response.
- Stream or poll Codex events back to App.
- Normalize Codex events into Thread / Turn / Item.
- Preserve block/document/workspace scope for UI routing.

Target normalized model:

```text
Thread -> Drawer
Turn   -> block interaction group
Item   -> Pet current state / comment card item
```

See:

```text
ref-tmp/event.md
```

## Event UX TODO

Use the three-layer event model:

```text
Drawer = thread full timeline
Comment icon = turn items scoped to a block
Pet = current item / current status
```

First visible milestones:

- Pet shows connected / thinking / editing / done / error.
- Drawer shows full thread event history.
- Block comment icon appears when a block-scoped response or file change completes.
- Approval / blocked state appears in Pet, with block marker if scoped to a block.

## Validation TODO

Manual validation:

- Start bridge from Settings.
- `/health` returns connected state.
- Send a block prompt from App.
- Codex receives `turn/start`.
- Codex returns a response.
- Codex can edit a file in the workspace.
- Stop / Restart works without orphaning duplicate processes.
- App close cleans up bridge process.

Automated validation:

- Unit test settings serialization.
- Unit test bridge URL selection priority.
- Tauri command tests for start/stop error handling where possible.
- Bridge script syntax check:

```text
node --check tools/agent-html-codex-app-server-bridge.mjs
```

## Current Known Boundaries

- This is not Claude Code Channels.
- This does not push into an existing Codex TUI.
- Response and tool-call UI are not implemented yet.
- Current App message `Sent to local agent bridge.` only means the bridge accepted the request.
- Full user-visible agent feedback requires the event model in `ref-tmp/event.md`.
