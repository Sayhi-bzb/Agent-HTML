# Layout Primitives

## Layout 的角色

UI 组件主要表达“这是什么东西”，比如 `button`、`badge`、`card`。layout 组件主要表达“这些东西怎么排”，比如纵向堆叠、横向聚类、分栏、网格、宽度约束。

因此，layout 和 UI 是同性质的语义积木，只是职责不同：

- UI 组件负责局部界面单元
- layout 组件负责空间组织规则

页面结构应通过少量 layout primitives 自由嵌套 UI 和 layout，而不是依赖 runtime host 预设结构。

## 最小原子集合

当前建议的 layout primitive 最小集合是：

- `stack`
  - 纵向堆叠内容，负责 section、正文块、表单块等常见垂直流
- `cluster`
  - 横向聚类内容，并允许自然换行，适合标签、按钮组、元信息行
- `split`
  - 在两个或少量区域之间分配空间，适合主副栏、媒体与正文、说明与控件
- `grid`
  - 规则网格排布，适合卡片宫格、专题块阵列、dashboard 区块
- `switcher`
  - 根据空间条件在并列和堆叠之间切换，适合响应式区块
- `frame`
  - 控制页面或区块的宽度、对齐和阅读边界

## 零 Props 的 Layout

以下 layout 默认应是零 props：

- `stack`
- `cluster`

原因是这两个名字本身已经表达了主要结构语义：

- `stack` 已经表示纵向堆叠
- `cluster` 已经表示横向聚类和自然换行

如果 agent 每次使用它们还需要填写很多选项，通常说明配置层的事情泄漏到了使用层。

## 允许少量结构 Props 的 Layout

以下 layout 可以允许极少量结构 props，但这些 props 只能补充结构关系，不能暴露实现参数。
本节定义的是允许边界，不等于当前版本必须把这些 props 全部开放到 agent-facing schema。

### `split`

`split` 可以允许表达主副关系或均衡关系，例如：

- 哪一边是主内容
- 当前是主副结构还是均衡结构

但不直接表达：

- 70/30、60/40 这类比例数值
- flex basis、minmax 这类实现参数

### `grid`

`grid` 可以允许表达非常轻的结构模式差异，比如规则重复网格和更强调主次的网格板块。

但不直接表达：

- 列数数值
- 最小卡片宽度
- gap 数值

保守做法下，`grid` 在 v1 也可以先保持零 props。

### `switcher`

`switcher` 可以允许表达切换倾向，例如更早切换成堆叠，或尽量维持并列更久。

但不直接表达：

- breakpoint 数值
- container query 实现细节

### `frame`

`frame` 可以允许表达包裹范围，例如：

- 页面包裹
- 普通区块包裹
- 阅读区包裹

但不直接表达：

- 最大宽度数值
- padding 数值
- bleed / inset 的具体实现

## 留在配置层的 Layout 配置

以下内容属于 layout 组件配置层，不应直接进入 agent prompt schema：

- gap / rhythm 的具体实现
- partition ratio
- columns
- min width
- max width
- measure
- padding
- breakpoint
- wrap / reflow 的具体规则
- density 下的松紧变化

这些配置来源于 `architecture.md` 中定义的全局 layout 轴和 layout 组件配置。

原则是：

- 使用层只回答“关系类型”
- 配置层回答“这个关系具体长什么样”

例如：

- `split` 只表达主副还是均衡
- 具体比例、gutter、窄屏重排策略留在配置层

- `grid` 只表达它是网格
- 具体列数、最小宽度、间距留在配置层

- `frame` 只表达它是页面包裹还是阅读包裹
- 具体最大宽度、左右留白留在配置层

## 设计原则

- layout 组件和 UI 组件一样，都是语义使用层的原子积木
- layout 的名字本身通常就是主要语义，不应默认再给 agent 大量额外选项
- 能靠 layout 名称表达的，不新增 prop
- 数值型空间参数默认不进入 agent-facing schema
- 结构关系进入使用层，具体落地进入配置层
- layout primitive 应允许自由嵌套 UI 和 layout primitive
- layout 使用层只暴露稳定的结构关系，数值型空间实现默认留在配置层
