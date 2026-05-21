# agent-html-app UI / Design System Audit

本文是 `agent-html-app` 当前前端壳层与 design-system 落地的尖锐审计。  
范围限定为 **app shell + design system**。  
不审 Rust/Tauri 后端，不审语义渲染协议，也不把 preview artifact 本身当作 app shell 的产品定义。

## 结论摘要

当前 `agent-html-app` 不是“完全绕开 shadcn 的自制 UI”，但也**不能**被描述成“已经贯彻 shadcn 哲学的 app shell”。

直接结论如下：

- 它**确实**直接消费了本地 `shadcn` 组件源码。
- 它**确实**有统一的 theme token，并且颜色语义已被消费。
- 它**没有**把页面壳层的 spacing、sizing、panel geometry 收敛成统一 contract。
- 它当前更准确的描述是：**一个使用了本地 shadcn 组件和 theme token 的 Tailwind 应用**，而不是一个已经完成 shell-level design-system 收敛的工作台。

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

### 2. Theme token 层：半符合

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

但结论仍然只能是 **半符合**，原因很直接：  
项目把“颜色语义 token”统一了，但**没有把 shell 的布局语义也统一起来**。theme token 只覆盖了视觉表层，没有覆盖 app shell 的结构层。

### 3. App shell 布局系统：明显偏离

这是真正的主问题。

当前页面壳层没有清晰的 layout contract。  
rail padding、pane header 高度、content gutter、section gap、action row 密度、panel 默认比例与最小宽度，仍然散落在 feature 组件和容器 props 里。

典型表现：

- `p-3`
- `px-3 py-2`
- `px-4`
- `gap-2`
- `gap-3`
- `h-14`
- `size-8`
- `minSize={16}`
- `minSize={22}`
- `minSize={38}`

这些值并不是偶发存在，而是已经构成当前 shell 的真实布局系统。  
问题在于：**它们没有被命名、没有被集中、没有被约束，只是碰巧相互看起来还能凑合工作。**

这意味着：

- 页面结构靠“局部作者记忆”维持一致，而不是靠 contract；
- 新 feature 会继续复制这些原子值；
- 后续要统一密度、紧凑度、rail rhythm 时，没有单一控制面；
- UI 审查无法判断一个新值是设计决定，还是局部随手写下的尺寸。

这部分不能再用“Tailwind 本来就这么写”来搪塞。  
Tailwind 允许这样写，不代表 design system 应该停在这样写。

### 4. 基础组件内部几何：可接受，但已经外溢到页面层

像 `Button`、`Card`、`Tabs` 这类本地 `shadcn` 组件内部带有：

- `h-9`
- `px-4`
- `rounded-xl`
- `p-4`

这本身不是问题。  
这是 component primitive 的内部 geometry，属于可接受的源码内约束。

问题是：**项目把这种“组件内部几何写死”的模式，继续复制到了页面壳层。**

结果就是：

- primitive 有一套尺寸；
- shell 又在 feature 里再写一套尺寸；
- 二者之间没有更高层级的 layout contract 做收束。

这不是 shadcn 的问题，这是当前 app shell 治理没做完。

### 5. Mock preview 携带第二套视觉体系：必须隔离解释

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

因此，这部分必须被明确标记为 **shell 外部内容**，而不是“app 主题的另一种表达”。

## Required Corrections

以下整改不是可选建议，而是后续对齐 design system 的最低要求。

### 1. 必须建立 app shell layout contract

必须为 app shell 建立一层明确的结构 contract，至少覆盖：

- top bar 高度
- rail 内边距
- pane header 内边距
- workbench content gutter
- shell composer 区密度
- 默认 panel 比例
- panel 最小宽度

这层 contract 可以落在统一 CSS 变量、统一 shell utility、或统一 layout wrapper 上。  
形式可以讨论，**不建立 contract 这件事不能讨论。**

### 2. 页面层不得继续散落重复布局值

feature 组件不得继续各自维护常用壳层尺寸。  
重复出现的 `p-3`、`px-3 py-2`、`gap-2`、`gap-3`、`h-14` 这类值，必须收敛。

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

### 5. Mock preview 必须被文档明确隔离

如果 mock preview 保留现状，spec 必须明确：

- 它是 preview artifact 示例；
- 它不是 app shell 的 design-system 来源；
- 它不参与 app shell theme 合规判断。

否则，审计边界会持续被污染。

## Acceptance Criteria

以下条件同时满足，才可以声称 `agent-html-app` 已开始对齐 shell-level design system：

- app shell 的常用布局参数有集中定义位置；
- panel 比例与最小宽度不再散落在页面装配代码中；
- rail / header / content gutter 的常用值不再跨 feature 重复手写；
- 页面壳层新增代码默认走统一 shell contract，而不是先写原子值再事后回收；
- `@/components/ui/*` 继续维持为基础 UI 唯一入口；
- app shell 代码中不新增裸视觉值；
- mock preview 的视觉体系被明确标注为 shell 外部内容。

在这些条件达成前，任何“我们已经继承了 shadcn 哲学”的表述都属于过度自我美化。
