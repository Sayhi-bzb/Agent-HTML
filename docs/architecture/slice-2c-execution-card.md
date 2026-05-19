# Slice: 2C

## 归属

- Phase: 2
- Slice: 2C
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-2-design.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `2C` 的职责不是继续设计 exposure-state，而是验证首批低耦合 raw-candidate 能否真正贯穿 schema / prompt / runtime。
- 当前 `alert` / `badge` 已经有最便宜的 runtime 接线点，因为 `component-capabilities.mjs` 里已经存在 `tone -> variant` 的 `propMappings`。
- 但当前工作树虽然已经有 `PropExposureState`、`ComponentExposurePolicy` 和 `prop-exposure-policy.ts`，主生成链仍没有切到 exposure decision，`createPublicAgentContract()` 也仍直接公开 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`。这说明 `2C` 现在的真实状态不是“完全没铺垫”，而是“类型和 policy 脚手架已在，但主链仍受 `2A/2B` 完成度约束”。

## 这刀要证明什么

- 必须为真的结果 1:
  `alert.variant` 和 `badge.variant` 已作为正式公开 prop 进入最终 schema。
- 必须为真的结果 2:
  CLI prompt 已显示 `variant`，并且不再把 `tone` 当新增推荐写法。
- 必须为真的结果 3:
  runtime mapping 已能消费 `variant`，同时 `select.size` / `switch.size` 等第二批候选仍保持锁住。

## 第一批入口文件

- `packages/core/src/prop-exposure-policy.ts`
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`

## 明确不碰

- `tabs.default`
- `accordion.mode`
- `row.kind`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`

## 当前现实依据

- 代码入口:
  - `packages/core/src/types.ts` 目前已经有：
    - `PropExposureState`
    - `ComponentExposurePolicy`
    - `ResolvedComponentSchema`
  - `packages/core/src/prop-exposure-policy.ts` 目前已经存在，并先把：
    - `alert.variant`
    - `badge.variant`
    - `select.size`
    - `switch.size`
    都保持在 locked 状态
  - `packages/core/src/public-agent-contract.ts` 目前仍直接公开 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
  - `packages/ahtml/src/cli/schema.mjs` 目前直接把最终 schema 格式化成 prompt
- 现有 bridge / 旧路径:
  - `packages/core/src/schema-overlays.ts` 里 `alert` / `badge` 仍公开 `tone`
  - `packages/ahtml/src/config/component-capabilities.mjs` 里 `alert` / `badge` 仍通过 `tone -> variant` 渲染
  - `scripts/generate-component-schema.mjs` 当前仍没有把 policy/opened-vs-locked 决策写进 generated schema 主链
  - `select.size` / `switch.size` 在 generated introspection 中有候选事实，但当前 runtime 没有同等低成本消费路径
- 当前测试或 fixture:
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 对应审计文档:
  - `docs/architecture/phase-2-design.md`
  - `docs/architecture/phase-2-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`

## 计划改动

1. 以 `2A/2B` 已落地为前提，在 `prop-exposure-policy.ts` 里只打开首批低耦合样本：
   - `alert.variant`
   - `badge.variant`
2. 更新 `schema.mjs` 的 prompt 输出，确保 prompt 显示最终公开 schema，而不是继续继承 legacy `tone` 方向。
3. 保持 `component-capabilities.mjs` / `render-capabilities.mjs` 的 runtime 消费最小化修改，只补足 `variant` 作为公开入口的解释，不扩张到 `size` 或高耦合旧字段。
4. 明确保留第二批锁住样本：
   - `select.size`
   - `switch.size`
   - `card.size` 继续作为待核实假设，而不是当前事实

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/cli.test.ts`
- 再跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
- 再跑:
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 不先跑:
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`

## 停手边界

- 一旦出现以下信号就先停:
  - 需要新增或重构 `PropExposureState` / `ComponentExposurePolicy` 相关核心类型
  - 需要改 `generate-component-schema.mjs` 的 schema 来源
  - 需要动 `tabs` / `accordion` / `table` 的 state 或 structure bridge
  - 需要为 `select.size` / `switch.size` 设计新的 runtime 消费路径
- 这说明已经混入了哪个下一阶段问题:
  - 改类型面或生成闸口说明其实还停留在 `2A/2B`
  - 动 tabs/accordion/table 说明已经漂到 `Phase 4`
  - 动 `size` 的 runtime 接线路径说明已经超出首批低成本试点

## 完成证据

- 代码证据:
  - `prop-exposure-policy.ts` 只打开 `alert.variant` / `badge.variant`
  - `schema.mjs` 输出的 prompt 与最终公开 schema 一致
  - runtime mapping 对首批试点 prop 的消费路径保持清晰且低耦合
- 测试证据:
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 文档证据:
  - 本卡与 `docs/architecture/phase-2-design.md`
  - `docs/architecture/phase-2-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`
    的口径保持一致

## 当前风险

- 风险 1:
  当前前置条件尚未完成，最容易把 `2C` 写成“假可执行卡”。
- 风险 2:
  如果 `tone` 和 `variant` 同时长期公开，Phase 2 会停在双轨 contract，而不是验证新公开入口。
- 风险 3:
  一旦把 `select.size` / `switch.size` 混进来，这一刀就会从低成本试点变成 runtime 改造。

## 回退判断

- 如果这刀失败，最可能是哪个桥接点没隔离:
  - 其实不是 runtime bridge 问题，而是 `2A/2B` 的 schema source / exposure decision 还没站稳
- 如果测试爆炸，先看哪一层:
  - 先看 `cli.test.ts` 里的 prompt/schema 可见性断言
  - 再看 `runtime-contract.test.ts` 是否把新公开 prop 传播到了 runtime contract
  - 最后看 `render-capabilities.test.ts` 是否因为 mapping/source 不一致而报警

## 交接说明

- 下一刀最自然的承接 slice:
  - 如果前置未完成，回到 `2A/2B`
  - 如果首批试点已贯通，再考虑第二批候选或进入 `3A`
- 当前仍显式保留的兼容点:
  - `alert.tone`
  - `badge.tone`
  - `list.variant` 作为历史公开正例
- 不能误判为“已经完成”的地方:
  - 只是把 `variant` 写进文档，但 schema 生成链还没消费 exposure policy
  - 只是把 `variant` 开到 schema/prompt，但 runtime 并没有走公开新入口
  - 只是锁住了第二批候选，却没有证明首批试点真的贯穿三层
