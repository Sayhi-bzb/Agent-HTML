# Docs

`docs/` 只保留当前事实。

它只承担三件事：

- 解释当前稳定架构边界
- 记录当前工作树的真实实现状态
- 记录当前验证口径和仍需重点关注的行为边界

`blueprint/` 记录目标架构设计；`docs/` 记录当前工作树事实。  

## 现在先看什么

### 1. 架构层

先看：

- `architecture/architecture.md`
- `architecture/schema.md`
- `layout.md`
- `syntax.md`

回答的问题：

- 配置层、语义层、renderer、runtime host 现在按什么边界解释
- 哪些公开能力是稳定的
- 哪些实现参数仍留在配置层或内部层

### 2. 现实层

先看：

- `details/current-contract-audit.md`
  - 当前 contract、schema、runtime 主链的现实基线。
- `details/current-contract-component-matrix.md`
  - 逐组件查看公开 props、固定行为和 runtime 投影。
- `details/high-risk-runtime-bridges.md`
  - 当前仍需重点关注的固定行为边界和 heavy gate 风险点。

回答的问题：

- 当前 public contract 真正从哪里生成
- 哪些旧兼容桥已经退出
- 哪些 heavy gate 仍在保护现行行为边界

### 3. 状态层

先看：

- `roadmap.md`
  - 当前能力状态、验证基线和仍需关注的风险。
- `todo.md`
  - 当前未完成事项。
- `spec/todo.md`
  - compat 专项清理的收尾顺序与核对项。

回答的问题：

- 当前能力状态是什么
- 当前还有没有未完成事项
- compat 清理已经做到哪一步、还剩哪些收尾项

## 最短路径

### 路径 A：要判断现在项目到哪了

1. `docs/index.md`
2. `docs/roadmap.md`
3. `docs/todo.md`
4. `docs/spec/todo.md`
5. `docs/details/current-contract-audit.md`
6. `docs/details/high-risk-runtime-bridges.md`

### 路径 B：要改实现但不想读背景说明

1. `docs/architecture/architecture.md`
2. `docs/architecture/schema.md`
3. `docs/details/current-contract-audit.md`
4. `docs/details/current-contract-component-matrix.md`
5. `docs/roadmap.md`

### 路径 C：只想看当前高风险行为边界

1. `docs/details/high-risk-runtime-bridges.md`
2. `docs/details/current-contract-component-matrix.md`
3. `docs/details/component-details.md`

## 现实资料

- `components.md`
  - 组件事实盘点，不等于公开 schema。
- `details/component-details.md`
  - 更细的底层实现事实与风险点。

## `details/*` 是什么

- `current-*`
  - 当前状态基线文档，回答“现在是什么”。
  - `current-contract-audit.md` 看主链事实。
  - `current-contract-component-matrix.md` 看组件级事实。
- `high-*`
  - 当前高风险专题文档，回答“现在最需要盯什么”。
  - `high-risk-runtime-bridges.md` 专门盯 `tabs` / `accordion` / `table` 的固定 renderer 行为边界。

## 阅读边界

- `roadmap.md` 和 `todo.md` 只描述当前状态与当前事项。
- `spec/todo.md` 只记录 compat 专项清理的收尾顺序与核对项。
- `details/*` 记录现实，不负责定义目标架构。
- `architecture/*`、`layout.md`、`syntax.md` 解释稳定边界，不负责实现过程说明。
