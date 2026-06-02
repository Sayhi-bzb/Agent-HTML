# AgentHTML React Canvas 设计说明

日期：2026-06-02

## 一句话定义

AgentHTML 不再做 chat flow UI，也不再把 `.ahtml` DSL 作为主产品路线。

新的核心是：

```text
Agent writes React. AgentHTML guards the canvas.
```

中文解释：

```text
Agent 正常写 React。
AgentHTML 负责让 React 产物变成可定位、可审阅、可反馈、可持续修改的 AI 画布。
```

React 是画面和交互底座。AgentHTML 是协作协议和护栏层。

更具体地说：

```text
.agent-html/ 是 agent 写 React artifact 的本地 playground。
@agent-html/react 提供 Artifact / Block / Action 等协作标记。
AgentHTML host 负责 localhost 预览、Guard、Block overlay 和 AI action bridge。
Codex app-server 是可选执行后端，不是 artifact 直接调用的 API。
```

所以新的产品形态可以理解成：

```text
React playground + AI canvas runtime + optional Codex bridge
```

## 为什么转向

之前的 `.ahtml` runtime 试图同时解决两件事：

1. 画面怎么写出来。
2. AI 怎么稳定地理解和修改画面。

这导致我们在 runtime 里手搓一套轻量 React：标签、布局、组件、属性、语法、校验、渲染映射。它能让静态结构稳定，但无法自然支持 state、hooks、events、script、自定义交互和复杂 UI。

现在的判断是：

- 画面和交互应该交给 React。
- AI 协作稳定性应该交给 AgentHTML。
- 不要再让 AgentHTML 重新发明 UI 语言。

更直观的类比：

```text
Chat flow UI = 小说
React canvas = 电影
AgentHTML = 镜头编号、场记板、剪辑规则、导演反馈回路
```

小说是线性文本。电影是可见场景。AgentHTML 要做的是把 AI 输出从文字流变成可导演的场景。

## 核心分工

| 层 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| React | UI、state、hooks、events、组件组合、数据渲染 | 不知道哪个区域可被 agent 稳定修改 |
| Agent | 生成和修改 artifact 源码 | 不应该自由发明视觉系统 |
| AgentHTML | Artifact/Block 语义、localhost host、样式护栏、局部反馈 | 不重新实现 React，不做通用 app framework |

Agent 的自由度主要在 React 能力上，而不是在产品协议上。

Agent 可以自由使用：

- React state。
- hooks。
- events。
- `map` / `filter` / derived data。
- 自定义组件。
- shadcn/ui 或预设 `components/ui`。
- charts、tables、forms、canvas、SVG 等普通 React 能力。

Agent 必须遵守：

- 顶层使用 `Artifact`。
- 关键区域使用 `Block id`。
- `Block id` 稳定、唯一、可读。
- 复用 `.agent-html/components`、`.agent-html/hooks`、`.agent-html/patterns` 中已有资产。
- 不把整个页面写成一个无法局部反馈的大 block。
- 不直接读写本地文件。
- 不直接调用 Codex app-server。

所以 AgentHTML 的主线不是：

```text
.ahtml -> AST -> runtime renderer -> React
```

而是：

```text
.agent-html/artifacts/*.agent.tsx
  -> AgentHTML Guard
  -> React render
  -> AgentHTML host/canvas overlay
  -> human block-level feedback
  -> host sends block-aware prompt to Codex / another agent
  -> agent edits the same React source
```

## `.agent-html/` Playground

`.agent-html/` 是放在用户 workspace 下的本地 React playground。这个 workspace 不一定是软件仓库，也可以是 Obsidian vault、研究资料夹、产品资料夹、课程资料夹或运营资料夹。

推荐结构：

```text
user-workspace/
  .agent-html/
    artifacts/
      market-research.agent.tsx
      roadmap.agent.tsx
      pr-review.agent.tsx
    components/
      ui/
        button.tsx
        card.tsx
        table.tsx
    hooks/
      use-filter.ts
      use-selection.ts
      use-copy-block-prompt.ts
    patterns/
      research-matrix.tsx
      decision-table.tsx
      evidence-panel.tsx
    AGENTS.md
    manifest.json
```

这里的重点是：agent 不是在一个空白文件里随便发明网页。它是在一个有预设组件、hooks、patterns、规则文件和 Guard 的 playground 里写 React artifact。

## 复用性模型

React-first 不代表每个 artifact 都从零写。复用应该来自普通 React 资产。

### `components/ui`

`components/ui` 可以预设 shadcn/ui 或项目自己的 UI 组件。

Agent 应该优先复用：

- `Button`
- `Card`
- `Table`
- `Tabs`
- `Badge`
- `Dialog`
- `Sheet`
- `Input`
- `Select`
- `Tooltip`
- `Chart`

这些组件是 React 组件，不是 AgentHTML DSL。Agent 仍然可以组合它们、传 props、管理 state。

### `hooks`

hooks 用来减少重复交互逻辑。

常见预设：

- `useFilter`
- `useSelection`
- `useSort`
- `useTabs`
- `useCopyBlockPrompt`
- `useLocalArtifactState`
- `useDebouncedValue`

这些 hooks 让 agent 不必每次手写搜索、筛选、选择、复制状态，也让不同 artifact 的交互行为更一致。

### `patterns`

patterns 是高层 React 组合，不是硬编码模板。

常见预设：

- `ResearchMatrix`
- `DecisionTable`
- `TimelineReview`
- `EvidencePanel`
- `RoadmapBoard`
- `RiskRegister`
- `IncidentTimeline`
- `LearningExplainer`

patterns 的价值是让 agent 组合成熟工作形态，而不是每次重新发明布局。

### shadcn preset

可以提供：

```text
agent-html init --preset shadcn
```

它负责：

- 初始化 React/Vite artifact playground。
- 准备 `components/ui`。
- 准备 semantic tokens。
- 写入 `.agent-html/AGENTS.md`。
- 写入 Guard 规则。
- 放入多场景 examples。

关键边界：shadcn 提高 UI 复用和一致性，但 AgentHTML 的核心仍然是 `Artifact`、`Block`、Guard、host 和 AI feedback loop。

## 最小 Artifact Contract

Agent 可以正常写 React，但关键区域必须用 AgentHTML 标记。

最小形态：

```tsx
import { Artifact, Block } from "@agent-html/react"

export default function Page() {
  return (
    <Artifact title="Codex 调研">
      <Block id="summary" title="总结">
        <section>
          <h2>总结</h2>
          <p>这里正常写 React/HTML。</p>
        </section>
      </Block>

      <Block id="market-map" title="市场地图">
        <section>
          <h2>市场地图</h2>
          <table>
            <tbody>
              <tr>
                <td>Codex CLI</td>
                <td>本地目录 agent</td>
              </tr>
            </tbody>
          </table>
        </section>
      </Block>
    </Artifact>
  )
}
```

`Artifact` 表示这是一个 AI 工作产物。`Block` 表示这里是可定位、可反馈、可重建的区域。

`Block` 不是 UI 积木。它是协作边界。

## 什么是 Block

`Block` 的意义是让 human 和 agent 对同一个区域有稳定称呼。

用户不需要说：

```text
改上面那个市场地图下面第二段
```

而是说：

```text
改 market-map 这个 block，把 Claude Code 和 Gemini CLI 加进去。
```

AgentHTML host 可以把这个反馈变成更稳定的 prompt：

```text
In artifact "Codex 调研", edit Block "market-map".
Keep other blocks unchanged unless needed.
User request: 把 Claude Code 和 Gemini CLI 加进去。
```

### Block 规则

- 每个重要区域必须有 `Block`。
- 每个 `Block` 必须有稳定 `id`。
- `id` 应使用 kebab-case，如 `market-map`、`risk-table`。
- 同一个 artifact 内 `id` 不得重复。
- 不要把整个页面写成一个巨大 block。
- 不要把每个按钮、每个段落都拆成 block。
- Block 边界应该对应用户会反馈的语义区域。

## AgentHTML Guard

AgentHTML Guard 类似 Prettier/ESLint，但目标不是格式，而是 AI artifact 规则。

```text
Prettier 管格式。
ESLint 管代码质量。
AgentHTML Guard 管 canvas 可协作性和视觉稳定性。
```

Guard 做两类检查。

### 1. 协作稳定检查

必须检查：

- artifact 文件默认导出 React component。
- 顶层使用 `<Artifact>`。
- 至少存在一个 `<Block>`。
- 每个 `<Block>` 有 `id`。
- `Block id` 唯一。
- `Block id` 可读且稳定。
- 不存在明显的巨大单 block 页面。

可以检查：

- `Block title` 是否存在。
- block 数量是否过多或过少。
- 是否存在没有被 block 覆盖的大段主要内容。
- 是否使用了不稳定 id，如 `block1`、`section2`、`temp`。

### 2. 视觉稳定检查

React-first 后，agent 容易写出漂移样式：

```tsx
<div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-12">
  <div className="rounded-3xl border border-purple-400/30 bg-white/10 shadow-2xl">
    ...
  </div>
</div>
```

这会让每个 artifact 都像不同 AI 生成器吐出来的页面，视觉系统无法持续。

Guard 默认禁止：

- `style={{ ... }}`。
- 视觉型 `className`。
- Tailwind 颜色类，如 `bg-purple-900`、`text-pink-300`。
- 渐变类，如 `bg-gradient-*`、`from-*`、`via-*`、`to-*`。
- 夸张圆角，如 `rounded-3xl`、`rounded-[48px]`。
- 重阴影，如 `shadow-2xl`。
- 任意值类，如 `text-[72px]`、`p-[37px]`。
- 字体和字距漂移，如 `font-serif`、`tracking-tight`。

Guard 允许：

- React state。
- hooks。
- event handlers。
- `map` 渲染。
- 自定义组件。
- 原生 HTML 元素。
- 非视觉用途的少量 className，作为显式 escape hatch。

## 样式归一策略

AgentHTML 不应该要求 agent 用一整套新 UI 组件来排版。否则又会绕回 DSL。它也不应该放任 agent 随意写视觉 className。

更好的默认方式是：

```text
Agent 写原生 HTML/React 或复用 shadcn/ui。
AgentHTML 给 artifact 容器注入默认 CSS token。
Guard 阻止明显的视觉漂移。
```

例如 agent 写：

```tsx
<section>
  <h2>总结</h2>
  <p>Codex CLI 不只是开发工具。</p>
  <button>筛选</button>
  <table>...</table>
</section>
```

AgentHTML 负责让这些原生元素在 canvas 里有统一默认样式：

```css
.agent-html-artifact h2 { ... }
.agent-html-artifact p { ... }
.agent-html-artifact button { ... }
.agent-html-artifact table { ... }
```

这样 agent 不需要写 `className`，页面也不会变丑。

当使用 shadcn/ui 时，规则是：

```text
Use variants and semantic tokens.
Use className for layout only.
Do not override component colors, fonts, radius, or shadow manually.
```

也就是说，允许：

```tsx
<Card>
  <CardHeader>
    <CardTitle>核心结论</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Codex CLI 不只适合开发。</p>
  </CardContent>
</Card>
```

不允许：

```tsx
<Card className="rounded-3xl bg-purple-950 text-lime-200 shadow-2xl">
```

### Token 所有权

颜色、字体、间距、圆角、阴影应该由 AgentHTML token 管理。

```text
agent 可以决定内容结构。
agent 不应该决定视觉品牌。
```

如果确实需要特定视觉表达，应该通过受控接口打开：

```tsx
<Artifact title="..." theme="editorial">
```

或者：

```tsx
<Block id="hero" title="Hero" intent="cover">
```

而不是让 agent 自由写一串 Tailwind class。

## className 策略

不要完全永远禁止 `className`，但默认禁止 agent 自由使用。

建议分三档：

### Strict 默认模式

默认用于 agent 生成 artifact。

- 禁止 `style`。
- 禁止 `className`。
- 使用 AgentHTML 全局元素样式。
- 最稳定，最适合自动生成。

### Safe Layout 模式

允许极少数结构类。

可考虑允许：

```text
sr-only
hidden
min-w-0
overflow-hidden
```

不允许颜色、字体、阴影、圆角、任意值。

### Escape Hatch 模式

人工开启，用于特殊原型或设计实验。

- 允许 `className`。
- Guard 只 warning。
- Host 明确标记这个 artifact 使用了自定义样式。

v1 应该先做 Strict 和 warning，不急着做复杂自动改写。

## 自动修正策略

Guard 可以分两步做。

第一步只报告问题：

```text
Unsafe className on line 42:
bg-purple-900 rounded-3xl shadow-2xl
Use AgentHTML default CSS or theme tokens instead.
```

第二步再支持安全自动修正：

```tsx
<div className="bg-purple-900 rounded-3xl shadow-2xl">
```

自动变成：

```tsx
<div>
```

不要急着把任意 className 智能翻译成组件或 token，因为这容易误判设计意图。

## UI 和 AI 如何交互

React artifact 不应该直接控制 Codex，也不应该直接读写用户文件。

正确边界是：

```text
React artifact
  -> triggers Action / interaction event
  -> AgentHTML host receives it
  -> host builds block-aware prompt/context
  -> host sends it to Codex app-server / Codex CLI / another agent
  -> agent edits the artifact source file
  -> host reloads preview
```

示例：

```tsx
<Action
  target="competitors"
  prompt="补充 Claude Code 和 Gemini CLI，并比较它们和 Codex CLI 的入口差异。"
/>
```

这个 `Action` 不直接调用 Codex。它只表达用户意图。AgentHTML host 负责把它转换成：

```text
Edit .agent-html/artifacts/market-research.agent.tsx.
Target Block: competitors.
User request: 补充 Claude Code 和 Gemini CLI，并比较它们和 Codex CLI 的入口差异。
Keep unrelated blocks unchanged.
```

然后交给执行后端。

### Codex app-server 的位置

Codex app-server 是可选 bridge，不是 AgentHTML 的 source of truth。

AgentHTML 可以通过 host 使用 Codex app-server：

- start/resume thread
- send block-aware prompt
- receive progress/events
- handle approvals through Codex-owned mechanisms

AgentHTML 不应该复制：

- auth
- model selection
- sandbox
- approvals
- MCP
- skills
- conversation semantics

这些仍然由 Codex 拥有。

## 保留什么

### 1. Durable Source

AgentHTML 的状态仍然应该在文件里。

```text
.agent-html/
  artifacts/
    codex-market.agent.tsx
    roadmap.agent.tsx
  data/
  manifest.json
```

不要把 chat state、runtime memory 或 Codex session 当成 AgentHTML 的 source of truth。

### 2. Block Identity

保留可寻址 block，但从 `.ahtml` 节点升级为 React component contract。

### 3. Feedback Loop

保留局部 prompt、copy block reference、prompt composer、interaction event 这类能力。

### 4. Theme / Token

保留 AgentHTML 统一视觉 token。React-first 后，这反而更重要。

### 5. Host Boundary

保留 localhost host、artifact index、错误展示、source path、sandbox、preview route。

## 舍弃什么

### 1. 舍弃 `.ahtml` 作为主路线

`.ahtml` 可以保留为 legacy/compat/import format，但不要再作为核心产品语言。

### 2. 舍弃手搓轻量 React

不再用 schema grammar、AST traversal、tag-to-component renderer 来承担主表达能力。

### 3. 舍弃 Cell/Layout/UI 主层级

`Cell -> Layout -> Block -> UI` 适合旧 DSL，不适合 AI canvas。

新主线只需要：

```text
Artifact -> Block -> normal React
```

### 4. 舍弃 App-first

v1 不应要求用户先进入桌面 app 或 Project/Section workspace。

更轻的入口：

```text
agent-html dev
open localhost
```

## 重构什么

### 1. Runtime 重构

旧 runtime：

```text
.ahtml -> parse -> validate -> renderAgentHtml -> React element
```

新 runtime/host：

```text
.agent.tsx -> guard -> Vite/React render -> canvas overlay
```

旧 `.ahtml` renderer 降级为：

```text
legacy-ahtml
```

### 2. Public API 重构

最小 public API：

```tsx
import {
  Artifact,
  Block,
  Action,
  Citation,
  Export,
} from "@agent-html/react"
```

v1 可以只实现：

```tsx
Artifact
Block
Action
```

其他能力后续再加。

### 3. Component Registry 重构

旧 registry 是 XML 标签市场和 prompt grammar。

新 registry 应该变成 agent guide：

- 推荐 snippets。
- artifact examples。
- block patterns。
- style rules。
- allowed escape hatches。
- validation metadata。

它不应该再限制 agent “只能写哪些标签”。

## 推荐 v1 形态

### 目录

```text
workspace/
  .agent-html/
    artifacts/
      market-research.agent.tsx
      pr-review.agent.tsx
    components/
      ui/
    hooks/
    patterns/
    data/
    manifest.json
    AGENTS.md
```

这里的 `workspace` 不一定是 software repo。它也可以是 Obsidian vault、研究资料夹、产品资料夹或课程资料夹。

### 命令

```text
agent-html init
agent-html init --preset shadcn
agent-html dev
agent-html guard
```

### 工作流

```text
human asks Codex / Claude Code / Gemini CLI
  -> agent writes .agent-html/artifacts/foo.agent.tsx
  -> agent reuses .agent-html/components, hooks, and patterns
  -> agent-html guard checks structure and style
  -> agent-html dev serves localhost
  -> human reviews canvas
  -> human selects Block or triggers Action
  -> host builds block-aware prompt
  -> agent edits foo.agent.tsx
```

### Host 展示

Host 至少展示：

- artifact 列表。
- 当前 artifact 页面。
- block hover/selection overlay。
- block id/title。
- copy block prompt。
- source file path。
- guard warnings。
- available actions。
- optional Codex bridge status。

## 给 Agent 的写作规则

这些规则应该写进 `.agent-html/AGENTS.md` 或 skill。

```text
Write normal React.
Use Artifact as the top-level wrapper.
Wrap every major semantic region in Block.
Use stable kebab-case Block ids.
Use existing components/ui, hooks, and patterns before writing custom UI.
Use shadcn variants and semantic tokens when shadcn components exist.
Do not use style for visual styling.
Use className only for safe layout when necessary.
Never use raw color, gradient, large radius, heavy shadow, or custom font classes.
Use semantic HTML elements first: section, h2, p, table, button.
Use React state, events, and custom components when useful.
Keep content data in arrays or objects when repeated.
Do not create one giant Block.
Do not split every small element into a Block.
Prefer clear structure over decorative design.
Do not directly call Codex app-server or local filesystem APIs from the artifact.
Use Action or host events for AI interactions.
```

## 示例：正确方向

```tsx
import { useState } from "react"
import { Artifact, Block } from "@agent-html/react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

const competitors = [
  { name: "Codex CLI", angle: "local agent", entry: "terminal" },
  { name: "Claude Code", angle: "agentic coding", entry: "terminal" },
  { name: "Cursor", angle: "IDE agent", entry: "editor" },
]

export default function MarketResearch() {
  const [entry, setEntry] = useState("all")
  const rows = competitors.filter((item) => {
    return entry === "all" || item.entry === entry
  })

  return (
    <Artifact title="Agent 市场调研">
      <Block id="summary" title="核心结论">
        <Card>
          <CardHeader>
            <CardTitle>核心结论</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Agent 正在进入用户已有工作目录，HTML artifact 是新的审阅表面。</p>
          </CardContent>
        </Card>
      </Block>

      <Block id="competitor-map" title="竞品地图">
        <section>
          <h2>竞品地图</h2>
          <Button onClick={() => setEntry("terminal")}>Terminal</Button>
          <table>
            <tbody>
              {rows.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.angle}</td>
                  <td>{item.entry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Block>
    </Artifact>
  )
}
```

这个例子是 React，不是 DSL。AgentHTML 只关心 `Artifact`、`Block` 和样式护栏。

## 示例：错误方向

```tsx
export default function MarketResearch() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-12">
      <div className="rounded-3xl border border-purple-400/30 bg-white/10 p-10 shadow-2xl">
        <h1 className="text-6xl font-black tracking-tight text-white">
          Codex Market
        </h1>
      </div>
    </div>
  )
}
```

问题：

- 没有 `Artifact`。
- 没有 `Block`。
- 用户不能稳定指向局部区域。
- agent 自由发明了视觉系统。
- 颜色、字体、圆角、阴影全部漂移。

## 产品边界

AgentHTML 不是：

- Chat UI。
- Markdown renderer。
- Storybook clone。
- Vite/Next 替代品。
- shadcn/Radix 替代品。
- 完整 app framework。
- 新的 JSX/HTML DSL。

AgentHTML 是：

- AI canvas host。
- React artifact runtime boundary。
- Block-level collaboration layer。
- Style guard。
- Localhost preview surface。
- Agent output stabilizer。

## 开放问题

这些问题不阻塞方向，但会影响实现优先级：

- Guard 是只报错，还是支持自动 strip unsafe className？
- `className` escape hatch 放在 artifact 级、block 级，还是 CLI flag？
- Host 是否使用 iframe sandbox 渲染 agent artifact？
- Block metadata 是运行时采集，还是构建时静态分析？
- `.ahtml` legacy 能否导入成 `.agent.tsx`？
- 是否需要 artifact-level manifest，还是从 TSX export metadata 推导？

## 最终判断

AgentHTML 的核心不是做更好的聊天框，也不是做静态 HTML 预览器。

核心是：

```text
一个带 AI 的 canvas。
```

React 负责让画面真实可交互。AgentHTML 负责让这个画面能被人和 agent 共同导演。

更短的产品句子：

```text
React makes the scene interactive.
AgentHTML makes the scene addressable.
```

中文：

```text
React 让场景可交互。
AgentHTML 让场景可点名、可反馈、可重拍。
```
