# shadcn Registry 分发系统报告

日期：2026-06-03

## 一句话结论

shadcn registry 是源码级分发系统。它不是把组件封装成黑盒 npm 包，
而是把仓库里选中的组件、hooks、patterns、配置、规则、文档和工作流文件，
按声明安装进用户项目。

对 AgentHTML 来说，registry 可以承担 React Canvas 架构里的复用层：

```text
npm 提供稳定运行库。
registry 分发本地源码套件。
agent 在本地源码套件里写 React artifact。
```

更具体地说：

```text
@agent-html/react
  -> npm package
  -> 提供 Artifact / Block / Action 等稳定协作 API

@agent-html registry
  -> shadcn registry
  -> 安装 .agent-html/ui、hooks、patterns、AGENTS.md、examples
```

这样 agent 不需要每次从零手搓 UI，也不需要被限制在旧 `.ahtml` DSL 里。
它可以正常写 React，同时复用本地安装的组件、hooks 和 patterns，并接受
AgentHTML Guard 的协作和视觉护栏。

## shadcn Registry 是什么

shadcn registry 是一个以 `registry.json` 为入口的源码分发协议。

一个 registry 可以由静态 JSON、动态 route handler 或公开 GitHub 仓库提供。
只要 registry catalog 和 item payload 符合 shadcn schema，CLI 就能发现、
查看、搜索、验证和安装其中的 item。

最小 catalog 形态：

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "items": [
    {
      "name": "button",
      "type": "registry:ui",
      "title": "Button",
      "description": "A simple button component.",
      "files": [
        {
          "path": "components/ui/button.tsx",
          "type": "registry:ui"
        }
      ]
    }
  ]
}
```

这里的 item 不是一个编译后的包。它描述的是：哪些源码文件属于这个 item，
这些文件是什么类型，安装时应该落到目标项目的哪里。

## Registry 和 npm 的区别

npm 和 registry 都能分发可复用能力，但所有权模型不同。

| 维度 | npm package | shadcn registry |
| --- | --- | --- |
| 安装对象 | package 依赖 | 源码文件和配置文件 |
| 默认位置 | `node_modules/` | 用户项目目录 |
| 使用方式 | 从包名 import | 从本地文件 import |
| 源码所有权 | 外部包维护者拥有 | 安装后成为项目源码 |
| 修改方式 | 升级版本或 fork | 直接编辑本地文件 |
| 适合内容 | 稳定库、SDK、运行时 API | UI、hooks、patterns、规则、模板 |
| 对 agent 的可见性 | 通常是外部依赖 | 本地可读、可改、可组合 |

npm 更适合分发稳定边界：

```tsx
import { Artifact, Block, Action } from "@agent-html/react"
```

registry 更适合分发项目内资产：

```tsx
import { Button } from "../ui/button"
import { useFilter } from "../hooks/use-filter"
import { ResearchMatrix } from "../patterns/research-matrix"
```

所以可以把两者理解为：

```text
npm 安装外部依赖。
registry 安装本地源码套件。
```

或者用产品隐喻表达：

```text
npm 像标准设备。
registry 像一套可直接入住、也可改造的房屋。
```

## 核心能力

### 1. Catalog 和 item

`registry.json` 是 catalog。它定义 registry 名称、主页和可安装 items。

item 是一个可安装单元。它可以是一个 button，也可以是一整个 feature kit。
item 至少描述：

- `name`
- `type`
- `title`
- `description`
- `files`

对 AgentHTML 来说，item 不应该只限于单个 UI component。更有价值的是把一组
协作资产作为一个 kit 安装。

### 2. files 和 target

`files` 声明 item 包含哪些文件。`target` 可以指定这些文件安装到用户项目里的
目标路径。

例如一个 AgentHTML base item 可以把文件安装到 `.agent-html/`：

```json
{
  "name": "base-playground",
  "type": "registry:item",
  "files": [
    {
      "path": "rules/AGENTS.md",
      "type": "registry:file",
      "target": "~/.agent-html/AGENTS.md"
    },
    {
      "path": "ui/button.tsx",
      "type": "registry:ui",
      "target": "~/.agent-html/ui/button.tsx"
    },
    {
      "path": "hooks/use-filter.ts",
      "type": "registry:hook",
      "target": "~/.agent-html/hooks/use-filter.ts"
    }
  ]
}
```

这让 registry 能安装“项目结构”，而不只是安装单个组件。

### 3. registryDependencies

`registryDependencies` 声明一个 item 依赖其他 registry item。

例如 `research-kit` 可以依赖 card、table、badge、filter hook 和 evidence panel：

```json
{
  "name": "research-kit",
  "type": "registry:item",
  "registryDependencies": [
    "@agent-html/card",
    "@agent-html/table",
    "@agent-html/badge",
    "@agent-html/use-filter",
    "@agent-html/evidence-panel"
  ]
}
```

这让 AgentHTML 可以用小 item 组成大 kit。开发者也可以只安装需要的部分。

### 4. dependencies

`dependencies` 和 `devDependencies` 声明 npm 依赖。

例如图表 pattern 可以声明：

```json
{
  "name": "metrics-dashboard",
  "type": "registry:block",
  "dependencies": ["recharts"]
}
```

这说明 registry 和 npm 不是互斥关系。registry 可以安装本地源码，同时声明这些
源码需要哪些 npm package。

### 5. include

大型 registry 可以用 `include` 拆分 catalog。

推荐 AgentHTML registry 结构：

```text
registry.json
ui/
  registry.json
  button.tsx
  card.tsx
  table.tsx
hooks/
  registry.json
  use-filter.ts
  use-selection.ts
patterns/
  registry.json
  research-matrix.tsx
  decision-table.tsx
rules/
  registry.json
  AGENTS.md
examples/
  registry.json
  market-research.agent.tsx
```

根 catalog：

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "agent-html",
  "homepage": "https://agent-html.dev",
  "include": [
    "ui/registry.json",
    "hooks/registry.json",
    "patterns/registry.json",
    "rules/registry.json",
    "examples/registry.json"
  ]
}
```

`include` 的价值是让 item 定义贴近源码，降低 registry 维护成本。

### 6. 静态和动态服务

registry 可以用两种方式服务。

静态方式：

```text
npx shadcn@latest build
```

默认生成 `public/r` 下的 JSON 文件，例如：

```text
public/r/registry.json
public/r/button.json
```

动态方式：

```text
loadRegistry()
loadRegistryItem(name)
```

动态 route handler 可以在请求时读取 source registry，并返回 catalog 或 item JSON。

对 AgentHTML 早期来说，静态 JSON 和 GitHub registry 更轻。动态服务适合后续做
文档站、搜索页或带权限的 registry。

### 7. GitHub registry

公开 GitHub 仓库可以直接成为 registry。只要仓库根目录有 `registry.json`，
用户就能安装 item：

```text
npx shadcn@latest add owner/repo/item-name
```

这对 AgentHTML 的早期分发很重要。它不要求先搭建 registry server。

示例：

```text
npx shadcn@latest add agent-html/registry/base-playground
npx shadcn@latest add agent-html/registry/research-kit
```

GitHub registry 适合公开、无认证的源码套件。如果需要私有仓库、认证或团队内部
registry，应使用 namespace registry 和认证机制。

### 8. Namespace registry

namespace 让用户用短地址安装 item。

先注册：

```text
npx shadcn@latest registry add @agent-html=https://agent-html.dev/r/{name}.json
```

再安装：

```text
npx shadcn@latest add @agent-html/research-kit
```

namespace 的价值是形成稳定生态入口。用户不用记完整 URL，也不用知道 item JSON
的实际路径。

### 9. CLI 审查和安装

常用命令：

```text
npx shadcn@latest list @agent-html
npx shadcn@latest search @agent-html --query research
npx shadcn@latest view @agent-html/research-kit
npx shadcn@latest add @agent-html/research-kit
npx shadcn@latest registry validate agent-html/registry
```

安装前审查很重要。registry item 会把源码写进项目，应该像第三方代码依赖一样
审查。

推荐流程：

```text
npx shadcn@latest view @agent-html/research-kit
npx shadcn@latest add @agent-html/research-kit --dry-run
npx shadcn@latest add @agent-html/research-kit --diff <file>
```

这让 human 和 agent 都可以先看 item payload、目标路径、依赖和文件变化，再决定
是否安装。

## 对 AgentHTML 的价值

### 1. 把复用从 DSL 转回 React 源码

旧 `.ahtml` runtime 通过 schema、tags 和 registry 限制 agent 能写什么。

React Canvas 架构改成：

```text
agent 正常写 React。
AgentHTML 用 Artifact / Block / Action 管协作边界。
Guard 管视觉和结构护栏。
registry 分发可复用源码资产。
```

这意味着 AgentHTML 不需要继续手搓一套轻量 React。复用可以来自普通 React
组件、hooks 和 patterns。

### 2. 降低 agent 手搓 UI 的概率

agent 容易生成风格漂移的 JSX：

```tsx
<div className="rounded-3xl bg-purple-950 p-10 text-lime-200 shadow-2xl">
```

registry 可以先把标准 UI 安装到 `.agent-html/ui/`：

```text
.agent-html/ui/button.tsx
.agent-html/ui/card.tsx
.agent-html/ui/table.tsx
.agent-html/ui/badge.tsx
.agent-html/ui/dialog.tsx
```

再通过 `.agent-html/AGENTS.md` 规定：

```text
Use .agent-html/ui components before custom markup.
Use Button for actions.
Use Card for grouped content.
Use Table for tabular data.
Use Badge for status labels.
Use className for layout only.
Do not use raw colors, gradients, heavy shadows, or custom font classes.
```

这样 agent 有本地可读的组件和明确规则，Guard 再拦截不合格输出。

### 3. 让 patterns 成为产品资产

AgentHTML 的重点不是只分发按钮。更重要的是分发工作形态。

可复用 patterns 包括：

| 场景 | Pattern |
| --- | --- |
| 市场调研 | `ResearchMatrix`、`EvidencePanel`、`CitationList` |
| 产品规划 | `RoadmapBoard`、`DecisionTable`、`RiskRegister` |
| 软件开发 | `PrReviewTable`、`CodePathCard`、`TestStatusPanel` |
| 事故复盘 | `IncidentTimeline`、`ActionItemTable` |
| 学习解释 | `LearningExplainer`、`ConceptMap`、`QuizPanel` |

这些 patterns 是 React 组件，不是 AgentHTML DSL。它们可以使用 state、events、
charts、tables 和普通 HTML。AgentHTML 只要求它们被放进稳定的 `Block` 边界。

### 4. 分发 agent rules 和 examples

registry items 可以安装任何文件，因此可以分发：

```text
.agent-html/AGENTS.md
.agent-html/examples/market-research.agent.tsx
.agent-html/examples/pr-review.agent.tsx
.agent-html/examples/roadmap.agent.tsx
```

这对 agent 很关键。agent 不只需要组件源码，也需要本地规则和可模仿示例。

推荐 base playground 安装后包含：

```text
.agent-html/
  AGENTS.md
  manifest.json
  ui/
  hooks/
  patterns/
  artifacts/
    example.agent.tsx
```

这样 Codex、Claude Code、Gemini CLI 或其他 agent 进入 workspace 后，可以直接读到
AgentHTML 的本地规则和现成资产。

## 推荐 AgentHTML Registry 设计

### 1. Base playground

`@agent-html/base-playground` 安装最小工作环境。

目标：

```text
.agent-html/
  AGENTS.md
  manifest.json
  ui/
    button.tsx
    card.tsx
    table.tsx
    badge.tsx
  hooks/
    use-copy-block-prompt.ts
  patterns/
  artifacts/
    example.agent.tsx
```

用途：

```text
npx shadcn@latest add @agent-html/base-playground
```

### 2. Research kit

`@agent-html/research-kit` 安装市场调研和证据组织能力。

建议内容：

```text
.agent-html/hooks/use-filter.ts
.agent-html/hooks/use-selection.ts
.agent-html/patterns/research-matrix.tsx
.agent-html/patterns/evidence-panel.tsx
.agent-html/patterns/citation-list.tsx
.agent-html/artifacts/research-example.agent.tsx
```

### 3. Product kit

`@agent-html/product-kit` 安装产品规划能力。

建议内容：

```text
.agent-html/patterns/roadmap-board.tsx
.agent-html/patterns/decision-table.tsx
.agent-html/patterns/risk-register.tsx
.agent-html/artifacts/product-roadmap-example.agent.tsx
```

### 4. Dev kit

`@agent-html/dev-kit` 安装开发场景 artifact 能力。

建议内容：

```text
.agent-html/patterns/pr-review-table.tsx
.agent-html/patterns/code-path-card.tsx
.agent-html/patterns/test-status-panel.tsx
.agent-html/artifacts/pr-review-example.agent.tsx
```

### 5. Learning kit

`@agent-html/learning-kit` 安装教学和解释型 artifact 能力。

建议内容：

```text
.agent-html/patterns/learning-explainer.tsx
.agent-html/patterns/concept-map.tsx
.agent-html/patterns/quiz-panel.tsx
.agent-html/artifacts/lesson-example.agent.tsx
```

## Agent 使用规则

AgentHTML registry 应配套安装规则文件。核心规则：

```text
Write normal React.
Use Artifact as the top-level wrapper.
Wrap every major semantic region in Block.
Use stable kebab-case Block ids.
Use .agent-html/ui components before custom markup.
Use .agent-html/hooks before rewriting common state logic.
Use .agent-html/patterns before inventing new work layouts.
Use component variants and semantic tokens.
Use className only for layout when necessary.
Do not use raw colors, gradients, heavy shadows, large radius, or custom fonts.
Do not directly call Codex app-server or local filesystem APIs from artifacts.
Use Action or host events for AI interactions.
```

这组规则和 Guard 一起工作：

```text
registry 提供可复用资产。
AGENTS.md 告诉 agent 如何使用。
examples 展示正确写法。
Guard 拦截偏离协作和视觉规则的 artifact。
```

## 安全和审查

registry 安装的是源码。它比 npm package 更透明，但不代表自动安全。

安装第三方 registry item 前应该检查：

- item 的 `files`
- 每个文件的 `target`
- npm `dependencies`
- `registryDependencies`
- 是否安装或覆盖 `AGENTS.md`
- 是否包含 scripts、workflow、MCP config 或其他有权限影响的文件
- 是否使用固定 ref

推荐公开安装命令固定版本或 commit：

```text
npx shadcn@latest add agent-html/registry/research-kit#v1.0.0
```

或：

```text
npx shadcn@latest add agent-html/registry/research-kit#c0ffee254729296a45d6691db565cf707a3fef5d
```

这能提高可复现性，减少默认分支变化带来的风险。

## 对产品路线的判断

AgentHTML 不应该自己重建一套 marketplace 或组件包管理系统。

更实际的路线是：

1. `@agent-html/react` 用 npm 分发稳定 API。
2. AgentHTML registry 用 shadcn 分发本地源码套件。
3. `agent-html init --preset shadcn` 调用或引导安装 base playground。
4. `agent-html dev` 扫描 `.agent-html/artifacts/*.agent.tsx`。
5. `agent-html guard` 检查 `Artifact`、`Block` 和视觉护栏。

最终形态：

```text
agent-html init
  -> installs npm runtime
  -> installs registry playground
  -> writes .agent-html/AGENTS.md

agent writes React artifact
  -> reuses .agent-html/ui
  -> reuses .agent-html/hooks
  -> reuses .agent-html/patterns
  -> marks Artifact / Block / Action

agent-html dev
  -> serves localhost canvas
  -> shows block overlay
  -> supports block-aware feedback
```

## 最终结论

shadcn registry 对 AgentHTML 的意义不是“安装几个 UI 组件”。

它是 React Canvas 架构的源码分发层：

```text
npm gives AgentHTML a stable runtime API.
registry gives agents a local source toolbox.
```

中文表达：

```text
npm 提供稳定运行边界。
registry 提供本地可读、可改、可复用的工具箱。
```

这正好解决 React-first 后的核心问题：

- agent 需要自由写 React。
- human 需要稳定审阅和反馈。
- 产品需要统一视觉和复用资产。
- 系统不能回到旧 DSL 的表达限制。

因此，AgentHTML 应把 shadcn registry 作为 `.agent-html/` playground 和 artifact kit
的主要分发方式。
