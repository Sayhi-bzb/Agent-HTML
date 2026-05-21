# High-Risk Runtime Boundaries

本文只覆盖三类曾经最依赖 compat bridge、现在最需要关注固定行为边界的组件：

- `tabs`
- `accordion`
- `table`

本文现在回答的是另一组现实问题：

- 旧 compat bridge 是否已经拆掉
- 这三类组件当前真正的行为来源是什么
- 现在哪些 gate 在保护新行为

## 结论先行

这三类组件仍然值得重点关注，但原因已经变了。

当前事实是：

- `row.kind`
- `tabs.default`
- `accordion.mode`
- `accordion.default`
- `legacyBridges.*`
- `behavior.stateBridge`

都已经退出当前代码实现。

现在的风险点不再是“兼容桥会不会继续解释旧字段”，而是：

- 新结构语义是否足够稳定
- renderer 的固定行为是否被测试完整保护
- heavy gates 是否持续保证最终 artifact 不重新泄露旧字段

## 1. `table`

`table` 当前不再通过 `row.kind` 分流 header / body。

当前行为来源是：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `table` 只保留 `rowSlot` / `cellSlot`
- `packages/ahtml/src/cli/runtime-host/renderer/render-ui-node.tsx`
  - 第一行在存在多行时固定作为 header
  - 剩余行进入 body

当前判断：

- 风险已经从“旧结构桥”变成“固定首行 header 语义是否符合预期”
- 相关保护主要在 renderer tests 和 build / preview gates

## 2. `tabs`

`tabs` 当前不再读取 legacy `default`。

当前行为来源是：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `tabs` 只保留 `itemValueProp` / `itemHeadingProp`
- `packages/ahtml/src/cli/runtime-host/renderer/render-ui-node.tsx`
  - 默认选中项固定来自第一个 `tab`

当前判断：

- 风险已经从“兼容状态桥”变成“首个 tab 默认选中规则是否被稳定保护”
- 相关保护主要在 renderer tests、prompt/schema tests 和 artifact 输出 gate

## 3. `accordion`

`accordion` 当前不再兼容 `mode` / `default`。

当前行为来源是：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `behavior.model = "fixed-multiple-state"`
  - `renderer.staticProps = { type: "multiple" }`
- `packages/ahtml/src/cli/runtime-host/renderer/render-ui-node.tsx`
  - 只消费 `staticProps`
  - 不再解析 authoring 输入里的旧状态字段

当前判断：

- 风险已经从“兼容状态模型”变成“固定 multiple 行为是否满足当前产品边界”
- 相关保护主要在 renderer tests 和 runtime contract / render capabilities tests

## 4. 现在真正保护这些边界的证据

当前关键保护点是：

- `packages/core/src/parse/sanitize-agent-html.test.ts`
  - 已改成断言旧 compat 字段会被拒绝
- `packages/ahtml/src/cli/runtime-host/renderer/render-node.test.ts`
  - 已删除直接构造 `legacyBridges.*` 的测试
  - 改为断言 `table` / `tabs` / `accordion` 的现行固定行为
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 继续断言 artifact 不重新泄露 `tone="` / `kind="` / `default="`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - 继续断言 preview 输出不重新泄露旧字段

## 5. 当前总判断

这三类组件仍然是高关注边界，但已经不再是 compat bridge 问题。

它们现在分别是：

- `table`
  - 结构默认规则边界
- `tabs`
  - 默认选中规则边界
- `accordion`
  - 固定状态模型边界

如果后续继续观察风险，重点应放在：

- 新固定行为是否需要进一步文档化
- heavy gates 是否持续覆盖最终输出口径
