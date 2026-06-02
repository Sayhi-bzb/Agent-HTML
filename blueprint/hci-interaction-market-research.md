# 人机交互模式市场调研

这份调研用于判断 AgentHTML 的产品方向。参考起点是 Thariq Shihipar 的
X 长帖：

https://x.com/trq212/status/2052809885763747935?s=20

X 原帖正文直接抓取受限。本调研采用公开 companion gallery、二级讨论文章、
OpenAI Codex 文档和 HCI 资料交叉还原观点。

## 结论

AgentHTML 不应该被定义成四种开发模板。更大的机会是成为 agent 生成的
可交互工作产物载体。

Codex CLI 是很强的首个入口，因为它天然运行在用户的工作目录里，能读取代码、
文档、数据和上下文，也能写入 `.agent-html/`。但 AgentHTML 的市场不只在开发。
所有存在以下问题的工作都适合：

- AI 输出很长，人类不愿读。
- AI 输出很平，难以比较多个方向。
- AI 输出难以定位，用户只能说“改上面那段”。
- AI 输出不可操作，用户只能再写一段 prompt。
- AI 输出难以交接，下一轮 agent 只能重新猜意图。

更准确的产品定位是：

```text
Prompt / context
  -> agent 生成 artifact
  -> localhost 预览和操作
  -> human 局部审阅、比较、选择、调整
  -> agent 基于 artifact 和反馈继续迭代
```

HTML/React 的优势不是“比 Markdown 好看”，而是它把 AI 输出从一段答案变成一个
可浏览、可点击、可比较、可分享、可再次修改的工作界面。

## 参考材料

- Thariq companion gallery:
  [The unreasonable effectiveness of HTML](https://thariqs.github.io/html-effectiveness/)
- Handoff:
  [HTML Artifacts Need URLs](https://handoff.host/blog/html-artifacts-need-urls/)
- Nielsen Norman Group:
  [AI: First New UI Paradigm in 60 Years](https://www.nngroup.com/articles/ai-paradigm/)
- Nielsen Norman Group:
  [Direct Manipulation: Definition](https://www.nngroup.com/articles/direct-manipulation/)
- Microsoft Research:
  [Guidelines for Human-AI Interaction](https://www.microsoft.com/en-us/research/project/guidelines-for-human-ai-interaction/)
- OpenAI Codex docs:
  [Connect the TUI to a remote app server](https://developers.openai.com/codex/cli/features#connect-the-tui-to-a-remote-app-server)
- 二级转述：
  [The Unreasonable Effectiveness of HTML in Claude Code](https://explainx.ai/blog/unreasonable-effectiveness-html-claude-code-thariq-2026)

## 人机交互模式演进

### 1. Batch / Prompt Once

用户一次性提交完整需求，然后等待系统产出结果。

早期批处理是这种模式。今天很多 AI prompt 也是这种模式：用户把一大段要求交给
模型，模型生成一大段结果。它的问题是反馈太晚。一旦结果偏了，人类需要重新解释
意图，系统也很难知道错在什么局部。

这个模式适合一次性任务，不适合持续协作。

### 2. Command / CLI

用户和系统轮流交互。用户给一条命令，系统执行并返回状态，用户再决定下一步。

传统 CLI、IDE 命令、git workflow 和今天的 Codex CLI 都属于这个大类。它的优势是
精确、可组合、贴近工作目录。它的问题是可见性弱：复杂结果经常被压平成终端文本，
人类需要在脑内重建结构。

Codex CLI 已经解决了很多 agent 执行问题，但它仍然需要更好的 artifact surface
来承载复杂结果。

### 3. Direct Manipulation / GUI

用户直接操作屏幕上的对象，系统给出即时反馈。NN/g 对 direct manipulation 的定义
强调三点：对象可见、动作可增量和可逆、结果立即显示。

这个模式的核心价值是控制感。用户不需要记住命令名，也不需要把一切描述成 prose。
他们可以点、拖、切换、筛选、比较。

对 AgentHTML 来说，这意味着 artifact 不应该只是最终展示页。它应该允许用户在
产物内部完成判断和调整：选择一个方案、展开一个风险、调一个参数、拖动优先级、
复制一段 diff、导出下一轮 prompt。

### 4. Intent-Based AI

NN/g 把生成式 AI 称为新的 UI 范式：用户不再告诉计算机“怎么做”，而是告诉它
“想要什么结果”。这带来巨大杠杆，也带来控制权问题。

当 AI 决定过程时，人类可能更难发现错误来源。当前聊天界面通常只能用继续追问来
修正结果，缺少可视化对象、局部控制和渐进反馈。

所以纯 chat 不是终点。更有价值的是把 intent-based AI 和 GUI/direct manipulation
结合起来。

### 5. Artifact-Based Mixed Initiative

这是 AgentHTML 应该占据的位置。

AI 负责吸收上下文、生成初稿、组织复杂信息。人类负责审阅、判断、选择、局部调整。
artifact 是双方共同操作的对象。

这个模式不是“AI 给答案”，而是：

```text
agent 生成可操作产物
human 在产物上做判断
agent 根据局部反馈继续修改产物或底层源文件
```

Microsoft Human-AI Interaction Guidelines 把 AI 产品设计分成初始交互、常规交互、
出错时和长期使用四个阶段。Artifact-based interaction 正好能补齐这些阶段：

- 初始交互：展示 AI 能做什么，并让结果结构可见。
- 常规交互：通过局部块、控件和状态支持持续使用。
- 出错时：让用户指出具体区域，而不是重写整段 prompt。
- 长期使用：保留 artifact、版本、上下文和可复演的源。

## 为什么 HTML/React artifact 是机会

Thariq 的 companion gallery 展示了二十个自包含 HTML artifact，覆盖 planning、
code review、design、prototype、diagram、deck、research、report 和 custom editor。
这说明 HTML 不是某个开发模板，而是一种通用的 agent output surface。

### 信息密度

Markdown 擅长线性文本。HTML 擅长把不同形态的信息放在同一个可扫视界面里：

- 对比矩阵
- 时间线
- 风险表
- 架构图
- 状态标签
- 代码片段
- 折叠解释
- 交互控件

复杂 AI 输出的瓶颈不是生成能力，而是人类是否愿意读、是否能读懂、是否能指出
哪里需要改。

### 空间化比较

很多决策不是线性阅读问题，而是比较问题。比如三个实现方案、多个设计方向、几种
定价策略、不同用户旅程。

HTML 可以把选项并排放置，把权衡、风险、样例和下一步动作放在同一个视野里。
这比“方案 A... 方案 B... 方案 C...”更符合人类决策方式。

### 真实交互

有些东西不能靠文字描述：

- 动效曲线
- 点击路径
- 表单体验
- 筛选逻辑
- 参数调优
- 看板排序
- prompt 模板变量

HTML/React 能让 agent 生成一次性但真实可用的交互界面。用户操作之后，artifact
还可以导出 Markdown、JSON、patch、prompt 或配置 diff，重新进入 agent workflow。

### 可分享与可寻址

Handoff 的观点是：HTML artifact 如果要进入团队协作，就需要 URL、版本和稳定入口。
本地 HTML 文件对个人有用，但带 URL 的 artifact 才能进入团队审阅。

对 AgentHTML 来说，v1 可以从 localhost 开始，不一定先做云端分享。但架构上应该
承认 artifact 需要被寻址：

- 本地路径可寻址。
- localhost route 可寻址。
- block id 可寻址。
- 未来 URL 和版本可寻址。

### 可继续修改

AI artifact 的第一版通常不是最终版。它的价值在于让下一轮反馈更具体。

如果用户能说“改 `risk-model` 这个 block，把 enterprise 场景加进去”，agent 就不必
重新解析整段自然语言。Artifact 的结构越稳定，人机协作越可持续。

## AgentHTML 的市场定位

AgentHTML 应该是 agent-era artifact host，而不是静态页面生成器。

它服务的是一个新工作流：

```text
用户把问题交给 agent
agent 生成一个可交互 artifact
用户在浏览器中审阅、比较、选择、调整
artifact 把局部反馈和操作结果交还给 agent
agent 继续修改 artifact 或真实项目
```

这个定位和几个相邻产品不同：

| 相邻产品 | 主要价值 | AgentHTML 的差异 |
| --- | --- | --- |
| Chat UI | 对话和答案 | 把答案变成持久、可操作的界面 |
| Markdown docs | 线性记录 | 支持空间化、交互和局部定位 |
| Storybook | 组件开发展示 | 面向 agent 生成的任意工作产物 |
| Vite app | 正式应用开发 | 面向轻量、临时、可迭代 artifact |
| Dashboard tool | 固定数据看板 | 面向一次性或半结构化 AI 产物 |
| Desktop app | 集中入口 | AgentHTML 可先从 repo-local localhost 启动 |

## 目标用户与场景

### 开发

Codex CLI 是最自然的初始场景：

- PR review：annotated diff、风险分级、review path。
- 代码理解：module map、调用链、入口点、热路径。
- 实现计划：阶段、依赖、风险、验收标准。
- 设计系统：token、组件状态、变体 contact sheet。
- 调试报告：时间线、日志片段、假设、验证步骤。

这些场景的共同点是：agent 已经有上下文，但终端文本不适合人类审阅复杂结构。

### 产品与业务

- 市场调研：竞品矩阵、机会地图、用户画像、引用索引。
- 产品决策：方案比较、roadmap、risk register、stakeholder view。
- 销售方案：客户痛点、方案包、ROI 假设、定制报价草案。
- 运营复盘：指标变化、事件时间线、行动项和 owner。

这些内容不是代码，但同样需要可扫视、可比较、可迭代。

### 研究与学习

- 复杂概念解释：交互图、术语表、例子切换。
- 论文阅读：贡献、方法、证据、局限、相关工作。
- 课程材料：可折叠章节、测验、模拟器。

纯文本解释容易变成长文。Artifact 可以把学习路径变成可导航结构。

### 个人工作

- 旅行计划：地图、日程、预算、备选方案。
- 家装计划：风格板、采购表、时间线。
- 职业规划：目标、技能差距、项目组合、下一步任务。

这些场景说明 AgentHTML 的边界不该被开发限定。开发只是最容易被 Codex CLI 点燃的
入口。

## 对当前产品结构的影响

### 1. 不要把 Project / Section 作为必需层级

当前 `Project -> Section -> Cell -> Block -> UI` 更像 app workspace 和 DSL runtime
混合后的层级。对于 repo-local artifact host，强制 Project / Section 会增加启动
成本。

建议 v1 改成：

```text
user-repo/
  .agent-html/
    artifacts/
      market-research.agent.tsx
      pr-review.agent.tsx
      roadmap.agent.tsx
    data/
    manifest.json
```

`Project` 和 `Section` 可以作为 app 或 manifest 元数据存在，但不是渲染一个 artifact
的前置条件。

### 2. 保留语义，但从 DSL 转成 React 组件契约

当前语义 DSL 的问题是缺少 state、hooks、event、script。它适合表达静态结构，不适合
构建 artifact-based mixed initiative。

建议转成 React-first：

```tsx
import { Artifact, Block, PromptAction } from "@agent-html/runtime"

export default function ResearchArtifact() {
  return (
    <Artifact title="AI Artifact Host Market Research" kind="research">
      <Block id="summary" title="Summary">
        ...
      </Block>
      <Block id="opportunity-map" title="Opportunity Map">
        ...
      </Block>
      <PromptAction target="opportunity-map" label="Deepen this section" />
    </Artifact>
  )
}
```

语义层的职责从“限制 agent 能写什么标签”变成“让 agent 和 human 有稳定的定位点”。

### 3. Localhost 是 v1 主入口

OpenAI Codex 文档显示，Codex app-server 可以通过 localhost WebSocket 运行和连接。
这说明 AgentHTML 不需要先依赖完整桌面 app。

更实际的 v1 是：

```text
codex / agent 在当前 repo 里生成 .agent-html/
agent-html host 启动 localhost
浏览器预览 artifact
用户反馈具体 block 或 action
agent 继续修改文件
```

桌面 app 可以后续承载更强的项目管理、历史、分享和多 artifact workspace，但不应该
成为验证 artifact 市场的前置条件。

### 4. Artifact 必须可导出回 agent workflow

如果 artifact 只是看，它会退化成漂亮报告。它必须能把人类操作结果交还给 agent：

- copy prompt
- export markdown
- export JSON
- export config diff
- export selected option
- open issue / task draft
- write local artifact state

这个闭环比视觉效果更重要。

## 风险

### 安全风险

React/HTML artifact 可以执行脚本。agent 生成的代码需要默认本地隔离，不能直接获得
敏感权限。v1 应该避免让 artifact 任意调用本地文件系统或 Codex 控制接口。

### 复杂度风险

如果 AgentHTML 变成完整 app framework，会和 Vite、Next、Storybook 竞争。正确边界
是 artifact host，不是通用应用框架。

### 语义丢失风险

如果完全放任 agent 写任意 React，系统会失去可定位和可持续修改能力。因此最小语义
组件仍然重要：`Artifact`、`Block`、`Action`、`Source`、`Export`。

### 市场叙事风险

如果只讲“HTML 比 Markdown 好”，会显得像格式偏好。真正叙事应该是：

```text
AI 正在生成越来越复杂的工作产物；
人类需要一种能审阅、操作、分享、迭代这些产物的界面；
AgentHTML 是这个界面层和本地运行时。
```

## 建议路线

### Phase 1: Repo-local artifact host

- 支持 `.agent-html/artifacts/*.agent.tsx`。
- 启动 localhost preview。
- 自动索引 artifact。
- 支持 React state、hooks 和浏览器事件。
- 提供最小语义组件：`Artifact`、`Block`、`Action`。
- 提供 agent instructions，告诉 Codex CLI 如何生成 artifact。

### Phase 2: Human feedback loop

- 每个 block 可定位。
- 用户可复制针对某个 block 的 follow-up prompt。
- artifact 可导出 Markdown、JSON 或局部决策。
- host 显示 artifact 的源文件路径和更新时间。

### Phase 3: Multi-scenario examples

示例不要只做开发模板。至少覆盖：

- PR review
- market research
- product roadmap
- learning explainer
- sales proposal
- incident report
- custom editor

示例的目的不是限定产品，而是证明 artifact category 足够广。

### Phase 4: Sharing and versioning

- 本地 route 稳定。
- artifact id 稳定。
- block id 稳定。
- 支持版本历史或快照。
- 后续再考虑 URL 分享、团队审阅和 hosted artifact。

## 一句话定位

AgentHTML 是 agent 时代的本地 artifact host：让 AI 生成的工作产物从聊天答案变成
可审阅、可操作、可定位、可迭代的浏览器界面。
