# agent-html-app UI / Design System Audit

本文是 `agent-html-app` 当前前端壳层与 design-system 落地的尖锐审计。  
范围限定为 **app shell + design system**。  
不审 Rust/Tauri 后端，不审语义渲染协议，也不把 preview artifact 本身当作 app shell 的产品定义。

## 结论摘要

当前 `agent-html-app` 不是“完全绕开 shadcn 的自制 UI”，但也**不能**被描述成“已经贯彻 shadcn 哲学的 app shell”。

直接结论如下：

- 它**确实**直接消费了本地 `shadcn` 组件源码。
- 它**确实**有统一的 theme token，并且颜色语义已被消费。
- 它**已经开始**把页面壳层的 spacing、sizing、panel geometry 收敛成统一 contract，但收敛范围目前主要覆盖 shell 层，不代表整套 UI 已经治理完成。
- 它**已经补上**一批高频 content-level contract，例如状态行、loading row、empty card、card header/copy、metric row、status badge、search field、session card trigger/action，但仍未形成完整的内容区规范。
- 它**已经继续补上**顶栏标题堆叠、pane label、surface item、section label 这类非 card 场景 contract，说明治理开始从单个卡片扩展到更广的 shell 内容层。
- 它**已经开始收敛** `Preview / Source / Inspect` 三个 workbench tab 的共享 card/frame/content 骨架，不再每个 tab 各自复制同一套结构。
- 它**已经开始收敛** session rail / workbench / shell 三列的 pane scaffold，本轮已把 `pane + header + content + footer` 这一层抽成共享壳层骨架，而不是三处分别手写。
- 它**又继续收敛** pane header / action cluster / meta row / status row 这一层重复结构，说明治理已经进入 feature 内局部 shell 语义回收阶段。
- 它当前更准确的描述是：**一个已经开始建立 shell-level design-system contract 的 Tailwind + shadcn 应用**，而不是一个已经彻底完成前端治理的工作台。

这不是措辞问题，而是架构事实。

## 审计基线

本审计采用的 `shadcn` 基线不是“有没有装 `button` 和 `card`”，而是以下三条同时成立：

1. theme token 在全局集中定义；
2. 组件通过语义类统一消费 token；
3. 页面壳层本身也遵守稳定的 layout / spacing / sizing contract，而不是在 feature 文件里散落原子值。

若只满足前两条，结论只能是“组件层部分对齐”；不能据此声称整个 app shell 已经对齐 design system。

## Findings

### 1. 基础组件层：符合

`agent-html-app` 没有绕开本地 `shadcn` 组件层。  
当前 feature 代码直接消费 `@/components/ui/*`：

- `Button`
- `Card`
- `Badge`
- `Input`
- `Tabs`
- `ScrollArea`
- `Separator`
- `Textarea`
- `Resizable`

这说明项目接受了 `shadcn` 的核心前提之一：**基础 UI 组件以源码形式进入项目，并成为第一层 primitive**。

这部分是符合的，不需要粉饰，也不需要否认。

### 2. Theme token 层：符合

全局 theme token 已存在于 `apps/agent-html-app/src/styles.css`：

- `--background`
- `--foreground`
- `--card`
- `--primary`
- `--muted`
- `--border`
- `--ring`
- `--radius`

页面与组件也在消费这些语义值，例如：

- `bg-background`
- `text-foreground`
- `bg-card`
- `text-card-foreground`
- `text-muted-foreground`
- `border-primary`

这说明项目并非裸色值乱飞，也不是完全靠局部 CSS 拼接视觉。

这部分现在可以判定为 **符合**。  
颜色、前景、边框与半径语义都集中在全局 theme token 层，且 app shell 没有继续引入新的裸视觉值。

### 3. App shell 布局系统：半符合

这是真正的主问题。

当前页面壳层已经补上了一层明确的 layout contract。  
panel 默认比例与最小宽度已集中定义；top bar、pane header、pane footer、content gutter、surface gap 以及一批高频内容模式也已被集中命名并通过 shell 语义类消费。

目前已经被集中收敛的内容包括：

- top bar 高度
- rail / pane header / footer / content padding
- shell surface gap
- panel 默认比例
- panel 最小宽度
- supporting copy / status row / loading row
- search field / search icon / search input
- session card trigger / card action layering

这意味着最危险的一层偏离已经被修正：  
页面结构不再主要依赖散落的 `p-*` / `gap-*` / `h-*` 原子值维持一致性。

但这部分仍然只能判定为 **半符合**，而不是“完全达标”，原因有两点：

- contract 目前主要覆盖 app shell，尚未系统化扩展到更多内容区与局部模式；
- feature 内仍然存在少量组件级布局覆写，这些覆写虽然不再是裸值散落，但还没有完全收敛成更细粒度的 content contract。

结论不是“问题解决完了”，而是“最危险的壳层散落问题已经开始被系统治理”。

### 4. 基础组件内部几何：可接受，但已经外溢到页面层

像 `Button`、`Card`、`Tabs` 这类本地 `shadcn` 组件内部带有：

- `h-9`
- `px-4`
- `rounded-xl`
- `p-4`

这本身不是问题。  
这是 component primitive 的内部 geometry，属于可接受的源码内约束。

此前的问题是：**项目把这种“组件内部几何写死”的模式，继续复制到了页面壳层。**

当前壳层已经开始与 primitive 内部几何分层：

- primitive 保留自身内部 geometry；
- shell 额外建立了自己的结构 contract；
- 两层边界比之前清晰得多。

但这部分仍然没有完全结束。  
后续仍需要继续判断哪些局部内容区 geometry 应留在 primitive，哪些应进一步提升为 app shell / content contract。

### 5. 交互结构与状态链：已有真实问题，已修正一部分

此前 app shell 不只是有“样式不统一”的问题，还出现了两个更实质的前端问题：

- `SessionRail` 把整个 session card 包在原生 `<button>` 外层，同时在卡片 footer 里再嵌套删除 `Button`；
- `SourceTab` 的 `validating` 状态在装配层被固定写成 `false`，导致“校验中”UI 永远不显示。

前者会制造无效的交互嵌套结构；后者说明 app shell 某些 UI 状态之前只是“长得像支持”，并没有真正接上线。

当前这两点已经开始被修正：

- session card 改成 `Card + overlay trigger + action button` 分层，而不是 button 套 button；
- `validateCurrentSource()` 已经维护 `commandState.validating`，并传递到 `SourceTab`。

此外，mock 浏览器模式下原本还存在另一类假交互：

- 点击 session 只更新视觉高亮预期，但不真正切换 `currentSession`；
- `loading / building / inspecting / checking / drafting / sending` 这类 command 状态在 mock 分支里并没有统一经过 `commandState`。

当前这部分也已经开始被修正：

- mock session 切换、创建、删除、build、inspect、proposal、send message 已接入本地 mock runtime 状态；
- mock 分支的核心命令状态已统一经过 `commandState`，不再完全是“同步直落的假 UI”。
- `Build` 触发前若存在未保存 source，当前实现会先尝试保存；保存失败时不会再继续运行 build，避免出现“source 落盘失败但 build 仍继续”的假成功链路。
- mock 浏览器模式下，`Inspect` 与 `Proposal` 现在也回到“以已保存 source 为准”的边界，不再错误地直接消费未保存 draft。
- build / inspect 完成后，前端当前 `activeView` 会重新对齐 Tauri session record 的 `currentView`，不再出现后端已切 view 但前端仍停留旧 tab 的分叉。
- mock 浏览器模式也补上了 session 级 view state，而不是只靠一个全局 `activeView` 假装切换。
- `saving / building / inspecting / drafting / checking` 这批命令态现在已进入对应面板视图，不再只是内部 state 或 footer 文案。
- Tauri `Build` 真正执行期间，当前 session summary 也会暂时进入 `building`，左侧 session 徽标不再滞后于命令过程。
- session rail 的状态徽标现在按真实 `session.status` 渲染，不再把“当前选中”错误混成状态语义。
- build / inspect / validate / proposal / doctor 以及 session rail 的关键操作在运行态下已做基本禁重入，避免继续制造假并发。
- 当前又进一步收紧成 **session-scoped command lock**：session 切换、source 编辑、workbench tab / build / inspect、proposal / send 等动作不再在同一条会话命令链上交叉重入。
- Tauri `Build` 若在前端 optimistic `building` 过渡态之后失败，当前实现会重新 hydrate 当前 session，避免左栏 summary 长时间停留在过期的 `building` 假态。
- mock `Inspect` 不再反向污染 `currentBuild`；上一轮成功 preview 的 build 结果不会仅因为 inspect 发现错误就被伪造成失败。

这部分的结论很直接：  
design-system 治理如果只盯视觉，不看交互结构和状态链，就会把真实问题漏掉。
### 6. Mock preview 携带第二套视觉体系：已隔离，但仍需保持边界

`apps/agent-html-app/src/lib/mock-data.ts` 内的 preview HTML 示例包含大量裸视觉值：

- `#0f141b`
- `#eef3fb`
- `#ffbf7f`
- `linear-gradient(...)`

如果它只是 preview artifact 的演示数据，这不是致命问题。  
但如果团队把它当成 app 自身 UI 的风格依据，就会立刻造成误导：

- app shell 一套 theme；
- preview mock 又是一套 theme；
- 两套系统没有 contract 联系；
- 视觉讨论会失去边界。

当前代码已经明确把这部分标记为 **sample artifact content for the preview pane**。  
这一步已经满足“边界隔离”的最低要求。

后续需要保持的是：不要再让 mock preview 示例倒灌回 app shell 的 design-system 讨论。

## Required Corrections

以下整改不是可选建议，而是后续对齐 design system 的最低要求。

### 1. 必须继续扩展 app shell layout contract

已完成的基础项：

- top bar 高度
- rail 内边距
- pane header 内边距
- workbench content gutter
- shell composer 区密度
- 默认 panel 比例
- panel 最小宽度

接下来仍需继续补充更细一层的 content-level contract，例如：

- 空状态
- 统计行
- 列表项内部 rhythm
- 内容卡片间距分层
- topbar supporting copy / title hierarchy
- 可复用的交互容器模式，例如 selectable card / card action layering

当前已继续落地的内容项包括：

- scroll pane 统一入口
- surface pane 填充容器
- pane header leading/trailing contract
- compact action group
- split row 语义包装
- meta row / supporting copy / status row 包装
- scroll surface content 容器
- card heading / card body / body copy
- preview canvas 填充容器
- shell empty card
- shell card header
- shell card copy
- shell metric list
- shell status badge
- shell loading row 组件包装
- shell title stack
- shell pane label
- shell pane header
- shell split row
- shell action group
- shell meta row
- shell supporting copy
- shell status row
- shell scroll surface
- shell surface item
- shell section label
- shell pane scaffold
- app-shell root pattern：`TopBar`
- app-shell root pattern：`MainLayout`
- feature-scoped content pattern：`WorkbenchCard`
- feature-scoped content pattern：`PreviewFrame`
- feature-scoped content pattern：`SourceEditorField`
- feature-scoped content pattern：`SourceValidationSummary`
- feature-scoped content pattern：`InspectDiagnosticList`
- feature-scoped content pattern：`InspectConsoleSection`
- feature-scoped content pattern：`MessageBody`
- feature-scoped content pattern：`ComposerField`

形式已经明确：当前采用的是 **统一 CSS 变量 + shell utility classes + panel constraint constants**。

### 2. 页面层不得重新引入散落重复布局值

本轮已经收敛掉最主要的一批页面层重复值。  
后续要求变成：

- 不得在新代码中重新引入这类壳层原子值；
- 若出现新的高频 layout pattern，必须优先提升为 shell 语义类或 content contract。

允许局部特例存在，但特例必须少、必须有理由、必须能指出它为何不走标准 shell 尺度。

### 3. `@/components/ui/*` 必须继续作为唯一基础 UI 入口

后续新增 feature 不得绕开本地 `shadcn` 组件层再造第二套基础控件。

尤其不得新建自制的：

- base button
- base card
- base input
- base tabs
- base scroll container

primitive 入口只能继续收敛在 `@/components/ui/*`。

### 4. 颜色语义必须继续 token-first

app shell 与 feature 层不得引入裸色值、裸阴影、裸边框语义。  
所有视觉语义仍应优先通过：

- `bg-*`
- `text-*`
- `border-*`
- `ring-*`

这些语义类去消费全局 token。

### 5. Mock preview 的边界必须持续保持明确

当前代码侧已经明确：

- 它是 preview artifact 示例；
- 它不是 app shell 的 design-system 来源。

后续 spec 与实现都必须继续保持这个边界，不得回退。

## Acceptance Criteria

以下条件同时满足，才可以声称 `agent-html-app` 已开始对齐 shell-level design system：

- app shell 的常用布局参数有集中定义位置；
- panel 比例与最小宽度不再散落在页面装配代码中；
- rail / header / content gutter 的常用值不再跨 feature 重复手写；
- 高复用内容模式开始有命名 contract，而不是每个 feature 重新拼装；
- 页面壳层新增代码默认走统一 shell contract，而不是先写原子值再事后回收；
- `@/components/ui/*` 继续维持为基础 UI 唯一入口；
- app shell 代码中不新增裸视觉值；
- 关键 UI 状态链不是假接线，至少 loading / validating / sending / checking 这类状态能真实传到视图；
- build / inspect / proposal 这类跨面板动作不绕开 source-of-truth discipline；
- session 级关键交互具备统一命令锁，不再允许主要命令链路交叉重入；
- optimistic 过渡态在失败后具备显式恢复路径，而不是依赖下一次人工刷新；
- session 级 view state 不与前端临时 tab state 分叉；
- mock preview 的视觉体系被明确标注为 shell 外部内容。

其中前六项与最后一项，当前实现已经开始满足；  
但这仍然不足以支持“我们已经彻底完成前端治理”的说法。

## Remaining Sharp Problems

以下问题仍然存在，不能因为本轮治理进展就被弱化：

- `agent-html-app` 现在只是**明显更接近** shell-level design system，并没有完成 content-level 全面治理。
- 本轮已经把 `WorkbenchCard`、`PreviewFrame`、`SourceEditorField`、`SourceValidationSummary`、`InspectDiagnosticList`、`InspectConsoleSection`、`MessageBody`、`ComposerField` 从 `shell-content` 共享层下沉回 feature 层，说明“伪共享模式混入共享 catalog”这个问题已经被正面处理，而不是继续含混维持。
- `WorkbenchPane` 的 tab/tool action 条带、`SourceTab` 的 header action 组、`ShellPane` 的 composer 区仍然主要由 feature 自己装配；当前问题已从“共享层混装”转成“哪些 feature pattern 将来值得继续上提到更广的 contract”。
- 本轮又继续把这些区域命名成 feature-scoped contract：`WorkbenchHeader`、`SourceHeader`、`ShellComposer`。问题已经从“匿名散落”进一步收敛到“这些 pattern 是否应继续上提到更通用层级”的边界判断。
- 根层 `App` 已经不再直接匿名拼接顶部栏和三栏 resizable 布局，而是显式消费 `TopBar` 与 `MainLayout`。这一步修正的是“文档里已有壳层语义，但实现没有对应命名边界”的问题。
- 当前又继续把 `WorkbenchTabs`、`SessionRailHeader`、`SessionCard` 命名出来，说明治理已经不只是抽单个 row 或 field，而是在把整段稳定交互模式收回到有边界的 pattern 上。
- 这意味着当前缺的已经不是“有没有 contract”，而是 **content pattern catalog 还不完整**：共享层与 feature 层的边界已经比之前干净，但哪些模式应该被正式提升到更广的共享层，哪些长期只保留在 feature，本轮还没有到完全稳定的边界。
- mock preview 仍然内嵌大量裸视觉值；当前只能因为它被明确标注为 preview artifact sample 而被接受，不能把这类写法迁回 app shell。
- `Textarea`、`Tabs`、`ScrollArea` 等 primitive 的内部 geometry 仍然与 feature 内容排布共同决定最终密度，这要求后续继续守住“primitive 内部约束”和“shell 外层 contract”之间的边界。
