# Reading Map

本文只回答两个问题：

- 现在先看哪几篇
- 哪些资料已经不该再当作当前主入口

## 现在的四层

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
- `docs/phase-5-completion-proof.md`

回答的问题：

- 已完成的阶段现在怎么验收描述
- `Phase 5` 为什么已经可以正式视为完成
- 还剩哪些 post-phase cleanup 欠账

### 4. 历史层

只在需要追溯时看：

- `docs/history.md`

回答的问题：

- 当时为什么按 `Phase 2-5` 拆
- 某个切片卡或 issue 草稿当时怎么写
- 某条兼容桥最初是怎么迁移设计的

## 最短路径

### 路径 A：要判断现在项目到哪了

1. `docs/reading-map.md`
2. `docs/roadmap.md`
3. `docs/todo.md`
4. `docs/phase-5-completion-proof.md`
5. `docs/details/current-contract-audit.md`
6. `docs/details/high-risk-runtime-bridges.md`

### 路径 B：要改实现但不想背迁移文档

1. `docs/architecture/architecture.md`
2. `docs/architecture/schema.md`
3. `docs/details/current-contract-audit.md`
4. `docs/details/current-contract-component-matrix.md`
5. `docs/roadmap.md`

### 路径 C：要追溯历史决策

1. `docs/history.md`
2. 对应 `phase-*` implementation draft
3. 对应 `slice-*` execution card 或 issue draft

## 不再作为主入口的资料

以下资料仍可追溯，但不再是默认阅读路径：

- `phase-*-implementation-draft.md`
- `implementation-slices.md`
- `execution-checklist.md`
- `phase-completion-criteria.md`
- `slice-*-execution-card.md`
- `slice-*-issue-draft.md`
- `coverage-audit.md`
- `tabs/accordion/table migration card`

如果只是判断当前现实或剩余收尾，不要先读这些。
