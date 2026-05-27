# Claude Code Channels 集成调研

这份报告只聚焦一个核心问题：Agent-HTML 作为阅读器/工件审阅器时，如何把用户在界面里的选择、评论和 prompt 发送到**同一个正在运行的 Claude Code 终端 session**。

## 核心结论

Claude Code 官方文档里最匹配这个需求的能力是 **Channels**。

Channels 的作用是：让一个 MCP server 把外部消息、alerts、webhooks 等事件 **push 到正在运行的 Claude Code session**。这正好适合 Agent-HTML 的交互场景：

```text
用户在 Agent-HTML 阅读器里选中某个 block
  -> 输入修改意见
  -> 点击 Send
  -> 当前 Claude Code 终端 session 收到这条上下文消息
```

这比“手工复制 prompt”更顺滑，也比“让 Claude 主动调用 MCP tool 读取 pending event”更接近真实的 UI 发送体验。

## 推荐架构

建议把 Agent-HTML 的发送链路设计成：

```text
Agent-HTML UI
  -> POST 到本地 channel server
  -> channel server 发送 notifications/claude/channel
  -> 当前 Claude Code session 收到 <channel ...>...</channel>
  -> Claude 基于该上下文继续处理
```

其中 channel server 是一个本地 MCP server，同时可以暴露 HTTP endpoint 给 Agent-HTML UI 调用。

推荐数据流：

```text
阅读器选择/输入
  -> 结构化 payload
  -> 本地 HTTP bridge
  -> Claude Code Channel notification
  -> Claude Code 当前 session
```

## Channel Notification 形态

官方 channel 通知方法是：

```ts
await mcp.notification({
  method: "notifications/claude/channel",
  params: {
    content: "...",
    meta: {
      source: "agent_html"
    }
  }
})
```

对 Agent-HTML，建议 `content` 放用户可读的完整上下文，`meta` 放机器可读的定位信息。

示例：

```ts
await mcp.notification({
  method: "notifications/claude/channel",
  params: {
    content: [
      "用户在 Agent-HTML 阅读器中选中了一个内容块，并提出修改要求。",
      "",
      "用户要求：",
      "把这一段改得更紧凑，并保留原来的语气。",
      "",
      "选中块摘要：",
      "Installation section lead text and local-first document alert.",
      "",
      "相关 AHTML：",
      "<Stack>...</Stack>"
    ].join("\n"),
    meta: {
      source: "agent_html",
      projectId: "design-engineering",
      sectionId: "installation",
      blockPath: "Page/Section/Stack[0]",
      blockTag: "Stack"
    }
  }
})
```

进入 Claude Code session 后，概念上会表现为类似：

```xml
<channel source="agent_html" projectId="design-engineering" sectionId="installation" blockPath="Page/Section/Stack[0]" blockTag="Stack">
用户在 Agent-HTML 阅读器中选中了一个内容块，并提出修改要求。

用户要求：
把这一段改得更紧凑，并保留原来的语气。

选中块摘要：
Installation section lead text and local-first document alert.

相关 AHTML：
<Stack>...</Stack>
</channel>
```

## Agent-HTML Payload 建议

Agent-HTML 发送给本地 channel server 的 payload 可以保持简单：

```json
{
  "prompt": "把这一段改得更紧凑，并保留原来的语气。",
  "projectId": "design-engineering",
  "sectionId": "installation",
  "blockPath": "Page/Section/Stack[0]",
  "blockTag": "Stack",
  "blockSummary": "Installation section lead text and local-first document alert.",
  "ahtmlSource": "<Stack>...</Stack>"
}
```

第一版不需要设计复杂协议。重点是把“用户指向哪里、想改什么、相关上下文是什么”稳定送进 Claude Code 当前 session。

## 关键限制

Channels 目前不是普通稳定功能，需要注意：

- 它是 research preview。
- 需要 Claude Code v2.1.80 或更新版本。
- Team/Enterprise 环境可能需要管理员启用。
- 自定义 channel 在预览期需要开发加载方式。
- notification 没有 ACK；发送成功不等于 Claude 已经处理。
- 如果没有正在运行的 Claude Code session，事件无法自然进入 session。

因此产品上建议保留一个 fallback：

```text
如果 channel server 不可用
  -> 显示 Copy Prompt
  -> 用户手工粘贴到 Claude Code
```

## 对 Agent-HTML 的产品建议

第一版目标应聚焦在 **Send selected context to Claude Code**：

- 用户能选中或聚焦一个 AHTML block。
- block input 中输入修改意见。
- 点击 Send 后，通过 Channels 推送到当前 Claude Code session。
- 如果 Channels 不可用，提供 Copy Prompt。

不要在第一版追求：

- 双向确认。
- Claude Code 处理状态回显。
- 自动修改当前文档。
- 托管 Claude Code 终端。

这些都可以在 channel 基础通路稳定后再做。

## 后续实现切分

建议分三步实现：

1. **上下文采集**
   - 复用现有 interaction unit/block path。
   - 生成 block summary、block path、tag、AHTML source slice、user prompt。

2. **本地 channel server**
   - 提供 `POST /agent-html/channel/send`。
   - 将请求转换为 `notifications/claude/channel`。
   - 提供健康检查，方便 UI 判断是否可用。

3. **UI 接入**
   - 接入现有 block input 的 Send 按钮。
   - 成功后给出轻量反馈。
   - 失败时提供 Copy Prompt fallback。

## 参考文档

- Claude Code Channels: https://code.claude.com/docs/en/channels
- Channels reference: https://code.claude.com/docs/en/channels-reference

