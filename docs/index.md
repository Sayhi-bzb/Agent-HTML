# Docs Index

`docs/` 现在只保留当前事实，不再保留旧实施草稿、切片卡、完成证明或历史导航。

它只承担三件事：

- 解释当前稳定架构边界
- 记录当前工作树的真实实现状态
- 跟踪仍未收口的验证、兼容桥和文档欠账

顶层架构事实仍以 `blueprint/` 为准。  
如果只想找到最短阅读路径，先看 [reading-map.md](./reading-map.md)。

## 当前主入口

- `reading-map.md`
  - 压缩导航，告诉你现在先读哪几篇。
- `roadmap.md`
  - 当前实现状态、已完成验收结论、剩余收尾方向。
- `todo.md`
  - 当前仍未完成的收尾项，不再回放已完成阶段的实施清单。
- `details/current-contract-audit.md`
  - 当前 contract、schema、runtime 主链的现实基线。
- `details/high-risk-runtime-bridges.md`
  - 当前仍需重点关注的兼容桥和 heavy gate 风险点。

## 稳定解释文档

- `architecture/architecture.md`
  - 系统分层与职责边界。
- `architecture/schema.md`
  - prop exposure 机制与当前公开面边界。
- `layout.md`
  - layout primitive 的稳定语义边界。
- `syntax.md`
  - agent-html 语义 authoring surface 的当前方向。

## 现实资料

- `details/current-contract-component-matrix.md`
  - 逐组件查看公开 props、兼容字段和 runtime bridge。
- `components.md`
  - 组件事实盘点，不等于公开 schema。
- `details/component-details.md`
  - 更细的底层实现事实与风险点。

## 清理原则

- 已完成的旧阶段文档、切片卡和历史实施稿已经从仓库移除，不再在 `docs/` 中堆积。
- `docs/` 只记录当前代码事实、当前验证口径和仍未完成的收尾项。
- 如果未来需要新的实施计划，应新写针对当下问题的文档，而不是恢复旧实施稿。

## 阅读边界

- `roadmap.md` 和 `todo.md` 现在描述的是“当前还差什么”，不是完整历史剧本。
- `details/*` 记录现实，不负责定义目标架构。
- `architecture/*`、`layout.md`、`syntax.md` 解释稳定边界，不负责回放每个阶段怎么落地。
