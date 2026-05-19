# Docs Index

`docs/` 是当前项目的人工导航层，用来帮助工程师和 agent 快速判断“先看哪篇、每篇解决什么问题”。这里的文档分成两类：架构决策文档，以及组件事实资料文档。阅读时先看架构，再看资料。

## 推荐阅读顺序

1. [architecture/architecture.md](./architecture/architecture.md)
   项目总分层：配置层、语义使用层、engine、渲染层、runtime host、output、组件资料层。
2. [architecture/schema.md](./architecture/schema.md)
   prop 暴露机制：`blocked` / `raw-candidate`、schema 到 prompt 的链路、旧公开字段迁移方向。
3. [components.md](./components.md)
   组件事实总表：家族、exports、slots、variant props、来源。
4. [details/component-details.md](./details/component-details.md)
   更细的实现资料：host elements、显式 props、risky props、依赖。

## 架构

- [architecture/architecture.md](./architecture/architecture.md)
  决策文档。说明项目整体层级结构，以及配置层、语义使用层和运行时层之间的职责分工。
- [architecture/schema.md](./architecture/schema.md)
  决策文档。说明原厂 prop 如何被标记状态，并如何影响公开 schema 和 agent prompt。

## 组件资料

- [components.md](./components.md)
  资料文档。用于盘点 shadcn 组件家族、exports、slots、variant props 和来源，不等于公开 schema。

## 细节资料

- [details/component-details.md](./details/component-details.md)
  资料文档。用于核对底层实现细节和风险暴露面，比如 `className`、`asChild`、host elements 和依赖。

## 阅读边界

- `architecture/*` 是决策文档，定义项目想怎么做。
- `components.md` 和 `details/component-details.md` 是事实资料，帮助查清组件源码和能力边界。
- 资料文档不等于 agent-facing contract；公开 schema 和 prompt 规则以架构文档和实现为准。
