# Slice: 3A

## 归属

- Phase: 3
- Slice: 3A
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-3-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `3A` 是 `Phase 3` 的真正起点。它解决的是“layout primitive 是否已经进入正式 public contract / standard schema”，不是“layout 是否已经能 parse / validate / render”。
- 当前 `component-schema.ts` 里的 `STANDARD_COMPONENT_NAMES` 仍只有现有 UI / structural 节点，没有任何 layout primitive。这意味着只要 `3A` 还没做，后面的 `3B/3C` 都只能停留在文档目标，无法拥有正式入口。
- 当前 `public-agent-contract.ts` 直接把 `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 作为公开组件 contract 对外输出，所以 layout 是否进入主公开面，本质上先由 schema 决定，不是由 renderer 决定。
- 当前 `component-schema.test.ts` 明确把标准组件名单锁死在 25 个现有节点，`public-agent-contract.test.ts` 则锁住“公开 contract 直接来自 validated schema”这一事实。这说明 `3A` 会首先撞到 core 层测试，而不是 runtime 层。

## 这刀要证明什么

- 必须为真的结果 1:
  `stack` / `cluster` / `split` / `grid` / `switcher` / `frame` 已成为正式标准节点，而不是只在 `docs/layout.md` 里存在。
- 必须为真的结果 2:
  `getComponentSchema()` 已能返回这些节点的 schema，且 schema 是保守的结构语义 schema，不是实现参数 schema。
- 必须为真的结果 3:
  `createPublicAgentContract()` 对外导出的组件列表已经包含 layout primitive，说明它们已进入公开 authoring surface。
- 必须为真的结果 4:
  layout schema 仍不泄露 `gap`、`ratio`、`columns`、`breakpoint`、`max-width` 这类配置层参数。

## 第一批入口文件

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`
- 视需要再碰：
  - `packages/core/src/generated/component-schema.generated.ts`

## 明确不碰

- `packages/core/src/parse/parse-agent-html.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/core/src/parse/sanitize-agent-html.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`

## 当前现实依据

- schema 入口:
  - `component-schema.ts` 当前控制：
    - `STANDARD_COMPONENT_SCHEMAS`
    - `STANDARD_COMPONENT_NAMES`
    - `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
    - `getComponentSchema()`
  - 当前 `STANDARD_COMPONENT_NAMES` 只包含 25 个现有节点：
    - `page`
    - `alert`
    - `card`
    - `separator`
    - `badge`
    - `progress`
    - `input`
    - `textarea`
    - `checkbox`
    - `switch`
    - `slider`
    - `radio-group`
    - `toggle-group`
    - `select`
    - `combobox`
    - `option`
    - `table`
    - `row`
    - `cell`
    - `list`
    - `item`
    - `tabs`
    - `tab`
    - `accordion`
    - `accordion-item`
- overlay 入口:
  - `schema-overlays.ts` 当前只定义 UI / field / table / list / tabs / accordion 相关 contract
  - 没有任何 `stack` / `cluster` / `split` / `grid` / `switcher` / `frame`
- public contract 入口:
  - `public-agent-contract.ts` 当前直接返回 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
  - 这意味着只要 layout 进了 validated schema，它就会进入主公开 contract
- 当前测试保护面:
  - `component-schema.test.ts`
    - 直接断言 `STANDARD_COMPONENT_NAMES` 和组件总数
    - 直接断言 `page.allowedChildren`、`card.allowedChildren` 等嵌套关系
    - 是 `3A` 的第一批主 gate
  - `public-agent-contract.test.ts`
    - 当前保护“公开 contract 直接来自 validated schema”
    - 是 `3A` 的第二批主 gate
- 对应设计文档:
  - `docs/layout.md`
  - `docs/architecture/phase-3-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`

## 前置条件

1. `docs/layout.md` 已经把最小 layout primitive 集合和 props 边界说清。
2. 当前目标只是“layout 名字和保守 schema 进入主公开面”，不是同时打通 parse/validate/runtime。
3. 当前接受测试会先在 core 层断裂；这不是问题，而是 `3A` 应有的第一道证据。

## 计划改动

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
     - 只允许表达页面包裹 / 阅读包裹之类结构角色
3. 明确 children contract 时保持保守：
   - 先允许 layout 嵌套 UI / layout 的最小合法组合
   - 不在 `3A` 里把所有 page-level 组合一次放开到最宽
4. 让 `component-schema.ts` 和 `public-agent-contract.ts` 自然接住这些新 schema：
   - `STANDARD_COMPONENT_NAMES` 会因此变动
   - `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 会因此扩张
   - `createPublicAgentContract()` 会自然暴露这些节点
5. 先补 core 测试，而不是先碰 parser/runtime：
   - 更新 `component-schema.test.ts`
   - 更新 `public-agent-contract.test.ts`

## 最窄验证口

- 先跑:
  - `packages/core/src/component-schema.test.ts`
- 再跑:
  - `packages/core/src/public-agent-contract.test.ts`
- 不先跑:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
  - 任意 runtime / preview / heavy tests

## 停手边界

- 一旦出现以下信号就先停:
  - 开始修改 `parse-agent-html.ts` 正则或 alias 逻辑
  - 开始调整 `validate-agent-html.ts` 的 children 校验
  - 开始为 layout 写 renderer kind / capability / projection
  - 开始为 layout 增加大量数值型 props
- 这说明已经混入了哪个下一阶段问题:
  - parse / validate 改动说明已经进入 `3B`
  - renderer / capability 改动说明已经进入 `3C`
  - 数值参数扩张说明已经违反 `docs/layout.md` 的 contract 边界

## 完成证据

- 代码证据:
  - `schema-overlays.ts` 已显式定义 layout primitive schema
  - `component-schema.ts` 已把它们纳入标准节点集合
  - `public-agent-contract.ts` 已通过 validated schema 自然公开这些节点
- 测试证据:
  - `packages/core/src/component-schema.test.ts`
  - `packages/core/src/public-agent-contract.test.ts`
- 文档证据:
  - 本卡与 `docs/layout.md`
  - `docs/architecture/phase-3-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`
    的口径保持一致

## 当前风险

- 风险 1:
  如果在 `3A` 就把 children contract 放得太宽，后面的 `3B` 很难再用 parse/validate 作为真实收口点。
- 风险 2:
  如果在 `3A` 就把 layout props 做成实现参数面，会直接把配置层职责泄漏到 authoring surface。
- 风险 3:
  `public-agent-contract.ts` 当前是透传 validated schema，所以 `3A` 的任何 schema 误开放都会立刻变成公开 contract 误开放。

## 回退判断

- 如果这刀失败，最可能是哪层还没把 layout 当正式 contract 成员:
  - `schema-overlays.ts` 里没有 layout 条目
  - `STANDARD_COMPONENT_NAMES` 仍未包含 layout 名字
  - `public-agent-contract.ts` 仍只导出现有 UI 节点集合
- 如果测试爆炸，先看哪一层:
  - 先看 `component-schema.test.ts` 是否暴露名称清单、allowedChildren、props 边界仍锁在旧集合
  - 再看 `public-agent-contract.test.ts` 是否因为 components 集合扩张而需要显式补充 contract 断言

## 交接说明

- 下一刀最自然的承接 slice:
  - `3B`
- 当前不能误判为“已经完成”的地方:
  - 只是文档里列了 layout 名字，但 schema 里还没有
  - 只是把 layout 名字加入了标准节点集合，但 props 边界仍泄露实现参数
  - 只是 schema 里有了 layout，但 parse/validate/runtime 还完全没接
  - 只是 tests 改绿了，但 `3A` 已经顺手改了 parser/runtime，导致切片边界失真
