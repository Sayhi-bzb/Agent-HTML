# Phase 4 Implementation Draft

本文把 `docs/roadmap.md` 和 `docs/architecture/implementation-slices.md` 里的 `Phase 4` 从“高风险解耦阶段”继续细化成接近真实 patch 的实施草案。

它重点回答：

- 当前 runtime contract、renderer mapping、`render-node.tsx`、`app.tsx`、doctor/parity 是怎么互相拴住的
- 哪些地方只是 renderer 实现细节，哪些地方已经变成公开 contract 的事实来源
- `4A/4B/4C` 分别应该从哪里切，才能先拆职责、再拆模块、最后拆宿主壳
- 哪些测试是 `Phase 4` 的真正 gate，哪些只是后置大闸

## 1. 当前真实基线

基于当前工作树，`Phase 4` 的真实问题不是“runtime 很复杂”，而是当前存在一条非常明确的耦合链：

```txt
schema.mjs
  -> runtime-contract.mjs
  -> render-capabilities.mjs
  -> rendererMapping / verificationData
  -> render-node.tsx
  -> app.tsx
  -> doctor / runtime parity / runtime template checks
```

更具体地说：

- `packages/ahtml/src/cli/schema.mjs`
  - 调 `createPublicAgentContract()`
  - 再立刻调用 `createRuntimeContract(publicAgentContract.components)`
  - 也就是说 CLI schema 输出已经同时携带：
    - `verificationData`
    - `rendererMapping`
- `packages/ahtml/src/config/runtime-contract.mjs`
  - 把 schema components 归一成：
    - `verificationData`
    - `rendererMapping`
    - `elementRegistrySpec`
    - `rendererKindSpec`
- `packages/ahtml/src/config/render-capabilities.mjs`
  - 是 runtime projection 真正的“映射事实层”
  - 里面同时定义：
    - component capability definitions
    - uiProtocol slots/normalization
    - renderer kind field requirements
    - renderer slot generation
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - 直接吃 `rendererMapping`
  - 同时承担：
    - UI projection
    - structured child node 读取
    - legacy field 翻译
    - noscript fallback
    - 部分默认结构类名注入
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
  - 不是纯宿主
  - 仍然通过 shared shell CSS 强行提供：
    - `ahtml-document-shell`
    - `ahtml-section-stack`
    - `ahtml-prose-block`
    - preview/gallery grid 骨架
- `packages/ahtml/src/cli/doctor-checks.mjs`
  - 会把：
    - `getCliSchemaOutput()`
    - `createRuntimeContractFromSchema()`
    - runtime manifest / verification state
    全部拉进同一个 parity 检查链

所以 `Phase 4` 的风险本质是：

- 一边要拆 renderer/runtime host 职责
- 一边又不能打断 schema 到 doctor 的一致性证明链

## 2. 当前耦合点，不要混成一种风险

### 2.1 contract-to-runtime 耦合

`schema.mjs` 当前不是单纯 prompt 输出器，它已经把 runtime contract 一起打包出来了：

- `verificationData`
- `rendererMapping`

这意味着：

- renderer mapping 的变化不是纯 runtime 私有改动
- 任何字段重排都会立刻影响 doctor / runtime parity / template sync

因此 `Phase 4` 不能假设“我只是重构 runtime，不会影响公开面”。

### 2.2 renderer-spec 耦合

`render-capabilities.mjs` 当前同时做四件事：

1. capability definition source
2. verificationData builder
3. rendererMapping builder
4. renderer kind requirement registry

这会导致一个现实问题：

- 想改 renderer 行为时，很容易同时碰 verification schema、runtime registry spec、slot generation

所以 `Phase 4` 的第一刀不该先动 `app.tsx`，而应先拆 `render-node.tsx` 和 mapping responsibilities。

### 2.3 legacy bridge 耦合

当前 legacy 字段不是只留在旧 schema 里，而是贯穿 runtime spec：

- `render-capabilities.mjs`
  - table 仍依赖 `kindProp`
  - tabs 仍依赖 `defaultProp`
  - accordion 仍依赖 `modeProp` / `defaultProp` / `defaultMode`
- `renderer/types.ts`
  - `RendererSpecComponent` 仍显式包含：
    - `defaultProp`
    - `modeProp`
    - `defaultMode`
    - `kindProp`
- `render-node.tsx`
  - 直接消费这些字段来驱动 tabs / accordion / table 行为

这说明 `Phase 4` 的第一层目标不是删除 legacy 字段，而是先把“legacy 翻译责任”隔离出来。

### 2.4 shell 耦合

`app.tsx` 当前通过共享 CSS 默认提供页面结构含义：

- `.ahtml-document-shell`
- `[data-agent-html-component="page"] { display: grid; gap: ... }`
- `.ahtml-prose-block`
- `.ahtml-section-stack`
- 特定 content block 下的 spacing reset

这意味着当前页面就算 authoring 没表达 layout，runtime shell 也会替它补一套。

所以 `Phase 4` 的最后一刀才应该碰这个文件，因为：

- 一旦先拆 shell，而 layout projection 还没站稳，页面会立刻塌

## 3. 现有测试真正覆盖了什么

### 3.1 `render-capabilities.test.ts`

当前主要证明：

- renderer element registry spec 能从 mapping 里导出
- slot `childNames` 能被正确生成
- renderer kind template和 shared kind definitions 同步
- 一些 textMode / slot 模式能被正确带出来

它最适合做：

- `4A` / `4B` 的第一道 gate

它不适合证明：

- `app.tsx` shell 是否正确解耦

### 3.2 `runtime-contract.test.ts`

当前主要证明：

- verification / mapping / renderer registry 都从同一 contract 出来
- managed runtime manifest 和 verification state 共享同一份 contract 结果

它最适合做：

- “拆职责但不破 contract 同源性”的 gate

### 3.3 `render-node.test.ts`

当前已经覆盖大量 runtime behavior：

- structured slot child selection
- compound text/prose rendering
- tabs / accordion / select / combobox 等结构组件的运行时投影
- noscript fallback 的形状

这正是 `4A` / `4B` 的主验证口。

### 3.4 `runtime-template.test.ts`

当前更偏 template 同步与生成物一致性：

- checked-in `elements.tsx`
- checked-in `kinds.ts`
- vite template config

它适合在：

- renderer kinds 或 registry source 真正变化时
  作为中后段 gate

### 3.5 `runtime-surface.test.ts`

当前主要验证：

- manifest / runtime surface / runtime files / doctor surface 一致
- provenance、proof、css entry、template config、verification state 一致

它是 `4C` 或之后才该重点关注的 gate。

## 4. 当前文件职责的诚实划分

### 4.1 `runtime-contract.mjs`

当前职责：

- 把 schema components 变成 runtime contract
- 继续向下派生 manifest / verification state 的共同输入

不建议在 `Phase 4` 把它改成 renderer 逻辑容器。

更好的边界是：

- 它继续做 contract assembler
- 不承担具体 runtime rendering 决策

### 4.2 `render-capabilities.mjs`

这是 `Phase 4` 必碰文件。

因为它当前既是：

- UI protocol definition source
- renderer mapping source
- renderer registry rule source
- verification source

更现实的 Phase 4 目标不是一刀拆成很多文件，而是先把概念边界明确出来：

- definition layer
- mapping layer
- validation/rule layer

### 4.3 `render-node.tsx`

这是 Phase 4 的第一高风险点。

当前它至少同时承担：

- renderer entry dispatcher
- primitive / compound / field / choice / overlay / table / tabs / accordion projection
- legacy field semantics
- slot child extraction
- fallback generation
- className 注入和部分 shell-like layout

所以 `Phase 4` 在这里最忌讳：

- 再包一层 helper 但职责仍然没分

### 4.4 `renderer/types.ts`

这里不是实现文件，但它把旧 contract 直接写进了 spec 面。

如果不先收这个类型面：

- renderer 代码再怎么拆，legacy bridge 仍然会被类型继续默认合法化

因此 `4A` 必须把它作为一等入口，而不是只改 `render-node.tsx`。

### 4.5 `app.tsx`

当前它并不只是 runtime host bootstrap。

它还提供：

- document shell
- gallery shell
- preview layout
- default prose/layout CSS
- gallery preview sample document construction

所以 `Phase 4` 在这里的目标应当是：

- 拆“宿主职责”和“默认页面骨架职责”
- 不是马上重写整个 gallery

### 4.6 `doctor-checks.mjs`

这是 Phase 4 的收口器，不是起点。

它当前已经把：

- schema parity
- renderer mapping parity
- renderer registry parity
- runtime surface parity

串在一起。

因此它更适合在每个切片完成后证明“没打断链路”，而不是在开头承载新设计。

## 5. Slice 4A 的真实 patch 顺序

`4A` 的目标是：

- 先把 legacy bridge 从主 renderer 分支隔离
- 但不改变 runtime shell，也不改变整体 renderer module 边界

### Step 1

先在 `renderer/types.ts` 明确哪些字段属于 legacy bridge。

建议不要立刻删除这些字段，而是先把它们语义分组出来，例如：

- tabs/accordion state bridge
- table row role bridge
- variant-like bridge

如果只是保留现在一堆平铺字段，后续 helper 很容易继续无边界扩张。

### Step 2

在 `render-node.tsx` 抽出三类 helper：

- variant-like legacy bridge
  - 例如 `tone -> variant`
- explicit state bridge
  - 例如 tabs/accordion 的 `default`、`mode`
- structural role bridge
  - 例如 table 的 `kind`

目标不是现在就改字段名，而是先让主渲染分支不再直接散落 legacy 解释逻辑。

### Step 3

在 `component-capabilities.mjs` 里把这些 bridge 对应的 mapping 边界写得更显式。

也就是说：

- 哪些是 runtime prop mapping
- 哪些是 legacy compatibility

至少要能从 definition 级别看出来，而不是只有进 `render-node.tsx` 才知道。

### Step 4

更新测试：

- `render-node.test.ts`
  - tabs/accordion/table/alert/badge 相关样例仍通过
- `render-capabilities.test.ts`
  - renderer spec requirement 仍成立

停手条件：

- 如果此时开始改 `app.tsx` 或拆 UI/layout module，说明已经越过 `4A`

## 6. Slice 4B 的真实 patch 顺序

`4B` 的目标是：

- 把 runtime projection 的模块边界真正分开
- 让 `render-node.tsx` 退回成 dispatcher

### Step 1

先按职责拆两个新入口：

- `render-ui-node.tsx`
- `render-layout-node.tsx`

这里的关键不是文件名，而是 ownership：

- UI projection 负责现有 UI nodes 和结构型 UI nodes
- layout projection 负责 `Phase 3` 新增的 layout kinds

### Step 2

保留一个薄 `render-node.tsx`：

- 只负责：
  - 读取 node type
  - 查 renderer spec
  - 分发到 UI/layout/text renderer

如果拆完后 `render-node.tsx` 仍继续包含 tabs/accordion/select/table 大量细节，说明这一步没有成功。

### Step 3

评估 `slot child extraction` 的归属。

当前 `getSlotChildren()` / `getStructuredItemsForNode()` 仍在主文件里。

更诚实的归属是：

- UI structured slot extraction 留在 UI projection 层
- layout child selection 留在 layout projection 层

不要让 layout projection 继续复用以 tabs/select/table 为中心设计的 helper。

### Step 4

在 `component-capabilities.mjs` / `render-capabilities.mjs` 确认 layout kinds 已经正式进入 supported kinds 和 renderer kind rules。

否则：

- layout projection 只是实现文件拆开了
- contract/rule 层仍然不知道这些 kind 合法

### Step 5

更新测试：

- `render-node.test.ts`
  - 仍能覆盖现有 UI 行为
  - 并开始覆盖 layout dispatch
- `runtime-contract.test.ts`
  - contract 派生链不变

停手条件：

- 如果此时开始大面积改共享 shell CSS，说明已经进入 `4C`

## 7. Slice 4C 的真实 patch 顺序

`4C` 的目标是：

- 清理 document shell / gallery shell / preview shell 的职责混用
- 让 runtime host 不再默认定义页面结构

### Step 1

先盘点 `app.tsx` 当前职责，按三层拆：

- runtime host bootstrap
- document artifact shell
- gallery/editor shell

当前它们还共处一文件，不代表第一刀必须多文件拆完，但至少要先在逻辑上切开。

### Step 2

把 shared shell CSS 里的默认结构假设单独聚类：

- `.ahtml-document-shell`
- `[data-agent-html-component="page"]`
- `.ahtml-prose-block`
- `.ahtml-section-stack`
- card-content spacing reset
- gallery grid / sidebar layout

其中前四类是最关键的 `Phase 4` 目标，因为它们直接在替 authoring surface 表达 layout。

### Step 3

决定哪些壳结构继续保留为 runtime host 必需职责，哪些必须退出主路径。

更现实的边界是：

- 保留：
  - 应用挂载
  - 基础字体/背景/颜色变量注入
  - gallery editor 两栏壳
- 退出主路径：
  - 默认 page grid
  - 默认 prose block
  - 默认 section stack

这些应该转为：

- layout projection 结果
- 或显式 artifact wrapper，而不是 runtime host 默认值

### Step 4

把 gallery preview sample document 的职责和 runtime shell 视觉职责拆开看。

当前 `createGalleryPreviewDocument()` 会构造一整套示例结构，这本身没问题；
问题在于它目前和 shared shell CSS 一起，容易让“预览文档长什么样”和“runtime host 默认怎么排”混成一件事。

`4C` 的目标不是删 gallery preview，而是防止它继续作为页面骨架真相来源。

### Step 5

最后再跑：

- `runtime-template.test.ts`
- `runtime-surface.test.ts`
- 必要时 `doctor` 相关路径

因为到这一刀时，template/provenance/parity 链条才会真正被触碰。

## 8. 当前最容易犯的错

### 8.1 先碰 doctor，再去改 renderer

doctor 是结果校验器，不是设计入口。

### 8.2 直接删 legacy 字段

如果没有先把 bridge 责任单独隔离，删除字段只会把 tabs/accordion/table 这类运行时行为一起打断。

### 8.3 把 render-node 拆成多个大文件但不分 ownership

这只是物理切文件，不是架构解耦。

### 8.4 在 layout projection 还没站稳前就删 document shell

页面会立即退回无结构状态，反而更难判断问题属于 shell 还是 projection。

## 9. 当前最诚实的验证顺序

`4A` 先看：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`

`4B` 再加：

- `packages/ahtml/src/config/runtime-contract.test.ts`

`4C` 再加：

- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`

只有当：

- template source
- registry source
- shell CSS
- runtime surface proof

真的被改动时，才应该把这两类测试提到主 gate。

## 10. 对当前文档理解的修正

基于当前代码，`Phase 4` 最诚实的定义不是“把 runtime 解耦一下”，而是：

- 先把 legacy bridge 从 renderer 主分支中拆出来
- 再把 UI/layout projection 的模块边界拆出来
- 最后才把 runtime host 和 document/gallery shell 的混用拆出来

如果这三个动作顺序颠倒，就会很容易出现两种假进展：

- 只改文件结构，不改职责
- 只改壳样式，不改 contract 主路径

这两种都不会让最终目标更真。
