# Schema Prop Exposure

本文定义的是当前稳定的 prop 暴露机制。

如果要核对当前工作树里的现实证据，请优先看：

- `docs/details/current-contract-audit.md`
- `docs/details/current-contract-component-matrix.md`
- `docs/details/high-risk-runtime-bridges.md`

## 两个 schema 视图

当前代码里同时保留两种不同用途的 schema 视图：

- `完整 authoring schema`
  - 供 parse / validate / sanitize 使用。
  - 会保留显式兼容语义字段和已开放的 raw props。
- `最终公开 contract`
  - 供 CLI schema / prompt 使用。
  - 由 `createPublicAgentContract()` 投影得到。
  - 会过滤 legacy semantic props，并隐藏已被正式 raw prop 取代的旧包装字段。

这不是“两套公开 contract 并存”，而是：

- 一套完整 authoring 接受面
- 一套最终公开给 agent 的主路径 contract

## 当前公开面规则

当前主公开面遵守下面几条规则：

- `blocked` prop 不进入公开 contract，也不进入 prompt。
- `raw-candidate` prop 只有在组件配置明确放开时，才进入公开 contract。
- legacy semantic props 可以继续留在兼容 authoring 层，但不再是公开主入口。
- 文档级配置选择入口仍然存在，但不再把 agent prompt 绑死在“必须先写某个实现配置”上。

## 当前公开主路径

当前公开 contract 的代表性结果是：

- `alert`
  - 公开 `title`、`variant`
- `badge`
  - 公开 `variant`
- `list`
  - 公开 `variant`
  - 这是历史公开例外，不构成任意开放原厂 `variant` 的先例
- 表单与内容字段
  - 继续公开 `title`、`label`、`description`
  - 继续公开语义 `value`、语义 `checked`

当前不应再把下面这些字段写成“默认公开主路径事实”：

- `tone`
- `kind`
- `mode`
- `default`

## 当前兼容边界

兼容层仍然存在，但位置已经明确收紧：

- authoring 兼容层
  - `alert.tone`
  - `badge.tone`
  - `row.kind`
  - `tabs.default`
  - `accordion.mode`
  - `accordion.default`
- runtime 兼容层
  - `legacyBridges.variant`
  - `legacyBridges.state`
  - `legacyBridges.structuralRole`
  - `behavior.stateBridge`

因此更准确的当前判断是：

- 旧字段已经退出公开 contract / prompt 主路径
- 但它们仍作为显式兼容 authoring 输入和 runtime bridge 保留

## 暴露状态模型

当前稳定的内部状态仍然只有两类：

- `blocked`
  - 永远不进入公开 schema，也不进入 prompt
- `raw-candidate`
  - 允许进入公开候选池，但是否真正公开取决于组件配置

这个状态模型的职责是回答“原厂 prop 能不能进入公开 contract”，不是回答“历史包装字段还删没删完”。

## 当前应继续 blocked 的类别

下面这些类别当前仍应保持隐藏：

- 样式逃逸
  - `class`
  - `className`
  - `style`
  - `css`
- 结构逃逸
  - `asChild`
  - `dangerouslySetInnerHTML`
- 事件与运行时接线
  - `onClick`
  - `open`
  - 原厂受控 `value` / `checked`
  - `defaultValue`
  - `defaultChecked`
- 实现层布局参数
  - gap
  - columns
  - ratio
  - breakpoint
  - max width

## 当前应怎样读这份文档

- 如果你关心“agent 现在会被公开鼓励写什么”，看最终公开 contract。
- 如果你关心“旧输入为什么还没完全失效”，看兼容 authoring 层和 runtime bridge。
- 如果你关心“某个字段到底在哪里被过滤或保留”，回到 `current-contract-audit.md` 和组件矩阵核对代码证据。
