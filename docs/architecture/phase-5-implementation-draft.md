# Phase 5 Implementation Draft

本文把 `docs/roadmap.md` 和前面的 `Phase 2/3/4` 实施草案收束到最后一步：旧机制下线与最终单一路径收口。

它回答的是最现实的几个问题：

- 当前还有哪些旧机制残留在 schema、prompt、renderer、shell、doctor、heavy tests 里
- 为什么 `Phase 5` 不是“删一波字段”，而是一组必须按顺序完成的收束动作
- 哪些测试目前还把旧路径当成正确行为
- 最终“完成”应该由哪些证据证明，而不是靠文档声称

## 1. 当前真实基线

到当前工作树为止，旧机制仍然还保留在若干显式兼容层和迁移资料里，但主公开 contract、主 runtime spec 和 heavy happy-path 已经完成了大部分收口。

### 1.1 旧公开字段仍保留在兼容语义层，不再是主公开 contract

`packages/core/src/schema-overlays.ts` 仍然定义：

- `alert.tone`
- `badge.tone`
- `row.kind`
- `tabs.default`
- `accordion.mode`
- `accordion.default`

但当前代码真相已经变成：

- `packages/core/src/public-agent-contract.ts`
  - 公开主路径会过滤 `origin === "legacy"` 的 semantic props
- `packages/ahtml/src/cli/schema.mjs`
  - prompt 只消费过滤后的公开 contract
- `packages/core/src/public-agent-contract.test.ts`
  - 已明确保护 `row` / `tabs` / `accordion` 在公开 contract 中不再暴露这些旧字段

这意味着：

- 这些字段仍是显式兼容语义层的一部分
- 但已经不再是当前 schema / prompt 的主公开输入来源

### 1.2 runtime spec 主路径已收紧，旧桥通过 `legacyBridges` 保留

`packages/ahtml/src/config/component-capabilities.mjs` 和
`packages/ahtml/src/cli/runtime-template/src/renderer/types.ts` / `render-node.tsx`
当前兼容桥仍显式记录：

- `legacyBridges.state`
- `legacyBridges.structuralRole`
- `legacyBridges.variant`

而当前主路径已经改成：

- `RendererSpecComponent` 顶层不再正式承认 `kindProp` / `modeProp` / `defaultProp` / `defaultMode`
- `RuntimeVerificationState.behavior` 已改成显式 `stateBridge`
- `render-ui-node.tsx` / `render-capabilities.test.ts` 直接保护“兼容桥存在，但不再是主 spec 形状”

所以旧机制仍然深入运行时行为，但已经不再是 runtime spec 的顶层主路径。

### 1.3 shell 仍然默认提供结构语义

`packages/ahtml/src/cli/runtime-template/src/app.tsx` 仍然把下面这些当成主路径默认值：

- `ahtml-document-shell`
- `ahtml-section-stack`
- `ahtml-prose-block`

这意味着即便 `Phase 4` 已经开始把 layout projection 明确化，当前 shell 仍然可能替 authoring surface 补结构。

### 1.4 测试也还在把旧路径当成“当前正确行为”

此前这条是 `Phase 5` 的主要阻塞点；当前已经不是。

- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - happy-path 输入已切到：
    - `variant`
    - 标准 `<table><row>...`
    - 结构化 `<tabs><tab ...`
  - 输出当前保护：
    - `class="ahtml-runtime-host ahtml-runtime-document"`
    - `tone="` / `kind="` / `default="` 不重新出现在 artifact
    - tabs / accordion / table 的运行时行为仍成立
- `packages/ahtml/src/cli/cli.test.ts`
  - 当前已直接保护 prompt 和公开 contract 不再把旧字段作为主公开入口
- `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
  - 当前 full heavy gate 已证明 doctor / runtime parity / renderableAgentComponents 链路可过
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - 当前已补到能证明代表性最终 syntax 可渲染，且不回退到旧输入依赖

这意味着 `Phase 5` 的一个核心工作不是“改实现”，而是同步更新验证口径，让测试从“保护旧路径”转成“证明最终单一路径”。

## 2. 为什么 Phase 5 不能直接开删

最容易犯的错是把 `Phase 5` 当作删除周。

这在当前项目里会失败，原因很具体：

### 2.1 doctor/parity 会放大全链断裂

`doctor-checks.mjs` 会同时检查：

- `renderableAgentComponents`
- `verificationData`
- `rendererMapping`
- renderer registry parity
- runtime surface parity

如果上游删字段、下游没同步，失败不会只出现在一个地方，而会沿：

```txt
schema
  -> runtimeContract
  -> runtimeCapability
  -> manifest
  -> verification state
  -> doctor
```

整条链爆开。

### 2.2 heavy build / preview tests 还依赖旧 authoring surface

只要输入 fixture 里仍大量使用：

- `tone`
- `kind`
- `default`

那么实现再怎么想收口，测试都会把旧路径重新钉住。

### 2.3 docs 现在是迁移中状态，不是最终态

当前 `roadmap.md`、`implementation-slices.md`、`phase-2/3/4` 草案已经能说明迁移顺序，
但它们仍在描述 bridge 如何存在、何时退出。

`Phase 5` 的 docs 工作不是再加一篇迁移稿，而是把“过渡语言”回写成“最终口径”。

## 3. Phase 5 的真实目标，不要写成抽象口号

`Phase 5` 真正要交付的不是“更干净的代码”，而是下面五件可以验证的事情：

1. CLI schema / prompt 不再把 legacy field 当主公开能力
2. runtime spec 不再把 legacy bridge 字段当主路径 schema
3. renderer 的主要结构和样式决策来自 schema + mapping + layout projection，而不是旧壳默认值
4. doctor / runtime parity / heavy tests 的验证口径已经切换到最终单一路径
5. docs 不再把迁移桥描述成长期结构事实

这五件事缺一不可，否则就是“局部完成”。

## 4. 当前残留点的诚实清单

### 4.1 `schema-overlays.ts`

当前残留：

- 旧字段仍然就是公开 schema 来源

Phase 5 目标：

- 它不再承担旧包装字段的主 contract 职责
- 如果还保留兼容定义，也必须显式成为兼容层，而不是默认公开层

### 4.2 `schema.mjs`

当前残留：

- `formatPrompt()` 仍完全基于 `component.props` 输出
- 所以只要 legacy prop 还在 schema 里，prompt 就会继续把它们当主推荐写法

Phase 5 目标：

- prompt 输出不再把 legacy field 写成主语义入口
- prompt 只反映最终公开 schema

### 4.3 `render-capabilities.mjs`

当前残留：

- runtime mapping 仍把 legacy state/role fields 当显式 spec 成员

Phase 5 目标：

- `kindProp`
- `modeProp`
- `defaultProp`
- `defaultMode`

这些不再作为主路径 renderer spec 的长期组成部分。

### 4.4 `render-node.tsx`

当前残留：

- helper 抽离前，它仍直接解释 legacy props
- 即使 Phase 4 已抽 helper，Phase 5 也要决定 helper 是否还能留在主路径

Phase 5 目标：

- 旧桥接最多作为显式兼容入口存在
- 不能继续决定主渲染行为模型

### 4.5 `app.tsx`

当前残留：

- 默认 shell 结构仍可替 authoring surface 提供页面骨架

Phase 5 目标：

- shell 只保留宿主与展示职责
- 不再隐含“没有 layout 也有默认文档结构”

### 4.6 `doctor-checks.mjs`

当前残留：

- 只要 runtime capability 和 manifest 里还有旧桥，doctor 仍会把它们当合法事实

Phase 5 目标：

- doctor 验证的是最终 contract
- 而不是“旧字段仍被接受也算通过”

## 5. Slice 5A 的真实 patch 顺序

`5A` 的目标是：

- 下线旧公开 contract 入口
- 先收紧上游，不直接冲 runtime 行为

### Step 1

先在 core schema source 中区分：

- 最终公开字段
- 显式兼容字段

即便代码上还没彻底删除，也不能再让兼容字段默认出现在 agent-facing 主 contract 中。

### Step 2

更新 `schema.mjs` / `cli.test.ts` 的期望：

- prompt 中不再把 `tone`、`kind`、`mode`、`default` 当主要 authoring 能力
- CLI JSON schema 里若还有兼容字段，也应有明确退出边界

### Step 3

同步修正 fixture 与轻量测试输入：

- 把最基础的正例从 legacy 写法切到最终写法

否则后面的测试仍会被旧输入钉住。

停手条件：

- 如果此时开始大改 renderer spec 或 app shell，就已经越过 `5A`

## 6. Slice 5B 的真实 patch 顺序

`5B` 的目标是：

- 下线 runtime spec 中的旧字段
- 让 runtime 的稳定形状与最终 contract 一致

### Step 1

先从 `renderer/types.ts` 收类型面。

因为只要类型面继续把这些字段视为常规字段：

- 下游实现就会被鼓励继续使用它们

### Step 2

在 `render-capabilities.mjs` 里同步收窄 renderer kind definitions 和 mapping 生成。

这一刀要特别小心：

- table / tabs / accordion 如果还没有新的稳定表示法，不能直接硬删
- 必须先确认 `Phase 2/3/4` 已经提供了替代路径

### Step 3

改 `render-node.tsx`：

- legacy bridge helper 若仍保留，只允许走显式兼容分支
- 主 projection 分支不再把 legacy 解释当默认路径

### Step 4

更新中层验证：

- `render-capabilities.test.ts`
- `runtime-contract.test.ts`
- `render-node.test.ts`

停手条件：

- 如果此时开始大量回写 docs 或改 doctor 提示文案，说明把 `5C` 混进来了

## 7. Slice 5C 的真实 patch 顺序

`5C` 的目标是：

- 收尾 docs
- 收尾 doctor / preview / build gate
- 用最终验证链证明项目已经单路径收束

### Step 1

先改 heavy tests 的 authoring inputs 和 expectations。

这是当前最现实的工作，因为：

- `cli.build.heavy.test.ts` 的 happy-path 之前还直接用 `tone` / `kind` / `default`
- 之前还直接断言 `ahtml-document-shell`

如果这些不改，最终代码即便收口，heavy tests 也会继续保护旧路径。

### Step 2

再收 doctor / runtime parity 的最终口径：

- `verification-data-parity`
- `renderer-mapping-parity`
- `renderer-registry-parity`

这些检查应继续存在，但现在应该验证的是最终单一路径，而不是旧桥接仍然合法。

### Step 3

最后回写 docs：

- `roadmap.md`
- `todo.md`
- 以及必要时 `schema.md` / `layout.md` / `phase-* draft`

回写原则：

- 保留事实资料和审计文档
- 但执行型文档不再把已删除桥接写成当前有效路径

### Step 4

最终 gate 才应包括：

- `packages/ahtml/src/cli/cli.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`
- 视改动面决定：
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`

这里和前几个阶段不同：

- `Phase 5` 的定义本来就包含最终收口
- 所以不能再只跑最窄单点测试来声称完成

## 8. 当前最容易犯的错

### 8.1 只删 schema 字段，不改测试 fixture

结果是：

- 代码收了
- 但所有 heavy tests 全部报旧 authoring 输入失效

这不是坏事，但如果没有提前按阶段调整，会让失败面变得不可解释。

### 8.2 只改实现，不改 docs

这样最终会留下两套真相：

- 代码是一套
- 执行文档还是迁移中的另一套

这和当前目标正相反。

### 8.3 只改 docs，不证明 gate

`Phase 5` 是最后收口阶段，不可能只靠文档 diff 证明完成。

### 8.4 把兼容层隐藏起来而不是显式化

如果不得不保留兼容层，它必须是显式、可定位、可删除的。

否则项目只是在换地方藏旧路径。

## 9. 当前最诚实的验证顺序

`5A` 先看：

- `packages/ahtml/src/cli/cli.test.ts`
- `packages/core/src/public-agent-contract.test.ts`

`5B` 再加：

- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

`5C` 最后加：

- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`
- 以及真正被改到的 heavy CLI gates

也就是说：

- 前几个阶段可以避免大闸
- `Phase 5` 不能

## 10. 对当前文档理解的修正

基于当前代码，`Phase 5` 不是“扫尾杂项”。

它实际上是：

- 收主 contract
- 收 runtime spec
- 收 shell 默认值
- 收 doctor/parity 口径
- 收 heavy tests
- 收 docs

六件事的联动收口。

如果把它低估成“最后删点字段”，最后只会得到：

- 文档说已经收口
- 测试还在保护旧路径
- doctor 还在接受旧能力

这不算完成。
