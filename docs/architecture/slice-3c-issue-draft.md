# Issue Draft: Slice 3C Minimal Layout Runtime Projection

## 标题

`Phase 3 / Slice 3C`: 给复杂 layout primitive 补最小 runtime projection，但不提前清 shell

## 为什么现在开这张单

- `3B` 解决的是最小 layout authoring 是否已经被 parse + validate 正式接受；`3C` 解决的是“layout 节点是不是还停留在能过上游但不能 render 的假支持”。
- 当前 runtime 侧还没有任何 layout projection 的正式入口：
  - `packages/ahtml/src/cli/runtime-template/src/renderer/kinds.ts` 里的 `runtimeRendererKinds` 不包含任何 layout kind
  - `packages/ahtml/src/config/component-capabilities.mjs` 还没有 layout capability definition
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx` 也没有 layout handler
- 当前 `render-node.tsx` 的 compound / noscript fallback 仍直接带：
  - `ahtml-section-stack`
  - `ahtml-prose-block`
  - `grid gap-3`
  这说明这刀必须很克制：只补最小 layout projection，不顺手清 document shell。

## 当前现实

- `packages/ahtml/src/cli/runtime-template/src/renderer/kinds.ts`
  - 当前只有：
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
  - 当前没有任何 `layout-*` kind
- `packages/ahtml/src/config/component-capabilities.mjs`
  - 当前 `componentCapabilityDefinitions` 只覆盖 UI / field / collection / tabs / accordion / table
  - `structuralAgentComponents` 只有 `accordion-item` / `cell` / `item` / `option` / `row` / `tab`
  - 当前没有 layout capability definitions
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - 当前 `rendererKindHandlers` 没有 layout handler
  - compound/noscript fallback 仍写死：
    - `ahtml-section-stack`
    - `ahtml-prose-block`
    - `grid gap-3`
  - `page` 在 capability 里仍带 `rootClassName: "grid gap-5"`
- 当前测试保护面：
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

## 目标

这张单不是清 shell，也不是开放 layout 数值参数。它只证明一件事：

- `split` / `grid` / `switcher` / `frame` 等 layout primitive 已经从“能 parse 但不能 render”的半支持状态，进入“有正式 renderer kind / capability / 最小 projection”的状态。

## 范围

第一批入口文件：

- `packages/core/src/component-schema.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/kinds.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

视需要再碰：

- `packages/core/src/parse/sanitize-agent-html.ts`

建议交付内容：

1. 先补 schema + validator：
   - `split`
   - `grid`
   - `switcher`
   - `frame`
   仍保持硬边界：
   - 只表达结构关系
   - 不开放列数、比例、gap、breakpoint、max-width 数值
2. 在 `component-capabilities.mjs` 新增 layout capability definitions：
   - 至少给 `stack` / `cluster` / `split` / `grid` / `switcher` / `frame` 明确 `source`、`renderKind`、`renderer.kind`
   - 不继续把 layout 挤进 `compound` / `collection`
3. 在 `renderer/kinds.ts` 和 `renderer/types.ts` 扩 layout kinds：
   - `layout-stack`
   - `layout-cluster`
   - `layout-split`
   - `layout-grid`
   - `layout-switcher`
   - `layout-frame`
4. 在 `render-node.tsx` 增最小 layout handler：
   - `stack`
   - `cluster`
   - `split`
   - `grid`
   - `switcher`
   - `frame`
5. 只在 projection 真有前置需求时再碰 `sanitize-agent-html.ts`：
   - 不为了“结构看起来更整齐”而过早引入 implicit wrapper

## 明确不做

- 不改 `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- 不改 `packages/ahtml/src/cli/runtime-template.mjs`
- 不改 `packages/ahtml/src/cli/doctor-checks.mjs`
- 不清 gallery shell / preview shell
- 不统一 document shell 收口
- 不设计新的 layout 数值参数面
- 不重做 UI/layout projection ownership 大拆分

## 前置条件

必须先确认下面三条：

1. `3A` 已经让 layout 名字进入正式 schema / 标准节点集合
2. `3B` 已经让最小 layout authoring 站稳；否则 `3C` 会在“上游还没接受 layout”时被迫从 renderer 侧兜底
3. 当前接受 shell 仍带 document-style 假设这一现实；这刀不负责把它们清掉

如果上面任一条件不成立，这张单的正确输出不是“加个 layout wrapper 假装完成”，而是把阻塞点写清楚。

## 完成标准

必须同时满足：

1. `split` / `grid` / `switcher` / `frame` 已成为正式 schema + validator 节点
2. runtime 已能对 layout primitive 做最小投影，不再停留在“能 parse 但不能 render”
3. layout projection 有自己的 renderer kind / capability 定义，不继续寄生在 `compound` / `collection` 这类 UI 分支里
4. layout schema 仍然不开放列数、比例、gap、breakpoint、max-width 这类实现参数

下面这些不足以支持“完成”：

- 只是 schema 里加入了 `split/grid/switcher/frame`，但 runtime 还不能 render
- 只是给 layout 加了一个临时 UI kind，没有真正独立的 layout kind
- 只是 render 出一个 wrapper，但为了做到这一点已经开始大改 shell
- 只是测试覆盖了 layout wrapper 字符串，却没有证明 layout 仍守住无数值参数边界

## 最窄验证口

- 先跑:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
- 再跑:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - 任意 build / preview / runtime heavy tests

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始大面积改 `app.tsx` shared shell CSS
- 开始清 `ahtml-document-shell` / `ahtml-section-stack` / `ahtml-prose-block`
- 开始为 layout 设计响应式数值参数面
- 开始重构 renderer ownership，把 UI/layout 大面积拆模块

这分别说明：

- 已经进入 `Phase 4`
- 已经靠近 `4B`
- 已经违反 `docs/layout.md` 的 contract 边界

## 风险提醒

- 如果继续把 layout 塞进 `compound` / `collection`，运行时表面上能 render，但 ownership 仍是假的，后面 `4B` 会更难拆
- `page` 和 compound fallback 现在已经带 `grid gap-*` / `ahtml-section-stack` 预设；如果 layout projection 没有自己的最小 wrapper，很容易再次被 document shell 语义吞掉
- `render-node.test.ts` 可以证明 layout 已能投影，但不能证明 host shell 已经干净；这不是这刀的失败，只是边界

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 4 / Slice 4A`

当前仍会显式保留、但不应在这刀里收掉的东西：

- document-shell 默认结构假设
- gallery shell / preview shell
- doctor / runtime surface / heavy gate 的最终收口

## 参考文档

- `docs/architecture/slice-3c-execution-card.md`
- `docs/architecture/phase-3-implementation-draft.md`
- `docs/layout.md`
- `docs/architecture/execution-checklist.md`
