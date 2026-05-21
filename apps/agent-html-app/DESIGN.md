# agent-html-app Design System

`agent-html-app` 是一个围绕 `ahtml session` 工作流组织的本地优先桌面工作台。  
它不是 marketing site，不是通用 shadcn 组件展示页，也不是卡片驱动的 SaaS dashboard。

这份文档是 `agent-html-app` 的设计源文件，用来约束：

- 页面整体信息架构
- 顶层样式与 token 的治理边界
- `shadcn` primitive 的使用方式
- 结构化 UI / wireframe workbench 的最终视觉方向

## 1. 产品定位

这个 app 的页面类型是：

- `local-first desktop workbench`
- `review studio`
- `session workspace`

核心对象不是 marketing 内容，而是：

- `Session`
- `Preview`
- `Source`
- `Inspect`
- `Agent Shell`

主目标是围绕单个 session 完成：

- 编辑 source
- 构建 preview
- 运行 inspect
- 在右侧 review rail 中完成审查与提案闭环

## 2. 三原则

这是 `agent-html-app` 的最高优先级设计治理原则。后续任何新增 UI、重构或视觉收敛，都必须先满足这三条。

### 2.1 顶层 CSS

视觉和布局规则必须优先收敛到 app 顶层 CSS 和共享 shell contract。

具体要求：

- 新增样式优先进入顶层 token、共享 class、语义化 shell class。
- 页面层不长期保留一次性 `style`、匿名 layout 常量、feature 内局部视觉规则。
- pane spacing、header/footer rhythm、surface 语言、status 语言必须从共享入口统一定义。
- 页面文件应消费设计系统，不应在页面层重新拼一套视觉体系。

设计含义：

- 顶层 CSS 是系统入口，不是补丁层。
- feature 组件默认只消费，不自行建立第二套风格语言。

### 2.2 直接使用 shadcn 原装组件

交互 primitive 统一从仓内 `@/components/ui/*` 出发。

具体要求：

- `Button`、`Input`、`Textarea`、`Tabs`、`Badge`、`Card`、`ScrollArea` 等交互 primitive 直接使用 shadcn 生成的组件。
- 不复制一份自制基础控件来替代 shadcn。
- 需要变化时，优先通过 token、variant、组合方式、语义 wrapper 调整。
- feature 层允许封装 `ShellActionButton`、`ShellPaneHeader` 这类语义组件，但底层 primitive 仍应来自 shadcn。

设计含义：

- 我们要统一 primitive 来源，而不是统一写法表面上像 shadcn。
- 不允许“视觉想收敛，于是回退到手搓基础按钮/输入框”。

### 2.3 页面和布局统一消费 token

页面和布局必须统一消费 token，而不是依赖随手写的原子值或局部硬编码。

具体要求：

- color、radius、spacing、pane padding、gap、border、surface 都必须吃 token。
- 页面层不回流成 `p-* / gap-* / rounded-* / shadow-*` 的零散治理模式。
- layout 值优先由共享变量表达，例如 shell header padding、top bar height、section padding。
- 页面中的视觉收敛必须通过 token 和 contract 扩展完成，而不是在单页做一组例外规则。

设计含义：

- token 是治理入口，不是文档摆设。
- layout 也是设计系统的一部分，不只是颜色和字号。

## 3. 视觉方向

`agent-html-app` 的目标视觉不是：

- bento grid
- SaaS card wall
- pill-heavy dashboard
- debug panel

它的目标视觉是：

- `structural UI`
- `frame-first workbench`
- `wireframe-inspired review studio`

一句话定义：

> 从“很多小盒子组成的 UI”，转向“一个清晰骨架承载内容的 UI”。

### 3.1 结构化 UI 的核心特征

- 层次来自结构，不来自小卡片堆叠。
- 大面积平面色块优先，不靠每块内容都加边框和阴影制造层次。
- 分栏、分隔线、留白、对齐和排版承担主要视觉秩序。
- pane 的边界是语义边界，不是装饰边界。
- 整体气质应更接近 `workbench / review rail / editor shell`，而不是组件展示墙。

### 3.2 层次优先级

`agent-html-app` 的层次优先级固定为：

1. 布局
2. 分割线
3. 留白
4. 排版
5. 状态色

不是：

1. 阴影
2. 大圆角
3. pill
4. 卡片套卡片

### 3.3 应避免的视觉倾向

以下倾向会把 app 拉回“便当味 / card-heavy UI”，必须避免：

- 每个信息块都单独做成 card
- card 内再继续普遍套 card
- tabs、badge、metric、search、button 全部变成满屏 pill
- 大量 `rounded-2xl`、`rounded-full` 与 `shadow-sm/md`
- 靠“组件壳”而不是“页面结构”来表达层次

## 4. 布局模型

这个 app 的标准布局是：

- 顶部 `TopBar`
- 左侧 `Sessions Rail`
- 中间 `Workbench`
- 右侧 `Agent Shell`

这是一个标准的 `App Shell + Resizable Three-Pane Workspace`。

### 4.1 顶部栏

顶部栏是紧凑状态栏，不是浏览器 tab 栏。

它的职责是：

- 展示产品标识
- 展示当前 session 名称
- 展示当前 view 和运行环境状态

设计要求：

- 当前 session 是主信息。
- 品牌与 workspace identity 是次级信息。
- 状态只保留短 badge，不扩写解释文案。
- 路径、时间戳、实现术语不能占据主位。

### 4.2 左侧 Sessions Rail

左侧栏是 session 管理轨道，不是通用文件树。

它的职责是：

- 搜索 session
- 创建 session
- 按 `Current / Pinned / Needs attention / Recent` 分组
- 切换、重命名、置顶、删除 session

设计要求：

- rail 强调结构分组，不强调每条 session 的独立组件感。
- 当前 session 在结构上应清楚可见。
- 搜索与新建入口保持极简。
- resize handle 是工作台结构的一部分，应有明确语义。

### 4.3 中间 Workbench

中间栏是主工作区，承担最大视觉权重。

它的职责是：

- `Preview`
- `Source`
- `Inspect`

设计要求：

- 它不是单一 viewer，而是三视图工作台。
- `Preview / Source / Inspect` 更像结构标签，而不是主导性的胶囊组件。
- pane header 只保留标题、必要 action、必要 badge。
- 中栏应始终是三栏里最稳定、最连续、最少噪音的区域。

### 4.4 右侧 Agent Shell

右侧栏不是 terminal，不是原始消息 dump，它是 `review rail`。

它的职责是：

- 展示 proposal
- 展示 context / readiness
- 提供简化后的 session message stream
- 承载 composer 和 review 动作

设计要求：

- 右栏视觉应像审查轨道，而不是 debug 面板。
- proposal / review 卡优先于 runtime / diagnostics 摘要。
- runtime report、log、doctor 类信息都是次级信息。
- 右栏不应和中栏争夺主视觉权重。

## 5. 表面与边界

### 5.1 边界的语义

边界只在真正有结构语义时出现：

- 顶栏与主体之间
- 三栏之间
- pane header / content / footer 之间
- 需要明确容器归属时

不允许：

- 为了“看起来像组件”而普遍描边
- 为了“更有层次”而每块内容都加 outline

### 5.2 Surface 层级

surface 层级应尽量少，推荐控制在 2 到 3 层：

- 一级：整体工作台骨架
- 二级：pane / 主要 surface
- 三级：必要的次级容器

不允许无限嵌套：

- pane -> card -> inner card -> metric pill -> badge wall

### 5.3 阴影

阴影不是主视觉语言。

规则：

- 常规 surface 以平面或极弱层次为主
- 阴影只能作为非常轻的辅助
- 不允许依赖阴影建立主要结构感

### 5.4 圆角

圆角要克制。

规则：

- pane 级 surface 可以有中等圆角
- 小型状态元素谨慎使用 pill
- 不允许“所有元素都大圆角”

## 6. 组件规则

### 6.1 Session Item

session item 的设计目标是结构清楚，不是组件可爱。

规则：

- 默认只保留名称、状态、更新时间三类必要信息
- 辅助操作保持极简
- 不通过额外帮助文字解释 session
- 更接近平面 strip / row，而不是装饰性小卡片集合

### 6.2 Tabs

`Preview / Source / Inspect` 是工作台结构标签。

规则：

- tabs 要服务于结构识别
- 不应成为整页最抢眼的视觉语言
- 不要把 tabs 设计成一排很重的胶囊主角

### 6.3 Pane Header

header 默认只包含：

- 标题
- 必要 action
- 必要 badge

不默认包含：

- 解释性副标题
- path
- timestamp
- help copy

### 6.4 Runtime / Diagnostics / Logs

这些内容是次级信息。

规则：

- runtime report 不能常驻主导右栏层级
- inspect 默认优先展示结果本身
- log / console 只在确有必要时出现
- runtime / doctor 类信息要以短摘要呈现，不要像调试终端

### 6.5 Empty / Loading / Status

这些状态必须使用极短语言。

规则：

- 用短标签
- 不用句子说明
- 不解释内部机制

例如：

- `Load`
- `Build`
- `Check`
- `Draft`
- `Idle`

## 7. 文案与产品语言

`agent-html-app` 的页面语言应该始终呈现为：

- `session`
- `review`
- `result`

而不是：

- `mock runtime`
- `system`
- `placeholder`
- `kind`
- `role`
- `doctor output`

### 7.1 文案规则

- 页面层不新增解释性 `description`、caption、help copy
- 标题优先用名词或短动作
- 状态优先用短标签
- 文案必须看起来像产品语言，而不是实现日志

### 7.2 不应作为主内容的信息

以下信息默认不能当主内容展示：

- 完整路径
- 时间戳
- 内部状态名
- JSON 结果
- mock / placeholder / system 等实现术语

## 8. Typography

当前 app 采用：

- `--font-sans`: 系统无衬线
- `--font-mono`: 系统等宽
- `--font-heading`: 有衬线标题字族

设计目标：

- 标题承担更多气质与层次
- body 保持克制、清晰、中性
- code / source surface 保持等宽

规则：

- session title、重要标题允许使用 heading family
- 状态标签、section label 使用更紧凑的 uppercase / tracking
- 正文文案保持短、轻、密度受控

## 9. Color 与 Token 方向

当前 app 使用的是安静的中性色系统，不是高饱和品牌系统。

目标方向：

- 背景柔和
- 前景克制
- 边框轻
- muted surface 只作为微弱层次
- 破坏性状态保留最小必要对比

规则：

- app 的颜色主要服务于结构和状态，不服务于装饰
- 不引入第二套品牌主色语言
- 不让 badge / chip 颜色墙主导页面

## 10. 实现约束

### 10.1 顶层入口

设计系统的主要实现入口是：

- `src/styles.css`
- 共享 shell semantic classes
- `Shell*` 语义组合组件

### 10.2 组件边界

允许的模式：

- shadcn primitive
- shell semantic wrapper
- feature 级组合

不允许的模式：

- feature 内重新发明 primitive
- feature 内重新定义一套 layout 语言
- 使用局部 hack 覆盖整个系统

### 10.3 Preview Artifact 的边界

`mock preview artifact` 可以保留独立视觉体系，因为它代表产物示例，而不是 app shell 本身。

规则：

- preview artifact 不作为 app shell 风格来源
- app shell 的设计判断不能被 mock preview 的表现带偏

## 11. 当前代码侧契约

当前 app 已经存在一层明确的 shell contract，后续新增 UI 必须继续沿用。

代表性 contract 包括：

- pane scaffold
- pane header / footer / content spacing
- top bar rhythm
- search field contract
- tabs contract
- status badge contract
- loading / empty / console contract
- session / shell / workbench 的共享语义 wrapper

这意味着：

- 页面层默认应消费这些 contract
- 不应在 feature 中回流成新的原子值治理方式
- 共享语义组件比页面内联写法优先级更高

## 12. Do / Don’t

### Do

- 用结构建立层次
- 用 token 驱动布局和视觉
- 直接使用 shadcn primitive
- 让中栏 workbench 成为最稳定的视觉中心
- 让右栏像 review rail，而不是 debug pane
- 让文案看起来像产品，而不是内部实现

### Don’t

- 不要让 UI 退回 card / pill / shadow 驱动
- 不要把每个信息块都做成小盒子
- 不要暴露实现术语
- 不要把路径、JSON、时间戳当主内容
- 不要在 feature 层重新做一套基础控件
- 不要绕开顶层 CSS 和 token 直接写局部视觉规则

## 13. 一句话规范

`agent-html-app` 的最终视觉标准是：

> 一个骨架清晰、边界克制、信息密度可控、统一消费 token 与 shadcn primitive 的结构化三栏工作台。
