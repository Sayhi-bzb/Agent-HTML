# Agent HTML Syntax

## 目标

本文描述的是 agent-html authoring surface 的当前稳定边界。

如果要核对 parser / validator / sanitize / runtime 的现实支持面，请优先看：

- `docs/details/current-contract-audit.md`
- `docs/details/current-contract-component-matrix.md`
- `docs/roadmap.md`

## 当前 authoring surface

当前 authoring surface 由三层组成：

1. 头部配置
   - 当前规范写法仍是 `<meta-agent style-ref="..." />`
   - `style-ref` 在 parse / runtime 层允许 fallback，并会产出显式 warning；但在当前 CLI prompt 主路径里仍是规范入口
2. 正式语义节点
   - UI 节点
   - layout 节点

## UI 与 Layout

当前语法层已经正式承载两类语义积木：

- UI 节点
  - 表达“这是什么东西”
- layout 节点
  - 表达“这些东西怎么排”

这意味着 authoring surface 当前允许：

- UI 嵌套 UI
- layout 嵌套 UI
- layout 嵌套 layout

页面的节点结构不再依赖 runtime host 反推；但最终 artifact 仍会叠加 document shell 的全局文档排版默认值。

## 公开 prompt 与完整 authoring 的区别

当前最容易混淆的不是 grammar，而是两层输入面：

- `最终公开 prompt`
  - 只公开最终 public contract
  - 不再主动推荐 `tone`、`kind`、`mode`、`default`
- `完整 authoring surface`
  - 当前与最终公开 prompt 在组件 props 上已经一致

因此现在更准确的说法是：

- “旧字段仍是主写法”已经不是当前事实
- “旧字段仍可被接受”也已经不是当前实现事实

## 结构子节点

当前结构子节点仍然是正式 vocabulary 的一部分：

- `option`
- `row`
- `cell`
- `item`
- `tab`
- `accordion-item`

这些节点的风险主要来自父节点 contract 和 runtime bridge，而不是它们自己是不是正式语法成员。

## Props 边界

语法层继续遵守当前 contract：

- UI 原厂 props 由 `blocked` / `raw-candidate` 机制控制是否公开
- layout 节点当前保持零 props 主路径
- layout 若未来补少量结构 props，也只应表达结构关系，不应暴露数值实现参数

## 与配置层的关系

- 头部配置负责 style / document config 选择
- 语义节点负责页面与组件关系
- runtime host 消费语义节点和配置结果
- 当前稳定配置结果仍主要承载 `style-ref -> styleProfile`
- host 不再替 authoring surface 补 layout primitive 节点，但当前仍会通过 document layout policy 追加文档型 framing / prose 默认值
