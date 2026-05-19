# Slice: 4B

## 归属

- Phase: 4
- Slice: 4B
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-4-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `4A` 解决的是 legacy bridge 责任隔离；`4B` 解决的是 runtime projection ownership。如果不把两者拆开，最后只会得到“helper 位置变了，但 `render-node.tsx` 还是全能大文件”的假进展。
- 当前 renderer 目录里仍只有：
  - `render-node.tsx`
  - `types.ts`
  - `parity.ts`
  - `kinds.ts`
  - `elements.tsx`
  这说明 UI projection 和 layout projection 现在还没有真实模块边界。
- `Phase 3` 已经把 layout 当正式目标面写进计划，所以 `4B` 必须明确回答：layout projection 的 ownership 到底落在哪里，而不是继续复用围绕 `tabs/select/table` 设计的 UI helper。

## 这刀要证明什么

- 必须为真的结果 1:
  `render-node.tsx` 已退回 dispatcher，而不再继续承担所有 UI / layout / fallback / child extraction 细节。
- 必须为真的结果 2:
  UI projection 和 layout projection 至少在模块边界上已经分离，不再共处一个超大函数文件。
- 必须为真的结果 3:
  layout projection 的 child selection / projection helper 不再直接复用以 `tabs` / `select` / `table` 为中心设计的 UI 结构抽取逻辑。

## 第一批入口文件

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 新文件：`packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx`
- 新文件：`packages/ahtml/src/cli/runtime-template/src/renderer/render-layout-node.tsx`
- 视需要改：
  - `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `packages/ahtml/src/config/component-capabilities.mjs`
  - `packages/ahtml/src/config/render-capabilities.mjs`

## 明确不碰

- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- gallery shell / preview shell CSS
- `doctor-checks.mjs`
- 最终 legacy 字段删除
- 新的 layout prop 面设计

## 当前现实依据

- 代码入口:
  - `render-node.tsx` 当前同时承担：
    - dispatcher
    - primitive / compound / field / choice / overlay / table / tabs / accordion projection
    - slot child extraction
    - noscript fallback
    - 部分 shell-like class 注入，如 `ahtml-section-stack` / `ahtml-prose-block`
  - 当前 renderer 目录没有 `render-ui-node.tsx` 或 `render-layout-node.tsx`
  - `render-node.tsx` 当前的 `getSlotChildren()` / `getStructuredItemsForNode()` 仍是通用入口，但设计重心明显偏 UI structured slots
- 现有 bridge / ownership 现状:
  - UI 结构组件如 `tabs`、`accordion`、`table` 仍与 primitive / field / option-set projection 共处一文件
  - layout projection 目标已经在 `Phase 3/4` 文档里存在，但当前实现模块边界仍未建立
- 当前测试或 fixture:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
    - 当前覆盖 UI runtime behavior 很广
    - 适合做 `4B` 的主 gate
  - `packages/ahtml/src/config/runtime-contract.test.ts`
    - 当前证明 verification / mapping / registry 同源
    - 适合证明拆模块没有打断 contract 派生链
- 对应审计文档:
  - `docs/architecture/execution-checklist.md`
  - `docs/architecture/phase-4-implementation-draft.md`
  - `docs/architecture/execution-map.md`

## 前置条件

1. `4A` 已经让 legacy bridge 进入显式 helper 或至少显式责任层；否则 `4B` 只会把未隔离的 legacy 逻辑搬进新文件。
2. `3C` 已经至少定义好复杂 layout 的目标投影方向；否则 `render-layout-node.tsx` 会变成空壳或临时杂物间。
3. 当前不需要同时改 shell；如果布局还靠 `app.tsx` 默认骨架兜底，那是 `4C` 的问题，不在这刀里补。

## 计划改动

1. 先把 `render-node.tsx` 压成 dispatcher：
   - 读 node type
   - 查 renderer spec
   - 分发到 text / UI / layout projection
2. 把 UI projection 落到 `render-ui-node.tsx`：
   - primitive / compound / field / option set
   - `tabs` / `accordion` / `table`
   - UI-specific fallback 和 structured slot extraction
3. 把 layout projection 落到 `render-layout-node.tsx`：
   - 只承接 layout kinds
   - child selection / composition helper 明确按 layout 语义组织
4. 只在必要时补 `component-capabilities.mjs` / `render-capabilities.mjs`，让 rule 层能承认 layout kinds 的存在；不要在这刀里碰 shell。

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 再跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
- 不先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`

## 停手边界

- 一旦出现以下信号就先停:
  - 开始大面积改 `app.tsx` shared shell CSS
  - 开始重新设计 layout prop 面
  - 开始删除 `kindProp/defaultProp/modeProp/defaultMode`
  - `render-node.tsx` 仍保留大量 UI / layout / fallback 细节，只是加了几个中转函数
- 这说明已经混入了哪个下一阶段问题:
  - 改 shell 说明已经混入 `4C`
  - 删旧字段说明提前混入 `5B`
  - 重设计 layout prop 面说明退回了 `Phase 3`

## 完成证据

- 代码证据:
  - `render-node.tsx` 已退回 dispatcher
  - `render-ui-node.tsx` 与 `render-layout-node.tsx` 已有清晰 ownership
  - layout projection 不再只是 UI helper 的副产物
- 测试证据:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
- 文档证据:
  - 本卡与 `docs/architecture/execution-checklist.md`
  - `docs/architecture/phase-4-implementation-draft.md`
    的口径保持一致

## 当前风险

- 风险 1:
  当前 `render-node.tsx` 体量过大，最容易出现“拆文件不拆职责”的假解耦。
- 风险 2:
  layout projection 如果直接复用 UI structured slot helper，很可能把 tabs/select/table 的历史结构假设继续带进 layout。
- 风险 3:
  `runtime-contract.test.ts` 能证明 contract 同源，但不能单独证明 projection ownership 已经清楚；必须结合 `render-node.test.ts` 看。

## 回退判断

- 如果这刀失败，最可能是哪个 ownership 还没拆干净:
  - structured child extraction 仍留在 dispatcher
  - fallback 仍混在 UI/layout 主分支
  - layout projection 仍依赖 UI-only helper
- 如果测试爆炸，先看哪一层:
  - 先看 `render-node.test.ts` 是否暴露 tabs / accordion / table 等 UI 行为在分拆后丢失
  - 再看 `runtime-contract.test.ts` 是否因为 mapping/verification 形状被顺手改坏而报警

## 交接说明

- 下一刀最自然的承接 slice:
  - `4C`
- 当前不能误判为“已经完成”的地方:
  - 只是把大文件拆成多个大文件
  - `render-node.tsx` 仍继续做核心 projection 决策
  - layout projection 文件存在，但只做中转，没有自己的结构语义边界
