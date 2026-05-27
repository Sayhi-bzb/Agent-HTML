# Agent-HTML Agent Bridge 收敛报告

## 结论

Agent-HTML 的核心不是研究多种外部 agent 协议，而是提供一个可交互的意图界面：

```text
用户在 App 里选择 block / 操作组件 / 输入 prompt / 点击 Send
  -> Agent-HTML 生成结构化上下文事件
  -> local bridge 送给后端 agent
  -> agent 在本地 workspace 中回复或编辑文件
```

当前主线选择 **Codex App Server**。这条路线已经实测闭环：Codex 可以收到 Agent-HTML bridge 发来的消息，生成 response，并通过工具编辑本地文件。

## 已验证链路

```text
Agent-HTML App Send
  -> POST /agent-html/events
  -> local Codex bridge
  -> codex app-server --listen stdio://
  -> thread/start
  -> turn/start
  -> Codex response / local file edit
```

实测结果：

- `/health` 返回 `provider: codex_app_server`、`connected: true`、`appServerRunning: true` 和 `threadId`。
- 测试 prompt 已进入 Codex thread，并得到回复：`Codex 已经收到来自 Agent-HTML bridge 的实时测试消息。`
- 文件编辑测试已成功：Codex 将 `.tmp/codex-edit-test.txt` 从 `before-codex-edit` 改为 `after-codex-edit`。

## 三个 Bridge 的定位

| Bridge | 定位 | 是否主推 |
| --- | --- | --- |
| Codex App Server bridge | Agent-HTML 作为 Codex rich client，创建 thread 并发起 turn | 是 |
| Local log bridge | 调试 payload、验证 App Send 行为 | 否，保留作 fallback |
| Claude Code channel bridge | Claude Channels 可用环境下把事件推给 Claude Code session | 否，环境依赖强 |

Claude Code Channels 本轮在第三方 provider 环境下不可用，因此不能作为默认产品承诺。MCP 连接成功也不等于 Channels 可用。

## 当前 UX 状态

已经成立：

```text
页面选择/操作/输入
  -> 点击 Send
  -> 后台 Codex 收到请求
  -> Codex 可以回复或编辑本地文件
```

还缺：

```text
Codex response / tool call / task status
  -> 回流到 Agent-HTML 页面
```

所以当前页面上的 `Sent to local agent bridge.` 只能说明提交成功；后端实际 response 已存在于 Codex session/event 中，但还没有显示到 App UI。

## 下一步建议

下一阶段只做一件事：把 Codex App Server 的 `agent_message`、`task_complete`、工具调用和错误状态回流到 Agent-HTML UI。

推荐目标体验：

```text
Send clicked
  -> Bridge accepted
  -> Codex turn started
  -> Codex is working
  -> Codex final response displayed in App
  -> file edits can be surfaced as changed files / diff summary
```

这会把当前“后台已跑通”的能力，收敛成用户可见的 agent 工作台体验。
