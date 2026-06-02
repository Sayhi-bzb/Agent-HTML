# AgentHTML 物理世界映射

这份本地笔记记录 AgentHTML 的共享世界观。它放在 `.secrets/` 下，
不会进入 Git，用来帮助 agent 在开发时进入同一套剧本。

## 核心映射

| 系统概念 | 物理世界隐喻 |
| --- | --- |
| `AgentHTML/` | 沉浸式工件剧场公司 |
| `projects/` | 主题园区群 |
| `project/` | 单个主题园区 / 制作现场 |
| `section/` | 主题馆 / 电影厅 / 章节 / 维度容器 |
| `components` | 建筑模块 / 舞台道具 |
| `.agent-html` | 沙盘 / 剧本蓝图 |
| `agent` | 造景师 + 工程师 + 公司运营者 |
| `human` | 观众导演 |
| `runtime` | 舞台机械 / 显化设备 |
| `app` | 观众入口 + 导演控制台 |

## 公司使命

AgentHTML 是一家沉浸式工件剧场公司。

公司不是为了发布一次性页面而存在。公司要把 AI 输出转化成一种可以被人类和
agent 持续审阅、导演、重建、复演的工件剧场。

公司的使命是：对抗一次性、黑箱化、不可编排的 AI 输出，把它转化成具备以下
特征的沉浸式工件：

- 可定位
- 可审阅
- 可编排
- 可复演
- 可被下一班 agent 接着重建

更好的内容体验是这个使命的结果之一，但不是全部。更底层的目标是协作体验：
human 应该能清楚地导演工作，agent 应该能精确地修改工作，runtime 应该能可靠
地演出工作，app 应该让整个循环可见、可控、可继续。

## 公司在开发什么

AgentHTML 开发的是一套可编排内容体验系统。

人来到这家公司，就像进入一座沉浸式剧场。他们会消费内容，但不是被动观众。
他们也可以成为导演：选择什么重要，指出哪一幕需要变化，要求剧情走向改变，
再让 agent 回到制作现场重建。

所以公司同时开发两件事：

- 可以被体验的内容
- 可以被检查的结构
- 可以被定位的 section
- 可以被复用的 components
- 可以把蓝图演出来的 runtime 舞台机械
- 可以让 human 审阅、比较、判断、指挥的 app 表面
- 可以让下一位 agent 不必重新猜世界规则的架构

## 主冲突

AgentHTML 对抗的是一次性 AI 输出。

一次性输出看起来完成了，但很难作为长期资产运营。它也许能渲染一次，但下一轮
迭代很容易丢失结构、意图和局部定位。human 可以说“改这里”，但如果工件里没有
稳定的“这里”，agent 就无法精确施工。

公司对抗五类相关问题：

- 一次性输出：生成结果没有为持续工作而设计。
- 黑箱内容：能看到表面，但看不清可编辑结构。
- 不可编排反馈：human 的意图无法稳定指向 section、block 或 component。
- 失控演出：runtime 无法在不同会话和 host 中可靠显化同一份蓝图。
- 公司内耗：app、runtime、Codex、agent 的职责不清，互相复制或增加后续工作成本。

当一个 artifact 不再是静态答案，而成为可持续运营的剧场资产时，公司就赢了。

## 世界角色

`AgentHTML/` 是公司根目录。它是共享的文件系统世界，用来存放公司的项目、
内部记录和 agent 可读的指令。

`projects/` 是主题园区群。它包含许多制作现场，每个现场都可以有自己的内容
方向、观众目标和工件历史。

`project/` 是一个主题园区或制作现场。它承载一组连贯的可编排内容体验。

`section/` 是 project 内部的维度容器。它可以是科幻馆、冒险馆、搞笑馆、
章节、业务模块、用户旅程阶段、草稿区或正式演出区。隐喻可以随 project 变化，
但工程事实不变：section 是一个可定位、可审阅、可演出、可重建、可交接给下一位
agent 的 artifact 单元。

`components` 是建筑模块和舞台道具。它们应该承载语义，而不只是布局。一个
component 的价值，在于它能帮助 agent 和 runtime 在多轮编辑中保留结构。

`.agent-html` 是沙盘和剧本蓝图。它是 artifact 的 durable source。公司不应该
把聊天记忆或临时 runtime 状态当成世界真正的源头。

`agent` 是造景师、工程师和公司运营者。agent 可以直接造景，也要改善公司本身：
更清晰的结构、更可靠的 runtime 规则、更顺畅的 app 流程、更低的 agent 交接成本。

`human` 是观众导演。human 从剧场内部体验内容，再回到导演控制台指挥下一轮演出。

`runtime` 是舞台机械。它通过稳定的 tags、blocks、attributes、interactions 和
host boundaries 来保存、校验、渲染、演出蓝图。

`app` 是观众入口和导演控制台。它让 human 进入 artifact，扫描它，选择局部，
比较结果，提供反馈，并启动下一轮 agent 工作。

## 日常生产循环

公司的生产循环是：

```text
human 意图
  -> app 导演控制台
  -> agent 接收上下文
  -> agent 修改蓝图或公司机械
  -> runtime 校验并演出 artifact
  -> human 审阅新的演出
  -> 反馈成为下一轮制作指令
```

这个循环解释了为什么系统边界重要。App 不应该复制 Codex 对 auth、model
selection、sandbox、approvals、MCP 或 conversation semantics 的所有权。
Runtime 应该拥有 artifact source、schema、rendering、block identity 和语义交互
决策。Agents 应该做出能让下一轮循环更容易理解的改动。

## Agent 员工守则

agent 在这家公司工作时，应该问：

- 这个改动是否让 artifact 更容易被 human 定位、审阅、导演或比较？
- 这个改动是否保留或改善了 `.agent-html` 蓝图，而不是把意义藏进临时输出？
- 这个改动是否让 `section/` 更像一个独立的可编排内容单元？
- 这个改动是否尊重 runtime 作为舞台机械、app 作为导演控制台的职责？
- 这个改动是否减少了下一位 agent 的交接成本，还是让下一班更需要猜？
- 这个改动是否把一次性输出推进成了持久的剧场资产？

好的工作应该同时改善演出和公司。内容要让 visitor 获得更好的体验，生产线也要
让 human、agent、runtime、app 更容易一起运转。
