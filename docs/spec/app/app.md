```
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│<panel-left><right>|tab 1|tab 2|<+>icon                                                       <min><max><close>│
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

关联审计：[`audit.md`](./audit.md)

**三栏工作台布局**：左侧是 Session rail，中间是 `Workbench` 主工作区，右侧是 `Agent Shell` 审查与提案区；上方是全局状态栏，不是传统浏览器 tab 栏。

## 1. 页面整体结构

```text
AppShell
├── TopBar
│   ├── Brand / Workspace identity
│   ├── Current session summary
│   └── Active workbench view + runtime status
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
│       ├── Review timeline / readiness
│       ├── Proposal and context cards
│       └── Message composer / session chat
```

## 2. 区域职责

### 顶部栏

顶部栏主要承担 **当前工作上下文展示 + 会话状态摘要**，不是传统意义上的 tab 管理器。

在当前项目里，它更接近：

```text
TopBar
├── TopbarMark
├── ProductLabel: agent-html-app
├── SessionPath
├── CurrentSessionName
├── ActiveViewLabel: Workbench · preview/source/inspect
└── StatusMeta
```

其中：

* 左侧标识当前产品与工作路径
* 中间展示当前 session 名称
* 右侧展示当前 workbench 视图与状态摘要
* 当前实现里没有浏览器式 tab、多窗口控制、也没有顶部新增 tab 按钮

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

### 建议功能

| 模块 | 在本项目中的作用 |
| --- | --- |
| `New Session` | 创建新的 `ahtml` 会话 |
| `Search` | 按 session 名称或目录过滤历史会话 |
| `Session Groups` | 按 `Current / Pinned / Needs attention / Recent` 分组 |
| `Session Item` | 打开、重命名、置顶、删除某个 session |
| `Resize Handle` | 拖拽调整左侧 rail 宽度 |

这里的 `resiable ->` 应该是 `resizable ->`，表示左侧栏右边界可以拖拽调整宽度。

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
* `Inspect`：查看 diagnostics、review focus、proposal 对比和检查结果

建议把中间区域理解为 **主制作区 / 主审查区**，而不是单一 viewer：

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
├── Review Timeline
├── Readiness / proposal cards
├── Context / comparison cards
└── Composer
```

它的主要职责包括：

* 展示 session 级消息流
* 展示 proposal、decision、context-card
* 提供 review timeline 与 readiness 提示
* 驱动从 proposal 到 `Preview / Source / Inspect` 的跳转
* 作为 agent 协作入口，而不是裸 CLI 输入框

它会和中间 `Workbench` 双向联动：

* 从 `Agent Shell` 跳到 `Source` 查看焦点片段
* 从 `Agent Shell` 跳到 `Inspect` 继续 review
* 根据 build / inspect / validation 结果更新 proposal readiness

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
SessionsSidebar: 15
Workbench: 63
AgentShell: 22
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
  - `app-shell-surface-pane`
  - `app-shell-card-heading`
  - `app-shell-preview-canvas`
  - `shell-content` 局部共享包装：`ShellEmptyCard`、`ShellCardCopy`、`ShellMetricList`、`ShellLoadingRow`
  - `shell-content` 语义组合：`ShellCardHeader`、`ShellStatusBadge`
  - `shell-content` 壳层文本/块级组合：`ShellTitleStack`、`ShellPaneLabel`、`ShellSupportingCopy`、`ShellSurfaceItem`、`ShellSectionLabel`
  - `shell-content` 壳层行级组合：`ShellSplitRow`、`ShellActionGroup`、`ShellMetaRow`、`ShellStatusRow`、`ShellPaneHeader`
  - `shell-content` workbench 骨架：`ShellWorkbenchCard`
  - `shell-content` 三栏 pane 骨架：`ShellPaneScaffold`

这意味着：

- `AppShell` 的常用布局参数不再主要依赖 feature 文件里的局部原子值
- 页面壳层新增代码默认应消费 shell contract，而不是重新写一套 `p-*` / `gap-*` / `h-*`
- 一部分高频内容模式也已开始从 feature 内联写法收敛成可复用语义类
- `mock preview` 仍然允许保留独立视觉体系，但它被视为 preview artifact 示例，不再作为 app shell theme 的依据

另外，当前治理不只是视觉层面：

- `SessionRail` 已经去掉了 button 套 button 的交互结构；
- `SourceTab` 的 validating 状态链已经接通，不再是假 UI。
- mock 浏览器模式下的 session 切换、proposal、send message、build / inspect / doctor 等动作也已接入本地状态流，不再只是静态展示。
- `Build` 现在会在前置保存失败时中止，而不是继续运行后续 build。
- mock 浏览器模式下的 `Inspect` 与 `Proposal` 也已回到“消费已保存 source”的边界，和 Tauri 运行时保持一致。
- build / inspect 完成后的当前 workbench view 现在会重新对齐 session record，不再出现后端和前端对当前 tab 认知不一致的情况。
- `saving / building / inspecting / drafting / checking` 这些命令态现在已经进入对应 panel，而不只是停留在内部 state。
- Tauri `Build` 执行期间，当前 session 的左栏状态徽标也会进入 `building` 过渡态。
- 左栏 session badge 现在表达真实 session status，而不是把“当前选中”误当状态颜色。
- 关键命令按钮和 session rail 操作在运行态下已做基础禁重入。
- 当前又补上了 session 级命令锁：在同一条会话命令链执行期间，session 切换、source 编辑、workbench tab/build/inspect、proposal/send 不再交叉重入。
- Tauri `Build` 若在 optimistic `building` 过渡态后失败，前端现在会重新 hydrate 当前 session，回收过渡态而不是把 summary 留在假 `building`。
- mock `Inspect` 也不再把上一轮成功 build 的结果错误覆盖成失败态。

仍需继续治理的部分，以 [`audit.md`](./audit.md) 的当前状态为准。

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
| 在 `Agent Shell` 中选择 review focus | 定位到相关 `Source` 或 `Inspect` 内容 |
| 拖拽右侧边界 | 调整 `AgentShell` 宽度 |

键盘语义也已经存在明确映射：

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
