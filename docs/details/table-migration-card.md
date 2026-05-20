# Table Migration Card

> 历史资料。本文记录的是迁移执行期对 `table` 兼容桥的拆分方式，不再是当前主 docs 入口。
> 当前现实说明请优先看 `docs/details/high-risk-runtime-bridges.md`。

本文只聚焦 `table` 这一个高风险样本。

它不解释全局架构，也不重复组件资料。它只回答更具体的执行问题：

- 当前 `table` 的 legacy bridge 究竟穿过了哪些真实代码层
- 为什么 `row.kind` 不是普通旧 prop，而是结构分流闸门
- `4A/4B/5A/5B/5C` 每刀应先保什么、替什么、最后删什么
- 当前哪些测试在保护旧路径，哪些地方其实还没有足够保护

如果只需要高层结论，请先看：

- `docs/details/high-risk-runtime-bridges.md`

如果已经准备进入 `Phase 4/5`，再同时对照：

- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/phase-5-implementation-draft.md`
- `docs/architecture/execution-checklist.md`

## 1. 当前真实桥接链

`table` 当前的问题不是“还留着一个 legacy 命名没清”。

它已经穿过一条完整主链：

```txt
schema-overlays.ts
  -> generated/component-schema.generated.ts
  -> public-agent-contract.ts
  -> schema.mjs
  -> component-capabilities.mjs
  -> render-capabilities.mjs
  -> renderer/types.ts
  -> render-node.tsx
  -> cli.build.heavy.test.ts
```

这条链上目前能直接看到的事实是：

- `packages/core/src/schema-overlays.ts`
  - `row` 仍公开 `kind`
  - `kind` 的可选值仍是 `header` / `body`
- `packages/ahtml/src/config/component-capabilities.mjs`
  - `table.renderer.kindProp = "kind"`
  - `table.renderer.headerKind = "header"`
- `packages/ahtml/src/config/render-capabilities.mjs`
  - `table` renderer kind 明确要求：
    - `kindProp`
    - `headerKind`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererSpecComponent` 仍正式允许：
    - `kindProp`
    - `headerKind`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderTableComponent()` 直接读取 `kindProp`
  - 按 `row.props[kindProp] === headerKind` 分流 header rows 和 body rows
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - happy-path build 场景已切到标准 `<table><row>...`，不再把 `<row kind="header">` 当主路径输入

## 2. 为什么 `table` 比看起来更危险

`row.kind` 当前不是视觉 alias，不是轻量状态字段，也不是普通 metadata。

它当前直接决定：

- 哪些 `row` 进入 `TableHeader`
- 哪些 `row` 进入 `TableBody`

也就是说，它是结构分流规则。

如果没有替代路径就删掉它：

- 不是少一个旧 prop
- 而是 header/body 结构来源直接消失

这和 `tabs.default`、`accordion.mode/default` 的区别是：

- `tabs` 更像单状态桥
- `accordion` 更像完整状态模型
- `table` 更像结构角色桥

## 3. 当前最诚实的测试判断

`table` 比 `tabs` 更危险的一点是：它的结构桥当前保护得更弱。

目前可以诚实确认的是：

- heavy build fixture 继续使用 `<row kind="header">`
  - 否，happy-path 已切到标准 `<table><row>...`
- `render-node.tsx` 明确按 `kindProp` 分流 header/body
  - 是
- `render-node.test.ts` 有专门断言 table header/body 分流
  - 证据缺失
- `cli.build.heavy.test.ts` 明确断言最终输出里的 header/body 结构
  - 证据缺失

这意味着：

- 当前 `table` 的旧桥是真实主路径
- 但它的结构行为并没有被足够聚焦地钉住
- 所以后续改造时，最容易出现“分流规则被改坏了，但测试只证明 table 还存在”

## 4. 当前行为里不能误删的东西

下面这些都不是可以顺手删的低风险点：

- `packages/core/src/schema-overlays.ts`
  - `row.props.kind`
- `packages/ahtml/src/config/component-capabilities.mjs`
  - `table.renderer.kindProp`
  - `table.renderer.headerKind`
- `packages/ahtml/src/config/render-capabilities.mjs`
  - `table.requiredFields` 中对 `kindProp/headerKind` 的要求
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererSpecComponent.kindProp`
  - `RendererSpecComponent.headerKind`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderTableComponent()`
  - `renderTableRow()`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 当前更该关注的是：happy-path 已切到标准 table 输入，但 artifact 级 header/body 结构断言仍偏弱

如果没有替代路径就删这些点，table 仍然也许能 render 出一些行，但 header/body 结构语义会先变得不可解释。

## 5. `4A` 该做什么，不该做什么

`4A` 对 `table` 的目标不是删除 `kindProp`，而是把“header/body 角色分流”从主渲染分支里显式隔离出来。

### `4A` 必须做到

- 在 `renderer/types.ts` 明确把 `kindProp/headerKind` 归到 structural-role bridge 一组
- 在 `render-node.tsx` 抽出显式 helper，例如：
  - `resolveLegacyTableRowRole`
  - 或 `partitionLegacyTableRows`
- 在 `component-capabilities.mjs` 让人一眼能区分：
  - table 正常 projection spec
  - legacy role bridge

### `4A` 不该做到

- 不删 `kindProp/headerKind`
- 不改 `app.tsx`
- 不把 table 误判成 layout 问题
- 不顺手设计新的 table authoring 结构语义

### `4A` 的停手条件

- `renderTableComponent()` 主分支不再直接散落角色分流逻辑
- 但现有 table 渲染行为仍与当前基线一致

### `4A` 的最窄验证口

- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

补充现实提醒：

- 当前 table 的 focused unit coverage 明显偏弱
- 所以 `4A` 之前或之中，补一条 table header/body 分流断言是很划算的

## 6. `4B` 该做什么，不该做什么

`4B` 对 `table` 的目标是把它继续归到 UI projection ownership，而不是让它和 layout projection 混在一起。

### `4B` 必须做到

- `render-node.tsx` 退回 dispatcher
- table projection 进入 UI projection 模块
- row/cell child extraction 和角色分流留在 UI projection 层

### `4B` 不该做到

- 不借机改 shell CSS
- 不把 table 结构分流问题当成 layout primitive 问题
- 不把新的 table 结构语义设计混进这一刀

### `4B` 的停手条件

- table projection 已不再和 layout/UI/text/fallback 四类逻辑共处一个主分支
- 但 contract 同源性仍保持

### `4B` 的最窄验证口

- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

## 7. `5A` 之前必须先确认什么

`5A` 的目标是下线旧公开 contract 入口。

对 `table` 而言，在删 `row.kind` 之前，至少要先确认：

1. 新的 header/body 结构语义已经存在
   - 例如新的显式结构节点
   - 或更上游的 normalization 规则
2. renderer 已能从新结构语义得到同样的 header/body 分流结果
3. `row.kind` 已退到显式 compatibility bridge

只要这三条有一条不成立，`row.kind` 还不能退出公开面。

## 8. `5B` 的真正危险点

`5B` 对 `table` 的核心动作是下线：

- `kindProp`
- `headerKind`

它影响的面包括：

- renderer spec 类型面
- render-capabilities requiredFields
- render-node header/body 分流逻辑

### `5B` 的安全顺序

1. 先让 renderer 主路径完全走新结构语义
2. 再让 `kindProp/headerKind` 退到显式兼容层
3. 再删 `render-capabilities.mjs` 对它们的 requiredFields
4. 再删 `renderer/types.ts` 对它们的正式允许面
5. 最后删 `component-capabilities.mjs` 中 table 的 `kindProp/headerKind`

### `5B` 的最窄验证口

- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

## 9. `5C` 需要补上的不只是收桥，还有结构保护

`5C` 对 `table` 来说，不应只是把 `<row kind="header">` 改掉。

还应一起处理：

- `render-node.test.ts`
  - 需要增加 focused table 结构断言，明确证明 header/body 仍正确分流
- `cli.build.heavy.test.ts`
  - happy-path fixture 已切到标准 `<table><row>...` authoring，但仍不能只证明 table 出现在 artifact 里
- docs
  - 不能继续把 `row.kind` 写成当前主路径事实

如果 `5C` 只改 docs 或只删旧字段，不补结构行为保护：

- table 的结构语义回归会最容易漏掉

## 10. 当前总判断

`table` 当前是一个典型的结构角色 legacy bridge 样本。

它难在两点：

- `row.kind` 当前是 header/body 分流的真实来源
- 但 focused 测试保护比 `accordion` 更弱

因此更合理的定位是：

- `Phase 4A` 的 structural-role bridge 隔离样本
- `Phase 5C` 需要先补结构保护再收桥的样本

而不应把它当作：

- `Phase 2` 第一批低成本试点
- 或“把一个旧 prop 名字换掉”的简单收尾项
