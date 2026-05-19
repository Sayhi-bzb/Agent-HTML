# Instance Card Coverage Audit

本文只审计一个更窄的问题：

- `docs/architecture/implementation-slices.md` 里定义的切片，当前是否都有对应的实例执行卡
- 这些实例执行卡是否已经足够支撑“下一刀怎么开工”的消费场景
- 还缺的到底是“切片级覆盖”，还是更细一层的专篇资料

它不审计代码实现是否完成，也不重复 `docs/coverage-audit.md` 对整套资料包的总覆盖判断。

## 审计范围

当前以这两组文件为准：

- 切片定义源：
  - `docs/architecture/implementation-slices.md`
  - `docs/architecture/execution-checklist.md`
- 实例执行卡：
  - `docs/architecture/slice-2a-execution-card.md`
  - `docs/architecture/slice-2b-execution-card.md`
  - `docs/architecture/slice-2c-execution-card.md`
  - `docs/architecture/slice-3a-execution-card.md`
  - `docs/architecture/slice-3b-execution-card.md`
  - `docs/architecture/slice-3c-execution-card.md`
  - `docs/architecture/slice-4a-execution-card.md`
  - `docs/architecture/slice-4b-execution-card.md`
  - `docs/architecture/slice-4c-execution-card.md`
  - `docs/architecture/slice-5a-execution-card.md`
  - `docs/architecture/slice-5b-execution-card.md`
  - `docs/architecture/slice-5c-execution-card.md`

## 审计方法

这里只接受三类证据：

- `implementation-slices.md` 明确列出了某个 slice
- 当前工作树里存在同名 `slice-*-execution-card.md`
- 执行卡本身已经把这一刀继续压到：
  - 当前目标
  - 当前前置条件
  - 第一批入口文件
  - 停手边界
  - 最窄 gate

下面这些不算通过：

- 只有 phase 级说明，没有 slice 级实例卡
- 只有模板 `slice-execution-template.md`，但没有具体 slice 落地
- 有卡片文件名，但内容没有把切片继续压到开工粒度

## 期望切片集合

当前切片定义源里要求覆盖的实例卡总数是 `12`：

- `2A`
- `2B`
- `2C`
- `3A`
- `3B`
- `3C`
- `4A`
- `4B`
- `4C`
- `5A`
- `5B`
- `5C`

## 覆盖矩阵

| Slice | 期望存在实例卡 | 当前状态 | 备注 |
|---|---|---|---|
| `2A` | `slice-2a-execution-card.md` | 已覆盖 | 已把“部分已落位但未完成”写成当前事实 |
| `2B` | `slice-2b-execution-card.md` | 已覆盖 | 已把真实切点收紧到 `generate-component-schema.mjs` |
| `2C` | `slice-2c-execution-card.md` | 已覆盖 | 已把试点范围压到低耦合 prop |
| `3A` | `slice-3a-execution-card.md` | 已覆盖 | 已明确只先收 schema / public contract |
| `3B` | `slice-3b-execution-card.md` | 已覆盖 | 已明确只打 `stack` / `cluster` parse + validate |
| `3C` | `slice-3c-execution-card.md` | 已覆盖 | 已明确只补复杂 layout 最小 projection |
| `4A` | `slice-4a-execution-card.md` | 已覆盖 | 已和 legacy bridge 隔离目标对齐 |
| `4B` | `slice-4b-execution-card.md` | 已覆盖 | 已明确 UI / layout projection ownership 边界 |
| `4C` | `slice-4c-execution-card.md` | 已覆盖 | 已明确它处理的是 host / shell 边界，不是 layout 设计 |
| `5A` | `slice-5a-execution-card.md` | 已覆盖 | 已把公开 contract 收口和 runtime 收口分开 |
| `5B` | `slice-5b-execution-card.md` | 已覆盖 | 已把 runtime spec 旧字段收口写成独立一刀 |
| `5C` | `slice-5c-execution-card.md` | 已覆盖 | 已把 docs / doctor / heavy gate 最终收口单列 |

## 当前判断

### 1. 切片级实例卡是否已经全覆盖

当前判断：`是`

理由：

- `implementation-slices.md` 中定义的 `2A-5C` 十二个切片，当前都能在 `docs/architecture/` 下找到同名实例执行卡。
- `docs/index.md` 已把这些卡片纳入导航，不再需要人工猜测“哪些切片已经有落地卡，哪些还只是阶段名”。
- `docs/todo.md` 当前也已经把“如果现在准备评估某刀是否能开工，先看哪张卡”写进阶段入口。

### 2. 当前缺的还是不是“实例卡”

当前判断：`不是`

理由：

- 现在的主要缺口已经不是“有没有 `2A-5C` 的切片卡”，而是更细一层的消费资料。
- 例如某些高风险路径已经继续下钻成组件专篇：
  - `docs/details/tabs-migration-card.md`
  - `docs/details/accordion-migration-card.md`
  - `docs/details/table-migration-card.md`
- 但并不是每个 slice 都已经继续下钻成 issue-ready 开工单、PR-ready 描述草稿，或组件级专篇。

### 3. 当前还没覆盖到哪一层粒度

当前判断：`切片以下的派生资料仍是部分覆盖`

还缺的主要不是切片卡本身，而是下面这些派生层：

- 并非每个 slice 都已有“直接可提交 issue”的实例化开工单
- 并非每个高风险组件或高耦合链条都已有独立风险卡
- `slice-risk-card-map.md` 已经把“哪些 slice 该先看哪些高风险专篇”整理出来
- `slice-artifact-map.md` 现在已经把：
  - 哪些 slice 已有 issue-ready 稿
  - 哪些 slice 只有执行卡
  - 哪些 slice 需要组件级风险专篇
  进一步整理成一张消费地图
- 当前剩下的主要缺口已经收缩到：
  - 并不是每个 slice 都有 issue-ready 稿
  - 更细的组件级专篇仍只覆盖高风险 bridge 样本

## 对总目标的意义

这份审计成立以后，可以更明确地说：

- 当前“阶段拆分”已经不只停在 `roadmap` 或 `implementation-slices`
- `2A-5C` 现在都已经至少下钻到“实例执行卡”这一层
- 后续如果还要继续细化，应该优先补的是：
  - issue / PR-ready 派生模板
  - 更细的高风险组件专篇
  - 切片卡与组件专篇之间的对应总表

因此，当前不应再把“缺少切片实例卡”当成主要缺口；更准确的说法是：

> 切片级实例卡覆盖已经完整，剩余缺口主要在切片以下的派生资料，而不是切片本身。

## 推荐后续动作

如果继续沿“执行方案细化”这个目标推进，下一批更有价值的文档工作是：

1. 给已有 `slice-execution-template.md` 派生出 1-2 份 issue / PR-ready 样例
2. 补一份“slice -> component risk card” 对照表
3. 只在确实高耦合的路径上继续下钻组件专篇，不把所有 slice 都机械扩成更细卡片
