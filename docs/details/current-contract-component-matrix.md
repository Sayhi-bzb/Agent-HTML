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
- `legacy/compat bridge`：当前仍保留、但已经不是主公开入口的旧语义字段或 runtime 兼容桥。
- `runtime bridge`：runtime 当前如何消费字段，或如何把当前字段映射到底层实现。
- `阶段含义`：对当前收口工作的直接影响，不是新规则。

## 文档与内容容器

| Component | 完整 authoring schema | 最终公开 contract | legacy/compat bridge | runtime bridge | render kind | 阶段含义 |
|---|---|---|---|---|---|---|
| `page` | `title` | `title` | 无 | `titleProp: "title"`，root 为 `article` | `compound` | 唯一根节点仍是强约束 |
| `alert` | `title`, `tone`, `variant` | `title`, `variant` | `tone` 仍保留在 semantic compatibility layer | `legacyBridges.variant` + `variant` 直通 | `compound` | `tone` 已退出公开主路径，但兼容桥仍在 |
| `card` | `title` | `title` | 无 | `titleProp: "title"`，`CardHeader/CardContent` 由 renderer 固定拼装 | `compound` | `size` 仍保持隐藏 raw candidate |
| `separator` | 无 | 无 | 无 | 直接映射到 `Separator` | `primitive` | 低风险基线组件 |
| `badge` | `tone`, `variant` | `variant` | `tone` 仍保留在 semantic compatibility layer | `legacyBridges.variant` + `variant` 直通 | `primitive` | 与 `alert` 相同，是 variant 试点 + legacy compat 样本 |
| `progress` | `value` | `value` | 无 | `value -> value`，并带 `determinate-progress` 行为模型 | `primitive` | 语义值直接进入 runtime 的对照组 |
| `table` | 无 | 无 | `row.kind` 仍存在于完整 schema，但不在公开 contract | 结构由 `row` / `cell` children 决定；table 自身通过 `legacyBridges.structuralRole` 兼容旧结构角色 | `table` | table 自身无 props，风险集中在结构 child |
| `list` | `variant` | `variant` | 无 | `variant` 决定根标签 `ol/ul`，默认 `ul` | `collection` | 这是历史公开例外，不构成任意开放原厂 `variant` 的先例 |
| `tabs` | `default` | 无 | `default` 仍保留在完整 schema compatibility layer | `legacyBridges.state` 决定默认选中项 | `tabs` | 公开主路径已收口，但默认状态 compat 仍在 runtime |
| `accordion` | `mode`, `default` | 无 | `mode/default` 仍保留在完整 schema compatibility layer | `legacyBridges.state` + `behavior.stateBridge` | `accordion` | runtime compat 最深的状态桥样本 |

## 字段与选择控件

| Component | 完整 authoring schema | 最终公开 contract | legacy/compat bridge | runtime bridge | render kind | 阶段含义 |
|---|---|---|---|---|---|---|
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

| Component | 完整 authoring schema | 最终公开 contract | legacy/compat bridge | runtime bridge | render kind | 阶段含义 |
|---|---|---|---|---|---|---|
| `option` | `value`, `label` | `value`, `label` | 无 | 供 `radio-group` / `toggle-group` / `select` / `combobox` slots 消费 | `structural` | 结构节点，风险主要在 parent contract |
| `row` | `kind` | 无 | `kind` 仍保留在完整 schema compatibility layer | `table` 通过 `legacyBridges.structuralRole` 解释其结构角色 | `structural` | 结构节点也受 legacy compat 影响 |
| `cell` | 无 | 无 | 无 | 由 `row` / `table` 结构消费 | `structural` | 低风险 |
| `item` | 无 | 无 | 无 | 由 `list` 的 `itemSlot` 消费 | `structural` | 低风险 |
| `tab` | `value`, `label` | `value`, `label` | 无 | 由 `tabs` 的 `itemValueProp` / `itemHeadingProp` 消费 | `structural` | `value` 是稳定结构标识，不等于 `tabs.default` 那类旧状态桥 |
| `accordion-item` | `value`, `title` | `value`, `title` | 无 | 由 `accordion` 的 `itemValueProp` / `itemHeadingProp` 消费 | `structural` | 子节点结构稳定，风险集中在父节点旧状态模型 |

## layout primitive

| Component | 完整 authoring schema | 最终公开 contract | legacy/compat bridge | runtime bridge | render kind | 阶段含义 |
|---|---|---|---|---|---|---|
| `stack` | 无 | 无 | 无 | layout projection | `layout-stack` | 已进入正式 surface |
| `cluster` | 无 | 无 | 无 | layout projection | `layout-cluster` | 已进入正式 surface |
| `split` | 无 | 无 | 无 | layout projection | `layout-split` | 当前仍保持零 props |
| `grid` | 无 | 无 | 无 | layout projection | `layout-grid` | 当前仍保持零 props |
| `switcher` | 无 | 无 | 无 | layout projection | `layout-switcher` | 当前仍保持零 props |
| `frame` | 无 | 无 | 无 | layout projection | `layout-frame` | 当前仍保持零 props |

## 当前模式汇总

从当前代码看，系统同时保留四种不同模式：

- 最终公开 contract 字段：
  - `alert.variant`
  - `badge.variant`
  - `title`
  - `label`
  - 语义 `value`
  - 语义 `checked`
- 完整 authoring schema 中仍保留的 compatibility semantic fields：
  - `alert.tone`
  - `badge.tone`
  - `row.kind`
  - `tabs.default`
  - `accordion.mode/default`
- runtime compatibility bridge：
  - `legacyBridges.variant`
  - `legacyBridges.state`
  - `legacyBridges.structuralRole`
  - `behavior.stateBridge`
- 结构节点 props：
  - `tab.value`
  - `accordion-item.value`
  - `option.value`

这也是为什么当前更准确的总判断不是“旧字段已经完全不存在”，而是：

- 旧字段已经退出主公开 contract / prompt
- 但仍作为显式 compatibility semantic layer + runtime bridge 保留

## 对下一步工作的直接帮助

这份矩阵可以直接支撑：

- `Phase 5` 总验收
  - 哪些东西已经退出主公开 contract
  - 哪些东西只是退到 compatibility layer
- 后续 docs 审计
  - 哪些文档若还说“当前公开 props = tone/default/kind/mode”，就是过期事实
- 后续真正的 compat 清理
  - 如果未来要继续压缩 compatibility layer，这份矩阵能直接指出剩余桥接点
