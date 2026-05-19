# Slice: 5A

## 归属

- Phase: 5
- Slice: 5A
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-5-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `5A` 是 `Phase 5` 的上游收口刀。它解决的是“旧字段还在不在主公开 contract 里”，不是“runtime 还能不能继续兼容吃旧字段”。
- 当前 `schema-overlays.ts` 仍直接公开：
  - `alert.tone`
  - `badge.tone`
  - `row.kind`
  - `tabs.default`
  - `accordion.mode`
  - `accordion.default`
  这说明旧字段现在仍是正式 schema / prompt 输入来源，而不是单纯兼容层。
- `public-agent-contract.ts` 当前基本只是把 `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 原样对外导出；`schema.mjs` 又直接基于 `component.props` 拼 prompt。这条链不先收，上游 contract 就永远不会诚实收口。

## 这刀要证明什么

- 必须为真的结果 1:
  legacy field 不再作为主公开 schema / prompt 的新增入口。
- 必须为真的结果 2:
  兼容字段如果暂时还保留，也已经从“默认公开字段”降成显式兼容层，而不是继续伪装成正式 authoring surface。
- 必须为真的结果 3:
  `cli.test.ts` 和 `public-agent-contract.test.ts` 已经开始直接保护“旧字段退出主公开面”这件事，而不只是在旁边验证 renderConfig 或帮助文案。

## 第一批入口文件

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/public-agent-contract.ts`
- `packages/ahtml/src/cli/schema.mjs`
- 视需要改：
  - `packages/core/src/generated/component-schema.generated.ts`
  - `packages/core/src/component-schema.ts`

## 明确不碰

- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- doctor / heavy tests 最终回写

## 当前现实依据

- 代码入口:
  - `schema-overlays.ts` 当前仍把 `tone`、`kind`、`mode`、`default` 直接写进公开 props
  - `public-agent-contract.ts` 当前直接返回 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
  - `schema.mjs` 当前：
    - `getCliSchemaOutput()` 直接消费 `createPublicAgentContract()`
    - `formatPrompt()` 直接遍历 `schema.components` 的 `props`
- 当前测试保护面:
  - `public-agent-contract.test.ts` 当前几乎只锁：
    - `style-ref`
    - render config
    - safety policy
    它还没有直接证明 `tone/kind/mode/default` 已退出主公开面
  - `cli.test.ts` 当前已经证明：
    - prompt 里不应出现 `tone="`
    - renderConfig 不应重新暴露 `tone`
    - schema 仍会导出 runtime verification/mapping
    但它还没有把 `tabs.default`、`accordion.mode/default`、`row.kind` 的退出写成主断言
- 对应审计文档:
  - `docs/details/current-contract-audit.md`
  - `docs/architecture/execution-checklist.md`
  - `docs/architecture/phase-5-implementation-draft.md`

## 前置条件

1. `Phase 2` 至少已经把 prop exposure / public contract 的最终目标说清，不再打算继续沿旧字段增债。
2. 当前允许 runtime 继续兼容旧字段；`5A` 的重点是先收主公开面，不要求这刀里同步删 runtime spec。
3. 如果仍需要用旧字段维持 heavy fixtures，那也必须把它们降到兼容层定位，而不是继续留在主 prompt/schema 中。

## 计划改动

1. 先在 `schema-overlays.ts` 里把：
   - 最终公开字段
   - 显式兼容字段
   的边界写清，不再让兼容字段默认出现在主公开 props 里。
2. 再在 `public-agent-contract.ts` 收口输出：
   - 让 `createPublicAgentContract()` 不再继续把 legacy field 当正式 public props 直接带出。
3. 再在 `schema.mjs` 收 prompt：
   - prompt 不再把 `tone`、`kind`、`mode`、`default` 写成主要 authoring 能力
   - prompt 只反映最终公开 schema
4. 最后补轻量测试断言：
   - `public-agent-contract.test.ts`
   - `cli.test.ts`
   让它们直接证明旧字段已退出主公开面。

## 最窄验证口

- 先跑:
  - `packages/core/src/public-agent-contract.test.ts`
- 再跑:
  - `packages/ahtml/src/cli/cli.test.ts`
- 不先跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - 任意 heavy CLI tests

## 停手边界

- 一旦出现以下信号就先停:
  - 开始修改 `component-capabilities.mjs` / `render-capabilities.mjs`
  - 开始改 `render-node.tsx` 或 `app.tsx`
  - 为了让 prompt/schema 通过，开始重新放宽已经收紧的旧字段
  - 开始设计新的 runtime 状态模型或新的 table header/body 结构语义
- 这说明已经混入了哪个下一阶段问题:
  - 改 runtime spec 说明已经混入 `5B`
  - 改 shell / heavy gate 说明已经混入 `5C`
  - 设计新状态/结构语义说明退回了 `Phase 3/4`

## 完成证据

- 代码证据:
  - `schema-overlays.ts` 不再把 legacy field 当主公开层默认输出
  - `public-agent-contract.ts` 已开始明确主公开 props 与兼容层的边界
  - `schema.mjs` 的 prompt 输出不再默认推荐 legacy field
- 测试证据:
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
- 文档证据:
  - 本卡与 `docs/architecture/execution-checklist.md`
  - `docs/architecture/phase-5-implementation-draft.md`
    的口径保持一致

## 当前风险

- 风险 1:
  `schema-overlays.ts` 当前同时混着内容字段、历史包装字段、hiddenProps 规则；如果不先拆概念，`5A` 很容易变成“删几个字段”而不是“收 contract 主路径”。
- 风险 2:
  `public-agent-contract.test.ts` 当前对旧字段退出主公开面的保护太弱，容易让改动看起来通过但没有真正被钉住。
- 风险 3:
  `cli.test.ts` 虽然已经检查 prompt 不出现 `tone="`，但对 `kind/mode/default` 的直接保护还不够强，尤其是 `tabs` / `accordion` / `table` 这些高耦合样本。

## 回退判断

- 如果这刀失败，最可能是哪层还在继续公开旧字段:
  - `schema-overlays.ts` 仍直接定义 legacy props
  - `public-agent-contract.ts` 仍直接透传 generated schema 结果
  - `schema.mjs` 仍把 legacy field 作为主 prompt 文案输出
- 如果测试爆炸，先看哪一层:
  - 先看 `public-agent-contract.test.ts` 是否开始暴露 contract props 集变化
  - 再看 `cli.test.ts` 是否因为 prompt/schema 输出仍带旧字段而报警

## 交接说明

- 下一刀最自然的承接 slice:
  - `5B`
- 当前不能误判为“已经完成”的地方:
  - 只是 prompt 里不再写 `tone`，但 schema 里还在公开它
  - 只是从个别组件删了 legacy field，但 `tabs.default` / `accordion.mode/default` / `row.kind` 还留在主公开面
  - 只是 docs 说要退出旧字段，但 `public-agent-contract.test.ts` 没有直接证明这件事
