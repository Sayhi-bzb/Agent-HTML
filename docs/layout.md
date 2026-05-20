# Layout Primitives

本文定义的是 layout primitive 的稳定 contract 和当前公开边界。

如果要判断当前工作树里：

- parser / validator / sanitize 已经接受到哪一层
- runtime 现在已经能投影哪些 layout
- runtime host 是否还在偷偷替 layout 补结构

请优先看：

- `docs/details/current-contract-audit.md`
- `docs/details/current-contract-component-matrix.md`
- `docs/roadmap.md`

## 当前定位

layout primitive 现在已经是正式语义节点。

当前稳定集合是：

- `stack`
- `cluster`
- `split`
- `grid`
- `switcher`
- `frame`

这些节点已经进入：

- schema surface
- parse / validate 主链
- 最小 runtime projection

## Layout 的职责

UI 组件表达“这是什么东西”，例如：

- `button`
- `badge`
- `card`

layout 组件表达“这些东西怎么排”，例如：

- `stack`
- `cluster`
- `split`
- `grid`

因此当前页面结构应由 UI 和 layout 节点共同表达，而不是由 runtime host 预设文档骨架反推出来。

## 当前公开边界

当前公开 contract 和 prompt 对六个 layout primitive 都保持零 props：

- `stack`
- `cluster`
- `split`
- `grid`
- `switcher`
- `frame`

这不是因为 layout 不存在，而是因为当前主公开面故意把 layout 语义压到“节点名本身就是主要含义”。

## 节点语义

- `stack`
  - 垂直堆叠内容
- `cluster`
  - 横向聚类并允许自然换行
- `split`
  - 表达主副区块或少量区域并列
- `grid`
  - 表达规则重复网格
- `switcher`
  - 表达并列与堆叠之间的切换倾向
- `frame`
  - 表达页面或阅读边界包裹

## 留在配置层的东西

当前仍明确留在配置层，而不是 agent-facing schema 的内容包括：

- gap / rhythm
- ratio
- columns
- min width / max width
- measure
- padding
- breakpoint
- density 变化下的具体空间实现

原则仍然是：

- 使用层回答“关系类型”
- 配置层回答“具体长什么样”

## 当前与 host 的边界

当前 layout 的结构解释应来自语义树本身：

- layout 节点可以嵌套 UI 节点
- layout 节点可以嵌套 layout 节点
- runtime host 不再被当成 layout 语义的默认来源

`ahtml-document-shell` 仍然存在于 artifact/document shell 侧，但它不再定义 layout primitive 的主语义。
