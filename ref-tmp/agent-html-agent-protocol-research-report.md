# Agent-HTML 外部 Agent 连接协议研究报告

这份报告聚焦 Agent-HTML 自己应该定义什么协议，才能把阅读器/工件审阅器里的用户选择、评论和 prompt 稳定交给外部 agent。Claude Code Channels、Codex App Server、MCP、`codex exec` 都只是适配目标，不应该成为我们项目内部协议的形状。

## 核心问题

Agent-HTML 的目标交互是：

```text
用户在 Agent-HTML 阅读器中选中一个 block
  -> 输入修改意见或问题
  -> 点击 Send
  -> 外部 agent 收到“用户意图 + 被指向的结构化上下文”
```

这里真正需要标准化的是 Agent-HTML 的内部输出协议：

```text
Agent-HTML UI
  -> Agent-HTML local bridge
  -> provider adapter
  -> Claude Code / Codex / clipboard / exec / future agents
```

这样项目不会被某一个 agent 的接口绑死。Claude Code 可以走 Channels，Codex 可以走 App Server，其他 agent 可以走 MCP、HTTP、本地命令或手工复制。

## 研究结论

建议 Agent-HTML 定义一层自己的 **Agent Context Event** 协议。

它的职责不是执行 agent，而是描述一次用户从阅读器发起的上下文事件：

- 用户说了什么。
- 用户指向了哪个文档、section、block 或 selection。
- 被指向对象的结构路径是什么。
- 相关 AHTML source 是什么。
- 这次请求期望 agent 做什么。
- 事件应该发给哪个外部 agent provider。

推荐把协议分成三层：

```text
1. Context Event
   Agent-HTML 统一事件格式。

2. Local Bridge API
   浏览器/Tauri UI 向本地 bridge 发送事件。

3. Provider Adapter
   把统一事件转换成 Claude Code Channels、Codex App Server、clipboard 等具体通道。
```

## 推荐内部协议

### 1. Agent Context Event

第一版可以使用 JSON。字段保持稳定、直白，避免过早设计复杂 RPC。

```json
{
  "schemaVersion": "agent-html.context-event.v1",
  "eventId": "evt_01J...",
  "createdAt": "2026-05-27T10:30:00.000Z",
  "source": {
    "app": "agent-html",
    "surface": "reader",
    "workspaceId": "default",
    "documentId": "design-engineering"
  },
  "target": {
    "kind": "block",
    "sectionId": "installation",
    "blockPath": "Page/Section/Stack[0]",
    "blockTag": "Stack",
    "selectionText": "Local-first document alert",
    "range": null
  },
  "intent": {
    "type": "edit",
    "prompt": "把这一段改得更紧凑，并保留原来的语气。"
  },
  "context": {
    "summary": "Installation section lead text and local-first document alert.",
    "ahtmlSource": "<Stack>...</Stack>",
    "nearbySource": null
  },
  "delivery": {
    "provider": "claude-code-channel",
    "mode": "push"
  }
}
```

关键点：

- `intent.prompt` 是用户原始输入，不要过度改写。
- `target` 用来定位用户指向的结构。
- `context` 放 agent 需要理解/修改的材料。
- `delivery` 只表达用户期望的目标 provider，不影响事件本身的语义。

### 2. Local Bridge API

Agent-HTML UI 不应该直接知道 Claude Code 或 Codex 的细节。建议它只调用本地 bridge：

```http
POST /agent-html/events
Content-Type: application/json
```

请求体就是 `Agent Context Event`。

响应建议：

```json
{
  "ok": true,
  "eventId": "evt_01J...",
  "provider": "claude-code-channel",
  "deliveryState": "accepted"
}
```

失败时：

```json
{
  "ok": false,
  "eventId": "evt_01J...",
  "error": {
    "code": "provider_unavailable",
    "message": "Claude Code channel server is not available."
  },
  "fallback": {
    "type": "copy_prompt",
    "text": "..."
  }
}
```

这让 UI 可以统一处理成功、失败和 Copy Prompt fallback。

## Provider Adapter 设计

Provider adapter 的职责是把 Agent-HTML 的统一事件转换成外部 agent 能理解的协议。

### Claude Code Channels Adapter

Claude Code 官方文档里最匹配“外部页面事件进入当前运行 session”的能力是 **Channels**。

适配方式：

```text
Agent Context Event
  -> 转成 channel content + meta
  -> 发送 MCP notification: notifications/claude/channel
  -> 当前 Claude Code session 收到 <channel ...>...</channel>
```

转换示例：

```ts
await mcp.notification({
  method: "notifications/claude/channel",
  params: {
    content: [
      "用户在 Agent-HTML 阅读器中发起了上下文请求。",
      "",
      "用户要求：",
      event.intent.prompt,
      "",
      "目标：",
      `${event.target.blockPath} (${event.target.blockTag})`,
      "",
      "摘要：",
      event.context.summary,
      "",
      "相关 AHTML：",
      event.context.ahtmlSource
    ].join("\n"),
    meta: {
      source: "agent_html",
      eventId: event.eventId,
      documentId: event.source.documentId,
      sectionId: event.target.sectionId,
      blockPath: event.target.blockPath,
      blockTag: event.target.blockTag
    }
  }
})
```

适用场景：

- 用户主要工作在 Claude Code 终端。
- 需要把网页里的选择和 prompt 推送到当前 Claude Code session。
- 接受 notification 没有 ACK、没有强处理保证的限制。

限制：

- Channels 是 research preview。
- 需要 Claude Code v2.1.80 或更新版本。
- Team/Enterprise 环境可能需要管理员启用。
- 如果没有正在运行的 Claude Code session，事件无法自然进入当前 session。
- 第三方 Anthropic 兼容网关或自定义模型环境下，Channels 可能不可用。2026-05-27 本项目实测：Claude Code v2.1.116、`channelsEnabled: true`、`agent-html-channel` MCP server 显示 connected，但当 `ANTHROPIC_BASE_URL` 指向第三方网关、模型为自定义 `mimo-v2.5-pro` 时，启动 `claude --dangerously-load-development-channels server:agent-html-channel` 仍输出 `Channels are not currently available`，并忽略该 channel。结论是：MCP 连接成功不等于 Channels 可用；第三方 provider 场景应默认走 local bridge/log/copy fallback，不能承诺 push 到当前 Claude Code session。

本项目的 Claude channel bridge 还需要声明 MCP experimental capability：

```js
capabilities: {
  experimental: {
    "claude/channel": {}
  }
}
```

这个 capability 只是必要条件，不会绕过 Claude Code 的 Channels 可用性、账号、组织策略或 provider 限制。

### Codex App Server Adapter

Codex 没有查到 Claude Code Channels 等价的“push 到当前 CLI/TUI session”官方协议。更明确的官方接口是 **Codex App Server**。

它的语义是：外部应用作为 Codex rich client，通过 JSON-RPC 2.0 风格协议创建/恢复 thread、发起 turn、追加 steer 输入，并接收流式 agent events。

适配方式：

```text
Agent Context Event
  -> 格式化成 Codex turn input
  -> 调用 thread/start 或 thread/resume
  -> 调用 turn/start 或 turn/steer
  -> 读取流式 agent events
```

示例：

```json
{
  "method": "turn/start",
  "id": 30,
  "params": {
    "threadId": "thr_123",
    "input": [
      {
        "type": "text",
        "text": "用户在 Agent-HTML 中选中了 Page/Section/Stack[0]。要求：把这一段改得更紧凑，并保留原来的语气。\n\n相关 AHTML：\n<Stack>...</Stack>"
      }
    ]
  }
}
```

适用场景：

- Agent-HTML 想成为一个 Codex rich client。
- 需要自己管理 thread、turn、approval、event stream。
- 目标不是写进某个已经打开的 Codex CLI/TUI，而是直接驱动 Codex session。

限制：

- 这不是“浏览器 prompt input 同步到当前终端 TUI 对话框”。
- Agent-HTML 需要承担更多 client 状态管理。
- 与 Claude Code Channels 的产品语义不同，不能共用 provider 层实现。

### MCP Tool Adapter

MCP 适合做工具和上下文源。它可以让 agent 主动读取 Agent-HTML 的当前 selection、block tree、document source。

建议暴露的工具：

```text
get_current_selection()
read_block_source(documentId, blockPath)
list_interaction_units(documentId)
search_document(documentId, query)
```

适用场景：

- 用户已经在 agent 对话中发起请求。
- agent 需要主动补充当前 Agent-HTML 文档上下文。
- 需要更强的双向工具调用能力。

限制：

- MCP 默认不是“网页按钮点击后自动把一条消息写入当前对话”。
- 如果要实现“点击通知 agent”，仍然需要 Channels、App Server、HTTP bridge、exec 或其他 delivery 层。

### Clipboard Adapter

Clipboard 是最低成本 fallback。

适配方式：

```text
Agent Context Event
  -> 格式化为完整 prompt
  -> 写入剪贴板或显示 Copy Prompt
  -> 用户手工粘贴到 Claude Code / Codex / Cursor / 其他 agent
```

它不自动化，但非常重要，因为它能覆盖：

- provider 未安装。
- channel server 未启动。
- App Server 不可用。
- 企业环境禁用某些预览能力。

### Exec Adapter

对 Codex，可以考虑 `codex exec` 作为一次性任务通道：

```text
Agent Context Event
  -> 组装 prompt
  -> 调用 codex exec
  -> 读取 stdout / JSONL event stream
```

适用场景：

- 自动化脚本。
- 批处理。
- 一次性问答或修改建议。

限制：

- 不等于同步到一个正在运行的交互式 Codex session。
- 更适合后台任务，不适合作为主交互体验。

## 协议对比

| Adapter | 外部协议 | 是否能 push 到当前 session | 适合场景 |
|---|---|---:|---|
| Claude Code Channels | MCP notification：`notifications/claude/channel` | 是，面向当前 Claude Code session | Claude Code 用户的阅读器 Send |
| Codex App Server | JSON-RPC 2.0 风格 thread/turn 协议 | 不是终端 TUI 注入；是外部 client 驱动 session | Agent-HTML 做 Codex rich client |
| MCP Tool | MCP tools/resources | 否，通常由 agent 主动读取 | 上下文查询、block/source 读取 |
| Clipboard | 系统剪贴板 | 否 | fallback |
| Exec | CLI/stdin/stdout/JSONL | 否 | 一次性自动化任务 |

## 推荐实现顺序

第一阶段先做项目内部协议，不绑定具体 agent：

1. 定义 `AgentContextEvent` 类型。
2. 在 UI 的 block input Send 上生成 event。
3. 实现 local bridge 的 `POST /agent-html/events`。
4. 实现 Copy Prompt adapter，作为稳定 fallback。

第二阶段做 Claude Code Channels adapter：

1. 本地 bridge 检查 channel server 可用性。
2. 把 event 转为 `notifications/claude/channel`。
3. UI 显示 accepted / fallback 状态。

第三阶段做 Codex App Server adapter：

1. 管理 Codex thread。
2. 把 event 转成 `turn/start` 或 `turn/steer`。
3. 读取 Codex event stream，并决定是否回写 Agent-HTML UI。

## 推荐 Prompt 格式

无论走哪个 adapter，都建议先统一一份可读 prompt 模板：

```text
用户在 Agent-HTML 阅读器中发起了上下文请求。

用户要求：
{{intent.prompt}}

目标位置：
- documentId: {{source.documentId}}
- sectionId: {{target.sectionId}}
- blockPath: {{target.blockPath}}
- blockTag: {{target.blockTag}}

选中文本：
{{target.selectionText}}

上下文摘要：
{{context.summary}}

相关 AHTML：
{{context.ahtmlSource}}
```

这样即使 provider adapter 不同，agent 看到的语义也保持一致。

## 最终建议

Agent-HTML 不应该把自己的协议命名成 Claude Code Channels 协议，也不应该直接围绕 Codex App Server 建模。项目内部应稳定在 `AgentContextEvent`：

```text
Agent-HTML 负责产生结构化上下文事件；
adapter 负责把事件送进不同 agent；
fallback 负责保证用户永远能把 prompt 带走。
```

当前最值得优先实现的产品路径是：

```text
AgentContextEvent
  -> Copy Prompt fallback
  -> Claude Code Channels adapter
  -> Codex App Server adapter
  -> MCP context tools
```

## 本轮第一版实现归档

第一版交互能力已经实现并归档在：

```text
ref-tmp/agent-html-interaction-v1-code-archive/
ref-tmp/agent-html-interaction-v1-code-archive.zip
```

归档内容包括：

- App block input 的 Send 入口。
- `agent-html.context-event.v1` 的事件生成与 prompt 格式化。
- Kanban item 拖拽交互事件记录。
- `POST /agent-html/events` local bridge。
- Claude Code channel bridge 适配脚本。
- Copy Prompt fallback。
- 单元测试与开发文档。

实测可用形态：

```text
Agent-HTML App Send -> local bridge/log -> copy fallback
```

在官方 Claude Code Channels 可用的账号/组织/provider 环境中，设计目标是：

```text
Agent-HTML App Send -> local bridge -> notifications/claude/channel -> 当前 Claude Code session
```

但在第三方 Anthropic 兼容网关场景下，本轮验证结果是 Channels 不可用，因此产品体验必须降级到 bridge/log/copy，而不是宣称自动进入当前 Claude Code 对话。

## 参考文档

- Claude Code Channels: https://code.claude.com/docs/en/channels
- Channels reference: https://code.claude.com/docs/en/channels-reference
- Codex App Server: https://developers.openai.com/codex/app-server
- Codex MCP: https://developers.openai.com/codex/mcp
- Codex non-interactive mode: https://developers.openai.com/codex/noninteractive
- Codex remote connections: https://developers.openai.com/codex/remote-connections
