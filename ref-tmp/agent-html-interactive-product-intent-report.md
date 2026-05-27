# Agent-HTML 交互产品意图报告

## 一句话定位

Agent-HTML 是一个让用户通过可交互 artifact 向后端 coding agent 表达意图的工作台。

它不是普通 HTML 预览器，也不是普通 chatbox。用户不需要把页面状态、选择位置、拖拽结果手动整理成 prompt，再复制到 agent 终端里。用户应该直接在 App 里阅读、选择、操作、输入请求，然后点击 Send。

后端 agent 收到的不是一条孤立聊天消息，而是一次带上下文的用户意图。

## 核心 UX

理想体验是：

```text
用户在 Agent-HTML App 里打开一个 artifact
  -> 选择一个 block，或完成一次组件交互
  -> 输入自然语言请求
  -> 点击 Send
  -> 后端 agent session 收到请求并开始工作
  -> agent 基于本地项目编辑文件、运行检查、产出修改
```

用户看到的是 App，不是 agent 终端。

Agent-HTML 承担的是“表达意图”的界面：它把用户在 artifact 中的选择、操作、当前状态和自然语言请求打包成 agent 可以理解的上下文。真正执行任务的是后端 agent session。

## 两类主要交互

### 1. 指向型请求

用户在页面里选中一个 block，然后输入请求：

```text
这里改得更短一点。
这个 section 重新组织一下。
把这个 card 的语气变专业。
解释一下这个 block 为什么这样写。
```

这时 Send 的含义是：

```text
把用户 prompt + 被选中的 block + block 所在位置 + 相关上下文
发送给后端 agent。
```

对用户来说，这应该像在 artifact 上直接批注。用户不需要告诉 agent “我指的是第几行第几个组件”，因为 App 已经知道用户指向哪里。

### 2. 交互型请求

用户不是只选择内容，而是在 App 里完成了一次真实交互。例如：

```text
在 Kanban 中拖拽 item。
调整任务优先级。
切换某个组件状态。
重新排序列表。
选择某个筛选条件。
```

然后用户点击 Send，并输入：

```text
按我刚才的排序更新源文件。
把这个 Kanban 状态固化到文档里。
根据当前排列重写计划。
把我刚才的操作总结成变更说明。
```

这时 Send 的含义是：

```text
把用户 prompt + 交互动作 + 交互后的 artifact 状态
发送给后端 agent。
```

这是 Agent-HTML 和普通 chatbox 最大的区别：用户的意图不只存在于文本里，也存在于 UI 操作里。

## Send 的真实含义

在 Agent-HTML 里，Send 不应该只是“发送聊天消息”。

它更准确的含义是：

```text
提交一次结构化 UI 意图。
```

一次 Send 至少可能包含：

- 用户输入的自然语言请求。
- 当前选中的 block 或区域。
- 当前 artifact 的相关结构。
- 用户刚刚完成的交互动作。
- 交互后的 UI 状态。
- 后端 agent 应该处理的本地项目上下文。

所以 Agent-HTML 的 prompt input 不是孤立聊天框，而是 artifact 上下文的提交入口。

## 和 Cursor Attachment 的区别

Cursor 的 attachment 心智更接近：

```text
用户选择文件、代码片段或符号
  -> 这些内容随聊天请求一起发给 agent
```

Agent-HTML 的心智更进一步：

```text
用户在 artifact 上选择结构、操作组件、改变状态
  -> 这些 UI 意图随请求一起发给 agent
```

Cursor attachment 主要是“把已有文本/代码作为上下文”。

Agent-HTML 的 attachment 是“把可视化结构、交互动作和 artifact 状态作为上下文”。

因此 Agent-HTML 更像一个 visual intent capture surface：用户通过界面行为表达意图，agent 把这些意图转化成本地文件修改。

## Claude Code 与 Codex 的 UX 差异

Claude Code 和 Codex 都可以作为后端 agent，但它们给用户的 UX 心智不同。

### Claude Code

Claude Code 更贴近这个体验：

```text
Agent-HTML 中点击 Send
  -> 正在后台运行的 Claude Code session 收到 request
  -> 这个 session 开始工作
```

对用户来说，这像是把 artifact 里的请求投递给“当前正在跑的后台助手”。用户不需要手动 Copy，也不需要回到终端手动 Send。

这是最接近 Agent-HTML 第一阶段产品目标的形态。

### Codex

Codex 也可以做到表层相似体验：

```text
Agent-HTML 中点击 Send
  -> Agent-HTML 通过 Codex 工作通道发起 request
  -> Codex 后端开始工作
```

但它的心智更像：

```text
Agent-HTML 自己内置或驱动了一个 Codex agent workflow。
```

它不一定等价于“把消息投递进用户已经打开的某个 Codex 终端 session”。因此 UX 可以相似，但产品解释应略有不同。

## 产品边界

第一版不需要追求所有高级能力。

不必一开始就做：

- 实时同步 agent 处理状态。
- 完整双向 session UI。
- 复杂交互历史回放。
- 自动把所有 UI 状态都变成持久文档修改。
- 控制或嵌入终端。

第一版最重要的是：

```text
用户能在 artifact 里明确表达“我指哪里、我做了什么、我想让 agent 做什么”；
Agent-HTML 能把这些意图准确送到后端 agent。
```

只要这条链路成立，Agent-HTML 就已经不只是预览器，而是 agent workflow 的前端意图层。

## 最终产品判断

Agent-HTML 的核心价值不是“预览 HTML”。

它的核心价值是：

```text
把 artifact 变成 agent 可理解、可操作、可反馈的意图界面。
```

用户在 artifact 中操作，agent 在本地工程中执行。

这形成了一个新的产品关系：

```text
Artifact = 用户表达意图的界面
Agent session = 执行意图的工作进程
Agent-HTML = 二者之间的交互层
```

因此，Agent-HTML 应该被设计成一个 agent-facing interactive workspace，而不是一个静态 artifact viewer。
