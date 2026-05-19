# Issue Draft: Slice 5A Public Contract Legacy Field Exit

## 标题

`Phase 5 / Slice 5A`: 把 legacy field 从主公开 contract / prompt 入口降为显式兼容层

## 为什么现在开这张单

- `5A` 是 `Phase 5` 的上游收口刀。它解决的是“旧字段还在不在主公开 contract 里”，不是“runtime 还能不能继续兼容吃旧字段”。
- 当前 `schema-overlays.ts` 仍直接公开：
  - `alert.tone`
  - `badge.tone`
  - `row.kind`
  - `tabs.default`
  - `accordion.mode`
  - `accordion.default`
  这说明 legacy field 现在仍是正式 schema / prompt 输入来源，而不是单纯兼容层。
- `public-agent-contract.ts` 当前基本只是把 `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 原样对外导出；`schema.mjs` 又直接基于 `component.props` 拼 prompt。这条链不先收，上游 contract 就不会诚实收口。

## 当前现实

- `packages/core/src/schema-overlays.ts`
  - 当前仍把 `tone`、`kind`、`mode`、`default` 直接写进公开 props
- `packages/core/src/public-agent-contract.ts`
  - 当前基本直接返回 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
- `packages/ahtml/src/cli/schema.mjs`
  - `getCliSchemaOutput()` 直接消费 `createPublicAgentContract()`
  - `formatPrompt()` 直接遍历 `schema.components` 的 `props`
- 当前测试保护面仍偏弱：
  - `public-agent-contract.test.ts` 还没有直接证明 `tone/kind/mode/default` 已退出主公开面
  - `cli.test.ts` 已经检查 prompt 不应重新暴露 `tone`，但对 `tabs.default`、`accordion.mode/default`、`row.kind` 的直接保护仍不够强

## 目标

这张单不是删 runtime bridge，也不是过早去改 doctor。它只证明一件事：

- legacy field 不再作为主公开 schema / prompt 的新增入口；如果暂时还保留，也已经降成显式兼容层，而不是继续伪装成正式 authoring surface。

## 范围

第一批入口文件：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/public-agent-contract.ts`
- `packages/ahtml/src/cli/schema.mjs`

视需要改：

- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/component-schema.ts`

建议交付内容：

1. 在 `schema-overlays.ts` 明确区分：
   - 最终公开字段
   - 显式兼容字段
2. 在 `public-agent-contract.ts` 收口输出：
   - 不再把 legacy field 当正式 public props 直接带出
3. 在 `schema.mjs` 收 prompt：
   - prompt 只反映最终公开 schema
   - `tone` / `kind` / `mode` / `default` 不再作为主要 authoring 能力出现
4. 补轻量断言：
   - `packages/core/src/public-agent-contract.test.ts`
   - `packages/ahtml/src/cli/cli.test.ts`
   直接证明“旧字段已退出主公开面”

## 明确不做

- 不改 `packages/ahtml/src/config/component-capabilities.mjs`
- 不改 `packages/ahtml/src/config/render-capabilities.mjs`
- 不改 `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 不改 `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- 不回写 doctor / heavy tests 的最终口径
- 不在这张单里发明新的 tabs / accordion / table 状态语义

## 前置条件

必须先确认下面三条：

1. `Phase 2` 已经把 prop exposure / public contract 的目标方向说清，不再打算继续沿旧字段增债
2. 当前允许 runtime 继续兼容旧字段；`5A` 的重点只是先收主公开面
3. 如果 heavy fixtures 还要暂时依赖旧字段，也必须把它们降到兼容层定位，而不是继续留在主 prompt/schema 中

如果上面任一条件不成立，这张单的正确输出不是“假装收口”，而是把阻塞点写清。

## 完成标准

必须同时满足：

1. `schema-overlays.ts` 不再把 legacy field 当主公开层默认输出
2. `public-agent-contract.ts` 已开始显式区分主公开 props 与兼容层
3. `schema.mjs` 的 prompt 输出不再默认推荐 `tone` / `kind` / `mode` / `default`
4. `public-agent-contract.test.ts` 和 `cli.test.ts` 已直接保护“旧字段退出主公开面”

下面这些不足以支持“完成”：

- 只是 prompt 里不再写 `tone`，但 schema 里还在主路径公开它
- 只是从个别组件删了 legacy field，但 `tabs.default` / `accordion.mode/default` / `row.kind` 还留在主公开面
- 只是 docs 说要退出旧字段，但测试没有直接证明

## 最窄验证口

- 先跑:
  - `packages/core/src/public-agent-contract.test.ts`
- 再跑:
  - `packages/ahtml/src/cli/cli.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - 任意 heavy CLI tests

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始修改 `component-capabilities.mjs` / `render-capabilities.mjs`
- 开始改 `render-node.tsx` 或 `app.tsx`
- 为了让 prompt/schema 通过，重新把已经收紧的旧字段放回主公开面
- 开始设计新的 runtime 状态模型或新的 table header/body 结构语义

这分别说明：

- 已经混入 `5B`
- 已经混入 `5C`
- 这刀并没有真正收口 contract
- 已经退回 `Phase 3/4`

## 风险提醒

- `schema-overlays.ts` 当前同时混着内容字段、历史包装字段、hiddenProps 规则；如果不先拆概念，`5A` 很容易变成“删几个字段”而不是“收 contract 主路径”
- `public-agent-contract.test.ts` 当前对旧字段退出主公开面的保护偏弱，容易让改动表面通过但没有真正被钉住
- `cli.test.ts` 虽然已经检查 prompt 不出现 `tone="`，但对 `kind/mode/default` 的直接保护还不够强，尤其是 `tabs` / `accordion` / `table`

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 5 / Slice 5B`

当前仍会显式保留、但不应在这刀里收掉的东西：

- runtime spec 中的 legacy bridge 字段
- renderer 对 legacy bridge 的兼容入口
- doctor / preview / build / runtime heavy gate 的最终收口

## 参考文档

- `docs/architecture/slice-5a-execution-card.md`
- `docs/architecture/phase-5-implementation-draft.md`
- `docs/architecture/slice-risk-card-map.md`
- `docs/details/high-risk-runtime-bridges.md`
