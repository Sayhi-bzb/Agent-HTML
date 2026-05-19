# Issue Draft: Slice 3A Layout Node Contract Registration

## 标题

`Phase 3 / Slice 3A`: 让 layout primitive 进入正式 public contract / standard schema

## 为什么现在开这张单

- `3A` 是 `Phase 3` 的真正起点。它解决的是“layout primitive 是否已经进入正式 public contract / standard schema”，不是“layout 是否已经能 parse / validate / render”。
- 当前 `component-schema.ts` 里的 `STANDARD_COMPONENT_NAMES` 仍只有现有 UI / structural 节点，没有任何 layout primitive。这意味着只要这刀还没做，后面的 `3B/3C` 都只能停留在文档目标，无法拥有正式入口。
- 当前 `public-agent-contract.ts` 直接把 `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 作为公开组件 contract 对外输出，所以 layout 是否进入主公开面，本质上先由 schema 决定，不是由 renderer 决定。
- 当前 `component-schema.test.ts` 明确把标准组件名单锁死在现有节点集合，`public-agent-contract.test.ts` 则锁住“公开 contract 直接来自 validated schema”这一事实。这说明这刀会先撞到 core 层测试，而不是 runtime 层。

## 当前现实

- `packages/core/src/component-schema.ts`
  - 当前控制：
    - `STANDARD_COMPONENT_SCHEMAS`
    - `STANDARD_COMPONENT_NAMES`
    - `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
    - `getComponentSchema()`
  - 当前 `STANDARD_COMPONENT_NAMES` 只包含现有 UI / structural 节点，不包含：
    - `stack`
    - `cluster`
    - `split`
    - `grid`
    - `switcher`
    - `frame`
- `packages/core/src/schema-overlays.ts`
  - 当前只定义 UI / field / table / list / tabs / accordion 相关 contract
  - 当前没有任何 layout primitive 条目
- `packages/core/src/public-agent-contract.ts`
  - 当前直接返回 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
  - 只要 layout 进了 validated schema，它就会进入主公开 contract
- 当前测试保护面：
  - `packages/core/src/component-schema.test.ts`
  - `packages/core/src/public-agent-contract.test.ts`

## 目标

这张单不是打通 parse/validate/runtime。它只证明一件事：

- `stack` / `cluster` / `split` / `grid` / `switcher` / `frame` 已成为正式标准节点，进入主公开 authoring surface，且暴露的是保守结构语义 schema，而不是实现参数 schema。

## 范围

第一批入口文件：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`

视需要再碰：

- `packages/core/src/generated/component-schema.generated.ts`

建议交付内容：

1. 先在 `schema-overlays.ts` 新增 layout primitive 条目：
   - `stack`
   - `cluster`
   - `split`
   - `grid`
   - `switcher`
   - `frame`
2. 对这些条目保持最保守 schema：
   - `stack`
     - 零 props
     - 只表达纵向堆叠语义
   - `cluster`
     - 零 props
     - 只表达横向聚类 / 自然换行语义
   - `split`
     - 只允许极少量结构 props，或 v1 暂时零 props
   - `grid`
     - v1 可以先零 props
   - `switcher`
     - v1 可以先零 props 或单一结构倾向 prop
   - `frame`
     - 只允许表达包裹 / 阅读边界之类结构角色
3. 让 `component-schema.ts` 和 `public-agent-contract.ts` 自然接住这些新 schema：
   - `STANDARD_COMPONENT_NAMES` 会因此变动
   - `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 会因此扩张
   - `createPublicAgentContract()` 会自然暴露这些节点
4. 先补 core 测试，而不是先碰 parser/runtime：
   - 更新 `component-schema.test.ts`
   - 更新 `public-agent-contract.test.ts`

## 明确不做

- 不改 `packages/core/src/parse/parse-agent-html.ts`
- 不改 `packages/core/src/parse/validate-agent-html.ts`
- 不改 `packages/core/src/parse/sanitize-agent-html.ts`
- 不改 `packages/ahtml/src/config/component-capabilities.mjs`
- 不改 `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 不改 `packages/ahtml/src/cli/runtime-template/src/app.tsx`

## 前置条件

必须先确认下面三条：

1. `docs/layout.md` 已经把最小 layout primitive 集合和 props 边界说清
2. 当前目标只是“layout 名字和保守 schema 进入主公开面”，不是同时打通 parse/validate/runtime
3. 当前接受测试会先在 core 层断裂；这不是问题，而是这刀应有的第一道证据

## 完成标准

必须同时满足：

1. `stack` / `cluster` / `split` / `grid` / `switcher` / `frame` 已成为正式标准节点
2. `getComponentSchema()` 已能返回这些节点的 schema，且 schema 是保守的结构语义 schema
3. `createPublicAgentContract()` 对外导出的组件列表已经包含这些 layout primitive
4. layout schema 仍不泄露 `gap`、`ratio`、`columns`、`breakpoint`、`max-width` 这类配置层参数

下面这些不足以支持“完成”：

- 只是文档里列了 layout 名字，但 schema 里还没有
- 只是把 layout 名字加入了标准节点集合，但 props 边界仍泄露实现参数
- 只是 schema 里有了 layout，但 parse/validate/runtime 还完全没接
- 只是 tests 改绿了，但这刀已经顺手改了 parser/runtime，导致切片边界失真

## 最窄验证口

- 先跑:
  - `packages/core/src/component-schema.test.ts`
- 再跑:
  - `packages/core/src/public-agent-contract.test.ts`
- 这张单默认不先跑:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
  - 任意 runtime / preview / heavy tests

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始修改 `parse-agent-html.ts` 正则或 alias 逻辑
- 开始调整 `validate-agent-html.ts` 的 children 校验
- 开始为 layout 写 renderer kind / capability / projection
- 开始为 layout 增加大量数值型 props

这分别说明：

- 已经进入 `3B`
- 已经进入 `3C`
- 已经违反 `docs/layout.md` 的 contract 边界

## 风险提醒

- 如果在这刀就把 children contract 放得太宽，后面的 `3B` 很难再用 parse/validate 作为真实收口点
- 如果在这刀就把 layout props 做成实现参数面，会直接把配置层职责泄漏到 authoring surface
- `public-agent-contract.ts` 当前是透传 validated schema，所以任何 schema 误开放都会立刻变成公开 contract 误开放

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 3 / Slice 3B`

当前仍会显式保留、但不应在这刀里收掉的东西：

- parse / validate 对 layout 的正式承认
- runtime projection
- host shell 与 document shell 的默认结构假设

## 参考文档

- `docs/architecture/slice-3a-execution-card.md`
- `docs/architecture/phase-3-implementation-draft.md`
- `docs/layout.md`
- `docs/architecture/execution-checklist.md`
