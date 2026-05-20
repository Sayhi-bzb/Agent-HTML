# Design System: tweakcn Theme Editor
**Project ID:** local workspace `D:\codes\tweakcn`

## 1. Visual Theme & Atmosphere

tweakcn 的编辑器不是“配置页”，而是典型的全屏工作台。整体气质偏冷静、紧凑、工具化，视觉主张是让用户持续停留在一个可编辑、可预览、可切换的创作环境里，而不是逐段填写表单。

它的页面层次有几个明显特征：

- 顶层是 `h-svh` 的满屏 shell，外层几乎不使用大面积装饰背景。
- 顶栏、控制栏、预览栏主要用细边线 `border-b` 分层，而不是大量卡片容器。
- 左右两栏是连续工作台，通过 `ResizablePanelGroup` 构成可拖拽的编辑器骨架。
- 右侧预览区是主舞台，工具条、标签切换、滚动预览和全屏态都围绕预览展开。
- 交互 affordance 很强，按钮、pill tabs、dropdown、inspector、fullscreen 都在持续强调“这是一个编辑器”。

如果用设计语言描述，它更接近：

- Dense but breathable
- Neutral, utilitarian, product-editor oriented
- Flat-to-soft elevation
- Structured, inspectable, continuously interactive

## 2. Color Palette & Roles

### Core light tokens

- **Pure editorial white** (`oklch(1 0 0)`): 用于 `background`、`card`、`popover`，让编辑器主体保持干净、可长时间停留。
- **Near-black graphite** (`oklch(0.145 0 0)`): 用于 `foreground` 与主要文字，承担高可读性的主体信息。
- **Ink-black action fill** (`oklch(0.205 0 0)`): 用于 light 模式的 `primary`，强调主按钮与高优先级动作。
- **Powder neutral wash** (`oklch(0.97 0 0)`): 用于 `secondary`、`muted`、`accent`，形成浅层底板、pill 激活面和弱强调背景。
- **Soft gray rule** (`oklch(0.922 0 0)`): 用于 `border`、`input`，构成细线边界和浅输入描边。
- **Measured muted caption** (`oklch(0.556 0 0)`): 用于 `muted-foreground`，支撑说明文字、辅助标签和次级元信息。
- **Warm alert red** (`oklch(0.577 0.245 27.325)`): 用于 `destructive`，明显但不过度刺眼。

### Core dark tokens

- **Charcoal workspace black** (`oklch(0.145 0 0)`): dark 模式主背景，保持编辑器连续性。
- **Off-white reading ink** (`oklch(0.985 0 0)`): dark 模式主文字与反白文字。
- **Soft dark panel** (`oklch(0.205 0 0)`): dark 模式 `card` 与局部面板底色。
- **Raised dark popover** (`oklch(0.269 0 0)`): dark 模式浮层与二级容器底。
- **Bright neutral action** (`oklch(0.922 0 0)`): dark 模式 `primary`，形成强对比操作入口。
- **Mid-dark accent plane** (`oklch(0.371 0 0)`): dark 模式 `accent`，用于 hover/active 辅助状态。
- **Dim steel border** (`oklch(0.275 0 0)`): dark 模式边界线，存在感轻但清晰。
- **Cool violet sidebar accent** (`oklch(0.488 0.243 264.376)`): dark sidebar 的主强调色，是整套系统里少数更鲜明的色相锚点。

### Functional palette roles

- **Chart blues and violets** (`chart-1` 到 `chart-5`): 用于数据预览和主题系统的可视化延伸，不抢占编辑器主任务。
- **Sidebar-specific neutrals** (`sidebar-*`): 说明 tweakcn 把导航/控制区域视为独立语义层，而不只是普通卡片。
- **Ring neutrals** (`ring` light `oklch(0.708 0 0)` / dark `oklch(0.556 0 0)`): 焦点与活跃状态偏克制，不使用高饱和品牌色。

## 3. Typography Rules

- **Primary UI font**: 默认是系统无衬线栈 `ui-sans-serif, system-ui, ...`，说明产品优先考虑稳定性和系统级可读性，而不是品牌装饰。
- **Serif companion**: 默认 serif 是 `Georgia / Cambria / Times` 风格，用于局部强调或展示型内容，而不是承载工具界面主文本。
- **Monospace channel**: 默认 mono 是 `SFMono / Menlo / Consolas / Courier New`，广泛用于代码、变量、token、快捷提示和数值输入。
- **Tracking**: 全局使用 `--letter-spacing` 驱动 `tracking-*`，默认是 `0em`，所以整体字距中性、不做品牌化拉伸。
- **Weight hierarchy**:
  - 顶层产品名和主要 section title 使用较稳的 `font-medium` / `font-semibold`
  - 辅助标签经常压到 `text-[11px]` 与 `uppercase`
  - 说明文字大多保持 `text-sm` 或更小，避免把编辑器做成营销页

整体文字观感不是“强品牌排版”，而是“高密度、稳定、工程化”的产品排版。

## 4. Component Stylings

- **Buttons:** 以 `ghost`、`outline` 为主。它们不是大块 CTA，而是工具栏动作、模式切换和二级操作入口。很多按钮弱化阴影，强调 hover、active、focus 与 icon affordance。
- **Tabs / Pills:** 关键标签切换统一收敛成圆角 pill。`TabsTriggerPill` 的激活态用 `bg-secondary` + `text-secondary-foreground`，形成柔和但清晰的模式切换语言。
- **Cards / Containers:** tweakcn 使用 card，但更常见的是“局部容器”而不是“整页卡片化”。局部容器多为 `rounded-lg`、轻边框、低阴影，尽量不切碎页面主结构。
- **Inputs / Forms:** 输入框通常偏紧凑，常配合 `bg-muted/50`、细边框、小字号和 mono 文本。它们服务于编辑效率，而不是视觉展示。
- **Control sections:** 左栏常见折叠 section，标题用超小号 uppercase 标签放在轻量背景胶囊里，形成“工具抽屉”而不是“内容卡片”。
- **Preview containers:** 预览区外层强调 `ScrollArea`、`ExamplesPreviewContainer`、可横向滚动和 `@container` 响应，而不是靠 summary cards 解释内容。
- **Toolbar:** Action bar 与 preview tab bar 都是细条式横向结构，靠 `border-b` 分层。视觉像 IDE / design tool，而不是 settings form。
- **Depth & elevation:** 阴影整体克制。默认 shadow token 是 `0 1px 3px` 级别的 whisper-soft depth，不追求厚重悬浮感。

## 5. Layout Principles

- **Full-screen shell first:** 外层先定义一个持续存在的应用壳，而不是先生成一页内容再往里塞组件。
- **Continuous workbench:** 左控制区和右预览区属于同一个连续平面，主要靠边线和间距分区。
- **Resizable desktop split:** 桌面端默认是可拖拽左右分栏，控制区宽度会被视作体验的一部分。
- **Tabbed mobile fallback:** 移动端不保留双栏，而是改成 `Controls / Preview` tabs，维持“同一个工具”的感觉。
- **Scroll containment:** 控制区和预览区各自管理滚动，避免整个页面长滚动破坏工作台语义。
- **Density with rhythm:** 虽然信息密度高，但通过 `h-14` 条带、`px-4`、pill tabs、折叠 section 和 consistent gaps 维持秩序。
- **Preview dominance:** 预览区始终是主要视觉重心；控制区服务于修改，预览区负责说服。

## 6. Editor Shell Notes

和普通 shadcn 示例页相比，tweakcn 最重要的不是 token，而是“编辑器框架语言”：

- header 是 app header，不是 hero 或 marketing nav
- 控制区是 panel system，不是表单卡片堆栈
- preview 区是工作舞台，不是静态组件陈列板
- actions 贴近 preview，而不是散落在配置区
- tabs 是工作模式切换，不是内容装饰

这也是后续把 `ahtml gallery` 向 tweakcn 视觉靠拢时，最值得复用的部分。

## 7. Gallery Contrast Notes

当前 `ahtml gallery` 已经使用了 shadcn primitives，但整体仍偏“配置页”：

- 顶栏、左栏、右栏都还是明显的 card frame
- 左侧以 section card 纵向堆叠为主，像一组配置模块
- 右侧 preview 先展示摘要，再展示组件展柜，主舞台感不足
- 页面主要靠容器包裹来分层，而不是靠 editor shell、toolbar、tabs 与滚动边界来构建工作台

因此它和 tweakcn 的关键差距，不在“有没有 shadcn 组件”，而在“页面是否已经长成一个编辑器”。
