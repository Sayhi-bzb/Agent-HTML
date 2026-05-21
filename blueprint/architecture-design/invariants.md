# agent-html Invariants

本文记录 agent-html 的不可破坏系统假设。后续 contract 和 type surface 必须遵守这些约束。

## 1. core engine is framework-independent

ahtml core 不依赖 Vite、React、shadcn、Tailwind、renderer adapter 或 runtime host 构建配置。

这些依赖只能出现在 runtime host 或渲染实现层中。

## 2. UI and layout are parallel semantic primitives

UI 组件表达对象语义，layout 组件表达空间关系。

二者都属于语义使用层。

## 3. shadcn lives in the runtime host

shadcn components、theme、CSS variables 和 Tailwind 配置若被采用，只能属于 runtime host。

ahtml 可以编排 runtime bootstrap，但不把 shadcn 源码或样式作为 core 协议。

## 4. semantic nodes have fixed meaning boundaries

agent-facing 节点必须有固定语义用途和清晰组合边界。

agent 可以填写内容字段和受控公开 props，不可以改内部实现结构。

## 5. prop exposure is policy-driven

原厂 props 必须先经过 exposure policy，才能进入公开 schema。

`blocked` 和 `raw-candidate` 是公开 prop 暴露的内部状态基础。

## 6. configuration layer owns realization

视觉与布局的具体实现属于配置层。

配置层至少包含：

- 全局 style
- 全局 layout
- 组件配置

## 7. layout usage stays structural

layout 使用层只表达关系，不表达数值实现参数。

## 8. implementation props stay internal

Tailwind class、`className`、完整 shadcn/ui props、Radix props 和组件源码结构不作为 agent-facing 主接口。

它们属于组件实现层。

## 9. parse / sanitize gates renderer adapter

agent-html 进入 renderer adapter 前必须经过 parse / sanitize。

renderer adapter 不接收未检查的 agent 输出。

## 10. scripts are disabled by default

agent 输出中的脚本默认不执行。

交互能力应由受控标准组件提供。

## 11. preview is the primary work mode

系统默认首先服务实时 preview 与协作 loop。

系统仍必须支持可分享、可归档的交付产物，但不把静态分享写成唯一默认目标。

## 12. current directory is not the runtime

当前工作目录默认只承载输入和输出。

Vite、React、Tailwind、shadcn、renderer adapter 和 generated runtime files 默认收纳在用户级 runtime root。

## 13. dev preview shares the renderer path

实时 preview 与 build / final artifact 必须共用同一条语义到渲染链路。

不应为 preview 和 build 维护两套语义投影实现。

## 14. renderer uses registered semantic nodes

renderer 只渲染已注册语义节点。

未知标签不得绕过安全边界执行。

## 15. public surface changes are synchronized

公共类型表面变更必须同步 blueprint、schema 和 tests。

## 16. examples must not leak implementation

agent-facing 示例不得泄漏组件内部实现。

示例不应诱导 agent 写 `className`、Tailwind class、完整 shadcn/ui props、Radix props 或内部结构。

## 17. raw escape hatch is explicit

raw escape hatch 必须显式标记，并经过安全边界。

自由 HTML 不应成为默认路径。

## 18. render config only carries controlled configuration

render config 只能承载受控配置结果。

它不得成为 CSS、Tailwind class、shadcn props、script、style 或外部资源的逃逸口。
