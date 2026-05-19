# Issue Draft: Slice 2C First Low-Coupling Raw-Candidate Pilot

## 标题

`Phase 2 / Slice 2C`: 只开放首批低耦合 raw-candidate，验证 schema / prompt / runtime 贯通

## 为什么现在开这张单

- `2C` 的职责不是继续设计 exposure-state，而是验证首批低耦合 raw-candidate 能否真正贯穿 schema / prompt / runtime。
- 当前 `alert` / `badge` 已经有最便宜的 runtime 接线点，因为 `component-capabilities.mjs` 里已经存在 `tone -> variant` 的 `propMappings`。
- 但当前工作树虽然已经有 `PropExposureState`、`ComponentExposurePolicy` 和 `prop-exposure-policy.ts`，主生成链仍没有切到 exposure decision，`createPublicAgentContract()` 也仍直接公开 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`。这说明 `2C` 的真实状态不是“完全没铺垫”，而是“类型和 policy 脚手架已在，但主链仍受 `2A/2B` 完成度约束”。

## 当前现实

- `packages/core/src/types.ts`
  - 当前已经有：
    - `PropExposureState`
    - `ComponentExposurePolicy`
    - `ResolvedComponentSchema`
- `packages/core/src/prop-exposure-policy.ts`
  - 当前已经存在，并先把：
    - `alert.variant`
    - `badge.variant`
    - `select.size`
    - `switch.size`
    都保持在 locked 状态
- `packages/core/src/public-agent-contract.ts`
  - 当前仍直接公开 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
- `packages/ahtml/src/cli/schema.mjs`
  - 当前直接把最终 schema 格式化成 prompt
- `packages/core/src/schema-overlays.ts`
  - 当前 `alert` / `badge` 仍公开 `tone`
- `packages/ahtml/src/config/component-capabilities.mjs`
  - 当前 `alert` / `badge` 仍通过 `tone -> variant` 渲染
- `scripts/generate-component-schema.mjs`
  - 当前仍没有把 opened-vs-locked policy 决策写进 generated schema 主链

## 目标

这张单不是打开所有候选 prop，也不是顺手碰高耦合 bridge。它只证明一件事：

- 首批低耦合样本 `alert.variant` / `badge.variant` 已作为正式公开 prop 贯穿最终 schema、CLI prompt 和 runtime 消费路径，同时第二批候选仍保持锁住。

## 范围

第一批入口文件：

- `packages/core/src/prop-exposure-policy.ts`
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`

只在前置条件成立时才允许动：

- `packages/core/src/public-agent-contract.ts`
- `scripts/generate-component-schema.mjs`

建议交付内容：

1. 以 `2A/2B` 已落地为前提，只打开：
   - `alert.variant`
   - `badge.variant`
2. 更新 `schema.mjs` 的 prompt 输出：
   - prompt 显示 `variant`
   - 不再把 `tone` 当新增推荐写法
3. 保持 runtime 消费最小化修改：
   - 只补足 `variant` 作为公开入口的解释
   - 不扩张到 `size` 或高耦合旧字段
4. 明确保留第二批锁住样本：
   - `select.size`
   - `switch.size`
   - `card.size` 继续作为待核实假设，而不是当前事实

## 明确不做

- 不重构 `PropExposureState` / `ComponentExposurePolicy` 核心类型
- 不重改 `generate-component-schema.mjs` 的 schema 来源
- 不动 `tabs.default`
- 不动 `accordion.mode`
- 不动 `row.kind`
- 不改 `packages/ahtml/src/cli/runtime-template/src/app.tsx`

## 前置条件

必须先确认下面三条，否则这张单应直接标成阻塞，不应开工：

1. `2A` 已把类型面和语义/暴露职责拆开
2. `2B` 已把 schema 生成闸口切到 exposure decision，而不是继续直抄 overlay.props
3. 当前允许保留 `tone` 作为短期兼容层，但不再把它当作新增公开入口

如果上面任一条件不成立，这张单的正确输出不是“提前开放 prop”，而是把阻塞点写清楚。

## 完成标准

必须同时满足：

1. `alert.variant` 和 `badge.variant` 已作为正式公开 prop 进入最终 schema
2. CLI prompt 已显示 `variant`，并且不再把 `tone` 当新增推荐写法
3. runtime mapping 已能消费 `variant`
4. `select.size` / `switch.size` 等第二批候选仍保持锁住

下面这些不足以支持“完成”：

- 只是把 `variant` 写进文档，但 schema 生成链还没消费 exposure policy
- 只是把 `variant` 开到 schema/prompt，但 runtime 并没有走公开新入口
- 只是锁住了第二批候选，却没有证明首批试点真的贯穿三层

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/cli.test.ts`
- 再跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
- 再跑:
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`

## 停手信号

出现下面任一信号就应停手并重新切片：

- 需要新增或重构 `PropExposureState` / `ComponentExposurePolicy` 相关核心类型
- 需要改 `generate-component-schema.mjs` 的 schema 来源
- 需要动 `tabs` / `accordion` / `table` 的 state 或 structure bridge
- 需要为 `select.size` / `switch.size` 设计新的 runtime 消费路径

这分别说明：

- 实际上还停留在 `2A/2B`
- 已经漂到 `Phase 4`
- 已经超出首批低成本试点

## 风险提醒

- 当前前置条件尚未全部完成，最容易把 `2C` 写成“假可执行 issue”
- 如果 `tone` 和 `variant` 同时长期公开，Phase 2 会停在双轨 contract，而不是验证新公开入口
- 一旦把 `select.size` / `switch.size` 混进来，这一刀就会从低成本试点变成 runtime 改造

## 交接

这张单完成后，下一张最自然的单是：

- 如果前置仍未完成，回到 `2A/2B`
- 如果首批试点已贯通，再考虑第二批候选或进入 `3A`

当前仍会显式保留、但不应在这刀里扩张的东西：

- `alert.tone`
- `badge.tone`
- `list.variant` 作为历史公开正例

## 参考文档

- `docs/architecture/slice-2c-execution-card.md`
- `docs/architecture/phase-2-design.md`
- `docs/architecture/phase-2-implementation-draft.md`
- `docs/architecture/execution-checklist.md`
