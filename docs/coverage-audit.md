# Coverage Audit

> 历史资料。本文审计的是“迁移执行文档体系是否足够完整”，不再是当前主 docs 入口。
> 当前阅读路径请先看 `docs/index.md`、`docs/reading-map.md`、`docs/roadmap.md`。

本文审计当前这套调研与执行文档，回答的问题不是“下一刀改什么”，而是：

- 这轮目标已经覆盖了哪些要求
- 每个要求现在靠什么证据支撑
- 哪些地方已经足够硬
- 哪些地方仍然只是部分覆盖，或还缺直接证据

这里审计的对象是当前目标：

> 调研项目代码架构，诚实化并具体细化各个阶段的执行方案

这不是代码实现完成审计；它是“调研与执行方案是否已经被写实到足够可用”的审计。

## 审计范围

本审计只针对当前 `docs/` 体系中的这些交付物：

- 目标层
  - `docs/architecture/architecture.md`
  - `docs/architecture/schema.md`
  - `docs/layout.md`
  - `docs/syntax.md`
- 现实层
  - `docs/details/current-contract-audit.md`
  - `docs/details/current-contract-component-matrix.md`
  - `docs/architecture/execution-map.md`
- 开工层
  - `docs/roadmap.md`
  - `docs/architecture/implementation-slices.md`
  - `docs/architecture/execution-checklist.md`
  - `docs/architecture/phase-2-design.md`
  - `docs/architecture/phase-2-implementation-draft.md`
  - `docs/architecture/phase-3-implementation-draft.md`
  - `docs/architecture/phase-4-implementation-draft.md`
  - `docs/architecture/phase-5-implementation-draft.md`
  - `docs/todo.md`
- 完工层
  - `docs/architecture/phase-completion-criteria.md`
- 导航层
  - `docs/reading-map.md`
  - `docs/index.md`

## 审计方法

对每个要求，当前审计只接受以下证据类型：

- 当前工作树中的真实代码入口和测试入口被点名
- 文档已经明确区分目标、现实、开工、完工几类真相来源
- 阶段计划已经落到入口文件、切片边界、最窄 gate、完成证据
- 过度自信或与当前代码不符的表述已经被回收成目标口径或设计假设

下面这些不算完成证据：

- 只有“愿景描述”，没有当前代码证据
- 只有“阶段名”，没有切片、入口文件和停手边界
- 只有“建议测试”，没有当前真实测试文件名
- 只有最终总结，没有中间文档能自证

## 覆盖矩阵

| 要求 | 当前证据 | 结论 | 剩余缺口 |
| --- | --- | --- | --- |
| 调研项目代码架构 | `current-contract-audit.md`、`current-contract-component-matrix.md`、`execution-map.md`、`architecture.md` | 已覆盖 | 仍未把所有组件逐个再扩成更细 execution hotspot 索引，但主链已足够清楚 |
| 诚实化当前状态 | `current-contract-audit.md`、`schema.md`、`syntax.md`、`layout.md`、`phase-2-design.md` 的收紧修正 | 已覆盖 | 仍依赖人工回读，而不是自动 drift check；但对文档目标来说已足够 |
| 细化 Phase 1-5 节奏 | `roadmap.md`、`todo.md` | 已覆盖 | `Phase 1` 主要是审计型完成，已足够；无明显缺口 |
| 把 phase 继续拆成可开工切片 | `implementation-slices.md` | 已覆盖 | 仍未进一步拆到“单 PR 粒度”，但当前 slice 粒度已经能指导开工 |
| 把每刀落到真实文件和最窄 gate | `execution-checklist.md` | 已覆盖 | 某些未来新文件名如 `render-ui-node.tsx` 仍属建议名，不是现有事实 |
| 给 `2A-5C` 每刀补到实例执行卡 | `slice-2a` 到 `slice-5c` 执行卡、`architecture/instance-card-coverage-audit.md` | 已覆盖 | 切片以下的 issue-ready / component-specific 派生资料仍是部分覆盖 |
| 给执行者提供 issue-ready 开工样例 | `slice-2a-issue-draft.md`、`slice-2b-issue-draft.md`、`slice-2c-issue-draft.md`、`slice-3a-issue-draft.md`、`slice-3b-issue-draft.md`、`slice-3c-issue-draft.md`、`slice-4a-issue-draft.md`、`slice-4b-issue-draft.md`、`slice-4c-issue-draft.md`、`slice-5a-issue-draft.md`、`slice-5b-issue-draft.md`、`slice-5c-issue-draft.md`、`slice-execution-template.md` | 已覆盖 | `2A-5C` 当前都已有 issue-ready 样例稿；剩余缺口已下沉到切片以下的更细风险专篇或未来实现期 focused checklist |
| 给执行者提供切片派生资料消费地图 | `slice-artifact-map.md`、`slice-risk-card-map.md`、`docs/index.md` | 已覆盖 | 地图已建立；后续更可能补的是更细风险专篇，而不是再补基础消费地图 |
| 给每个阶段定义完工证据 | `phase-completion-criteria.md` | 已覆盖 | 这是完成判据定义，不是 phase 已完成证明；但满足当前目标 |
| 减少阅读分叉 | `reading-map.md`、`docs/index.md` | 已覆盖 | 仍然保留较多文档篇数，但用途分层已经明确 |
| 对 Phase 2 给出诚实试点范围 | `phase-2-design.md`、`phase-2-implementation-draft.md`、`schema.md` | 已覆盖 | 目前仍是设计与证据层，不是代码已开放这些样本 |
| 对 Phase 3-5 给出真实难点和收口顺序 | `phase-3-implementation-draft.md`、`phase-4-implementation-draft.md`、`phase-5-implementation-draft.md` | 已覆盖 | 没有新增实作证据，这是预期内的范围外事项 |

## 逐项判断

### 1. 项目代码架构是否已经被调研到可用程度

当前判断：`是，基本达到`

理由：

- 已经有一份面向当前工作树的总审计：
  - `docs/details/current-contract-audit.md`
- 已经有一份组件级矩阵：
  - `docs/details/current-contract-component-matrix.md`
- 已经把 authoring -> schema -> runtime 和 parse -> validate -> sanitize 两条主链落到真实文件：
  - `docs/architecture/execution-map.md`

剩余缺口：

- 已经有一批高风险组件专篇：
  - `tabs`
  - `accordion`
  - `table`
- 但还没有把所有高耦合路径都继续下钻成同等粒度的热点卡。
- 对“阶段执行方案细化”这个目标来说，这已经不再是主缺口。

### 2. 文档是否已经把目标和现实分开

当前判断：`是，已明确分层`

理由：

- `reading-map.md` 已明确区分：
  - 目标层
  - 现实层
  - 开工层
  - 完工层
- `schema.md`、`syntax.md`、`layout.md` 已明确标注“目标 contract 不等于当前已实现事实”。
- `current-contract-audit.md` 明确声明自己只记录当前工作树现实，不定义未来架构目标。

剩余缺口：

- 这种分层主要靠文档组织和文字约束，不是自动校验机制。
- 但当前目标是研究与计划，文档分层已经足够满足。

### 3. 各阶段方案是否已经从口号细化到可执行

当前判断：`是，已达到可执行层`

理由：

- `roadmap.md` 已定义 phase 目标、风险、难度、入口和验收口径。
- `implementation-slices.md` 已把 phase 继续拆成 `2A-5C`。
- `execution-checklist.md` 已把每个 slice 压到：
  - 先改哪些文件
  - 必须证明什么
  - 不要混入什么
  - 最窄 gate 是什么

剩余缺口：

- `slice-execution-template.md` 已经提供模板层。
- `2A-5C` 现在都已经有 issue-ready 样例稿。
- 这意味着“执行方案是否已细化到切片级”这件事，当前已经不再是主缺口。
- 剩余问题主要是切片以下的更细派生资料与未来实现期验证，而不是阶段方案还不够具体。

### 4. 各阶段的“完成”是否已经有清晰证据口径

当前判断：`是，已建立最低证据框架`

理由：

- `phase-completion-criteria.md` 已定义：
  - 每个 phase 的完成定义
  - 必须已经为真的条件
  - 最低代码证据
  - 最低测试证据
  - 哪些情况不足以支持完成声明

剩余缺口：

- 还没有把这份判据绑定到实际代码变更记录，因为当前没有实施这些 phases。
- 这不是文档目标缺口，而是实现阶段的未来工作。

### 5. 这套资料是否已经对“诚实化”做了直接修正

当前判断：`是，且这是本轮最明显的增量之一`

理由：

- `card.size` 已从“像事实一样写着”降级回设计假设。
- `list.variant` 被重新标成历史公开正例，而不是第一批新开放 raw-candidate。
- `tone`、`kind`、`mode`、`default` 被明确写成：
  - 当前仍在主路径部分存在
  - 目标方向是退出主公开 contract
- `layout` / `syntax` 文档不再暗示 parser/runtime 已完整支持。

剩余缺口：

- 仍没有自动方式持续防止未来文档再次漂移。
- 但当前人工审计层面已经明显收紧。

## 当前最强证据

如果要证明这轮目标已经不是“泛泛调研”，当前最强的几份文档是：

1. `docs/details/current-contract-audit.md`
   - 证明现实基线是基于当前代码，而不是靠记忆。
2. `docs/roadmap.md`
   - 证明 phase 节奏、难度和阶段风险已经成形。
3. `docs/architecture/execution-checklist.md`
   - 证明方案已经落到开工级别，而不是只停在阶段标题。
4. `docs/architecture/instance-card-coverage-audit.md`
   - 证明 `2A-5C` 当前都已经至少下钻到实例执行卡，不再只有 phase / slice 名称。
5. `docs/architecture/phase-completion-criteria.md`
   - 证明“完成”也被写实，而不是只定义“怎么开工”。
6. `docs/reading-map.md`
   - 证明这套资料已经能被后来者以较低成本消费。

## 仍然不应夸大的地方

下面这些事情当前仍然没有完成，因此不应把总目标说得过满：

- `Phase 2-5` 的代码实现并没有开始，本轮主要交付的是架构调研和执行方案。
- `phase-completion-criteria.md` 定义的是完成判据，不是某个 phase 已经完成。
- 目前没有用测试结果证明未来 phases 的实现，只是把真实 gate 名称和覆盖范围整理清楚了。
- 文档仍然很多，虽然已分层压缩，但还没有收缩到极少数文件。

## 当前总判断

对目标“调研项目代码架构，诚实化并具体细化各个阶段的执行方案”的当前完成度判断是：

- `代码架构调研`：`高覆盖`
- `诚实化`：`高覆盖`
- `阶段执行方案细化`：`高覆盖`
- `执行方案消费成本`：`中高覆盖`
- `真正实现这些 phases`：`未开始，且不在本轮已完成范围内`

因此，更准确的结论不是“项目重构已准备完毕”，而是：

> 当前已经形成一套以当前工作树证据为基础的、较完整的架构调研与阶段执行资料包；它足以指导后续分阶段实施，但还不是实现完成证明。

## 推荐下一步

如果继续沿着当前目标推进，而不是切到真实代码实现，最有价值的下一步有两个方向：

1. 把这份审计继续压成 issue / PR 模板
   - 让每个 slice 可以直接生成开工单
2. 再做一轮“高风险组件专篇”
   - 例如：
     - `tabs`
     - `accordion`
     - `table`
   - 把 Phase 4/5 最容易炸的 runtime bridge 再拆成独立风险卡片
