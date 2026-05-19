# Slice Artifact Map

本文只回答一个消费层问题：

- 当前每个 `Slice` 到底已经有哪些派生资料可用
- 开工前最短应该先看哪几份
- 哪些 slice 现在只有执行卡，哪些已经有 issue-ready 稿，哪些还需要组件专篇配套

它不替代：

- `implementation-slices.md`
  - 负责定义切片顺序
- `execution-checklist.md`
  - 负责定义入口文件、停手边界和最窄 gate
- `slice-risk-card-map.md`
  - 负责定义哪些 slice 需要补读高风险专篇

它的作用更像一张消费地图：

- 如果你现在只知道“我要做 `2B` / `4A` / `5C`”，本文告诉你现成资料已经到哪一层。

## 阅读方式

按下面顺序使用：

1. 先在 `implementation-slices.md` 确认当前切片
2. 再用本文确认：
   - 当前已有执行卡吗
   - 当前已有 issue-ready 稿吗
   - 当前需要配套风险专篇吗
3. 再回到对应文档开工

## 总表

| Slice | Execution Card | Issue-ready Draft | 高风险专篇配套 | 当前消费层级 | 开工前最短组合 |
|---|---|---|---|---|---|
| `2A` | 有 | 有 | 无 | issue-ready 层 | `slice-2a-issue-draft.md` + `phase-2-implementation-draft.md` |
| `2B` | 有 | 有 | 无 | issue-ready 层 | `slice-2b-issue-draft.md` |
| `2C` | 有 | 有 | 无 | issue-ready 层 | `slice-2c-issue-draft.md` |
| `3A` | 有 | 有 | 无 | issue-ready 层 | `slice-3a-issue-draft.md` + `phase-3-implementation-draft.md` |
| `3B` | 有 | 有 | 无 | issue-ready 层 | `slice-3b-issue-draft.md` + `phase-3-implementation-draft.md` |
| `3C` | 有 | 有 | 按阻塞补读总风险图 | issue-ready 层 | `slice-3c-issue-draft.md` + `phase-3-implementation-draft.md` |
| `4A` | 有 | 有 | `tabs` / `accordion` / `table` 专篇 | issue-ready + 风险专篇层 | `slice-4a-issue-draft.md` + 三张 migration card |
| `4B` | 有 | 有 | 总风险图必读；单组件专篇按阻塞补读 | issue-ready + 风险图层 | `slice-4b-issue-draft.md` + `high-risk-runtime-bridges.md` |
| `4C` | 有 | 有 | 按阻塞补读总风险图和单组件专篇 | issue-ready 层 | `slice-4c-issue-draft.md` + `phase-4-implementation-draft.md` |
| `5A` | 有 | 有 | 总风险图必读；单组件专篇按字段退出判断补读 | issue-ready + 风险图层 | `slice-5a-issue-draft.md` + `high-risk-runtime-bridges.md` |
| `5B` | 有 | 有 | `tabs` / `accordion` / `table` 专篇 | issue-ready + 风险专篇层 | `slice-5b-issue-draft.md` + 三张 migration card |
| `5C` | 有 | 有 | `tabs` / `accordion` / `table` 专篇 | issue-ready + 风险专篇层 | `slice-5c-issue-draft.md` + 三张 migration card |

## 当前层级说明

### 1. 只有执行卡层

当前 `2A-5C` 每个 slice 都已经至少压到 issue-ready 层。

这意味着：

- 已经不再存在“只有执行卡、没有 issue-ready”的主缺口
- 剩余缺口已经下沉到更细的风险专篇、专门热点卡、或未来实现期的真实代码验证

### 2. 已有 issue-ready 稿

下面这些 slice 当前已经进一步压到了 issue-ready 层：

- `2B`
- `2A`
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

这些样例当前已经覆盖了几类典型问题：

- 前期类型面和职责拆分
- 前期生成闸口切换
- 前期首批低耦合试点开放
- 中段 layout 正式注册
- 中段 layout parse + validate 打通
- 中段 legacy bridge 隔离
- 中段 projection ownership 拆分
- 中段 host shell 边界清理
- 后段主 contract 收口
- 后段 runtime spec 收口
- 最终 gate 收口

因此它们现在更适合作为后续继续派生 issue / PR 模板的样板。

### 3. 已有高风险组件专篇深度配套

当前真正有组件级风险专篇深度支撑的主要是：

- `4A`
- `5B`
- `5C`

因为它们直接依赖：

- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

`4B` 和 `5A` 现在虽然已经有 issue-ready 稿，也仍主要要求先看总风险图；它们还没到“默认必须把三张单组件专篇都读完”的层级。

## 缺口总表

当前最明显的派生资料缺口已经不再是“缺 issue-ready 稿”，而是：

- 哪些 slice 还需要继续下钻成更细的风险卡或热点卡
- 哪些 slice 将来实现时需要补更具体的 focused 测试清单

更值得继续下钻的方向通常是：

1. `4A/5B/5C`
   - 因为它们已经明确依赖 `tabs` / `accordion` / `table` 这类高耦合 runtime bridge
2. `3C`
   - 因为它是 layout 最容易真正撞到 runtime ownership 的那刀
3. `5A`
   - 因为它和 `5B` 的边界最容易在真实实现时被重新混线

## 当前最短路径建议

### 如果你现在要做 `2B`

直接看：

- `docs/architecture/slice-2b-issue-draft.md`

必要时再回看：

- `docs/architecture/phase-2-implementation-draft.md`

### 如果你现在要做 `2A`

直接看：

- `docs/architecture/slice-2a-issue-draft.md`
- `docs/architecture/phase-2-implementation-draft.md`

### 如果你现在要做 `2C`

直接看：

- `docs/architecture/slice-2c-issue-draft.md`

### 如果你现在要做 `3C`

直接看：

- `docs/architecture/slice-3c-issue-draft.md`
- `docs/architecture/phase-3-implementation-draft.md`

### 如果你现在要做 `3A`

直接看：

- `docs/architecture/slice-3a-issue-draft.md`
- `docs/layout.md`

### 如果你现在要做 `3B`

直接看：

- `docs/architecture/slice-3b-issue-draft.md`
- `docs/architecture/phase-3-implementation-draft.md`

### 如果你现在要做 `4A`

直接看：

- `docs/architecture/slice-4a-issue-draft.md`
- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

### 如果你现在要做 `4B`

直接看：

- `docs/architecture/slice-4b-issue-draft.md`
- `docs/details/high-risk-runtime-bridges.md`

### 如果你现在要做 `4C`

直接看：

- `docs/architecture/slice-4c-issue-draft.md`
- `docs/architecture/phase-4-implementation-draft.md`

### 如果你现在要做 `5B`

直接看：

- `docs/architecture/slice-5b-issue-draft.md`
- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

### 如果你现在要做 `5A`

直接看：

- `docs/architecture/slice-5a-issue-draft.md`
- `docs/details/high-risk-runtime-bridges.md`

### 如果你现在要做 `5C`

直接看：

- `docs/architecture/slice-5c-issue-draft.md`
- `docs/details/high-risk-runtime-bridges.md`
- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

## 对总目标的意义

这张地图补上以后，当前资料包的消费链已经从：

- phase
- slice
- risk card

进一步变成：

- phase
- slice
- execution card
- issue-ready draft
- risk card

因此，当前剩余缺口已经更明确地下沉到：

- 尚未派生成 issue-ready 稿的 slice
- 尚未专篇化的更细热点路径

而不是再回到“阶段是不是已经拆开”“切片是不是已经存在”这类更上层的问题。
