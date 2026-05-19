# Issue Draft: Slice 2A Type Surface And Responsibility Split

## 标题

`Phase 2 / Slice 2A`: 把语义 contract、暴露 policy 和迁移中旧入口的边界写清，但不提前改公开输出

## 为什么现在开这张单

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
  这说明这刀最需要的不是“再讲原则”，而是把“迁移中状态的停手边界”写清楚，避免 `2B/2C` 和 `2A` 混写。

## 当前现实

- `packages/core/src/types.ts`
  - 当前已经有：
    - `PropExposureState`
    - `SemanticPropOrigin`
    - `ComponentSemanticPropSchema`
    - `ComponentSemanticContract`
    - `ComponentExposurePolicy`
    - `ResolvedComponentSchema`
  - 同时仍保留：
    - `ComponentSchemaOverlay`
- `packages/core/src/schema-overlays.ts`
  - 当前既导出：
    - `COMPONENT_SCHEMA_OVERLAYS`
    - `COMPONENT_SEMANTIC_CONTRACTS`
  - `hiddenProps` 仍留在 overlay 主对象中
- `packages/core/src/prop-exposure-policy.ts`
  - 当前已经单独存在
  - 当前锁住的候选包括：
    - `alert.variant`
    - `badge.variant`
    - `select.size`
    - `switch.size`
- 当前测试保护面：
  - `packages/core/src/types.test.ts`
  - `packages/core/src/component-schema.test.ts`

## 目标

这张单不是切生成闸口，也不是提前开放 prop。它只证明一件事：

- core 类型面和文件职责已经能够分别表达 semantic contract、exposure policy 和迁移中旧入口，同时 generated schema 与 `PublicAgentContract` 的最终对外形状仍保持当前基线。

## 范围

第一批入口文件：

- `packages/core/src/types.ts`
- `packages/core/src/types.test.ts`
- `packages/core/src/schema-overlays.ts`
- `packages/core/src/prop-exposure-policy.ts`

视需要再碰：

- `packages/core/src/component-schema.test.ts`

建议交付内容：

1. 把 `2A` 的完成标准写实，而不是继续把它描述成完全未开始：
   - 新类型已经落位
   - 新 policy 文件已经落位
   - 旧 overlay 类型和 `hiddenProps` 仍在主对象里
2. 明确 `types.ts` 的目标边界：
   - 新类型继续保留并稳定
   - `ComponentSchemaOverlay` 先保留为迁移中类型
   - 不在这刀强行删除全部旧引用
3. 明确 `schema-overlays.ts` 的目标边界：
   - `COMPONENT_SEMANTIC_CONTRACTS` 作为新入口存在
   - `COMPONENT_SCHEMA_OVERLAYS` 作为旧入口仍存在
   - `hiddenProps` 暂不硬删，但不再把它误写成“已经完成职责拆分”
4. 明确 `prop-exposure-policy.ts` 的目标边界：
   - 先只表达候选池和 locked/open 决策
   - 不在这刀里直接放开任何 raw-candidate
5. 明确测试目标：
   - `types.test.ts` 继续证明新类型可表达
   - `component-schema.test.ts` 继续证明公开 schema 结果还没变

## 明确不做

- 不改 `scripts/generate-component-schema.mjs`
- 不改 `packages/core/src/generated/component-schema.generated.ts`
- 不改 `packages/core/src/public-agent-contract.ts` 的最终输出形状
- 不改 `packages/ahtml/src/cli/schema.mjs`
- 不改 `packages/ahtml/src/config/runtime-contract.mjs`
- 不改 `packages/ahtml/src/config/render-capabilities.mjs`
- 不碰任意 runtime renderer 行为

## 前置条件

必须先确认下面三条：

1. 当前接受 `2A` 是“迁移中状态”，不要求一步删掉旧类型和旧入口
2. 当前目标是职责拆分，不是 exposure 决策真正切主链
3. 当前要明确承认：`2A` 已经部分发生在工作树里，但还没有形成可直接交接的停手说明

如果上面任一条件不成立，这张单最容易被误做成 `2B` 或 `2C`。

## 完成标准

必须同时满足：

1. core 类型面已经能分别表达：
   - 内容字段
   - 结构字段
   - 历史包装字段
   - 原厂 prop 暴露规则
2. `schema-overlays.ts` 不再只有一个旧语义入口，而是已经出现可供后续链路切换的语义 contract 入口
3. `prop-exposure-policy.ts` 已承载 per-component raw-candidate policy，但当前默认不改变公开输出
4. generated schema 与 `PublicAgentContract` 的最终对外形状仍保持当前基线

下面这些不足以支持“完成”：

- 只是新类型存在，但 generated schema 主链还完全没切
- 只是 `prop-exposure-policy.ts` 存在，但没有明确保持锁住状态
- 只是 `COMPONENT_SEMANTIC_CONTRACTS` 存在，但 `hiddenProps` 还继续留在旧主对象里
- 只是文档说 `2A` 做完了，但 `component-schema.test.ts` 实际已经被改成新输出

## 最窄验证口

- 先跑:
  - `packages/core/src/types.test.ts`
- 再跑:
  - `packages/core/src/component-schema.test.ts`
- 这张单默认不先跑:
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始修改 `generate-component-schema.mjs`
- 开始重写 generated schema props 来源
- 开始让 `public-agent-contract.ts` 输出形状变化
- 开始让 CLI prompt 或 runtime 测试改断言

这分别说明：

- 已经进入 `2B`
- 已经进入 `2C`

## 风险提醒

- 当前 `COMPONENT_SEMANTIC_CONTRACTS` 只是从旧 overlay 映射出来，`hiddenProps` 还没真正迁出；如果把这状态写成“职责已经完全拆开”，会误导后续 `2B`
- `prop-exposure-policy.ts` 虽然存在，但如果没有明确“默认锁住且不改公开输出”，很容易被误当成 `2C` 已开始
- `component-schema.test.ts` 现在仍锁旧结果；这是这刀的保护，不是阻碍。过早改它，往往说明切片已经切大

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 2 / Slice 2B`

当前仍会显式保留、但不应在这刀里收掉的东西：

- `ComponentSchemaOverlay`
- `COMPONENT_SCHEMA_OVERLAYS`
- `hiddenProps` 留在旧主对象里的迁移中状态
- raw-candidate 全部保持 locked 的保守策略

## 参考文档

- `docs/architecture/slice-2a-execution-card.md`
- `docs/architecture/phase-2-design.md`
- `docs/architecture/phase-2-implementation-draft.md`
- `docs/architecture/execution-checklist.md`
