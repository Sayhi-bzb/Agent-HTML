# Phase 2 Implementation Draft

本文是 `docs/architecture/phase-2-design.md` 的下一层草案，目标不是重讲原则，而是把 `Slice 2A` / `Slice 2B` 写到接近真实 patch 设计的粒度。

这份文档只覆盖：

- core 类型面应该新增什么对象
- `schema-overlays.ts` 应该退回成什么职责
- `generate-component-schema.mjs` 应该在哪一层做 exposure 决策
- `public-agent-contract.ts` 在 `2A/2B` 中应保持什么边界
- 哪些候选 prop 目前有真实 introspection 证据，哪些没有

它故意不覆盖：

- layout primitive 接入
- renderer / runtime host 拆分
- Phase 2 试点开放后的完整 runtime 改造

## 1. 当前真实基线

基于当前工作树，`Phase 2` 的核心事实是：

- `packages/core/src/types.ts`
  - 已经同时存在：
    - `ComponentSchemaOverlay`
    - `PropExposureState`
    - `ComponentSemanticPropSchema`
    - `ComponentSemanticContract`
    - `ComponentExposurePolicy`
    - `ResolvedComponentSchema`
  - 但旧的 `ComponentSchemaOverlay` 仍没有退出主链
  - 这说明 `2A` 已经部分发生，但还没有完成职责切换
- `packages/core/src/schema-overlays.ts`
  - 仍是当前 agent-facing schema 的真正手写来源
  - 同时已经额外导出：
    - `COMPONENT_SEMANTIC_CONTRACTS`
- `scripts/generate-component-schema.mjs`
  - 虽然收集了 `variantProps` / `unionProps` / `blockedProps`
  - 但导出的 `GENERATED_STANDARD_COMPONENT_SCHEMAS` 仍只是 overlay 的 `name` / `description` / `props` / `allowedChildren`
- `packages/core/src/component-schema.ts`
  - 当前没有 exposure-state 解析逻辑
  - 只是验证 generated schema 不含 escape hatch prop
- `packages/core/src/public-agent-contract.ts`
  - 当前只把 `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 原样公开

所以更准确的现实不是“`2A` 还没开始”，而是：

- `2A` 的类型脚手架和 policy 文件已经落位
- `2B` 的生成闸口还没有切
- `2C` 当然也还不能把公开 prop 贯穿到 prompt / runtime

因此，`2A/2B` 的关键不是“再加一个文档层”，而是把“公开 schema 的定义权”从混合 overlay 对象里拆出来。

## 2. 当前对象的问题，不要再抽象描述

当前 `ComponentSchemaOverlay` 的问题不是“命名不好”，而是它迫使同一个数组项承担了四种不同来源的信息：

1. 语义内容 contract
   - `page.title`
   - `card.title`
   - `option.label`
2. 语义结构 contract
   - `allowedChildren`
   - `tab.value`
   - `accordion-item.value`
3. 历史包装字段
   - `alert.tone`
   - `row.kind`
   - `tabs.default`
   - `accordion.mode`
4. 原厂 prop 暴露规则
   - `hiddenProps`

只要这四类信息继续共处一个对象，就很难回答下面两个实现问题：

- 某个 prop 是“本来就属于语义层”，还是“原厂 prop 经过 policy 放行后可见”？
- 某个字段是“当前正式公开能力”，还是“legacy bridge 仍暂时可见”？

所以 `2A` 的本质不是换名字，而是把“数据来源”拆开。

## 3. 建议新增的类型对象

下面的对象都应该放在 `packages/core/src/types.ts`，因为它们属于 contract / schema generation 的核心类型，不属于 CLI 或 runtime。

### 3.1 `PropExposureState`

```ts
export type PropExposureState = "blocked" | "raw-candidate"
```

用途：

- 表达原厂 prop 的默认状态
- 不表达“当前组件是否公开”，只表达候选池状态

### 3.2 `ComponentSemanticPropSchema`

```ts
export type ComponentSemanticPropSchema = ComponentPropSchema & {
  readonly origin?: "content" | "structure" | "legacy"
}
```

用途：

- 复用现有 `ComponentPropSchema`
- 在 `2A` 先显式标注现有公开字段的来源
- 避免所有字段都被默认当成“普通公开 prop”

这里的 `origin` 不是最终 runtime 需要消费的字段，而是 schema generation 的中间语义信息。

### 3.3 `ComponentSemanticContract`

```ts
export type ComponentSemanticContract = {
  readonly name: string
  readonly description: string
  readonly expose: boolean
  readonly sourceComponents: readonly string[]
  readonly semanticProps?: readonly ComponentSemanticPropSchema[]
  readonly allowedChildren?: readonly string[]
}
```

用途：

- 替代 `ComponentSchemaOverlay` 里“内容/结构/legacy 字段”那部分职责
- 明确它只负责语义层 contract，不负责原厂 prop 暴露规则

### 3.4 `ComponentExposurePolicy`

```ts
export type ComponentExposurePolicy = {
  readonly component: string
  readonly blocked?: readonly string[]
  readonly rawCandidates?: readonly string[]
  readonly openedRawCandidates?: readonly string[]
  readonly lockedRawCandidates?: readonly string[]
}
```

用途：

- 承载每个组件的原厂 prop policy
- 允许先保守写成 hand-written policy，而不是假装当前已经有自动化决策系统

这四个字段的意义要区分清楚：

- `blocked`
  - 明确永不进入公开面
- `rawCandidates`
  - 该组件当前允许被视为候选池成员的 prop
- `openedRawCandidates`
  - 当前版本正式对外开放的候选 prop
- `lockedRawCandidates`
  - 当前保留在候选池但暂不公开的 prop

`2A` 阶段里，这四者可以允许冗余共存；`2B/2C` 再进一步收紧到更稳定的表达形式。

### 3.5 `ResolvedComponentSchema`

```ts
export type ResolvedComponentSchema = ComponentSchema & {
  readonly semanticProps: readonly ComponentSemanticPropSchema[]
  readonly exposedRawProps?: readonly ComponentPropSchema[]
}
```

用途：

- 作为 `generate-component-schema.mjs` 的内部解析结果目标
- 表达“最终公开 schema”来自两部分：
  - 语义字段
  - 被 policy 放行的原厂 prop

注意：

- `ResolvedComponentSchema` 可以在 `2A` 先只作为内部目标类型，不需要立刻替换 `ComponentSchema` 的公开导出地位
- 对外 `PublicAgentContract` 仍可继续只暴露 `ComponentSchema[]`

## 4. 建议的文件职责重排

### 4.1 `types.ts`

新增：

- `PropExposureState`
- `ComponentSemanticPropSchema`
- `ComponentSemanticContract`
- `ComponentExposurePolicy`
- `ResolvedComponentSchema`

保留：

- `ComponentPropSchema`
- `ComponentSchema`
- `GeneratedShadcnIntrospection`

待降级：

- `ComponentSchemaOverlay`

建议做法：

- `2A` 先保留 `ComponentSchemaOverlay`，标注为迁移中类型
- 不要在同一刀直接把所有引用替换掉

### 4.2 `schema-overlays.ts`

当前职责太大，`2A` 之后应退回成：

- 语义字段定义源
- 结构约束定义源
- legacy public field 定义源

它不再应该承担：

- `hiddenProps` 主逻辑
- 原厂 prop 是否公开的决策逻辑

建议改名方向：

- 代码里可以先不改文件名，避免扩大 diff
- 但导出的常量建议从 `COMPONENT_SCHEMA_OVERLAYS` 改成更接近职责的名字，例如：
  - `COMPONENT_SEMANTIC_CONTRACTS`

如果这一步怕改动太大，也可以先双导出：

- `COMPONENT_SCHEMA_OVERLAYS`
- `COMPONENT_SEMANTIC_CONTRACTS`

然后在 `2B` 再移除旧名。

### 4.3 新文件 `prop-exposure-policy.ts`

这个文件应该成为 `2A/2B` 的核心新增点。

它的职责只做两件事：

- 定义每个组件允许讨论哪些 raw candidate
- 定义当前版本哪些 raw candidate 真正开放

它不应该：

- 定义内容字段
- 定义 allowedChildren
- 直接组装最终 public contract

### 4.4 `generate-component-schema.mjs`

这里是 `2B` 的真正闸口。

当前做法：

- 收集 introspection facts
- 写出 facts
- 直接把 overlay.props 写成 generated schema.props

建议改成三段式：

1. 读 semantic contracts
2. 读 exposure policy
3. 基于 introspection facts + exposure policy 解析出 final props

也就是说，`generate-component-schema.mjs` 不只是“格式化脚本”，而应该开始承担“resolved schema builder”的角色。

### 4.5 `component-schema.ts`

这里不应该承载复杂 policy 推导。

它更适合作为：

- generated schema 的验证层
- public lookup API
- parse/validate 使用的稳定出口

因此建议：

- exposure 决策尽量放在生成脚本或共享 helper 中完成
- `component-schema.ts` 保持“验证并公开结果”，不要再让它变成第二套决策引擎

### 4.6 `public-agent-contract.ts`

在 `2A/2B` 中，这个文件不该承担迁移复杂度。

它的角色应该继续保持简单：

- 消费已经 resolved 的 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
- 对外组装 `PublicAgentContract`

也就是说：

- 生成逻辑改在 core schema generation
- `public-agent-contract.ts` 保持稳定出口

## 5. 建议的数据流

`2B` 之后，推荐的数据流应接近下面这样：

```txt
schema-overlays.ts
  -> semantic contracts

prop-exposure-policy.ts
  -> per-component exposure policy

shadcn registry introspection
  -> variantProps / unionProps / blockedProps

generate-component-schema.mjs
  -> resolve semantic props
  -> resolve raw-candidate props
  -> merge to GENERATED_STANDARD_COMPONENT_SCHEMAS

component-schema.ts
  -> validate and publish stable schema

public-agent-contract.ts
  -> assemble public contract
```

关键点：

- `semantic contracts` 和 `exposure policy` 是两条并行输入
- introspection facts 不直接公开，而是参与决策
- 最终只有 resolved schema 进入 public contract

## 6. 兼容桥应该放在哪

`2A/2B` 最容易犯的错，是一边拆 schema source，一边把 legacy field 的兼容桥顺手塞回新 policy 文件。

不建议这么做。

建议边界是：

- `schema-overlays.ts`
  - 仍可暂存 legacy public field
  - 例如 `tone`、`mode`、`default`、`kind`
- `prop-exposure-policy.ts`
  - 只讨论原厂 prop 的可见性
  - 不负责 legacy field 去留
- runtime compatibility
  - 仍留在 `component-capabilities.mjs` / `render-node.tsx`
  - 等 Phase 4 再清

也就是说：

- legacy public field 是“旧公开 contract 兼容问题”
- raw candidate prop 是“原厂 prop 是否公开的问题”

这两个问题不能再写进同一个对象。

## 7. 当前哪些候选 prop 有硬证据

根据 `packages/core/src/generated/component-schema.generated.ts` 当前内容，现阶段有硬 introspection 证据的样本是：

- `alert.variant`
  - 来自 `variantProps.variant`
- `badge.variant`
  - 来自 `variantProps.variant`
- `select.size`
  - 来自 `unionProps.size`
- `switch.size`
  - 来自 `unionProps.size`
- `tabs.variant`
  - 来自 `variantProps.variant`
- `button.size`
  - 有 introspection，但当前并不在 agent-facing schema 组件集中
- `toggle.size`
  - 有 introspection，但当前 `toggle-group` 的公开面不是直接暴露 `toggle`

当前没有硬证据支持“`card.size` 是一个真实 raw candidate”：

- `card` 的 generated introspection 没有 `variantProps.size`
- 也没有 `unionProps.size`

因此更诚实的文档口径应是：

- 第二批候选优先考虑 `select.size`、`switch.size`
- `card.size` 如果还要保留，只能作为“待重新核实的设计假设”，不能继续写成当前代码事实

## 8. Slice 2A 的真实 patch 顺序

### Step 1

先在 `types.ts` 增类型，不删旧类型：

- 新增 `PropExposureState`
- 新增 `ComponentSemanticPropSchema`
- 新增 `ComponentSemanticContract`
- 新增 `ComponentExposurePolicy`
- 新增 `ResolvedComponentSchema`

不要立刻删除：

- `ComponentSchemaOverlay`

理由：

- 当前测试和 `schema-overlays.ts` 还直接依赖它
- 先加新类型可以降低第一刀的风险

### Step 2

新增 `prop-exposure-policy.ts`，先用最保守内容落地：

- `alert.variant` 进入 raw candidate 池但默认锁住
- `badge.variant` 进入 raw candidate 池但默认锁住
- `select.size` 进入 raw candidate 池但默认锁住
- `switch.size` 进入 raw candidate 池但默认锁住

不要在 `2A` 直接开放它们。

### Step 3

把 `schema-overlays.ts` 中的 `hiddenProps` 留在原位，但新增并行导出，开始让语义字段源独立命名。

例如：

- 保留 `COMPONENT_SCHEMA_OVERLAYS`
- 新增 `COMPONENT_SEMANTIC_CONTRACTS`

这一步的目标不是删 `hiddenProps`，而是先让调用方有新的语义入口可切换。

### Step 4

更新 `types.test.ts`：

- 新增对新类型的满足性示例
- 保留对旧 `ComponentSchemaOverlay` 的迁移中断言

停手条件：

- 只要 generated schema 输出开始改变，就说明已经进入 `2B`

## 9. Slice 2B 的真实 patch 顺序

### Step 1

先改 `generate-component-schema.mjs` 的内部构建过程，不急着改最终输出。

建议先引入中间函数概念：

- `resolveSemanticProps`
- `resolveRawCandidateProps`
- `buildResolvedSchema`

哪怕一开始只是局部函数，也比继续把逻辑写在顶层 `.map()` 里更容易验证。

### Step 2

让 generated file 先额外输出调试型中间数据，哪怕暂时还不被 runtime 消费，例如：

- `GENERATED_RESOLVED_COMPONENT_SCHEMAS`
- 或每个组件上附带仅内部使用的 source breakdown

如果担心 generated file 变复杂，也可以只在脚本内部保留中间结构，最终仍落成 `GENERATED_STANDARD_COMPONENT_SCHEMAS`。

### Step 3

确认 `GENERATED_STANDARD_COMPONENT_SCHEMAS` 的 props 改为：

- `semanticProps`
- 加上 `openedRawCandidates` 映射出的公开 props

而不是再直接等于 `overlay.props`

### Step 4

更新 `component-schema.test.ts`：

- 新增断言，确认 schema 来源不再只是 overlay 直抄
- 但 `2B` 默认公开结果仍尽量与当前基线保持一致

停手条件：

- 一旦 `cli.test.ts` 需要因新 prop 可见性变化而改断言，就说明已经进入 `2C`

## 10. 对现有文档口径的修正

基于当前生成文件，以下口径应调整为更诚实的版本：

- 把“第二批样本包含 `card.size`”改成：
  - 第二批优先样本：`select.size`、`switch.size`
  - `card.size` 暂列为待核实假设，不作为当前事实

这不是吹毛求疵，而是因为本轮目标就是“诚实化并具体细化”。如果某个候选没有当前工作树证据，就不该继续写成确定事项。

## 11. 最窄验证口

`2A` 建议只看：

- `packages/core/src/types.test.ts`
- `packages/core/src/component-schema.test.ts`

`2B` 建议只看：

- `packages/core/src/component-schema.test.ts`
- `packages/core/src/public-agent-contract.test.ts`

在这两个切片里，都不该先跑：

- `packages/ahtml/src/cli/cli.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`

除非公开输出已经真的开始变化。
