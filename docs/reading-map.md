# Reading Map

本文只回答一个问题：

- 现在先看哪几篇

## 现在的三层

### 1. 架构层

先看：

- `docs/architecture/architecture.md`
- `docs/architecture/schema.md`
- `docs/layout.md`
- `docs/syntax.md`

回答的问题：

- 配置层、语义层、renderer、runtime host 现在按什么边界解释
- 哪些公开能力是稳定的
- 哪些实现参数仍留在配置层或内部层

### 2. 现实层

先看：

- `docs/details/current-contract-audit.md`
- `docs/details/current-contract-component-matrix.md`
- `docs/details/high-risk-runtime-bridges.md`

回答的问题：

- 当前 public contract 真正从哪里生成
- 哪些旧兼容桥还在
- 哪些 heavy gate 仍在保护这些桥

### 3. 收尾层

先看：

- `docs/roadmap.md`
- `docs/todo.md`

回答的问题：

- 已完成的阶段现在怎么验收描述
- 还剩哪些 post-phase cleanup 欠账

## 最短路径

### 路径 A：要判断现在项目到哪了

1. `docs/reading-map.md`
2. `docs/roadmap.md`
3. `docs/todo.md`
4. `docs/details/current-contract-audit.md`
5. `docs/details/high-risk-runtime-bridges.md`

### 路径 B：要改实现但不想背迁移文档

1. `docs/architecture/architecture.md`
2. `docs/architecture/schema.md`
3. `docs/details/current-contract-audit.md`
4. `docs/details/current-contract-component-matrix.md`
5. `docs/roadmap.md`

### 路径 C：只想看 compat 风险

1. `docs/details/high-risk-runtime-bridges.md`
2. `docs/details/current-contract-component-matrix.md`
3. `docs/details/component-details.md`

## 已清理出仓库的资料类型

以下资料已经删除，不再作为默认阅读路径，也不再在 `docs/` 内保留：

- phase 实施稿与设计稿
- slice 执行卡、issue 草稿与配套消费地图
- 覆盖审计、完成证明和迁移 checklist
- `tabs` / `accordion` / `table` 的旧 migration card

如果只是判断当前现实或剩余收尾，不需要再找这些资料。
