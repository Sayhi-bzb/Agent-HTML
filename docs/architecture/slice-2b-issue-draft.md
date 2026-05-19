# Issue Draft: Slice 2B Schema Generation Gate Switch

## 标题

`Phase 2 / Slice 2B`: 把 schema 生成主链从 overlay 直抄切到 resolved exposure decision

## 为什么现在开这张单

- `2A` 已经把语义 contract 和 exposure policy 的类型脚手架落位，但这不等于公开 schema 主链已经切换。
- 当前 `generate-component-schema.mjs` 仍直接读取 `COMPONENT_SCHEMA_OVERLAYS`，再把 `overlay.props` / `allowedChildren` 写进 generated schema。
- 如果不先完成这刀，后面的 `2C` 很容易被误写成“只要开 policy 就会自动出现在 schema / prompt / runtime”。

## 当前现实

当前真实生成主链仍是：

- `scripts/generate-component-schema.mjs`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`

当前真实约束：

- `generate-component-schema.mjs` 仍只是：
  - 读 `COMPONENT_SCHEMA_OVERLAYS`
  - 写 `name` / `description` / `props` / `allowedChildren`
- `component-schema.ts`
  - 当前只做 zod 校验和查询出口
  - 不做 exposure-state 解析
- `public-agent-contract.ts`
  - 当前仍直接公开 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`

这说明现在真正缺的不是“再谈原则”，而是把生成闸口从 overlay 直抄切成：

- semantic contracts
- exposure policy
- introspection facts

三输入合流。

## 目标

这张单要证明的不是“输出已经大改”，而是：

- generated schema 的 props 来源已经不再只是 `overlay.props` 直抄
- schema 主链已经切到 resolved exposure decision
- `component-schema.ts` 和 `public-agent-contract.ts` 仍保持出口角色，而不是被拖进复杂决策

## 范围

第一批入口文件：

- `scripts/generate-component-schema.mjs`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`

按需要再碰：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/prop-exposure-policy.ts`

建议交付内容：

1. 在 `generate-component-schema.mjs` 中引入明确的中间步骤：
   - `resolveSemanticProps`
   - `resolveRawCandidateProps`
   - `buildResolvedSchema`
2. 让 generated schema 逻辑上变成：
   - semantic props
   - 加上 opened raw-candidates
   - 而不是继续只等于 `overlay.props`
3. 保持 `component-schema.ts` 继续只承担验证和查询出口
4. 保持 `public-agent-contract.ts` 继续只消费 validated schema

## 明确不做

- 不改 `packages/ahtml/src/cli/schema.mjs`
- 不改 `packages/ahtml/src/cli/cli.test.ts`
- 不改 `packages/ahtml/src/config/runtime-contract.mjs`
- 不改 `packages/ahtml/src/config/render-capabilities.mjs`
- 不做 runtime renderer 行为补丁
- 不正式开放 `alert.variant` / `badge.variant`

## 前置条件

开工前应先确认：

1. `2A` 已经让 `ComponentSemanticContract` / `ComponentExposurePolicy` / `ResolvedComponentSchema` 有了稳定类型面
2. 当前接受 `2B` 仍尽量保持默认公开输出不变
3. 执行人已经读过：
   - `docs/architecture/slice-2b-execution-card.md`
   - `docs/architecture/phase-2-implementation-draft.md`
   - `docs/details/current-contract-audit.md`

## 完成标准

必须同时满足：

1. generated schema 的 props 来源已不再只是 `overlay.props` 直抄
2. schema 生成链已能显式区分：
   - semantic props
   - blocked props
   - raw-candidate props
   - legacy public fields
3. `component-schema.ts` 仍保持验证 / 查询出口角色
4. `public-agent-contract.ts` 仍只是稳定出口，不被错误迁移成决策中心

下面这些不足以支持“完成”：

- 只是给生成脚本加了 helper，但最终输出仍完全等于 overlay 直抄
- 只是 generated file 多了中间结构痕迹，但最终公开 props 仍不受 exposure policy 影响
- 只是 core 测试没炸，但 `component-schema.ts` 或 `public-agent-contract.ts` 已偷偷承担决策逻辑

## 最窄验证口

- 先跑:
  - `packages/core/src/component-schema.test.ts`
- 再跑:
  - `packages/core/src/public-agent-contract.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始让 `alert.variant` / `badge.variant` 出现在 CLI prompt
- 开始修改 `schema.mjs`
- 开始补 runtime propMappings 或 render-capabilities 断言
- 开始处理 `tabs.default` / `accordion.mode` / `row.kind` 的 runtime 行为

这分别说明：

- 已经进入 `2C`
- 或已经漂向 `Phase 4`

## 风险提醒

- 最容易出现“脚本更复杂了，但闸口并没真正切”的假进展
- 如果把 exposure decision 同时写进 `generate-component-schema.mjs` 和 `component-schema.ts`，会制造双决策源
- 如果 `public-agent-contract.ts` 被拉进复杂决策，后续会更难审计 schema 真正来源

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 2 / Slice 2C`

当前仍不能误判为“已经完成”的地方：

- generated schema 逻辑还没切，只是类型面已经看起来更完整
- 公开 props 还没有真正受 policy/opened-vs-locked 决策控制

## 参考文档

- `docs/architecture/slice-2b-execution-card.md`
- `docs/architecture/phase-2-implementation-draft.md`
- `docs/architecture/slice-risk-card-map.md`
- `docs/details/current-contract-audit.md`
