# Phase 2 Design

本文把 `docs/roadmap.md` 中的 Phase 2 从阶段口号细化成当前工作树下可执行的设计方案。

目标不是直接改代码，而是先明确：

- 哪一层负责 public prop 暴露决策
- 哪些旧字段需要兼容桥
- 首批 `raw-candidate` 试点应该选哪些组件
- schema / prompt / runtime 之间的最小改动顺序是什么

## 1. 当前约束

根据 [../details/current-contract-audit.md](../details/current-contract-audit.md) 和 [../details/current-contract-component-matrix.md](../details/current-contract-component-matrix.md)，当前 Phase 2 受到这些约束：

- schema 的真实源头是 `schema-overlays.ts`，并通过 `scripts/generate-component-schema.mjs` 写入 `generated/component-schema.generated.ts`。
- `createPublicAgentContract()` 直接导出 generated schema，`schema.mjs` 只是下游消费者。
- runtime 只会消费两类公开 prop：
  - 已在 `component-capabilities.mjs` 里通过 `propMappings` / `rootByProp` / 显式字段接入的 prop
  - renderer 自定义逻辑直接读取的 prop
- 仅仅把 prop 加进 schema，不会自动让 runtime 支持它。

这意味着：

- Phase 2 的主改动层必须在 core schema 生成链路。
- 试点组件必须优先选择 runtime 已有接线点、或只需低成本补接线的组件。

## 2. 要先拆开的四类东西

当前 `schema-overlays.ts` 把四类概念混在一起：

1. 内容字段
   - 例：`page.title`、`card.title`、`option.label`
2. 结构字段
   - 例：`tab.value`、`accordion-item.value`、`option.value`
3. 历史包装字段
   - 例：`alert.tone`、`row.kind`、`tabs.default`、`accordion.mode`
4. 原厂 prop 暴露规则
   - 例：`hiddenProps: ["variant"]`

Phase 2 的第一原则是先把这四类职责分开，再谈 `blocked` / `raw-candidate`。

如果不先拆：

- 代码会继续把“内容 contract”和“实现 prop 暴露规则”写在同一个对象里。
- 任何新增候选 prop 都会继续依赖手工 overlay，而不是进入稳定决策链。

## 3. 建议的数据模型

### 3.1 保留的稳定对象

当前已有对象可以保留：

- `GeneratedShadcnIntrospection`
- `ComponentSchema`
- `ComponentPropSchema`

### 3.2 建议新增的对象

建议在 core 类型面引入以下稳定对象：

- `PropExposureState`
  - `blocked`
  - `raw-candidate`

- `ComponentContentContract`
  - 负责内容字段和结构字段
  - 不负责原厂 prop 暴露

- `ComponentExposurePolicy`
  - 负责原厂 prop 的状态和放行决策
  - 输入：
    - introspection facts
    - blocked 名单
    - per-component allowlist / lock list

- `ResolvedComponentSchema`
  - schema 生成阶段最终产物
  - 由：
    - 内容 contract
    - 结构 contract
    - exposure decision
    共同产生

### 3.3 当前文件级落点建议

- `types.ts`
  - 新增 `PropExposureState`
  - 新增 exposure policy 相关类型
- `schema-overlays.ts`
  - 退回为“内容/结构 contract 源”
  - 不再同时承担 hiddenProps 主逻辑
- 新增一个独立文件
  - 例如 `prop-exposure-policy.ts`
  - 承载 per-component 原厂 prop 状态和开放策略
- `generate-component-schema.mjs`
  - 从“把 overlay 原样写进 generated schema”
  - 改为“合并内容 contract + introspection + exposure policy 后生成 schema”

## 4. 兼容桥策略

Phase 2 不应直接硬删旧字段。更现实的策略是分三层处理：

### 4.1 立即冻结新增

这些字段不再作为新增能力入口：

- `tone`
- `kind`
- `mode`
- `default`

### 4.2 短期保留 schema 可见性，但显式标为 legacy

适用于：

- runtime 主路径仍显式依赖它们
- 还没有替代 public contract

当前样本：

- `row.kind`
- `tabs.default`
- `accordion.mode`
- `accordion.default`

### 4.3 可以优先退出公开面的字段

只适用于 runtime 已有更自然的原厂候选替代，且迁移成本较低。

当前样本：

- `alert.tone`
- `badge.tone`

这两个字段已经在 runtime 被映射到 `variant`，是最适合做首批迁移试点的一组。

## 5. 首批 raw-candidate 试点建议

Phase 2 不应同时处理所有候选 prop。按照当前工作树，建议分两批：

### 批次 A：优先试点

- `alert.variant`
- `badge.variant`

原因：

- `alert` / `badge`
  - runtime 已有 `tone -> variant` 的 `propMappings`
  - 只需把 schema 侧从 legacy `tone` 过渡到候选 `variant`

预期收益：

- 可以验证 `raw-candidate` 是否真的能进入 schema / prompt / runtime，而不是只停在类型层。

补充边界：

- `list.variant` 可以继续作为历史公开正例和对照组存在
- 但它不是 `Phase 2` 第一批“新开放 raw-candidate”样本，否则会把历史例外和新开放机制混在一起

### 批次 B：次级试点

- `select.size`
- `switch.size`

可选待核实项：

- `card.size`

原因：

- introspection 已明确显示这些组件存在 `size` 候选事实：
  - `select.unionProps.size`
  - `switch.unionProps.size`
- 当前工作树没有同等强度的 `card.size` introspection 证据；它应继续降级为设计假设，而不是当前批次事实。
- `button` / `toggle` 等还有更复杂尺寸轴
- 但当前 runtime 并没有为这些组件配置 `size` 的消费路径。

风险：

- 一旦选择这批组件，就不只是 schema 改动，还要补 runtime prop pass-through 或变体映射。

因此不应把它们放在 Phase 2 的第一刀。

## 6. 不建议作为首批试点的组件

以下组件不适合作为 Phase 2 第一批试点：

- `tabs`
  - 问题核心不是 raw candidate，而是 `default` 历史字段穿透到 uiProtocol / renderer spec / render function
- `accordion`
  - 同时带 `mode` 和 `default` 两个 legacy 入口，且 renderer 行为模型直接依赖它们
- `combobox`
  - 当前不是通过 `propMappings` 接线，而是 renderer 直接读 `node.props.value`
- `toggle-group`
  - 还带 `type`、`variant`、`size`、`spacing` 多个隐藏原厂参数，暴露策略复杂度更高

这些组件应该作为：

- legacy bridge 样本
- Phase 4 renderer 解耦样本

而不是第一批 exposure-state 试点。

## 7. 推荐改动顺序

### Step 1

先在 core 类型面引入 exposure-state 对象，不改 runtime：

- `types.ts`
- 新的 exposure policy 文件

完成标准：

- 可以表达：
  - blocked
  - raw-candidate
  - per-component locked/open decisions

### Step 2

把 `schema-overlays.ts` 降级为内容/结构 contract 源：

- 内容字段继续保留
- 结构字段继续保留
- hiddenProps 逐步迁出主路径

完成标准：

- overlay 不再是 public prop 暴露规则的唯一来源

### Step 3

改生成链路：

- `generate-component-schema.mjs`
- `component-schema.ts`
- `public-agent-contract.ts`

完成标准：

- generated schema 中的 props 来源于 resolved exposure decision
- 不再只是“照抄 overlay.props”

### Step 4

更新 `schema.mjs`：

- prompt 只展示最终公开 schema
- 可以显式排除 locked 的 raw-candidate

完成标准：

- prompt 不再通过历史 overlay 语义字段间接继承旧 contract

### Step 5

只在首批试点组件上打开新候选：

- `alert.variant`
- `badge.variant`

并保留短期兼容桥：

- `tone` 仍可解析
- 但新 schema / prompt 主方向转向 `variant`

完成标准：

- `variant` 在 schema 和 prompt 中可见
- runtime 仍正确渲染
- `tone` 仍可兼容，但不再作为新增方向

## 8. 验证口径

### 需要补的测试类型

- core schema generation
  - blocked prop 不可见
  - locked raw-candidate 不可见
  - opened raw-candidate 可见
- CLI prompt
  - prompt 只展示最终公开 props
  - legacy 字段不再作为新推荐写法
- runtime mapping
  - 试点组件的 raw-candidate 在 runtime 中确实被消费

### 当前最值得新增的场景

1. `alert`
   - `variant` 打开时应出现在 schema/prompt
   - `tone` 保持兼容但不再是主推荐
2. `badge`
   - 同上
3. `select`
   - `size` 默认锁住，不应出现在 schema/prompt，作为第二批锁住样本
4. `switch`
   - `size` 默认锁住，不应出现在 schema/prompt，作为第二批锁住样本
5. `list`
   - `variant` 继续工作，作为现有正例

## 9. 和后续阶段的接口

Phase 2 的完成不等于旧字段被删除。

Phase 2 真正交付的是：

- 一个稳定的 public prop 决策链
- 一个显式的 legacy bridge 列表
- 一组最小试点组件

之后：

- Phase 3 负责 layout 进入同一个 schema/authoring surface
- Phase 4 负责把 legacy bridge 从 renderer 主路径里拆掉
- Phase 5 才负责最终下线双轨 contract
