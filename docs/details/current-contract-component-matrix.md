# Current Contract Component Matrix

本文把当前 public contract 审计继续细化到组件级别。

它只描述当前工作树事实，不提前替未来重构做决定。所有字段都来自当前代码：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`

## 读法

- `当前公开 props`：当前 schema / prompt 会看到的 props。
- `历史包装 props`：当前仍公开、但 roadmap 目标中应逐步退出主 contract 的字段。
- `hiddenProps`：overlay 当前隐藏的原厂 prop。
- `runtime bridge`：runtime 当前如何消费公开 props，或如何把公开 props/内部默认值映射到底层实现。
- `阶段含义`：对 Phase 1/2/3/4 的直接影响，不是新规则。

## 文档与内容容器

| Component | 当前公开 props | 历史包装 props | hiddenProps | runtime bridge | render kind | 阶段含义 |
|---|---|---|---|---|---|---|
| `page` | `title` | 无 | 无 | `titleProp: "title"`，root 为 `article`，默认 `grid gap-5` 文档布局 | `compound` | 仍是唯一根节点，且 runtime 默认按文档页排版；layout 落地前是强约束 |
| `alert` | `title`, `tone` | `tone` | `variant` | `tone -> variant` (`danger -> destructive`, `neutral -> default`) | `compound` | `tone` 是典型旧包装字段，Phase 2/4 都要处理 |
| `card` | `title` | 无 | `size` | `titleProp: "title"`，`CardHeader/CardContent` 由 renderer 固定拼装 | `compound` | `size` 已被隐藏但当前未进入 runtime bridge，适合作为后续 exposure-state 对照样本 |
| `separator` | 无 | 无 | 无 | 直接映射到 `Separator` | `primitive` | 低风险基线组件 |
| `badge` | `tone` | `tone` | `variant` | `tone -> variant` (`danger/neutral/success/warning`) | `primitive` | 和 `alert` 一样，说明旧包装字段不只存在一处 |
| `progress` | `value` | 无 | 无 | `value -> value`，并带 `determinate-progress` 行为模型 | `primitive` | 是“公开语义值直接进入 runtime”的对照组 |
| `table` | 无 | 无 | 无 | 结构由 `row`/`cell` children 决定 | `table` | 表格自身不暴露 props，但对子节点 `row.kind` 有依赖 |
| `list` | `variant` | 无 | 无 | `variant` 决定根标签 `ol/ul`，默认 `ul` | `collection` | 当前 `variant` 是公开特例，不应被误当成“所有原厂 variant 都能放开”的先例 |
| `tabs` | `default` | `default` | `defaultValue`, `value` | `attrAliases.default -> "default-value"`；`defaultProp: "default"`；默认项由 renderer 计算 | `tabs` | 是旧字段已进入 schema、uiProtocol、renderer spec、render function 的完整样本 |
| `accordion` | `mode`, `default` | `mode`, `default` | `type`, `collapsible`, `defaultValue`, `value` | `modeProp: "mode"`、`defaultProp: "default"`、`defaultMode: "multiple"` | `accordion` | 旧 contract 穿透最深的组件之一；Phase 2 改 schema 后，Phase 4 还要清 runtime |

## 字段与选择控件

| Component | 当前公开 props | 历史包装 props | hiddenProps | runtime bridge | render kind | 阶段含义 |
|---|---|---|---|---|---|---|
| `input` | `label`, `value`, `description` | 无 | `defaultValue`, `placeholder`, `type` | `value -> defaultValue` | `text-field` | 公开 `value` 实际代表初始值，Phase 2 需要把“语义字段”和原厂受控值语义分开描述 |
| `textarea` | `label`, `value`, `description` | 无 | `defaultValue`, `placeholder` | `value -> defaultValue` | `text-field` | 与 `input` 同类 |
| `checkbox` | `label`, `checked`, `description` | 无 | `defaultChecked` | `checked -> defaultChecked` | `toggle-field` | 公开 `checked` 是语义字段，不等于原厂受控 `checked` |
| `switch` | `label`, `checked`, `description` | 无 | `defaultChecked` | `checked -> defaultChecked` | `toggle-field` | 与 `checkbox` 同类 |
| `slider` | `label`, `value`, `description` | 无 | `defaultValue`, `max`, `min`, `step` | `value -> defaultValue`（number-array），同时有 `visualStateProp: "value"` | `slider-field` | 公开 `value` 同时参与初始值和视觉状态，是后续 contract 收口时的重点样本 |
| `radio-group` | `label`, `value`, `description` | 无 | `defaultValue` | `value -> defaultValue` | `choice-group` | 语义 `value` 当前主要表示初始选中项 |
| `toggle-group` | `label`, `value`, `description` | 无 | `defaultValue`, `type`, `variant`, `size`, `spacing` | `value -> defaultValue`，并强制 `type: "single"` | `choice-inline` | 当前把多个原厂实现参数收在内部，适合作为 exposure-state 边界样本 |
| `select` | `label`, `value`, `description` | 无 | `defaultValue`, `open`, `dir`, `name`, `disabled`, `required` | `value -> defaultValue`，并带 noscript fallback | `select-overlay` | overlay 已隐藏大量运行时控制面，但公开 `value` 仍走旧“初始值”路径 |
| `combobox` | `label`, `value`, `description` | 无 | `defaultValue`, `disabled`, `list`, `placeholder`, `required` | `node.props.value` 直接参与默认选项匹配；fallback 也读当前 `value` | `combobox-input` | 不是通过 `propMappings`，而是 renderer 直接解释公开 `value`；重构时要单独处理 |

## 结构子节点

| Component | 当前公开 props | 历史包装 props | hiddenProps | runtime bridge | render kind | 阶段含义 |
|---|---|---|---|---|---|---|
| `option` | `value`, `label` | 无 | 无 | 供 `radio-group` / `toggle-group` / `select` / `combobox` slots 消费 | `structural` | 结构节点，主要风险在 parent contract 而不是自身 props |
| `row` | `kind` | `kind` | 无 | `kindProp: "kind"` 决定进入 header 还是 body | `structural` | 是结构节点也带旧包装字段，说明“结构 child”也受旧 contract 影响 |
| `cell` | 无 | 无 | 无 | 由 `row`/`table` 结构消费 | `structural` | 低风险 |
| `item` | 无 | 无 | 无 | 由 `list` 的 `itemSlot` 消费 | `structural` | 低风险 |
| `tab` | `value`, `label` | 无 | `value` | 由 `tabs` 的 `itemValueProp` / `itemHeadingProp` 消费 | `structural` | 子节点 `value` 是必须保留的稳定结构标识，不应和 `tabs.default` 混为一类 |
| `accordion-item` | `value`, `title` | 无 | `value` | 由 `accordion` 的 `itemValueProp` / `itemHeadingProp` 消费 | `structural` | 子节点结构稳定，父节点 `mode/default` 才是旧包装债务核心 |

## 当前模式汇总

从组件级事实看，当前系统有四种并行模式：

- 纯内容字段：
  - `page.title`
  - `card.title`
  - `option.label`
- 语义字段映射到原厂初始值：
  - `input.value -> defaultValue`
  - `checkbox.checked -> defaultChecked`
  - `select.value -> defaultValue`
- 历史包装字段映射到底层实现：
  - `alert.tone -> variant`
  - `badge.tone -> variant`
  - `row.kind -> header/body`
  - `tabs.default -> defaultValue`
  - `accordion.mode/default -> type/defaultValue`
- 结构节点 props：
  - `tab.value`
  - `accordion-item.value`
  - `option.value`

这也是为什么 Phase 2 不能只做“blocked/raw-candidate 接线”：

- 先要把内容字段、结构字段、历史包装字段、原厂 prop 暴露规则分开。

## 对下一步工作的直接帮助

这份矩阵可以直接支撑：

- Phase 1
  - 组件级 public contract 事实表
  - 旧字段位置盘点
- Phase 2
  - 首批试点组件选择
  - 哪些字段可以直接迁到 exposure-state
  - 哪些字段需要保留短期兼容桥
- Phase 4
  - 哪些 runtime kind 仍然直接解释旧字段
