# Docs Index

`docs/` 是当前项目的工程化解释层与人工导航层。它帮助工程师和 agent 快速判断“先看哪篇、每篇解决什么问题”。顶层架构事实以 `blueprint/` 为准，`docs/` 负责把这些事实展开成更便于实现、维护和排查的问题描述。阅读时先看决策，再看资料。

## 推荐阅读顺序

1. [architecture/architecture.md](./architecture/architecture.md)
   项目总分层：配置层、语义使用层、engine、渲染层、runtime host、output、组件事实层。
2. [architecture/schema.md](./architecture/schema.md)
   prop 暴露机制：`blocked` / `raw-candidate`、`ComponentFacts` 到 schema / prompt 的链路、当前公开字段边界。
3. [layout.md](./layout.md)
   layout primitive 语义 contract：最小集合、零 props 边界、少量结构 props、配置层职责。
4. [syntax.md](./syntax.md)
   新的 agent-html syntax 方向：让 UI 和 layout 作为并列语义节点进入 authoring surface。
5. [roadmap.md](./roadmap.md)
   新架构落地节奏：按阶段推进 schema、layout、renderer 和 runtime host 与 `blueprint` 收敛。
6. [todo.md](./todo.md)
   当前阶段性待办与零散实施清单：按 roadmap phase 归档的小项、收尾项和验证补项。
7. [components.md](./components.md)
   组件事实总表：家族、exports、slots、variant props、来源。
8. [details/component-details.md](./details/component-details.md)
   更细的实现资料：host elements、显式 props、risky props、依赖。

## 架构

- [architecture/architecture.md](./architecture/architecture.md)
  决策文档。对 `blueprint` 中的总分层做工程化展开，说明配置层、语义使用层、渲染层和 runtime host 的职责分工。
- [architecture/schema.md](./architecture/schema.md)
  决策文档。说明原厂 prop 如何被标记状态，并如何影响公开 schema、prompt 和组件配置。
- [layout.md](./layout.md)
  决策文档。说明 layout primitive 的最小集合、职责边界，以及哪些结构关系留在使用层、哪些实现参数留在配置层。
- [syntax.md](./syntax.md)
  决策文档。说明新的 agent-html syntax 如何同时容纳 UI 和 layout 语义节点。
- [roadmap.md](./roadmap.md)
  执行决策文档。说明当前新架构如何按阶段落地到 schema、layout、renderer 和 runtime host。

## 执行辅助

- [todo.md](./todo.md)
  执行辅助文档。承载按 roadmap phase 分组的当前待办、零散收尾和验证补项，不负责定义架构结论。

## 组件资料

- [components.md](./components.md)
  资料文档。用于盘点 shadcn 组件家族、exports、slots、variant props 和来源，不等于公开 schema。

## 细节资料

- [details/component-details.md](./details/component-details.md)
  资料文档。用于核对底层实现细节和风险暴露面，比如 `className`、`asChild`、host elements 和依赖。

## 阅读边界

- `architecture/*` 是决策文档，定义项目想怎么做。
- `blueprint/` 是顶层架构事实来源；`docs/` 负责解释和执行组织。
- `architecture/*` 是决策文档，解释项目按什么方式落地 `blueprint`。
- `layout.md` 与 `architecture/*` 一样属于决策文档，定义 layout primitive contract，而不是实现事实表。
- `todo.md` 是执行辅助文档，不是架构决策文档，也不是事实资料文档。
- `components.md` 和 `details/component-details.md` 是事实资料，帮助查清组件源码和能力边界。
- 资料文档不等于 agent-facing contract；公开 schema 和 prompt 规则以架构文档和实现为准。
