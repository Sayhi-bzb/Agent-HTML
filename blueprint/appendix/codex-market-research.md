# Codex 市场调研报告

> Appendix reference only.
> Current decision source: `../README.md`.
> Do not treat this file as current implementation law.

日期：2026-06-02

## 一句话结论

Codex 正在把 AI 编程产品从“聊天框回答代码问题”推进到“agent 进入真实工作目录、长期执行任务、读写文件、运行命令、保留线程、接受审查”的工作系统。

AgentHTML 不应该和 Codex 抢“写代码 agent”的位置。更有机会的方向是成为 Codex 和其他 agent 生成结果之后的本地 artifact 层：把一次性输出变成可以在 `localhost` 预览、审阅、定位、迭代、复演的 HTML/React 工件。

## Codex 是什么

Codex 是 OpenAI 的 coding agent 产品线。官方产品页把它定义为“帮助用户用 AI build and ship 的 coding agent”，并强调它面向真实工程工作、多 agent 工作流、skills、automations、code review 和多表面使用。

Codex 当前不是单一应用，而是一组互通的工作表面：

| 表面 | 官方定位 | 对 AgentHTML 的意义 |
| --- | --- | --- |
| Codex App | macOS/Windows 桌面 app，作为 agentic coding command center | 证明 OpenAI 在做视觉化 review/control surface，但 AgentHTML 不必复刻完整 app |
| IDE extension | VS Code、Cursor、Windsurf 等编辑器侧边栏 | 说明开发者入口仍在现有 IDE，不一定愿意换主工作台 |
| CLI | 在 terminal 当前目录运行 Codex | 最适合 AgentHTML 的早期入口：repo-local、文件系统原生、可直接生成 `.agent-html/` |
| Cloud | 浏览器里运行后台任务、看日志、审 diff、创建 PR | 说明市场正在接受 long-running/background agent |
| app-server | experimental 本地 app-server，支持 `stdio://`、`ws://IP:PORT`、`unix://` | 可做可选集成，不应成为 AgentHTML v1 的稳定依赖 |
| mcp-server | Codex 自身可作为 MCP server 被其他 agent 消费 | 说明 agent-to-agent/tool integration 正在成为基础设施 |

官方 quickstart 显示，Codex App、IDE、CLI、Cloud 都围绕“选择项目目录/仓库，然后让 Codex 工作”展开。CLI 支持 macOS、Windows、Linux，并在当前目录执行任务。IDE extension 默认以 Agent mode 启动，可以读文件、运行命令、写入项目目录。Cloud 则连接 GitHub repo，在云端执行任务并交付 diff/PR。

## Codex 的核心能力

### 1. 真实工作目录，而不是独立沙盒文档

Codex 的基本单位是用户项目目录或 GitHub repo。它不是让用户把代码复制进 chat，而是让 agent 进入已有工程环境。

这对 AgentHTML 的启发是：不要把 artifact 关进独立 app 的私有 workspace。更自然的形态是：

```text
user-repo/
  .agent-html/
    artifacts/
    data/
    manifest.json
    AGENTS.md
```

Codex 在用户 repo 里工作，AgentHTML 也应该在用户 repo 里存 durable source。用户通过 `localhost` 打开预览，而不是必须先进入一个独立桌面 app。

### 2. 长线程和任务控制

Codex 支持 session resume、fork、compact、plan mode、subagents。OpenAI 对 GPT-5.1-Codex-Max 的说明强调 long-running tasks、跨 context window compaction、多小时 agent loop。

市场信号很明确：coding agent 的竞争重点不只是“单次回答质量”，而是能否长期保持任务上下文、持续修复测试失败、逐步交付可审查结果。

AgentHTML 的对应机会不是复制 Codex 的 thread，而是让 thread 的阶段性产物变成可视化、可定位、可继续加工的 artifact。

### 3. 配置、权限和安全边界

Codex 的 best practices 强调：

- 用 `AGENTS.md` 存 repo 内 durable guidance。
- 用 `~/.codex/config.toml` 存个人默认配置。
- 用 `.codex/config.toml` 存 repo-specific 行为。
- 用 sandbox mode 和 approval policy 控制文件/命令权限。
- 用 MCP 接外部系统。
- 用 skills 封装重复工作。

这说明 AgentHTML 不应该重建模型选择、权限审批、MCP、agent orchestration。Codex 已经拥有这些基础设施。AgentHTML 应该只定义 artifact 生成、预览、编辑、审阅和导出的边界。

### 4. 审查闭环

Codex 的产品叙事强调测试、diff review、PR、logs、tool calls 和 human review。Codex 输出不是直接部署，而是被人审查和迭代。

AgentHTML 的机会在这里很强：代码 diff 是工程师能审的表面，但市场调研、产品方案、数据分析、原型、运营复盘并不适合只用 diff 审。它们更适合被渲染成可视化 artifact，再按 section/block 反馈。

## 第三方使用观察：Codex CLI 作为本地文件 agent

Aman Mittal 在 2026-01-04 发布的《First few days with Codex CLI》提供了一个重要补充：Codex CLI 的真实使用场景已经越过软件开发，进入本地笔记、写作、任务管理和个人工作流自动化。

作者原本长期使用 Cursor，但在 Obsidian vault 这类非代码目录里遇到摩擦：如果只是为了整理 Markdown、改会议纪要、同步任务，就不想把整个 vault 放进 IDE。Codex CLI 的优势是可以直接 `cd` 到文件所在目录，让 agent 在本地文件系统里工作。

文章里的实际任务包括：

- 写会议总结。
- 整理任务和 Todo。
- 审稿、润色长文章。
- 给 Obsidian notes 生成索引。
- 从 Linear 同步任务到 Obsidian。

这个案例说明 Codex CLI 的产品价值不只来自“会写代码”，而是来自三个更基础的能力：

- agent 直接工作在用户已有目录里。
- `AGENTS.md`、`SKILL.md` 等规则文件可以被版本控制和复用。
- 本地文件、外部工具、MCP 和 durable skills 可以组合成长期 workflow。

文章还提到 Codex sessions 存在 `~/.codex/sessions/`，格式是 JSONL，并且 CLI 和 IDE/extension 表面共享这些 session。这个观察可以帮助理解 Codex 的 thread 机制，但 AgentHTML 不应把它当成稳定公开 API。更稳的做法仍然是让 AgentHTML 拥有自己的 `.agent-html/` durable source，把 Codex session 只作为可选上下文。

对 AgentHTML 最直接的启发是：`.agent-html/` 不应该只假设存在于 software repo。它也可以存在于 Obsidian vault、研究资料夹、产品资料夹、课程资料夹或任何需要 agent 反复加工的本地工作目录。

## 竞争格局

### Claude Code

Claude Code 官方定义是 agentic coding tool：能读代码库、编辑文件、运行命令，并集成 terminal、IDE、desktop app、browser。它还强调 CLAUDE.md、MCP、skills、hooks、多 agent、计划任务、远程/桌面/移动 handoff。

含义：Anthropic 和 OpenAI 的方向高度一致，市场正在从“AI code autocomplete”转向“多表面、长任务、可配置 agent 工作系统”。

### Cursor Background Agents

Cursor 的 background agents 是异步远程 agents，会在隔离 Ubuntu 机器中 clone GitHub repo、编辑和运行代码、推送分支，用户可以查看状态、follow-up 或接管。Cursor 还提供 Background Agents API，可程序化创建和管理 agents。

含义：IDE 公司也在把用户从 foreground chat 引向 background execution。用户最终需要的是“任务结果如何审、如何接管、如何继续”，而不是只看 agent 的聊天记录。

### Gemini CLI

Gemini CLI 官方仓库将其描述为 open-source AI agent，直接把 Gemini 带到 terminal。它强调 terminal-first、文件操作、shell 命令、web fetching、Google Search grounding、MCP、checkpointing、GEMINI.md、GitHub Action 集成。

含义：terminal agent 会变成通用入口，不只服务 OpenAI。AgentHTML 如果只依赖 Codex 私有能力，会限制市场；如果定义为 agent-generated HTML/React artifact host，就可以兼容 Gemini CLI、Claude Code、Copilot CLI 等。

### GitHub Copilot coding agent

GitHub Copilot 已经把 agent 放进 GitHub issue、PR、cloud agent、CLI、custom agents、MCP、skills、hooks 等工作流。

含义：GitHub 的优势在 repo/issue/PR 原生位置。AgentHTML 不应和 GitHub 抢 PR workflow，而应服务 PR 之外的大量 artifact：调研、方案、图表、原型、解释性文档、交互演示。

## 市场趋势

### 趋势 1：agent 入口分散，但工作对象收敛到 repo

Codex、Claude Code、Gemini CLI、Copilot、Cursor 都在不同入口竞争：terminal、IDE、desktop、browser、GitHub issue、API。但它们都在围绕真实项目目录或 repo 工作。

AgentHTML 的正确锚点不是“再做一个 app”，而是“在 repo 内定义 artifact 目录和 preview runtime”。

第三方 Codex CLI 使用案例进一步说明，这个“工作目录”不必是代码仓库，也可以是 Obsidian vault、写作资料夹、研究资料夹或团队运营资料夹。AgentHTML 的目录协议应该叫 directory-local 或 workspace-local，而不是只叫 repo-local。

### 趋势 2：chat transcript 不是最终交付物

Agent 的工作过程可以在 chat/thread/log 里发生，但用户真正需要审查的是结果：

- diff
- report
- prototype
- dashboard
- diagram
- runnable demo
- decision memo
- interactive walkthrough

Codex 解决了代码 diff 和 PR review。AgentHTML 可以解决非代码 artifact 的 review surface。

### 趋势 3：长期任务需要中间可视化

Long-running agent 的问题是用户很难持续理解它做到了哪里。日志太细，最终 diff 太晚。中间 artifact 可以承担“可检查进度”的作用。

AgentHTML 可以让 agent 在任务中途不断更新：

- `research.agent.tsx`
- `architecture-map.agent.tsx`
- `migration-plan.agent.tsx`
- `debug-board.agent.tsx`
- `launch-review.agent.tsx`

用户用 browser 打开 `localhost`，看到的是正在演化的工作产品，而不是翻一长串 terminal 输出。

### 趋势 4：可执行内容比静态 Markdown 更有价值

Markdown 适合线性文本，但很多 agent 输出天然需要交互：

- 筛选和排序市场玩家
- 展开证据链
- 切换方案版本
- 对比功能矩阵
- 查看代码路径和截图
- 调整参数并重算图表
- 给局部 block 下反馈

这也是为什么 AgentHTML 需要从纯语义积木转向 React/HTML artifact。React 不是为了“前端技术栈好看”，而是为了 state、events、hooks、data binding、interactive review surface。

## 对 AgentHTML 的产品判断

### 1. 不要做 Codex 替代品

Codex 已经拥有：

- 模型入口
- auth
- sandbox
- approval
- shell execution
- MCP
- skills
- thread/session
- cloud/background task
- code review

AgentHTML 复制这些只会进入高成本竞争。AgentHTML 应该站在 Codex 之后：Codex 负责做事，AgentHTML 负责把结果变成可持续运营的 artifact。

### 2. 从 App-first 转为 localhost-first

原方向里的 App 可以作为高级控制台，但不应是产品成立前提。更轻的 v1 应该是：

```text
codex / claude / gemini / user
  -> writes .agent-html/*
  -> agent-html dev server indexes artifacts
  -> user opens localhost
  -> user reviews rendered artifact
  -> feedback references artifact/block
  -> agent edits source again
```

这样 AgentHTML 可以被 Codex CLI 自然运行：

```text
codex "用 AgentHTML 做一份竞品调研报告，保存到 .agent-html/artifacts/codex-market.agent.tsx"
agent-html dev
```

这里的 workspace 可以是 software repo，也可以是普通本地资料目录。Codex CLI 的实际用户已经在 Obsidian、文章草稿、任务列表等非代码资产上使用 agent；AgentHTML 应该承接这种更宽的 HTML artifact 需求。

### 3. React/HTML 应成为主 artifact 形态

当前语义 DSL 的优势是稳定、可验证、适合 LLM 生成。但它缺少 state、hooks、script、事件系统，导致不能承载复杂交互。

建议方向：

- React/TSX 作为主 artifact source。
- `Artifact`、`Block`、`Action`、`Citation` 等作为轻量语义层。
- 语义不再是 XML-like DSL 的限制，而是 React component contract。
- 旧 `.ahtml` 可以作为兼容/低代码输入，但不作为唯一主线。

示意：

```tsx
import { Artifact, Block, Citation } from "@agent-html/runtime";

export default function CodexResearch() {
  return (
    <Artifact title="Codex 市场调研" kind="research">
      <Block id="summary" title="结论">
        <p>Codex 是 repo-local agent 工作系统，不只是聊天式代码助手。</p>
      </Block>
      <Block id="competition" title="竞争格局">
        {/* interactive table, filters, charts */}
      </Block>
      <Citation href="https://developers.openai.com/codex/quickstart" />
    </Artifact>
  );
}
```

### 4. 不要把场景收窄到开发模板

Codex 是强入口，但 HTML artifact 的市场不只在开发。

AgentHTML 可以覆盖：

| 场景 | Artifact 形态 | 为什么 Markdown 不够 |
| --- | --- | --- |
| 市场调研 | 竞品矩阵、证据卡片、筛选器 | 需要比较、过滤、引用追踪 |
| 产品规划 | roadmap、用户旅程、方案对比 | 需要版本切换和局部反馈 |
| 数据分析 | dashboard、图表、异常 Drilldown | 需要交互图表和参数调整 |
| 软件开发 | 架构图、debug board、migration plan | 需要链接代码路径、状态、测试结果 |
| 教育内容 | interactive lesson、quiz、simulation | 需要状态和用户输入 |
| 运营复盘 | timeline、指标、事件关联 | 需要时间轴、展开、证据链 |
| 设计原型 | 可点击 prototype、component states | 需要真实交互 |
| 个人规划 | 决策表、预算、行程、目标追踪 | 需要局部编辑和计算 |

早期可以从开发者切入，因为 Codex CLI 给了天然分发路径。但产品叙事应是“agent-generated interactive artifacts”，不是“四个开发模板”。

## 建议的产品形态

### v1：Repo-local artifact host

核心命令：

```text
agent-html init
agent-html dev
agent-html build
```

核心目录：

```text
.agent-html/
  artifacts/
    codex-market-research.agent.tsx
    product-roadmap.agent.tsx
  data/
  manifest.json
  AGENTS.md
```

核心体验：

1. agent 在当前 repo 生成或修改 artifact。
2. `agent-html dev` 启动 localhost。
3. browser 展示 artifact index 和单个 artifact 页面。
4. 每个 `Block` 有稳定 id，可复制引用。
5. 用户把 block 引用交回 Codex，让 agent 精确修改。

### v2：Agent feedback loop

在 v1 基础上增加：

- block-level prompt action
- artifact diff view
- source/render split view
- run metadata
- citations/evidence panel
- optional Codex app-server integration

这里的 Codex app-server 只做可选增强。原因是它目前是 experimental，官方说明主要用于 local development/debugging，可能变化。

### v3：Multi-agent artifact protocol

把 AgentHTML 做成跨 agent 的 artifact contract：

- Codex CLI 可生成。
- Claude Code 可生成。
- Gemini CLI 可生成。
- Copilot CLI/GitHub agent 可生成。
- 普通人也可手写 React artifact。

这比绑定 Codex thread 更稳。Codex 是初始渠道，不是唯一平台。

## 风险

### 风险 1：如果继续 App-first，会和 Codex App/Cursor/Claude Desktop 竞争

桌面 app 不是没有价值，但它是重形态。Codex App 已经在做 command center、worktrees、cloud environments、review surface。AgentHTML 早期没有必要正面进入。

规避：先做 localhost-first artifact runtime，让任何 agent 都能生成内容。

### 风险 2：如果继续 DSL-only，会卡在交互能力

市场需要的是能执行、能筛选、能展开、能输入、能响应状态的 artifact。没有 state/hooks/script 的 DSL 很难承载这类需求。

规避：React-first，语义层作为 component contract，而不是完整替代 React。

### 风险 3：如果依赖 Codex 私有 thread，会被平台变化锁死

Codex thread/session 是强上下文，但不是 AgentHTML 应拥有的 durable source。AgentHTML 应读取自己的 `.agent-html/` 文件，而不是把 Codex 历史当数据库。

规避：Codex integration optional；artifact source independent。

### 风险 4：如果定位只讲开发，会错过更大的 artifact 市场

开发者是高频早期用户，但 HTML 的优势是可交互、可视化、可分享。这适合市场、产品、教育、运营、研究、设计等更多场景。

规避：示例从开发切入，但 product category 写成 interactive artifacts。

## 建议的战略表述

AgentHTML 是 agent-generated interactive artifacts 的本地运行时。

它让 Codex、Claude Code、Gemini CLI、Copilot 等 agent 把一次性文本输出升级为：

- repo-local durable source
- localhost preview
- React-powered interaction
- block-addressable review
- reusable artifact history
- exportable/shareable HTML

一句更短的产品定位：

> AgentHTML turns agent output into local, interactive, reviewable HTML artifacts.

中文定位：

> AgentHTML 把 agent 输出变成可在本地预览、可交互审阅、可持续迭代的 HTML 工件。

## 推荐下一步

1. 暂停把重点放在 `Project > Section > Cell > Block > UI` 的完整 app/workspace 层级上。
2. 定义 `.agent-html/` repo-local 目录协议。
3. 定义 React artifact public API：`Artifact`、`Block`、`Citation`、`Action`。
4. 做 `agent-html dev`：扫描 `.agent-html/artifacts/*.agent.tsx`，启动 localhost preview。
5. 写一份 Codex CLI 使用说明，让 Codex 能在当前 repo 生成 artifact。
6. 保留旧 `.ahtml` runtime 作为兼容能力，但新产品主线转向 React-first。

## Sources

- [OpenAI Codex product page](https://openai.com/codex/)
- [OpenAI Codex quickstart](https://developers.openai.com/codex/quickstart)
- [OpenAI Codex CLI reference](https://developers.openai.com/codex/cli/reference)
- [OpenAI Codex best practices](https://developers.openai.com/codex/learn/best-practices)
- [Building more with GPT-5.1-Codex-Max](https://openai.com/index/gpt-5-1-codex-max/)
- [First few days with Codex CLI](https://amanhimself.dev/blog/first-few-days-with-codex-cli/)
- [Claude Code overview](https://code.claude.com/docs/en/overview)
- [Cursor Background Agents](https://docs.cursor.com/background-agent)
- [Gemini CLI GitHub repository](https://github.com/google-gemini/gemini-cli)
- [GitHub Copilot cloud agent sessions](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/start-copilot-sessions)
