# Agent-HTML Agent Event UX 分层设计

## 核心结论

Agent-HTML 的新交互不是传统流式 chatbot，而是 canvas 上的 agent event surface。用户在页面里选择 block、操作组件、输入 prompt，然后点击 Send；agent 的反馈应该按照事件层级分散到不同 UI surface，而不是统一堆进聊天流。

推荐边界：

```text
Pet = current item / current status
Comment icon = turn 下和 block 相关的某些 item
Drawer = thread 全量 timeline
```

这套边界直接对应 Codex App Server / agent runtime 的自然结构：

```text
Thread
  -> Turn
     -> Item
```

映射到 Agent-HTML UI：

```text
Thread -> Drawer
Turn   -> 用户一次 Send，以及一次 block comment 聚合上下文
Item   -> Pet 当前中间态，或 comment card 的组成单元
```

## 三层 UI Surface

### 1. Drawer: Thread Timeline

Drawer 是完整事件账本。它承载 thread 里的所有 turn、item、tool call、tool result、agent response、file change、approval、error 和 token/status 信息。

它的职责是：

- 保存完整历史。
- 支持审计和调试。
- 展示所有 agent 做过什么。
- 作为用户想看细节时的展开面板。

它不应该是主交互入口，也不应该替代 canvas 上的 block comment。

### 2. Comment Icon: Block-Scoped Turn Items

Comment icon 是页面对象上的结果入口，接近 Figma comment pin，但语义从“人类评论”扩展成“agent 对这个 block 的操作结果”。

它只承载和某个 block 直接相关的 completed / meaningful items，例如：

- agent 对这个 block 的 final response。
- agent 针对这个 block 的建议。
- 影响这个 block 的 file change / diff。
- 这个 block 上的 error 或 blocked reason。
- 这个 block 的一次局部讨论 thread。

它不承载全局工具日志、token usage、MCP startup、无关命令输出等事件。

### 3. Pet: Current Item / Current Status

Pet 是 agent presence，不是完整聊天框。它负责让用户知道 agent 当前正在做什么，以及是否需要用户处理。

它承载：

- 当前 active item。
- 当前 turn/thread status。
- agentMessage/delta 的低信息密度中间态。
- tool use 的短状态。
- approval / blocked 的强提示。
- 没有 block 选中时的全局 input / control dock。

Pet 可以显示短句，但不应该展示完整内容。完整内容进 Drawer；block 相关最终结果进 Comment icon。

## 8 类 UX 事件分层

| UX 事件 | Drawer | Comment icon | Pet |
| --- | --- | --- | --- |
| Intent received | 记录用户 prompt、target block、eventId、turnId | 目标 block 出现 pending/working icon | 显示收到请求、开始工作 |
| Status | 记录 turn/thread 状态变化 | 只显示该 block 的 working/done/error 状态点 | 主承载：idle/thinking/editing/done/failed |
| Agent response | 保存完整 message、delta、final | block-scoped response 完成后生成 comment card | delta 期间显示 speaking/typing/短 preview |
| Plan / reasoning summary | 保存 plan、reasoning summary、步骤 | 默认不放，除非是 block 修改说明 | 显示极短中间态，如“我先检查结构” |
| Tool use | 记录 command、MCP、web search、file read/write | 默认不放，除非直接改变该 block | 显示 reading/editing/testing/running command |
| Tool observe | 记录 stdout、result、error、测试结果 | 只放 block 相关摘要或失败原因 | 显示 tests passed / command failed / done |
| File change / diff | 保存 changed files、patch、diff | 主承载之一：生成 suggestion/file-change card | 显示“已修改 N files”，不展示 diff |
| Approval / blocked | 保存完整阻塞原因和上下文 | block 相关时显示 needs approval/error icon | 主承载之一：全局确认入口/blocked card |

## 事件流转规则

所有事件都进入 Drawer。

```text
any event -> Drawer
```

当前正在执行的 item 进入 Pet。

```text
item/started -> Pet current item
item/delta   -> Pet short intermediate state
item/done    -> Pet short completion state, then idle
```

和 block 相关的 completed item 进入 Comment icon。

```text
completed item + scope=block -> Comment icon/card
```

approval / blocked 优先由 Pet 承载，因为它通常需要用户立即处理。

```text
approval request -> Pet approval card
if scope=block -> also mark block comment icon
```

agentMessage/delta 的推荐节奏：

```text
Send
  -> block icon: pending spinner
  -> Pet: thinking / speaking / editing
  -> Drawer: append full delta/events
  -> final response or file change completed
  -> after a short delay, block icon becomes comment/suggestion
  -> Pet shows done, then returns to idle
```

## Item Scope

为了决定 item 是否应该落到 Comment icon，需要给归一化后的 agent item 增加 scope。

建议模型：

```ts
type AgentItemScope =
  | { type: "block"; blockPath: string; sectionId?: string }
  | { type: "document"; documentId: string }
  | { type: "workspace" }
  | { type: "system" }
```

UI 规则：

```text
scope=block      -> Comment icon + Drawer
scope=document   -> Document marker / Drawer
scope=workspace  -> Pet + Drawer
scope=system     -> Drawer only, unless blocking
```

这可以避免 comment icon 被无关日志污染。

## Comment Card 形态

Comment icon hover 时显示轻量 card；click 后展开完整 thread / diff / actions。

解释型 response：

```text
Codex
This block is acting as the section lead. I would keep it short because the next card carries the details.

[Reply] [Resolve]
```

修改型 response：

```text
Codex
Updated this block

Changed:
- copy shortened
- tone kept neutral

[View diff] [Resolve]
```

建议型 response：

```text
Codex
Suggested change ready

1 block affected
1 file changed

[Preview] [Accept] [Reject]
```

阻塞型 response：

```text
Codex
Blocked

Need permission to edit source file.

[Open approval]
```

## Pet 形态

Pet 是状态载体和轻量控制入口。它可以有 collapsed 和 dock 两种形态。

Collapsed:

```text
thinking
editing this block
running tests
waiting approval
done
failed
```

Dock:

```text
Codex is editing

Current: applying patch

[Open activity] [Stop]
```

Approval:

```text
Codex needs approval

Run npm test?

[Allow] [Deny]
```

Global input:

```text
Ask Codex about this document...

[Send]
```

规则：

- 有 block 选中时，主输入优先在 block/context popover。
- 没有 block 选中时，Pet dock 可以承载全局 input area。
- 有 approval/blocked 时，Pet 优先变成必须处理的入口。
- Pet 不展示完整 diff、不展示完整 tool output、不替代 Drawer。

## Drawer 形态

Drawer 是 thread timeline，可以按 turn 分组。

```text
Thread
  Turn 1: user changed hero copy
    - userMessage
    - agentMessage
    - fileChange
    - task_complete

  Turn 2: user asked to run tests
    - userMessage
    - commandExecution
    - commandOutput
    - task_complete
```

每个 item 可以有摘要和展开态：

```text
Running command
npm test

[expanded output]
142 tests passed
```

Drawer 的目标不是抢占 canvas，而是提供“完整可追踪性”。

## 最终原则

用一个规则判断事件去哪里：

```text
所有事件都进 Drawer。
当前 active item 进 Pet。
block-scoped completed item 进 Comment icon。
```

三层分别代表：

```text
Drawer       = truth / audit / full log
Comment icon = outcome / response / diff / local thread
Pet          = presence / status / interruption / global input
```

这能让 Agent-HTML 保持 canvas 产品形态，而不是退化成页面旁边挂一个传统 chatbot。
