# High-Risk Runtime Bridges

本文只覆盖三类高风险组件：

- `tabs`
- `accordion`
- `table`

旧的单组件专篇已经移除；当前 bridge 现实统一收在本文。

本文只回答当前现实里的三个问题：

- 为什么这三类组件仍然是当前兼容收口里的高风险点
- 旧 authoring 字段现在具体退到了哪一层
- 哪些测试和 gate 仍在保护这些兼容桥

## 结论先行

这三类组件之所以危险，不是因为“公开 contract 还没收口”，而是因为：

- 旧字段虽然退出了公开 prompt 主路径
- 但它们仍存在于完整 authoring 兼容层
- runtime 仍通过显式 `legacyBridges` / `behavior.stateBridge` 解释这些旧字段
- unit tests 和 heavy gates 仍在保护这些桥接行为

当前更准确的总判断是：

- 风险已经不在顶层 `kindProp` / `modeProp` / `defaultProp` / `defaultMode` 主 spec
- 风险已经收进兼容 bridge payload、自定义状态解析和相关测试里

## 1. 当前共同模式

这三类组件现在共享的不是“旧字段公开给 agent”，而是这条兼容链：

```txt
schema-overlays.ts
  -> 完整 authoring compatibility layer
  -> component-capabilities.mjs
  -> render-capabilities.mjs / runtime-contract
  -> renderer/types.ts
  -> render-ui-node.tsx
  -> renderer tests
  -> build / preview / runtime gates
```

这意味着：

- 公开 contract 已经收口
- 但兼容行为仍然真实存在
- 直接删 bridge payload 会打断运行时行为，不只是删掉旧字段名

## 2. `table`：结构分流仍靠 `row.kind`

### `table` 当前桥接位置

当前证据链是：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `table.renderer.legacyBridges.structuralRole`
  - 其中仍记录：
    - `sourceProp: "kind"`
    - `headerValue: "header"`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererLegacyStructuralRoleBridge`
  - `RendererSpecComponent.legacyBridges?.structuralRole`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx`
  - `partitionTableRowsByLegacyRole()`
- `packages/core/src/parse/sanitize-agent-html.test.ts`
  - 仍覆盖 `<row kind="header">` 兼容输入
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - happy-path fixture 已切到 `<table><row><cell>`

### `table` 为什么仍危险

`row.kind` 当前不是视觉 alias，而是 header/body 分流来源。

也就是说，当前真正危险的不是“某个顶层 `kindProp` 字段还在不在”，而是：

- `legacyBridges.structuralRole` 里仍记着结构角色来源
- `render-ui-node.tsx` 仍要根据这个桥接把 rows 分成 header 和 body

### `table` 当前不能误删的点

- `table.renderer.legacyBridges.structuralRole`
- `RendererLegacyStructuralRoleBridge`
- `partitionTableRowsByLegacyRole()`
- 兼容输入测试里对 `row.kind` 的覆盖

## 3. `tabs`：默认状态仍靠兼容 state bridge

### `tabs` 当前桥接位置

当前证据链是：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `tabs.renderer.legacyBridges.state`
  - bridge payload 里仍记录 `defaultProp: "default"`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererLegacyStateBridge`
  - `RendererSpecComponent.legacyBridges?.state`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx`
  - `resolveTabsLegacyDefaultValue()`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - 直接构造 `legacyBridges.state`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 已切到 `<tabs><tab ...`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - 已断言最终 artifact 不重新泄露 `default="`

### `tabs` 为什么仍危险

`tabs.default` 已经不是公开主写法，但默认选中项的来源仍走兼容 state bridge。

当前风险不在“顶层还有没有 `defaultProp` 字段”，而在：

- `legacyBridges.state` 的 payload 仍定义默认状态来源
- `render-ui-node.tsx` 仍依赖这层 bridge 计算默认 tab

### `tabs` 当前不能误删的点

- `tabs.renderer.legacyBridges.state`
- `RendererLegacyStateBridge`
- `resolveTabsLegacyDefaultValue()`
- renderer tests 里对 tabs default 行为的断言

## 4. `accordion`：兼容状态模型仍最深

### `accordion` 当前桥接位置

当前证据链是：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `accordion.behavior.stateBridge = "accordion-state"`
  - `accordion.renderer.legacyBridges.state`
  - bridge payload 里仍记录：
    - `modeProp: "mode"`
    - `defaultProp: "default"`
    - `defaultMode: "multiple"`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RuntimeVerificationState.behavior.stateBridge`
  - `RendererLegacyStateBridge`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx`
  - `resolveAccordionLegacyState()`
  - `resolveAccordionMode()`
  - `resolveAccordionDefaultValue()`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - 直接构造 `legacyBridges.state`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 已切到最终 authoring surface

### `accordion` 为什么仍危险

`accordion` 的风险比 `tabs` 更深，因为它保留的不是单个默认值来源，而是一整个兼容状态模型：

- `mode`
- `default`
- `defaultMode`

这些字段已经不再作为主公开 contract，也不再作为 renderer 顶层长期字段出现；但它们仍被 bridge payload 和状态解析逻辑真实消费。

### `accordion` 当前不能误删的点

- `accordion.behavior.stateBridge`
- `accordion.renderer.legacyBridges.state`
- `resolveAccordionLegacyState()`
- `resolveAccordionMode()`
- `resolveAccordionDefaultValue()`
- renderer tests 里对默认展开和 fallback 的断言

## 5. 现在真正会把旧路径钉住的证据

当前最关键的不是“文档还提不提旧字段”，而是这些测试和 gate 仍在保护兼容现实：

### `sanitize-agent-html.test.ts`

它仍覆盖兼容 authoring 输入，例如：

- `tone`
- `kind`
- `default`

这证明旧字段虽然不再是 prompt 主路径，但仍是被接受的输入面。

### `render-node.test.ts`

它直接构造：

- `legacyBridges.state`
- `legacyBridges.structuralRole`

这说明 bridge payload 本身仍是运行时行为模型的一部分。

### `cli.build.heavy.test.ts` / `cli.preview.heavy.test.ts`

它们现在保护的是最终 contract，而不是旧输入本身：

- 宿主断言已经切到 `class="ahtml-runtime-host ahtml-runtime-document"`
- artifact 不应重新泄露：
  - `tone="`
  - `kind="`
  - `default="`

这类 heavy gate 当前的作用是：

- 证明最终输出口径已经收紧
- 防止兼容桥重新回流成公开主路径

## 6. 当前使用方式

如果现在只是判断现实或收尾优先级，直接看本文即可。  
这里已经是单组件 bridge 现实的统一入口。

## 7. 当前总判断

`tabs`、`accordion`、`table` 当前都已经不是“公开 contract 还没收口”的问题。

它们现在是：

- 完整 authoring 兼容层问题
- runtime bridge 问题
- renderer 状态 / 结构解释问题
- tests 和 completion audit 问题

其中：

- `table`
  - 最像结构桥
- `tabs`
  - 最像单状态桥
- `accordion`
  - 最像完整兼容状态模型

因此当前收尾的重点不是继续把这些字段写成主公开事实，而是：

- 诚实记录它们还留在哪一层
- 确保 docs、tests 和 gate 对这些层的描述一致
