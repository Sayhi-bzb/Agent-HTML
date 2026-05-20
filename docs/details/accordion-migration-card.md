# Accordion Migration Card

> 历史资料。本文记录的是迁移执行期对 `accordion` 兼容桥的拆分方式，不再是当前主 docs 入口。
> 当前现实说明请优先看 `docs/details/high-risk-runtime-bridges.md`。

本文只聚焦 `accordion` 这一个高风险样本。

它不是组件说明书，也不是全局架构文档。它只回答更具体的执行问题：

- 当前 `accordion` 的 legacy bridge 究竟穿过了哪些真实代码层
- 为什么 `accordion` 比 `tabs` 更难迁
- `4A/4B/5A/5B/5C` 每刀必须先保什么、替什么、最后删什么
- 哪些测试会把旧行为重新钉回主路径

如果只需要高层结论，请先看：

- `docs/details/high-risk-runtime-bridges.md`

如果已经准备进入 `Phase 4/5`，再同时对照：

- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/phase-5-implementation-draft.md`
- `docs/architecture/execution-checklist.md`

## 1. 当前真实桥接链

`accordion` 当前不是“schema 有旧字段、renderer 里顺手兼容一下”。

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
  -> render-node.test.ts
  -> cli.build.heavy.test.ts
```

这条链上目前能直接看到的事实是：

- `packages/core/src/schema-overlays.ts`
  - `accordion` 仍公开 `mode`
  - `accordion` 仍公开 `default`
  - `accordion-item` 仍作为结构子节点公开 `value`、`title`
- `packages/ahtml/src/config/component-capabilities.mjs`
  - `behavior.modeProp = "mode"`
  - `behavior.defaultProp = "default"`
  - `behavior.defaultMode = "multiple"`
  - `renderer.modeProp = "mode"`
  - `renderer.defaultProp = "default"`
  - `renderer.defaultMode = "multiple"`
- `packages/ahtml/src/config/render-capabilities.mjs`
  - `accordion` renderer kind 明确要求：
    - `modeProp`
    - `defaultProp`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererSpecComponent` 仍正式允许：
    - `modeProp`
    - `defaultProp`
    - `defaultMode`
  - `RuntimeVerificationState.behavior` 也允许这些字段
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderAccordionComponent()` 直接读取 `modeProp` / `defaultProp`
  - `resolveAccordionMode()` 负责 single/multiple fallback
  - `resolveAccordionDefaultValue()` 负责逗号分隔默认展开项解析
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - 直接构造 `modeProp/defaultProp/defaultMode`
  - 锁定 fallback 和默认展开行为
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 仍以 `<accordion>` / `<accordion-item>` 作为当前主路径输入
  - 仍锁定 noscript fallback 和 document shell 内的输出

## 2. 为什么 `accordion` 比 `tabs` 更难

`tabs` 主要是单状态桥：

- `default -> defaultProp`

`accordion` 不是。

它至少叠了三层旧状态模型：

1. `mode`
   - 决定 `single` 还是 `multiple`
2. `default`
   - 决定默认展开哪些 item
3. `defaultMode`
   - 在 authoring 未显式给 `mode` 时提供 renderer fallback

换句话说，`accordion` 当前不是一个 alias 问题，而是一个完整的 legacy state model：

- schema 公开旧字段
- verification data 记住旧状态字段
- renderer spec 允许旧状态字段
- renderer 实现依赖旧状态字段
- unit tests 和 heavy tests 都以旧状态模型为真

这就是为什么：

- `accordion` 不适合 `Phase 2` 第一批 exposure-state 试点
- 它更像 `Phase 4A` 的 state bridge 隔离样本
- 也是 `Phase 5B` 最危险的旧字段下线样本

## 3. 当前行为里不能误删的东西

下面这些不是“代码脏一点但无关紧要”，而是当前主路径行为来源：

- `packages/core/src/schema-overlays.ts`
  - `accordion.props.mode`
  - `accordion.props.default`
- `packages/ahtml/src/config/component-capabilities.mjs`
  - `behavior.modeProp`
  - `behavior.defaultProp`
  - `behavior.defaultMode`
  - `renderer.modeProp`
  - `renderer.defaultProp`
  - `renderer.defaultMode`
- `packages/ahtml/src/config/render-capabilities.mjs`
  - `accordion.requiredFields` 中对 `modeProp/defaultProp` 的要求
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererSpecComponent.modeProp`
  - `RendererSpecComponent.defaultProp`
  - `RendererSpecComponent.defaultMode`
  - `RuntimeVerificationState.behavior.modeProp/defaultProp/defaultMode`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderAccordionComponent()`
  - `resolveAccordionMode()`
  - `resolveAccordionDefaultValue()`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `renders a no-script fallback for accordion items when configured`
  - `parses explicit accordion default state instead of opening every item`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 两个 build 场景里的 `accordion` authoring 输入
  - 对 noscript fallback 的输出断言

如果没有替代路径就删这些点，不是“重构未完成”，而是会直接把当前运行时状态模型打断。

## 4. `4A` 该做什么，不该做什么

`4A` 的目标不是删除旧字段，而是把 `accordion` 的 legacy state bridge 从 renderer 主分支里隔离出来。

### `4A` 必须做到

- 在 `renderer/types.ts` 明确把这组字段标成 legacy accordion state bridge，而不是继续和其他字段平铺混在一起
- 在 `render-node.tsx` 抽出显式 helper，至少把下面两类责任拆开：
  - `resolveLegacyAccordionMode`
  - `resolveLegacyAccordionDefaultValue`
- 在 `component-capabilities.mjs` 让人一眼能区分：
  - 正常 projection spec
  - legacy compatibility state bridge

### `4A` 不该做到

- 不删 `modeProp/defaultProp/defaultMode`
- 不改 `app.tsx`
- 不把 layout projection 一起混进来
- 不顺手把 tabs/table 的 bridge 也做成大一统抽象，如果还没证明边界真的相同

### `4A` 的停手条件

- `renderAccordionComponent()` 主分支不再直接散落状态解析逻辑
- 但最终渲染行为和当前测试基线仍保持一致

### `4A` 的最窄验证口

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`

## 5. `4B` 该做什么，不该做什么

`4B` 的目标不是处理 legacy bridge，而是把 UI projection 和 layout projection 的模块 ownership 拆开。

对 `accordion` 来说，这一刀的重点是：

- `accordion` 继续归属 UI projection
- 但不再和 layout dispatch、通用 text rendering、fallback 裸混在一个大文件主分支里

### `4B` 必须做到

- `render-node.tsx` 退回 dispatcher
- `accordion` 渲染逻辑进入 UI projection 专属模块
- `accordion` 的 structured child extraction 与状态桥读取留在 UI projection 层，不让 layout 层复用这些 helper

### `4B` 不该做到

- 不借机改 shell CSS
- 不发明新的 accordion 公开状态语义
- 不把 `accordion` 误归到 layout projection，只因为它看起来像“展开/收起结构”

### `4B` 的停手条件

- `accordion` 已不再和 layout/UI/text/fallback 四类逻辑共处一个大分支
- 但 runtime contract 同源性没有被打断

### `4B` 的最窄验证口

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`

## 6. `5A` 之前必须先确认什么

`5A` 的目标是下线旧公开 contract 入口。

但对 `accordion` 而言，`5A` 不能只理解成“把 schema 上的 `mode/default` 删掉”。

在做 `5A` 之前，至少要先确认下面三件事已经成立：

1. 新的 accordion 状态语义已经存在
   - 不是文档假设
   - 而是 schema / prompt 上已经有正式入口
2. renderer 已经能从新入口驱动相同行为
   - 包括 single/multiple
   - 包括默认展开项
3. compatibility bridge 已退到显式兼容层
   - 不再继续占据主公开 contract

只要这三条有一条不成立，`5A` 就不能删公开字段。

## 7. `5B` 是 `accordion` 最危险的一刀

`5B` 的目标是下线 runtime spec 里的旧字段。

对 `accordion` 来说，这意味着要收掉：

- `modeProp`
- `defaultProp`
- `defaultMode`

这一步真正危险的地方在于，它同时影响：

- renderer spec 类型面
- runtime verification behavior
- render-capabilities kind requirements
- render-node state resolution

### `5B` 的安全顺序

1. 先让 renderer 主路径完全走新状态模型
2. 再让 compatibility bridge 退到显式转换层
3. 再删 `render-capabilities.mjs` 对 `modeProp/defaultProp` 的 requiredFields
4. 再删 `renderer/types.ts` 对这些字段的正式允许面
5. 最后删 `component-capabilities.mjs` 中对应 bridge 字段

如果把顺序反过来，例如先删类型面或 requiredFields：

- renderer 代码可能暂时还能跑
- 但 parity / verification / tests 会立刻进入半迁移状态

### `5B` 的最窄验证口

- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

## 8. `5C` 需要一起收哪些残留

`5C` 对 `accordion` 的难点不在代码删除量，而在“最后哪些东西还在继续保护旧路径”。

至少要一起处理：

- `render-node.test.ts`
  - 不能再继续把 `modeProp/defaultProp/defaultMode` 当测试搭建前提
- `cli.build.heavy.test.ts`
  - 不能继续只证明旧 authoring 输入
- docs
  - 不能继续把 `mode/default` 写成当前有效主路径

如果 `5C` 只改文档，不改测试：

- 旧路径会被测试重新钉回正确行为

如果 `5C` 只改测试，不改 docs：

- 后续执行者会继续误把旧桥接当当前 contract

## 9. 当前最诚实的替代顺序

如果未来真的要把 `accordion` 从旧状态模型迁出去，当前最诚实的顺序应是：

1. `4A`
   - 隔离 legacy accordion state bridge
2. `4B`
   - 把 accordion projection 归位到清晰的 UI projection ownership
3. 新状态语义落地
   - 先成为真实 schema / prompt / renderer 输入
4. `5A`
   - 下线旧公开 contract 入口
5. `5B`
   - 下线 runtime spec 旧字段
6. `5C`
   - 收测试、doctor、docs 和 heavy fixtures

这条顺序的关键不是“好看”，而是能保证任一中间态都仍然可解释：

- 要么是旧桥仍在主路径
- 要么是新桥已经接管主路径

而不是两边都半完成。

## 10. 当前总判断

`accordion` 当前是整个工作树里最典型的 legacy state bridge 样本之一。

它难在三点：

- 旧状态字段已经跨过 schema、verification、renderer、tests
- 旧状态模型不是单字段，而是 `mode/default/defaultMode` 的完整组合
- heavy tests 仍把旧输入和 fallback 输出当成当前真相

因此最适合把它视为：

- `Phase 4A` 的优先高风险隔离样本
- `Phase 5B` 的重点下线样本

而不应把它当作：

- `Phase 2` 低成本 prop exposure 试点
- 或“最后顺手删字段”的清理项
