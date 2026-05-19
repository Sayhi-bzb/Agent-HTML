# Slice: 3C

## 归属

- Phase: 3
- Slice: 3C
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-3-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `3B` 解决的是最小 layout authoring 是否已经被 parse + validate 正式接受；`3C` 解决的是“layout 节点是不是还停留在能过上游但不能 render 的假支持”。
- 当前 runtime 侧还没有任何 layout projection 的正式入口：
  - `packages/ahtml/src/cli/runtime-template/src/renderer/kinds.ts` 里的 `runtimeRendererKinds` 不包含任何 layout kind
  - `packages/ahtml/src/config/component-capabilities.mjs` 还没有 layout capability definition
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx` 也没有 layout handler
- 当前 `render-node.tsx` 的 compound / noscript fallback 仍直接带：
  - `ahtml-section-stack`
  - `ahtml-prose-block`
  - `grid gap-3`
  这说明 `3C` 必须很克制：只补最小 layout projection，不顺手清 document shell。

## 这刀要证明什么

- 必须为真的结果 1:
  `split` / `grid` / `switcher` / `frame` 已经成为正式 schema + validator 节点，而不是只存在于文档目标里。
- 必须为真的结果 2:
  runtime 已经能对 layout primitive 做最小投影，至少不再停留在“能 parse 但不能 render”。
- 必须为真的结果 3:
  layout projection 有自己的 renderer kind / capability 定义，不继续寄生在 `compound` / `collection` 这种 UI 导向分支里。
- 必须为真的结果 4:
  layout schema 仍然不开放列数、比例、gap、breakpoint、max-width 这类实现参数。

## 第一批入口文件

- `packages/core/src/component-schema.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/kinds.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 视需要再碰：
  - `packages/core/src/parse/sanitize-agent-html.ts`

## 明确不碰

- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- `packages/ahtml/src/cli/runtime-template.mjs`
- `packages/ahtml/src/cli/doctor-checks.mjs`
- gallery shell / preview shell 清理
- 响应式细节、density 细节、文档壳统一收口
- 新的 layout 数值参数面

## 当前现实依据

- runtime kind 入口:
  - `renderer/kinds.ts` 当前只有：
    - `accordion`
    - `choice-group`
    - `choice-inline`
    - `choice-overlay`
    - `collection`
    - `combobox-input`
    - `compound`
    - `primitive`
    - `range-field`
    - `select-overlay`
    - `slider-field`
    - `table`
    - `tabs`
    - `text-field`
    - `toggle-field`
  - 没有任何 `layout-*` kind
- capability 入口:
  - `component-capabilities.mjs` 当前：
    - `componentCapabilityDefinitions` 只覆盖 UI / field / collection / tabs / accordion / table
    - `structuralAgentComponents` 只有 `accordion-item` / `cell` / `item` / `option` / `row` / `tab`
    - 没有 layout capability definitions
- renderer 入口:
  - `render-node.tsx` 当前的 `rendererKindHandlers` 没有 layout handler
  - compound/noscript fallback 仍写死：
    - `ahtml-section-stack`
    - `ahtml-prose-block`
    - `grid gap-3`
  - `page` 在 capability 里仍带 `rootClassName: "grid gap-5"`
- 测试保护面:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
    - 适合继续保护 schema + validate 边界
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
    - 当前已覆盖 structured children、compound fallback、tabs/accordion/select/table 等 runtime 行为
    - 适合变成 `3C` 的主 runtime gate
- 对应设计文档:
  - `docs/layout.md`
  - `docs/architecture/phase-3-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`

## 前置条件

1. `3A` 已经让 layout 名字进入正式 schema / 标准节点集合。
2. `3B` 已经让最小 layout authoring 站稳；否则 `3C` 会在“上游还没接受 layout”时被迫从 renderer 侧兜底。
3. 当前接受 shell 仍带 document-style 假设这一现实；`3C` 不负责把它们清掉。

## 计划改动

1. 先补 schema + validator：
   - `split`
   - `grid`
   - `switcher`
   - `frame`
   要求仍然很硬：
   - 只表达结构关系
   - 不开放列数、比例、gap、breakpoint、max-width 数值
2. 再在 `component-capabilities.mjs` 新增 layout capability definitions：
   - 至少给 `stack` / `cluster` / `split` / `grid` / `switcher` / `frame` 明确 `source`、`renderKind`、`renderer.kind`
   - 不继续把 layout 挤进 `compound` / `collection`
3. 在 `renderer/kinds.ts` 和 `renderer/types.ts` 扩 layout kinds：
   - 推荐显式新增：
     - `layout-stack`
     - `layout-cluster`
     - `layout-split`
     - `layout-grid`
     - `layout-switcher`
     - `layout-frame`
   - 让 `RendererSpecComponent.kind` 能承认这些 kinds，而不是继续把 layout 当 `"structural"` 特例
4. 在 `render-node.tsx` 增最小 layout handler：
   - `stack` 渲染成稳定 block wrapper
   - `cluster` 渲染成可 wrap 的 group wrapper
   - `split` 渲染成主副区或均衡区 wrapper
   - `grid` 渲染成规则块容器
   - `switcher` 渲染成可切换布局容器
   - `frame` 渲染成宽度约束 wrapper
5. 只在 projection 真有前置需求时再碰 `sanitize-agent-html.ts`：
   - 如果 runtime 不需要 layout 归一化，就继续保持 sanitize 薄
   - 不为了“结构看起来更整齐”而过早引入 implicit wrapper
6. 扩测试：
   - `sanitize-agent-html.test.ts` 补复杂 layout 节点 schema/validate 场景
   - `render-node.test.ts` 补 layout 最小投影场景

## 最窄验证口

- 先跑:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
- 再跑:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 不先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - 任意 build / preview / runtime heavy tests

## 停手边界

- 一旦出现以下信号就先停:
  - 开始大面积改 `app.tsx` shared shell CSS
  - 开始清 `ahtml-document-shell` / `ahtml-section-stack` / `ahtml-prose-block`
  - 开始为 layout 设计响应式数值参数面
  - 开始重构 renderer ownership，把 UI/layout 大面积拆模块
- 这说明已经混入了哪个下一阶段问题:
  - shell 清理说明已经进入 `Phase 4`
  - ownership 大拆分说明已经靠近 `4B`
  - 参数面扩张说明已经违反 `docs/layout.md` 的 contract 边界

## 完成证据

- 代码证据:
  - `component-capabilities.mjs` 已有显式 layout capability definitions
  - `renderer/kinds.ts` / `renderer/types.ts` 已承认 layout projection kinds
  - `render-node.tsx` 已能直接投影 layout 节点，而不是抛 unsupported renderer kind/component
- 测试证据:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 文档证据:
  - 本卡与 `docs/layout.md`
  - `docs/architecture/phase-3-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`
    的口径保持一致

## 当前风险

- 风险 1:
  如果继续把 layout 塞进 `compound` / `collection`，运行时表面上能 render，但 ownership 仍然是假的，后面 `4B` 会更难拆。
- 风险 2:
  `page` 和 compound fallback 现在已经带 `grid gap-*` / `ahtml-section-stack` 预设；如果 layout projection 没有自己的最小 wrapper，很容易再次被 document shell 语义吞掉。
- 风险 3:
  `render-node.test.ts` 可以证明 layout 已能投影，但不能证明 host shell 已经干净；这不是 `3C` 的失败，只是边界。

## 回退判断

- 如果这刀失败，最可能是哪层还没把 layout 当正式 runtime 成员:
  - `RendererKind` 里还没有 layout kinds
  - `component-capabilities.mjs` 还没有 layout capability definitions
  - `render-node.tsx` 还在把 layout 当 unsupported component
- 如果测试爆炸，先看哪一层:
  - 先看 `sanitize-agent-html.test.ts` 是否暴露复杂 layout 仍被 `unknown-component` / `invalid-child`
  - 再看 `render-node.test.ts` 是否暴露 layout projection 仍被 UI fallback / structured slot helper 误吞

## 交接说明

- 下一刀最自然的承接 slice:
  - `4A`
- 当前不能误判为“已经完成”的地方:
  - 只是 schema 里加入了 `split/grid/switcher/frame`，但 runtime 还不能 render
  - 只是给 layout 加了一个临时 UI kind，没有真正独立的 layout kind
  - 只是 render 出一个 wrapper，但为了做到这一点已经开始大改 shell
  - 只是测试覆盖了 layout wrapper 字符串，却没有证明 layout 仍守住无数值参数边界
