# Slice: 2B

## 归属

- Phase: 2
- Slice: 2B
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-2-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `2A` 解决的是“语义 contract / exposure policy 是否已经能被分开表达”；`2B` 解决的是“公开 schema 的主链是否已经真正从 overlay 直抄切到 resolved exposure decision”。
- 当前工作树里，真正的生成闸口还没有切：
  - `scripts/generate-component-schema.mjs` 当前仍是：
    - 读取 `COMPONENT_SCHEMA_OVERLAYS`
    - 直接把 `overlay.props` / `allowedChildren` 写进 `GENERATED_STANDARD_COMPONENT_SCHEMAS`
  - `component-schema.ts` 当前只做 generated schema 验证，不做 exposure-state 解析
  - `public-agent-contract.ts` 当前只是把 `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 原样公开
- 这意味着如果不先把 `2B` 写实，后面很容易把“新类型已经有了”和“主生成链已经切了”混为一谈。

## 这刀要证明什么

- 必须为真的结果 1:
  generated schema 的 props 来源已经不再只是 `overlay.props` 直抄，而是 resolved exposure decision 的结果。
- 必须为真的结果 2:
  schema 生成链已经能显式区分：
  - semantic props
  - blocked props
  - raw-candidate props
  - legacy public fields
- 必须为真的结果 3:
  `component-schema.ts` 仍保持验证/查询出口角色，而不是变成第二套复杂决策引擎。
- 必须为真的结果 4:
  `public-agent-contract.ts` 仍只是稳定出口；`2B` 的复杂度不应被错误迁移到它身上。

## 第一批入口文件

- `scripts/generate-component-schema.mjs`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`
- 视需要再碰：
  - `packages/core/src/schema-overlays.ts`
  - `packages/core/src/prop-exposure-policy.ts`

## 明确不碰

- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/cli/cli.test.ts`
- `packages/ahtml/src/config/runtime-contract.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`
- 任意 runtime renderer 行为补丁
- 首批 raw-candidate 正式开放

## 当前现实依据

- 生成脚本入口:
  - `generate-component-schema.mjs` 当前：
    - `loadOverlays()` 读取 `COMPONENT_SCHEMA_OVERLAYS`
    - `schemas` 直接由：
      - `overlay.name`
      - `overlay.description`
      - `overlay.props`
      - `overlay.allowedChildren`
      组成
    - 没有 `resolveSemanticProps` / `resolveRawCandidateProps` / `buildResolvedSchema`
- generated file 入口:
  - `component-schema.generated.ts` 当前同时导出：
    - `GENERATED_SHADCN_INTROSPECTIONS`
    - `GENERATED_STANDARD_COMPONENT_SCHEMAS`
  - 当前 `GENERATED_STANDARD_COMPONENT_SCHEMAS` 仍完全反映 overlay 的 props，而不是 exposure-policy 决策结果
- 验证层入口:
  - `component-schema.ts` 当前只做：
    - `GENERATED_STANDARD_COMPONENT_SCHEMAS` 的 zod 校验
    - `STANDARD_COMPONENT_NAMES` / `getComponentSchema()` 查询出口
  - 没有 exposure-state 解析逻辑
- public contract 入口:
  - `public-agent-contract.ts` 当前：
    - 直接公开 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
    - 不负责 schema 生成逻辑
- 当前测试保护面:
  - `component-schema.test.ts`
    - 锁住标准组件名单、props、allowedChildren、runtime verification 对齐
    - 是 `2B` 的第一批主 gate
  - `public-agent-contract.test.ts`
    - 锁住公开 contract 直接来自 validated schema
    - 是 `2B` 的第二批主 gate
- 对应设计文档:
  - `docs/architecture/phase-2-design.md`
  - `docs/architecture/phase-2-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`

## 前置条件

1. `2A` 已经让 `ComponentSemanticContract` / `ComponentExposurePolicy` / `ResolvedComponentSchema` 有了稳定类型面。
2. 当前接受 `2B` 仍尽量保持默认公开输出不变；它的重点是“主链切换”，不是“新 prop 开放”。
3. 当前不把 CLI prompt、runtime contract、render-capabilities 拉进来；那是 `2C` 的问题。

## 计划改动

1. 先重写 `generate-component-schema.mjs` 的内部构建过程：
   - 从“overlay 直抄”
   - 改成“semantic contracts + exposure policy + introspection facts”三输入合流
2. 先引入明确的中间步骤，哪怕只是脚本内部函数：
   - `resolveSemanticProps`
   - `resolveRawCandidateProps`
   - `buildResolvedSchema`
3. 让 generated schema 在逻辑上变成：
   - semantic props
   - 加上 opened raw-candidates
   - 而不是继续只等于 `overlay.props`
4. 允许在脚本内部或 generated file 中保留中间结构痕迹，但不要让 runtime 先依赖这些调试结构。
5. 保持 `component-schema.ts` 角色克制：
   - 继续做验证与查询出口
   - 不把 exposure decision 再复制一遍到 runtime 查询层
6. 保持 `public-agent-contract.ts` 角色克制：
   - 继续消费 validated schema
   - 不在这里重做 schema 来源切换

## 最窄验证口

- 先跑:
  - `packages/core/src/component-schema.test.ts`
- 再跑:
  - `packages/core/src/public-agent-contract.test.ts`
- 不先跑:
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`

## 停手边界

- 一旦出现以下信号就先停:
  - 开始让 `alert.variant` / `badge.variant` 出现在 CLI prompt
  - 开始修改 `schema.mjs`
  - 开始补 runtime propMappings 或 render-capabilities 断言
  - 开始处理 `tabs.default` / `accordion.mode` / `row.kind` 这类 legacy bridge 的 runtime 行为
- 这说明已经混入了哪个下一阶段问题:
  - prop 可见性贯通说明已经进入 `2C`
  - runtime 旧桥问题说明已经漂向 `Phase 4`

## 完成证据

- 代码证据:
  - `generate-component-schema.mjs` 已不再把 `overlay.props` 当唯一 props 来源
  - generated schema 已能体现 resolved exposure decision
  - `component-schema.ts` / `public-agent-contract.ts` 仍保持出口角色而非决策中心
- 测试证据:
  - `packages/core/src/component-schema.test.ts`
  - `packages/core/src/public-agent-contract.test.ts`
- 文档证据:
  - 本卡与 `docs/architecture/phase-2-design.md`
  - `docs/architecture/phase-2-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`
    的口径保持一致

## 当前风险

- 风险 1:
  如果只是把脚本写复杂了，但 `GENERATED_STANDARD_COMPONENT_SCHEMAS` 最终仍等于 overlay 直抄，那 `2B` 只是“加中间层”而不是“切闸口”。
- 风险 2:
  如果把 exposure decision 逻辑同时写进 `generate-component-schema.mjs` 和 `component-schema.ts`，会产生两套决策源。
- 风险 3:
  如果 `public-agent-contract.ts` 被拉进复杂决策，会把简单出口变成隐式业务层，后面更难审计。

## 回退判断

- 如果这刀失败，最可能是哪层还没真正切闸:
  - `generate-component-schema.mjs` 仍只读 `overlay.props`
  - generated file 仍没有任何 resolved exposure decision 痕迹
  - `component-schema.ts` 仍只能证明“校验通过”，不能证明“来源已切”
- 如果测试爆炸，先看哪一层:
  - 先看 `component-schema.test.ts` 是否暴露 props 集或 allowedChildren 已经意外变化
  - 再看 `public-agent-contract.test.ts` 是否因为 generated schema 来源变化而需要补更直接的 contract 断言

## 交接说明

- 下一刀最自然的承接 slice:
  - `2C`
- 当前不能误判为“已经完成”的地方:
  - 只是生成脚本新增了 helper 函数，但输出仍和 overlay 直抄完全同构
  - 只是 generated file 多了 introspection facts 注释或中间结构，但最终公开 props 仍不受 exposure policy 控制
  - 只是 core 测试还没炸，但 CLI prompt/runtime 侧其实还没有任何受控入口
  - 只是 `public-agent-contract.ts` 仍能跑通，但真正的 schema 来源切换没有发生
