# Schema Prop Exposure Plan

## 背景

当前项目同时存在两层 prop 语义：

- 原厂层：shadcn / Radix / React 组件本来就有的 prop
- 对外层：我们手工包装后暴露给 agent 的 public 字段

过去主要依赖 hand-written overlay、隐藏字段和少量白名单来控制 agent 能看到什么。
这套方式的问题是：

- prop 是否能暴露给 agent，缺少统一、可计算的状态模型
- schema、prompt、renderer 的暴露规则容易分叉
- 下一位 agent 很难判断某个 prop 是“永远不能公开”，还是“只是这次被手工藏起来”

这份文档的目标不是继续扩充语义包装词，而是把 prop 暴露规则收敛成一个明确机制。

## 目标

给每个原厂 prop 一个状态，并让这个状态一路接到：

- schema 生成
- agent prompt 输出

结果应该是：

- `blocked` 的 prop 永远不进入 agent-facing schema，也不进入 prompt
- `raw-candidate` 的 prop 先进入“可配置候选池”，再由 style-ref / 组件映射配置决定是否真正公开
- agent 最终只会看到当前配置明确放开的 prop，而不是看到全部原厂 prop

这意味着未来不再依赖“手写公开白名单”作为主机制，而是依赖 prop 状态 + 配置决策。

## 状态模型

每个原厂 prop 需要先被标记一个内部状态：

- `blocked`
  - 含义：永远不能进入公开 schema，也不能进入 prompt
  - 适用：样式逃逸、结构逃逸、事件接线、运行时状态接线、DOM/form 接线、强行为语义 prop

- `raw-candidate`
  - 含义：允许进入公开候选池，但是否真正暴露，取决于 style-ref / 组件映射配置
  - 适用：纯视觉 recipe 轴，和少量轻度布局轴

当前保守结论：

- 稳定的 `raw-candidate` 主样本：`variant`、`size`
- 观察候选：`align`、`orientation`
- 其余 prop 默认不进入公开候选池

## 数据流

prop 状态需要接到 agent prompt schema，链路如下：

1. 组件原厂 facts 提供 prop 名、类型和组件归属
2. 每个原厂 prop 被标记为 `blocked` 或 `raw-candidate`
3. schema 生成阶段：
   - `blocked` prop 不进入公开组件 contract
   - `raw-candidate` prop 再看 style-ref / 组件映射配置是否锁住
4. prompt 输出阶段：
   - 只有最终进入公开 schema 的 prop，才出现在 agent prompt 中
   - 被锁住的 prop 不出现在 prompt 中，组件按默认实现值渲染

例子：

- `badge.variant`
  - 如果它是 `raw-candidate`，并且当前 style-ref 没锁住它，那么 schema 和 prompt 都会出现 `variant`
  - 如果当前 style-ref 锁住它，那么 schema 和 prompt 都不会出现 `variant`，agent 使用 badge 时直接落默认样式

## 两张表的角色

下面两张表解决的是两个不同问题，不能混读：

- 原厂 prop 状态表：定义未来原厂 prop 的暴露机制
- 现有公开字段去留表：定义当前历史对外字段的迁移方向

### 原厂 prop 状态表

| 参数名 | 是什么东西 | 状态 | 备注 |
|---|---|---|---|
| align | addon/内容贴左贴右、贴上贴下之类对齐方式 | raw-candidate | 轻度布局轴，但默认仍建议锁住 |
| asChild | 换掉组件根节点实现 | blocked | 结构逃逸口 |
| checked | 受控勾选状态 | blocked | 指原厂受控 prop，不是对外语义字段 |
| class | 直接塞 HTML class | blocked | 样式逃逸口 |
| className | 直接塞 CSS class | blocked | 样式逃逸口 |
| collapsible | 可不可以折叠、怎么折叠 | blocked | 已经进入行为模型，不应按视觉轴开放 |
| css | 直接注入样式 | blocked | 样式逃逸口 |
| dangerouslySetInnerHTML | 直接插原始 HTML | blocked | 结构/安全逃逸口 |
| defaultChecked | 初始勾选状态 | blocked | 原厂非受控状态接线 |
| defaultValue | 初始值，只在第一次渲染时生效 | blocked | 原厂非受控状态接线 |
| dir | 文字方向，LTR / RTL | blocked | DOM/运行时接线 |
| disabled | 是否禁用 | blocked | 运行时约束接线 |
| indicator | 图表/提示指示器样式，比如 dot / line | blocked | 不只是通用视觉轴，组件私有语义过强 |
| list | 选项源/集合绑定这类内部接线参数 | blocked | 数据/结构接线 |
| max | 最大值 | blocked | 改的是值域语义，不只是视觉选择 |
| min | 最小值 | blocked | 改的是值域语义，不只是视觉选择 |
| name | 原生表单字段名 | blocked | DOM/form 接线 |
| onClick | 直接绑点击事件 | blocked | 事件/行为接线 |
| onclick | HTML 事件属性版本 | blocked | 事件/行为接线 |
| open | 浮层是否打开，比如 dialog / popover / select | blocked | 运行时交互控制面 |
| orientation | 横向还是纵向排列 | raw-candidate | 轻度布局轴，但默认仍建议锁住 |
| placeholder | 输入框里没填值时的提示字 | blocked | 实现细节/交互文案接线 |
| required | 是否必填 | blocked | 运行时约束接线 |
| script | 直接注入脚本 | blocked | 安全/行为逃逸口 |
| side | 从哪一边出来，比如 left/right/top/bottom | blocked | 对 overlay/容器来说更像空间与行为策略，不宜通开 |
| size | 组件自己的尺寸档位，比如 sm / lg / icon | raw-candidate | 典型视觉 recipe 轴 |
| spacing | 某些组件内部的间距实现参数 | blocked | 应由 layout/style 配置层控制 |
| step | 每次增减的步长 | blocked | 改的是数值语义，不只是视觉选择 |
| style | 直接写内联样式 | blocked | 样式逃逸口 |
| type | 组件行为模式，比如 input 类型、accordion single/multiple | blocked | 行为模型，不应直接开放 |
| value | 受控值，组件当前值 | blocked | 指原厂受控 prop，不是对外语义字段 |
| variant | 组件自己的视觉款式开关，比如 default / destructive / outline | raw-candidate | 典型视觉 recipe 轴 |

### 现有公开字段去留表

| 参数名 | 是什么东西 | 处理 | 备注 |
|---|---|---|---|
| title | 标题、块头、章节名 | 保留 | 内容字段，不是原厂实现 prop |
| tone | 语义语气，比如中性、警告、危险 | 清理 | 属于旧语义包装，升级后可退场 |
| label | 给控件看的名字 | 保留 | 内容字段，不是原厂实现 prop |
| value | 这个组件表达的值 | 保留 | 这里是语义字段，不等于原厂受控 `value` |
| description | 补充说明、小字说明 | 保留 | 内容字段，不是原厂实现 prop |
| checked | 是否勾选/开启 | 保留 | 这里是语义字段，不等于原厂受控 `checked` |
| default | 初始打开/初始选中的项 | 清理 | 属于旧语义包装，原本用于包裹 `defaultValue` |
| mode | 行为模式 | 清理 | 属于旧语义包装 |
| kind | 结构角色 | 清理 | 属于旧语义包装 |
| variant | 这里只有一个公开例外：列表类型 | 待定 | 这是历史例外，不应自动类推到 shadcn `variant` 全面开放 |

## 当前迁移结论

- 原厂 `value` / `checked` 继续 blocked
- 语义层 `value` / `checked` 作为内容字段暂时保留
- `tone`、`default`、`mode`、`kind` 从主公开 contract 中退出
- `list.variant` 继续视为历史例外，不构成开放原厂 `variant` 的先例

## 实现验收口径

后续实现完成后，至少应满足以下规则：

- `blocked` prop 不出现在 CLI schema 输出中
- `blocked` prop 不出现在 agent prompt 中
- `raw-candidate` prop 若被 style-ref 锁住，不出现在公开 schema 和 prompt 中
- `raw-candidate` prop 若未被 style-ref 锁住，则进入公开 schema，并在 prompt 中可见
- `className`、`style`、`asChild`、`open`、原厂 `value` / `checked` / `defaultValue` / `defaultChecked` 必须始终不可见
- 被清理的旧语义字段不再作为主公开 contract 的新增方向
