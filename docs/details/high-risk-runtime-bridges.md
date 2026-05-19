# High-Risk Runtime Bridges

本文只覆盖三类高风险组件：

- `tabs`
- `accordion`
- `table`

如果要继续往单组件执行卡下钻，请补看：

- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

它不重新解释全项目架构，也不重复 `components.md` 的组件盘点。

它只回答三个更具体的问题：

- 为什么这三类组件是 `Phase 4/5` 的真实高风险点
- 当前哪些旧字段已经穿过 schema -> runtime spec -> renderer -> heavy tests 的整条主链
- 后续改造时，哪些桥接点必须先隔离、再替代、最后才能删除

## 结论先行

这三类组件之所以危险，不是因为“组件复杂”，而是因为它们都满足下面至少一个条件：

- 旧字段已经进入 runtime spec 类型面
- `render-node.tsx` 主路径直接读取旧字段
- renderer behavior 不是简单 prop pass-through，而是主动推导结构或状态
- heavy build tests 仍把旧 authoring surface 当当前正确输入

当前最直接的现实是：

- `table` 仍依赖 `row.kind -> kindProp`
- `tabs` 仍依赖 `default -> defaultProp`
- `accordion` 仍依赖 `mode/default -> modeProp/defaultProp/defaultMode`

所以这三类组件更适合作为：

- `Phase 4` 的 legacy bridge 隔离样本
- `Phase 5` 的最终下线路径样本

而不是 `Phase 2` 的第一批 raw-candidate 试点样本。

## 1. 共同风险模式

这三类组件目前共享一条高耦合模式：

```txt
schema-overlays.ts
  -> generated public schema
  -> component-capabilities.mjs
  -> renderer/types.ts
  -> render-node.tsx
  -> render-node.test.ts
  -> cli.build.heavy.test.ts
```

也就是说，它们不是只在“某个局部 helper”里保留旧桥接，而是已经跨过：

- public schema
- runtime capability definition
- renderer spec 类型面
- runtime render function
- renderer unit tests
- heavy artifact-level tests

这就是为什么：

- 直接删字段会爆一整串
- 只改 schema 或只改 renderer 都不够

## 2. `table`：`row.kind` 仍在决定 header/body 结构

### 当前主桥接

当前证据链：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `table.renderer.kindProp = "kind"`
  - `table.renderer.headerKind = "header"`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererSpecComponent.kindProp?: string`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderTableComponent()` 读取 `kindProp`
  - 通过 `row.props[kindProp] === headerKind` 区分 header rows 和 body rows
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 直接使用 `<row kind="header">`

### 为什么危险

这里的旧桥接不是视觉 alias，而是结构分流规则。

`row.kind` 当前实际承担的是：

- 哪些 `row` 应进入 `TableHeader`
- 哪些 `row` 应进入 `TableBody`

这意味着如果直接删掉 `kind`：

- 不是少一个旧 prop
- 而是 header/body 结构来源直接消失

### 对阶段的直接影响

- `Phase 2`
  - 不应把它当第一批 exposure-state 试点
- `Phase 4`
  - 必须先把“header/body 分流规则”从 legacy prop 读取中隔离出来
- `Phase 5`
  - 只有在新的结构表达路径已经存在时，`kindProp` 才能真正退出主路径

更细的执行顺序、停手边界和验证口，见：

- `docs/details/table-migration-card.md`

### 改造时不能误删的东西

- `component-capabilities.mjs` 中的 `kindProp`
- `render-node.tsx` 中 `renderTableComponent()` 对 header/body 的分流逻辑
- heavy test 里 `<row kind="header">` 对应的旧 fixture

### 最小替代思路

更合理的最终方向不是继续保留 `row.kind`，而是：

- 让 header/body 成为更显式的结构语义
- 或让 table normalization 在更上游就把结构分层完成

但在替代路径出现前，`row.kind` 仍是当前真实结构闸门。

## 3. `tabs`：`default` 仍在决定默认选中状态

### 当前主桥接

当前证据链：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `tabs.uiProtocol.attrAliases.default = "default-value"`
  - `tabs.renderer.defaultProp = "default"`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererSpecComponent.defaultProp?: string`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderTabsComponent()` 读取 `defaultProp`
  - 用 `getStructuredDefaultValue()` 计算 tabs 默认项
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - 直接构造 `defaultProp: "default"` 的 tabs spec
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 直接使用 `<tabs default="summary">`

### 为什么危险

`tabs.default` 当前不是简单“兼容旧命名”。

它已经深入到：

- uiProtocol attr alias
- renderer spec
- default selected tab 的运行时推导
- noscript fallback 对 sections 的展开顺序

所以如果直接删除 `default`：

- tabs 仍然能 render
- 但默认选中行为会先失真，再失去测试支撑

### 对阶段的直接影响

- `Phase 2`
  - 不应把 `tabs` 作为第一批 raw-candidate 试点
- `Phase 4`
  - 先隔离“默认选中值的来源计算”这类 legacy state bridge
- `Phase 5`
  - 只有在新的默认状态语义入口已经稳定后，`defaultProp` 才能退出

更细的执行顺序、停手边界和验证口，见：

- `docs/details/tabs-migration-card.md`

### 改造时不能误删的东西

- `component-capabilities.mjs` 中 `tabs.renderer.defaultProp`
- `render-node.tsx` 中 `renderTabsComponent()` 的 default 计算
- `render-node.test.ts` 中 tabs 的 default 行为断言
- `cli.build.heavy.test.ts` 中 `<tabs default="summary">` 的旧 fixture

### 最小替代思路

最终更合理的方向应该是：

- tabs 默认项来自新的正式语义字段或结构化状态表达
- 而不是继续沿用旧 `default` 包装字段

但在那之前，`defaultProp` 仍是 tabs 当前行为模型的真实输入。

## 4. `accordion`：`mode/default` 是三层旧桥叠在一起

### 当前主桥接

当前证据链：

- `packages/ahtml/src/config/component-capabilities.mjs`
  - `accordion.behavior.modeProp = "mode"`
  - `accordion.behavior.defaultProp = "default"`
  - `accordion.behavior.defaultMode = "multiple"`
  - `accordion.renderer.modeProp = "mode"`
  - `accordion.renderer.defaultProp = "default"`
  - `accordion.renderer.defaultMode = "multiple"`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `modeProp?: string`
  - `defaultProp?: string`
  - `defaultMode?: string`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderAccordionComponent()` 读取 `modeProp` 和 `defaultProp`
  - `resolveAccordionMode()` 决定 single/multiple
  - `resolveAccordionDefaultValue()` 决定默认展开项
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - 直接构造 `modeProp/defaultProp/defaultMode`
  - 覆盖：
    - fallback 渲染
    - 显式 default state 解析
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 仍直接使用 `<accordion>` / `<accordion-item ...>`
  - 并对 fallback 和 document shell 路径做断言

### 为什么危险

`accordion` 比 `tabs` 和 `table` 更难，因为它不是一个旧字段，而是三层叠加：

1. `mode`
   - 决定 single/multiple
2. `default`
   - 决定初始展开项
3. `defaultMode`
   - 当 authoring 没写 mode 时，提供 renderer fallback

这使它成为一个完整的 legacy state model，而不是单个 prop alias。

### 对阶段的直接影响

- `Phase 2`
  - 不应把 `accordion` 当试点开放样本
- `Phase 4`
  - 它是最典型的“legacy state bridge 需要先被单独隔离”的样本
- `Phase 5`
  - 必须确认新的显式状态模型已经存在，才能收掉 `modeProp/defaultProp/defaultMode`

更细的执行顺序、停手边界和验证口，见：

- `docs/details/accordion-migration-card.md`

### 改造时不能误删的东西

- `component-capabilities.mjs` 中 `behavior` 和 `renderer` 两侧关于 `mode/default/defaultMode` 的定义
- `render-node.tsx` 中：
  - `resolveAccordionMode()`
  - `resolveAccordionDefaultValue()`
  - `renderAccordionComponent()`
- `render-node.test.ts` 中对默认展开状态的断言
- heavy test 里 accordion fallback 相关断言

### 最小替代思路

如果后续要删 `mode/default`：

- 先要有新的显式 accordion 状态语义
- 再把 renderer 逻辑从旧字段读法切过去
- 最后才删除 type surface 和 heavy fixtures

在替代前直接删，几乎一定会让 runtime 行为和测试一起失真。

## 5. 为什么这三类组件不该混进 `Phase 2` 第一批试点

`Phase 2` 的目标是：

- 建 exposure-state 决策链
- 让最小试点 prop 贯穿 schema / prompt / runtime

`tabs`、`accordion`、`table` 这三类组件的问题核心却是：

- 旧结构字段或旧状态字段已经进入 runtime behavior model

也就是说，它们不是“低成本开放一个新 prop”问题，而是：

- legacy bridge 隔离
- runtime state model 替代
- heavy fixture 更新

所以它们应该晚于：

- `alert.variant`
- `badge.variant`

而不是和第一批试点混在一起。

## 6. 当前最会把旧路径钉死的测试

当前最值得警惕的不是单元代码本身，而是这些测试会把旧路径继续当正确行为：

### `render-node.test.ts`

它当前直接锁定：

- tabs 的 `defaultProp`
- accordion 的 `modeProp/defaultProp/defaultMode`
- accordion 的 fallback 结构

这意味着：

- 如果 Phase 4 隔离 bridge 但忘了同步更新这些断言
- 测试会继续把旧路径当真相来源

### `cli.build.heavy.test.ts`

它当前直接锁定：

- `<row kind="header">`
- `<tabs default="summary">`
- accordion 相关输入和 fallback
- `class="ahtml-document-shell"`

这意味着：

- `Phase 5` 不是删字段就结束
- fixture、artifact 断言、shell 断言都要一起切

## 7. 推荐使用方式

如果下一步真的开始实施：

- 做 `Phase 4A`
  - 先读本文
  - 再读 `docs/architecture/phase-4-implementation-draft.md`
  - 再看 `packages/ahtml/src/config/component-capabilities.mjs`
  - 再看 `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

- 做 `Phase 5A/5B/5C`
  - 先读本文
  - 再读 `docs/architecture/phase-5-implementation-draft.md`
  - 再看 `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 再对照 `docs/architecture/phase-completion-criteria.md`

## 8. 当前总判断

`tabs`、`accordion`、`table` 当前都已经不是单纯的“组件资料”问题。

它们是：

- runtime bridge 问题
- renderer state/structure 问题
- heavy test fixture 问题

其中：

- `table`
  - 最像结构桥
- `tabs`
  - 最像单状态桥
- `accordion`
  - 最像完整 legacy state model

如果后续要继续拆高风险样本，`accordion` 应优先级最高。
