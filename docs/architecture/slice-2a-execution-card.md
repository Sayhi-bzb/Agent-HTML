# Slice: 2A

## 归属

- Phase: 2
- Slice: 2A
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-2-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `2A` 是 `Phase 2` 的类型面和职责拆分刀。它解决的是“语义字段、结构字段、历史包装字段、原厂 prop 暴露规则是否已经分开表达”，不是“新 prop 是否已经出现在 schema / prompt / runtime”。
- 当前工作树里这刀其实已经走了半步：
  - `types.ts` 已经有：
    - `PropExposureState`
    - `ComponentSemanticPropSchema`
    - `ComponentSemanticContract`
    - `ComponentExposurePolicy`
    - `ResolvedComponentSchema`
  - `schema-overlays.ts` 已经新增：
    - `COMPONENT_SEMANTIC_CONTRACTS`
  - `prop-exposure-policy.ts` 也已经单独落位
- 但当前也还没收口：
  - `ComponentSchemaOverlay` 仍存在
  - `hiddenProps` 仍留在 `COMPONENT_SCHEMA_OVERLAYS` 主对象里
  - generated schema 主路径还没有切到 resolved exposure decision
  这说明 `2A` 现在最需要的不是“再讲原则”，而是把“迁移中状态的停手边界”写清楚，避免 `2B/2C` 和 `2A` 混写。

## 这刀要证明什么

- 必须为真的结果 1:
  core 类型面已经能分别表达：
  - 内容字段
  - 结构字段
  - 历史包装字段
  - 原厂 prop 暴露规则
- 必须为真的结果 2:
  `schema-overlays.ts` 不再只有一个旧语义入口，而是已经出现可供后续链路切换的语义 contract 入口。
- 必须为真的结果 3:
  `prop-exposure-policy.ts` 已经承载 per-component raw-candidate policy，但当前默认不改变公开输出。
- 必须为真的结果 4:
  `2A` 完成后，generated schema 与 `PublicAgentContract` 的最终对外形状仍应保持当前基线，不因这刀就改 prompt/runtime 断言。

## 第一批入口文件

- `packages/core/src/types.ts`
- `packages/core/src/types.test.ts`
- `packages/core/src/schema-overlays.ts`
- `packages/core/src/prop-exposure-policy.ts`
- 视需要再碰：
  - `packages/core/src/component-schema.test.ts`

## 明确不碰

- `scripts/generate-component-schema.mjs`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/public-agent-contract.ts` 的最终输出形状
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/runtime-contract.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`
- 任意 runtime renderer 行为

## 当前现实依据

- 类型面:
  - `types.ts` 当前已经有：
    - `PropExposureState`
    - `SemanticPropOrigin`
    - `ComponentSemanticPropSchema`
    - `ComponentSemanticContract`
    - `ComponentExposurePolicy`
    - `ResolvedComponentSchema`
  - 同时仍保留：
    - `ComponentSchemaOverlay`
- 语义 contract 入口:
  - `schema-overlays.ts` 当前既导出：
    - `COMPONENT_SCHEMA_OVERLAYS`
    - 也导出 `COMPONENT_SEMANTIC_CONTRACTS`
  - 但 `hiddenProps` 仍留在 overlay 主对象中，说明职责还没完全切干净
- exposure policy 入口:
  - `prop-exposure-policy.ts` 当前已经单独存在
  - 当前锁住的候选包括：
    - `alert.variant`
    - `badge.variant`
    - `select.size`
    - `switch.size`
- 当前测试保护面:
  - `types.test.ts`
    - 已经在类型层证明 semantic contract / exposure policy / resolved schema 能被表达
  - `component-schema.test.ts`
    - 仍锁当前 generated schema 结果
    - 适合证明 `2A` 没有意外改动公开输出
- 对应设计文档:
  - `docs/architecture/phase-2-design.md`
  - `docs/architecture/phase-2-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`

## 前置条件

1. 当前接受 `2A` 是“迁移中状态”，不要求一步删掉旧类型和旧入口。
2. 当前目标是职责拆分，不是 exposure 决策真正切主链。
3. 当前要明确承认：`2A` 已经部分发生在工作树里，但还没有形成可直接交接的停手说明。

## 计划改动

1. 先把 `2A` 的完成标准写实，而不是继续把它描述成完全未开始：
   - 新类型已经落位
   - 新 policy 文件已经落位
   - 旧 overlay 类型和 `hiddenProps` 仍在主对象里
2. 明确 `types.ts` 的目标边界：
   - 新类型继续保留并稳定
   - `ComponentSchemaOverlay` 先保留为迁移中类型
   - 不在 `2A` 强行删除全部旧引用
3. 明确 `schema-overlays.ts` 的目标边界：
   - `COMPONENT_SEMANTIC_CONTRACTS` 作为新入口存在
   - `COMPONENT_SCHEMA_OVERLAYS` 作为旧入口仍存在
   - `hiddenProps` 暂不硬删，但不再把它误写成“已经完成职责拆分”
4. 明确 `prop-exposure-policy.ts` 的目标边界：
   - 先只表达候选池和 locked/open 决策
   - 不在 `2A` 里直接放开任何 raw-candidate
5. 明确测试目标：
   - `types.test.ts` 继续证明新类型可表达
   - `component-schema.test.ts` 继续证明公开 schema 结果还没变

## 最窄验证口

- 先跑:
  - `packages/core/src/types.test.ts`
- 再跑:
  - `packages/core/src/component-schema.test.ts`
- 不先跑:
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`

## 停手边界

- 一旦出现以下信号就先停:
  - 开始修改 `generate-component-schema.mjs`
  - 开始重写 generated schema props 来源
  - 开始让 `public-agent-contract.ts` 输出形状变化
  - 开始让 CLI prompt 或 runtime 测试改断言
- 这说明已经混入了哪个下一阶段问题:
  - generated schema 主链切换说明已经进入 `2B`
  - prop 可见性变化说明已经进入 `2C`

## 完成证据

- 代码证据:
  - `types.ts` 已能表达 semantic contract / exposure policy / resolved schema
  - `schema-overlays.ts` 已提供 `COMPONENT_SEMANTIC_CONTRACTS`
  - `prop-exposure-policy.ts` 已单独存在并承载 locked raw-candidate
- 测试证据:
  - `packages/core/src/types.test.ts`
  - `packages/core/src/component-schema.test.ts`
- 文档证据:
  - 本卡与 `docs/architecture/phase-2-design.md`
  - `docs/architecture/phase-2-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`
    的口径保持一致

## 当前风险

- 风险 1:
  当前 `COMPONENT_SEMANTIC_CONTRACTS` 只是从旧 overlay 映射出来，`hiddenProps` 还没真正迁出；如果把这状态写成“职责已经完全拆开”，会误导后续 `2B`。
- 风险 2:
  `prop-exposure-policy.ts` 虽然存在，但如果没有明确“默认锁住且不改公开输出”，很容易被误当成 `2C` 已开始。
- 风险 3:
  `component-schema.test.ts` 现在仍锁旧结果；这是 `2A` 的保护，不是阻碍。过早改它，往往说明切片已经切大。

## 回退判断

- 如果这刀失败，最可能是哪层还没有真正拆开:
  - `ComponentSchemaOverlay` 仍被误当成唯一 schema source
  - `COMPONENT_SEMANTIC_CONTRACTS` 仍只是陪衬，没有被文档或调用方承认为新入口
  - `prop-exposure-policy.ts` 被加进来了，但没有明确 locked/open 边界
- 如果测试爆炸，先看哪一层:
  - 先看 `types.test.ts` 是否暴露新类型表达不自洽
  - 再看 `component-schema.test.ts` 是否暴露 `2A` 已意外改动公开 schema 结果

## 交接说明

- 下一刀最自然的承接 slice:
  - `2B`
- 当前不能误判为“已经完成”的地方:
  - 只是新类型存在，但 generated schema 主链还完全没切
  - 只是 `prop-exposure-policy.ts` 存在，但没有明确保持锁住状态
  - 只是 `COMPONENT_SEMANTIC_CONTRACTS` 存在，但 `hiddenProps` 还继续留在旧主对象里
  - 只是文档说 `2A` 做完了，但 `component-schema.test.ts` 实际已经被改成新输出
