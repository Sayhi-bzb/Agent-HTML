# Current Contract Component Matrix

本文把当前 contract 审计继续细化到组件级别。

它只描述当前工作树事实，不提前替未来重构做决定。所有字段都来自当前代码：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/public-agent-contract.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`

## 读法

- `完整 authoring schema`：当前 parse / validate / sanitize 会接受的字段。
- `最终公开 contract`：当前 CLI schema / prompt 会公开给 agent 的字段。
- `legacy/compat bridge`：历史 compat 桥在当前代码里的现状；这份表当前应全部为 `无`。
- `runtime bridge`：runtime 当前如何消费字段，或如何把当前字段映射到底层实现。
- `当前判断`：对当前实现状态的直接影响，不是新规则。

## 文档与内容容器

| Component | 完整 authoring schema | 最终公开 contract | 历史 compat 状态 | runtime bridge | render kind | 当前判断 |
| --- | --- | --- | --- | --- | --- | --- |
| `page` | `title` | `title` | 无 | `titleProp: "title"`，root 为 `article` | `compound` | 唯一根节点仍是强约束 |
| `alert` | `title`, `variant` | `title`, `variant` | 无 | `variant` 直通 | `compound` | compat `tone` 已移除 |
| `card` | `title` | `title` | 无 | `titleProp: "title"`，`CardHeader/CardContent` 由 renderer 固定拼装 | `compound` | `size` 当前仍停留在 overlay `hiddenProps`，没有进入 raw-candidate 链 |
| `separator` | 无 | 无 | 无 | 直接映射到 `Separator` | `primitive` | 低风险基线组件 |
| `badge` | `variant` | `variant` | 无 | `variant` 直通 | `primitive` | compat `tone` 已移除 |
| `progress` | `value` | `value` | 无 | `value -> value`，并带 `determinate-progress` 行为模型 | `primitive` | 语义值直接进入 runtime 的对照组 |
| `table` | 无 | 无 | 无 | 结构由 `row` / `cell` children 决定；多行时首行固定为 header | `table` | table 自身无 props，风险集中在固定结构规则 |
| `list` | `variant` | `variant` | 无 | `variant` 决定根标签 `ol/ul`，默认 `ul` | `collection` | 这是当前保留的公开特例，不构成任意开放原厂 `variant` 的先例 |
| `tabs` | 无 | 无 | 无 | 默认选中项固定来自第一个 `tab` | `tabs` | compat `default` 已移除 |
| `accordion` | 无 | 无 | 无 | 固定 `type="multiple"` | `accordion` | compat `mode/default` 已移除 |

## 字段与选择控件

| Component | 完整 authoring schema | 最终公开 contract | 历史 compat 状态 | runtime bridge | render kind | 当前判断 |
| --- | --- | --- | --- | --- | --- | --- |
| `input` | `label`, `value`, `description` | `label`, `value`, `description` | 无 | `value -> defaultValue` | `text-field` | `value` 仍是语义字段，不等于原厂受控值 |
| `textarea` | `label`, `value`, `description` | `label`, `value`, `description` | 无 | `value -> defaultValue` | `text-field` | 与 `input` 同类 |
| `checkbox` | `label`, `checked`, `description` | `label`, `checked`, `description` | 无 | `checked -> defaultChecked` | `toggle-field` | 语义 `checked` 与原厂受控 `checked` 已分离 |
| `switch` | `label`, `checked`, `description` | `label`, `checked`, `description` | 无 | `checked -> defaultChecked` | `toggle-field` | 与 `checkbox` 同类 |
| `slider` | `label`, `value`, `description` | `label`, `value`, `description` | 无 | `value -> defaultValue`，同时有 `visualStateProp: "value"` | `slider-field` | 语义值同时参与初始值和视觉状态 |
| `radio-group` | `label`, `value`, `description` | `label`, `value`, `description` | 无 | `value -> defaultValue` | `choice-group` | 当前语义 `value` 主要表示初始选中项 |
| `toggle-group` | `label`, `value`, `description` | `label`, `value`, `description` | 无 | `value -> defaultValue`，并强制 `type: "single"` | `choice-inline` | 多个原厂实现参数仍收在内部 |
| `select` | `label`, `value`, `description` | `label`, `value`, `description` | 无 | `value -> defaultValue`，并带 noscript fallback | `select-overlay` | 大量运行时控制面仍保持隐藏 |
| `combobox` | `label`, `value`, `description` | `label`, `value`, `description` | 无 | renderer 直接解释公开 `value` 做默认选项匹配 | `combobox-input` | 不是 `propMappings`，而是 renderer 直接解释语义值 |

## 结构子节点

| Component | 完整 authoring schema | 最终公开 contract | 历史 compat 状态 | runtime bridge | render kind | 当前判断 |
| --- | --- | --- | --- | --- | --- | --- |
| `option` | `value`, `label` | `value`, `label` | 无 | 供 `radio-group` / `toggle-group` / `select` / `combobox` slots 消费 | `structural` | 结构节点，风险主要在 parent contract |
| `row` | 无 | 无 | 无 | 由 `table` 结构消费 | `structural` | 不再携带结构角色字段 |
| `cell` | 无 | 无 | 无 | 由 `row` / `table` 结构消费 | `structural` | 低风险 |
| `item` | 无 | 无 | 无 | 由 `list` 的 `itemSlot` 消费 | `structural` | 低风险 |
| `tab` | `value`, `label` | `value`, `label` | 无 | 由 `tabs` 的 `itemValueProp` / `itemHeadingProp` 消费 | `structural` | `value` 是稳定结构标识 |
| `accordion-item` | `value`, `title` | `value`, `title` | 无 | 由 `accordion` 的 `itemValueProp` / `itemHeadingProp` 消费 | `structural` | 子节点结构稳定 |

## layout primitive

| Component | 完整 authoring schema | 最终公开 contract | 历史 compat 状态 | runtime bridge | render kind | 当前判断 |
| --- | --- | --- | --- | --- | --- | --- |
| `stack` | 无 | 无 | 无 | layout projection | `layout-stack` | 已进入正式 surface |
| `cluster` | 无 | 无 | 无 | layout projection | `layout-cluster` | 已进入正式 surface |
| `split` | 无 | 无 | 无 | layout projection | `layout-split` | 当前仍保持零 props |
| `grid` | 无 | 无 | 无 | layout projection | `layout-grid` | 当前仍保持零 props |
| `switcher` | 无 | 无 | 无 | layout projection | `layout-switcher` | 当前仍保持零 props |
| `frame` | 无 | 无 | 无 | layout projection | `layout-frame` | 当前仍保持零 props |

## 当前模式汇总

从当前代码看，系统当前保留三种不同模式：

- 最终公开 contract 字段：
  - `alert.variant`
  - `badge.variant`
  - `title`
  - `label`
  - 语义 `value`
  - 语义 `checked`
- 结构节点 props：
  - `tab.value`
  - `accordion-item.value`
  - `option.value`
- 固定 renderer 规则：
  - `table` 首行 header
  - `tabs` 默认首项
  - `accordion` 固定 `multiple`

这也是为什么当前更准确的总判断是：

- 旧字段已经退出当前 schema、runtime 与 renderer
- 当前风险点已经转成固定行为规则是否稳定

## 当前使用价值

这份矩阵可以直接支撑：

- 当前 contract 核对
  - 哪些东西已经退出当前 schema
  - 哪些行为已经固定化
- 当前 docs 审计
  - 哪些文档若还说“当前公开 props = tone/default/kind/mode”，就是过期事实
- 当前 compat 清理核对
  - 可以直接确认 compat bridge 已经退出当前代码
