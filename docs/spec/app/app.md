```
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│<panel-left>icon<right>icon|tab 1|tab 2|<+>icon                                               <min><max><close>│
│panel-header─────┬──────────────────────────────────────────────────────────────┬──────────────────────────────┤
│new session      │                                                              │                              │
│search           │                                                              │                              │
│panel-content────┤                                                              │                              │
│<session 1>button│                                                              │                              │
│<session 2>button│                                                              │                              │
│ ...             │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│         resiable│                                                              │                              │
│               ->│                    preview / source / inspect                │          agent shell         │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│                 │                                                              │                              │
│panel-footer─────┤                                                              │                              │
│<setting>icon    │                                                              │                              │
╰─────────────────┴──────────────────────────────────────────────────────────────┴──────────────────────────────╯
```

关联设计约束：[`apps/agent-html-app/DESIGN.md`](../../../apps/agent-html-app/DESIGN.md)

**三栏工作台布局**：左侧是 Session rail，中间是 `Workbench` 主工作区，右侧是 `Agent Shell` 审查与提案区；上方是全局状态栏，不是传统浏览器 tab 栏。

## 1. 页面整体结构

```text
AppShell
├── TopBar
│   ├── Brand / Product identity
│   ├── Current session name
│   └── Active workbench view + runtime / error meta
│
├── MainLayout
│   ├── SessionsSidebar
│   │   ├── PanelHeader
│   │   │   ├── New Session
│   │   │   └── Search
│   │   ├── SessionGroups
│   │   │   ├── Current
│   │   │   ├── Pinned
│   │   │   ├── Needs attention
│   │   │   └── Recent
│   │   └── ResizeHandle
│   │
│   ├── Workbench
│   │   ├── WorkbenchHeader
│   │   │   ├── ViewTabs: Preview / Source / Inspect
│   │   │   ├── Build
│   │   │   └── Inspect
│   │   └── ActiveViewPanel
│   │       ├── PreviewPanel
│   │       ├── SourcePanel
│   │       └── InspectPanel
│   │
│   └── AgentShell
│       ├── Proposal and context cards
│       ├── Runtime check summary
│       └── Message composer / session notes
```

## 2. 区域职责

### 顶部栏

顶部栏主要承担 **当前工作上下文展示 + 轻量运行态提示**，不是传统意义上的 tab 管理器。

在当前项目里，它更接近：

```text
TopBar
├── BrandMark: agent-html
├── CurrentSessionName
└── ActiveViewBadge + RuntimeMeta + ErrorMeta
```

其中：

* 左侧标识当前产品
* 中间展示当前 session 名称
* 右侧展示当前 workbench 视图 badge，以及 runtime / error meta icon
* 当前实现里不展示 session path 或 workspace path，也没有浏览器式 tab、多窗口控制、顶部新增 tab 按钮

因此，草图里的这些占位符在我们项目中应理解为：

| 草图占位 | 项目内对应语义 |
| --- | --- |
| `panel-left` | 左侧 `SessionsSidebar` 所在的会话轨道 |
| `right` | 右侧 `Agent Shell` 所在的审查轨道 |
| `tab 1 / tab 2` | 中间 `Workbench` 的视图切换：`Preview / Source / Inspect` |
| `<+>icon` | 不对应顶部新增 tab；当前 app 的创建入口是左侧 `New Session` |
| `<min><max><close>` | 不属于当前前端信息架构；窗口级操作由 Tauri 容器负责 |

---

## 3. 左侧面板

左侧面板是 **Session 管理区**，实际是一个 session rail，而不是通用文件导航栏。

```text
SessionsSidebar
├── Header
│   ├── SessionSearch
│   └── New Session
├── SessionGroups
│   ├── Current
│   ├── Pinned
│   ├── Needs attention
│   └── Recent
├── SessionCards
│   ├── Open session
│   ├── Rename
│   ├── Pin / unpin
│   └── Delete
└── Resize Handle
```

### 当前功能

| 模块 | 在本项目中的作用 |
| --- | --- |
| `New Session` | 创建新的 `ahtml` 会话 |
| `Search` | 按 session 名称或目录过滤历史会话 |
| `Session Groups` | 按 `Current / Pinned / Needs attention / Recent` 分组 |
| `Session Item` | 打开、重命名、置顶、删除某个 session |
| `Resize Handle` | 拖拽调整左侧 rail 宽度 |

这里的 `resiable ->` 应该是 `resizable ->`，表示左侧栏右边界可以拖拽调整宽度。

当前代码里，`open`、`search`、`create`、`rename`、`pin / unpin`、`delete` 已经接通，且继续保持在左栏低频 action menu 里，而不是回流成常驻编辑表单。

左侧面板当前使用的状态语义是：

```text
draft | dirty | building | error | ready
```

这些状态直接服务于 session 工作流，而不是通用文档列表。

---

## 4. 中间 Workbench

中间不是单一 `Live Page`，而是 **三视图工作台**。

```text
Workbench
├── WorkbenchHeader
│   ├── ViewTabs
│   │   ├── Preview
│   │   ├── Source
│   │   └── Inspect
│   ├── Build
│   └── Inspect
└── ActiveViewPanel
    ├── PreviewPanel
    ├── SourcePanel
    └── InspectPanel
```

它承担的不是泛化的“页面实时预览”，而是围绕 `ahtml session` 的核心制作与审查循环：

* `Preview`：显示 build 后的静态产物预览
* `Source`：编辑与校验当前 session 的源文档
* `Inspect`：查看 diagnostics 和检查输出

这里更适合把中间区域理解为 **主制作区 / 主审查区**，而不是单一 viewer：

```text
flex: 1
min-width: 0
```

这样左右两侧轨道调整宽度时，中间 workbench 可以自动伸缩。

---

## 5. 右侧 Agent Shell

右侧也不是普通 terminal，而是 **Agent Shell 审查面板**。

```text
AgentShell
├── ShellHeader
├── Proposal cards
├── Context cards
├── Runtime check summary
└── Composer
```

它的主要职责包括：

* 展示 session 级 note 流
* 展示 proposal 与 context card
* 展示次级 runtime check 摘要
* 作为 agent 协作入口，而不是裸 CLI 输入框

当前实现里，它和中间 `Workbench` 的关系仍然以“共享同一 session 状态”为主，而不是已经打通的焦点跳转：

* `proposal` 和 `check` 会消费当前 session 的 source / runtime 结果
* 右栏还没有实现 `review focus` 到 `Source / Inspect` 的定位跳转
* readiness / timeline 仍属于后续增强项

因此草图中的 `terminal`，在本项目中更准确的名称应为：

```text
Agent Shell / Review Rail / Proposal Rail
```

---

## 6. 推荐的布局模型

这个页面最适合用 **App Shell + Resizable Three-Pane Workspace** 来实现。

概念上可以是：

```text
height: 100vh
display: flex
flex-direction: column
```

顶部栏固定高度：

```text
TopBar: compact utility/status bar
```

主体区域占满剩余空间：

```text
MainLayout:
display: flex
flex: 1
overflow: hidden
```

当前项目的三栏宽度语义更接近：

```text
SessionsSidebar: 17
Workbench: 60
AgentShell: 23
```

这是当前默认布局权重，而不是固定像素值。布局重点是：

* 左侧会话 rail 保持紧凑
* 中间 workbench 拿到主要空间
* 右侧 agent shell 保持可读的审查宽度

---

## 7. 组件命名建议

如果按当前项目语义来表达，推荐使用现有命名，而不是再引入通用 IDE 占位名：

```text
App
├── TopBar
├── SessionsSidebar
├── Workbench
│   ├── PreviewPanel
│   ├── SourcePanel
│   └── InspectPanel
├── ResizableHandle
└── AgentShell
```

如果是 React 结构，可以概括成：

```tsx
<App>
  <TopBar />

  <ResizablePanelGroup direction="horizontal">
    <SessionsSidebar />
    <Workbench />
    <AgentShell />
  </ResizablePanelGroup>
</App>
```

这种表达和项目里的真实组件树一致，也不会误导成浏览器 tab + terminal 的传统 IDE 模型。

---

## 当前治理状态

当前实现已经补上了一层明确的 app shell contract，用来收敛之前散落在页面层的布局值。

当前前端壳层已具备：

- 集中的 panel 比例与最小宽度约束
- 集中的 top bar / pane header / pane footer / pane content spacing token
- 集中的 shell 语义类，例如：
  - `app-shell-pane-header`
  - `app-shell-pane-content`
  - `app-shell-pane-footer`
  - `app-shell-split-row`
  - `app-shell-surface-grid`
  - `app-shell-status-row`
  - `app-shell-loading-row`
  - `app-shell-search-field`
  - `app-shell-session-card-trigger`
  - `app-shell-scroll-pane`
  - `app-shell-scroll-surface`
  - `app-shell-scroll-surface-roomy`
  - `app-shell-card-heading`
  - `app-shell-preview-canvas`
  - `app-shell-console-section`
  - `app-shell-composer-field`
  - `shell-content` 局部共享包装：`ShellEmptyCard`、`ShellCardCopy`、`ShellMetricList`、`ShellLoadingRow`
  - `shell-content` 语义组合：`ShellCardHeader`、`ShellStatusBadge`
  - `shell-content` 壳层文本/块级组合：`ShellPaneLabel`、`ShellSurfaceItem`、`ShellSectionLabel`
  - `shell-content` 壳层行级组合：`ShellSplitRow`、`ShellActionGroup`、`ShellActionButton`、`ShellIconButton`、`ShellMetaRow`、`ShellStatusRow`、`ShellPaneHeader`
  - `shell-content` 滚动内容组合：`ShellScrollSurface`
  - `shell-content` 输入/检索组合：`ShellSearchField`
  - `app-shell` 根层 pattern：`TopBar`、`MainLayout`
  - `feature-scoped pattern`：`WorkbenchHeader`、`WorkbenchTabs`、`SourceHeader`、`PreviewHeader`、`InspectHeader`、`ShellHeader`、`ShellComposer`、`SessionRailHeader`、`SessionCard`
  - `feature-scoped content pattern`：`WorkbenchCard`、`PreviewFrame`、`SourceEditorField`、`SourceValidationSummary`、`InspectDiagnosticList`、`InspectConsoleSection`、`MessageBody`、`ComposerField`、`ShellCardFrame`
  - `shell-content` 三栏 pane 骨架：`ShellPaneScaffold`

这意味着：

- `AppShell` 的常用布局参数不再主要依赖 feature 文件里的局部原子值
- 页面壳层新增代码默认应消费 shell contract，而不是重新写一套 `p-*` / `gap-*` / `h-*`
- 一部分高频内容模式也已开始从 feature 内联写法收敛成可复用语义类
- `mock preview` 仍然允许保留独立视觉体系，但它被视为 preview artifact 示例，不再作为 app shell theme 的依据
- 对应模板已经集中在 `features/app-shell/mock-preview-artifact.ts`，不再和 app shell 的 mock 状态/流程代码混写
- 当前 app 代码侧也没有新的裸色、`style=` 或匿名 layout 常量回流，剩余治理重点已经转成更高层的 feature/content pattern 边界，而不是回到基础样式散落阶段

另外，当前治理不只是视觉层面：

- `SessionRail` 已经去掉了 button 套 button 的交互结构；
- `SourceTab` 的 validating 状态链已经接通，不再是假 UI。
- mock 浏览器模式下的 session 切换、proposal、send message、build / inspect / runtime check 等动作也已接入本地状态流，不再只是静态展示。
- `AgentShell` 现在会把 `proposal / context` 卡片稳定置于 runtime check 摘要之前，避免右栏重新退回 check-first。
- `RuntimeReportCard` 现在会收敛成次级摘要卡，而不是右栏主导内容面。
- `Build` 现在会在前置保存失败时中止，而不是继续运行后续 build。
- mock 浏览器模式下的 `Inspect` 与 `Proposal` 也已回到“消费已保存 source”的边界，和 Tauri 运行时保持一致。
- build / inspect 完成后的当前 workbench view 现在会重新对齐 session record，不再出现后端和前端对当前 tab 认知不一致的情况。
- `saving / building / inspecting / drafting / checking` 这些命令态现在已经进入对应 panel，而不只是停留在内部 state。
- Tauri `Build` 执行期间，当前 session 的左栏状态徽标也会进入 `building` 过渡态。
- 左栏 session badge 现在表达真实 session status，而不是把“当前选中”误当状态颜色。
- 关键命令按钮和 session rail 操作在运行态下已做基础禁重入。
- 当前又补上了 session 级命令锁：在同一条会话命令链执行期间，session 切换、source 编辑、workbench tab/build/inspect、proposal/send 不再交叉重入。
- `ShellCardHeader` 当前已回到极简头部默认值，不再把 `description` 当共享默认 affordance。
- `Empty` 现在已经成为左栏、右栏和 preview canvas 的统一空态词汇。
- Tauri `Build` 若在 optimistic `building` 过渡态后失败，前端现在会重新 hydrate 当前 session，回收过渡态而不是把 summary 留在假 `building`。
- mock `Inspect` 也不再把上一轮成功 build 的结果错误覆盖成失败态。

当前这轮 app shell 的基础壳层与规范同步已经完成收口；[`todo.md`](./todo.md) 主要保留这轮对齐记录。

后续新增 UI 仍需继续遵守 [`apps/agent-html-app/DESIGN.md`](../../../apps/agent-html-app/DESIGN.md) 里的 guardrail，不得把已收敛的布局、primitive 入口和 token 边界重新打散。

---

## 8. 交互逻辑

这个页面核心交互在当前项目里可以归纳为：

| 交互 | 行为 |
| --- | --- |
| 点击 `New Session` | 创建新的 `ahtml` session，并加入左侧列表 |
| 点击 `Session Item` | 切换当前 session |
| 搜索 `Session` | 过滤左侧 session 列表 |
| 拖拽左侧边界 | 调整 `SessionsSidebar` 宽度 |
| 点击 `Preview / Source / Inspect` | 切换中间 workbench 视图 |
| 点击 `Build` | 运行当前 session 的构建流程并刷新 preview |
| 点击 `Inspect` | 运行 inspect 流程并更新诊断与审查信息 |
| 在 `Source` 中编辑 | 更新 session draft，并触发轻量校验 |
| 保存 source | 将草稿写回 session 源文件 |
| 点击 `Draft proposal` | 在右侧生成当前 session 的 proposal 卡片 |
| 点击 `Run check` | 在右侧生成 runtime 检查摘要 |
| 在 `Agent Shell` 中输入并发送消息 | 追加当前 session note |
| 拖拽右侧边界 | 调整 `AgentShell` 宽度 |

当前代码侧尚未接通全局快捷键。如果后续补上，建议沿用：

```text
Cmd/Ctrl+K  聚焦 session 搜索
Cmd/Ctrl+S  保存 source
Cmd/Ctrl+Enter  Build
Cmd/Ctrl+Shift+I  Inspect
Cmd/Ctrl+1/2/3  切换 Preview / Source / Inspect
```

---

## 9. 信息架构总结

这个 Page 在本项目中更准确的定义是：

> 一个围绕 `ahtml` session 的本地优先桌面工作台，用来管理会话、编辑 source、构建 preview，并在 agent shell 中完成审查与提案闭环。

更具体一点：

```text
页面类型：Local-first desktop workbench
核心对象：Session、Preview、Source、Inspect、Agent Shell
主要目标：围绕单个 session 完成编辑、构建、检查、审查
布局方式：顶部状态栏 + 左侧 session rail + 中间 workbench + 右侧 agent shell
```

比较推荐把它定义为：

```text
Workbench / Review Studio / Session Workspace
```

而不是普通单页，也不是传统意义上的浏览器 tab + terminal IDE。它更像一个 **围绕 `ahtml` session 生命周期组织的审查型工作台外壳页面**。
