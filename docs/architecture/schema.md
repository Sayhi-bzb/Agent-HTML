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
  - 当前与最终公开 contract 在组件 props 上已经一致，只额外承载结构节点约束与运行时校验所需的完整组件集合。
- `最终公开 contract`
  - 供 CLI schema / prompt 使用。
  - 由 `createPublicAgentContract()` 投影得到。
  - 当前与完整 authoring schema 一致，不再承担 compat 过滤职责。

这不是“两套公开 contract 并存”，而是：

- 一套完整 authoring 接受面
- 一套最终公开给 agent 的主路径 contract

## 当前公开面规则

当前主公开面遵守下面几条规则：

- `blocked` prop 不进入公开 contract，也不进入 prompt。
- `raw-candidate` prop 只有在当前 exposure policy 生成结果中被显式打开时，才进入公开 contract。
- `profile-ref` 是当前唯一稳定的配置选择入口。
- 旧 `style-ref` 已退出主公开协议，只保留拒绝与诊断路径。

## 当前公开主路径

当前公开 contract 的代表性结果是：

- `alert`
  - 公开 `title`、`variant`
- `badge`
  - 公开 `variant`
- `list`
  - 公开 `variant`
  - 这是当前保留的公开特例，不构成任意开放原厂 `variant` 的先例
- 表单与内容字段
  - 继续公开 `title`、`label`、`description`
  - 继续公开语义 `value`、语义 `checked`

当前不应再把下面这些字段写成“当前可接受 schema 事实”：

- `tone`
- `kind`
- `mode`
- `default`

## 当前边界

这批旧字段已经退出当前代码：

- `alert.tone`
- `badge.tone`
- `row.kind`
- `tabs.default`
- `accordion.mode`
- `accordion.default`
- `legacyBridges.variant`
- `legacyBridges.state`
- `legacyBridges.structuralRole`
- `behavior.stateBridge`

当前同样已经退出主公开协议的旧配置入口：

- `style-ref`
- `styleProfile`
- `documentStyleConfigReference`

## 暴露状态模型

当前稳定的内部状态仍然只有两类：

- `blocked`
  - 永远不进入公开 schema，也不进入 prompt
- `raw-candidate`
  - 允许进入公开候选池，但是否真正公开取决于当前 exposure policy 与生成结果

这个状态模型的职责是回答“原厂 prop 能不能进入公开 contract”，不是回答兼容字段何时退出运行时。

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
- 如果你关心“某个字段到底在哪里被过滤或保留”，回到 `current-contract-audit.md` 和组件矩阵核对代码证据。
