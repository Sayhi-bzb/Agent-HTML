# Agent HTML Syntax

## 目标

本文描述的是新的 agent-html syntax 目标 contract，不等于当前 parser / validator / sanitize 已经完整支持这些节点。

当前实现落差、真实入口文件和阶段化接入顺序，应以：

- `docs/architecture/phase-3-implementation-draft.md`
- `docs/architecture/execution-checklist.md`
- `docs/architecture/phase-completion-criteria.md`

为准。

新的 agent-html 语法需要同时承载两类语义积木：

- UI 积木：表达“这是什么东西”
- layout 积木：表达“这些东西怎么排”

这意味着语法层不再只围绕 UI 组件组织，而是直接承载 `SemanticNode`。

## 基本方向

- UI 和 layout 都是正式语义节点
- 它们都应能直接出现在 agent-html authoring surface 中
- 页面结构应由语义节点嵌套表达，而不是由 runtime host 预设结构推断

## UI 与 Layout 的分工

- UI 节点主要表达对象语义，例如 `button`、`card`、`input`
- layout 节点主要表达关系语义，例如 `stack`、`split`、`grid`

因此，新语法要允许：

- UI 节点嵌套 UI 节点
- layout 节点嵌套 UI 节点
- layout 节点嵌套 layout 节点

## Props 边界

语法层继续遵守当前 contract：

- UI 组件的原厂 props 通过 `blocked` / `raw-candidate` 机制决定是否公开
- layout 组件默认少 props，优先靠节点名称表达语义
- layout 若允许少量结构 props，也只表达结构关系，不表达实现层数值参数

## 与配置层的关系

- 配置层决定 style / layout / component config
- 语法层表达语义节点关系
- runtime host 消费语义节点和配置层结果，不预设页面必须服从某个模板结构

## 当前实现方向

- 文档级配置选择入口仍然可写，但它不属于语义节点本体，也不再默认作为 agent prompt 的严格必写项
- layout primitive 的目标方向是作为正式 vocabulary 接入语法层
- 具体 grammar、parser、validate、sanitize 变更应以后续实现为准
