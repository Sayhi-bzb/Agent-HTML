# Slice Risk Card Map

本文只回答一个很实际的问题：

- 当某个人准备做某个 `Slice` 时，除了 phase 实施稿和执行卡，还应该先看哪几张高风险专篇

它不重复 `implementation-slices.md` 的切片定义，也不重复 `high-risk-runtime-bridges.md` 的风险解释本身。

它的作用是降低开工歧义，尤其是避免 `Phase 4/5` 执行者靠记忆判断：

- 哪些 slice 根本不需要额外风险卡
- 哪些 slice 必须先把 `tabs` / `accordion` / `table` 的专篇读完再开工
- 哪些 slice 只在某类阻塞真的出现时才需要下钻到组件专篇

## 使用方式

先按这个顺序查资料：

1. 先看 `docs/architecture/implementation-slices.md`
   - 确认当前到底是哪一刀
2. 再看对应 `slice-*-execution-card.md`
   - 确认第一批入口文件、停手边界、最窄 gate
3. 再用本文判断：
   - 当前是否必须补读高风险专篇
   - 必须读哪几篇
   - 哪些专篇暂时不该混进来

## 对照总表

| Slice | 默认先看 | 必读高风险专篇 | 只在出现阻塞时再读 | 说明 |
|---|---|---|---|---|
| `2A` | `phase-2-implementation-draft.md`, `slice-2a-execution-card.md` | 无 | `current-contract-audit.md` | 这是类型面和职责拆分，不应提前混入 runtime 风险卡 |
| `2B` | `phase-2-implementation-draft.md`, `slice-2b-execution-card.md` | 无 | `current-contract-audit.md` | 重点是生成闸口，不是高耦合运行时 bridge |
| `2C` | `phase-2-design.md`, `slice-2c-execution-card.md` | 无 | `high-risk-runtime-bridges.md` | 只做低耦合试点；一旦读到 `tabs` / `accordion` / `table`，通常说明范围已经漂了 |
| `3A` | `phase-3-implementation-draft.md`, `slice-3a-execution-card.md` | 无 | `current-contract-audit.md` | 只先收 schema / public contract，不需要组件风险专篇 |
| `3B` | `phase-3-implementation-draft.md`, `slice-3b-execution-card.md` | 无 | `execution-map.md` | 重点是 parse + validate，不是 runtime bridge |
| `3C` | `phase-3-implementation-draft.md`, `slice-3c-execution-card.md` | 无 | `high-risk-runtime-bridges.md` | 复杂 layout projection 仍不等于 `tabs` / `accordion` / `table` 风险桥 |
| `4A` | `phase-4-implementation-draft.md`, `slice-4a-execution-card.md` | `high-risk-runtime-bridges.md`, `tabs-migration-card.md`, `accordion-migration-card.md`, `table-migration-card.md` | 无 | 这是第一刀真正直接处理 legacy bridge 的切片 |
| `4B` | `phase-4-implementation-draft.md`, `slice-4b-execution-card.md` | `high-risk-runtime-bridges.md` | `tabs-migration-card.md`, `accordion-migration-card.md`, `table-migration-card.md` | 默认先读总风险图；只有在某个组件 ownership 拆分卡住时再下钻单组件专篇 |
| `4C` | `phase-4-implementation-draft.md`, `slice-4c-execution-card.md` | 无 | `high-risk-runtime-bridges.md`, `tabs-migration-card.md`, `accordion-migration-card.md`, `table-migration-card.md` | 这刀主要清 host / shell；只有当 shell 断言被高风险组件旧桥拖住时才需要下钻 |
| `5A` | `phase-5-implementation-draft.md`, `slice-5a-execution-card.md` | `high-risk-runtime-bridges.md` | `tabs-migration-card.md`, `accordion-migration-card.md`, `table-migration-card.md` | 先收公开 contract；如果要判断某个 legacy field 能不能退出公开面，就必须回看对应组件专篇 |
| `5B` | `phase-5-implementation-draft.md`, `slice-5b-execution-card.md` | `high-risk-runtime-bridges.md`, `tabs-migration-card.md`, `accordion-migration-card.md`, `table-migration-card.md` | 无 | 这是 runtime spec 收旧字段的核心刀，三张组件专篇都直接相关 |
| `5C` | `phase-5-implementation-draft.md`, `slice-5c-execution-card.md` | `high-risk-runtime-bridges.md`, `tabs-migration-card.md`, `accordion-migration-card.md`, `table-migration-card.md` | 无 | heavy gates 和 docs 最终收口时，旧桥 fixture / shell 断言都会一起回流 |

## 逐类说明

### 1. 哪些 slice 默认不该读风险卡

下面这些 slice 的主矛盾不在高风险 runtime bridge：

- `2A`
- `2B`
- `2C`
- `3A`
- `3B`
- `3C`

对这些切片来说，如果一开始就把 `tabs` / `accordion` / `table` 专篇摊开，多半不是更充分，而是更容易混线。

更准确的做法是：

- 先把 phase 实施稿和当前 slice 执行卡读清
- 只有当执行卡已经明确点名 legacy bridge 风险，才补读高风险专篇

### 2. 哪些 slice 必须先读总风险图

下面这些 slice 开工前，默认就应该先读：

- `4A`
- `4B`
- `5A`
- `5B`
- `5C`

至少先读：

- `docs/details/high-risk-runtime-bridges.md`

原因不是“多读一点更保险”，而是这些 slice 已经直接踩到：

- old field bridge
- renderer state / structure bridge
- heavy fixture 仍保护旧路径

不先看总风险图，很容易把：

- `tabs.default`
- `accordion.mode/default/defaultMode`
- `row.kind`

误当成普通 prop 收尾。

### 3. 哪些 slice 必须直接下钻单组件专篇

下面这些 slice，不应只停在总风险图：

- `4A`
- `5B`
- `5C`

原因：

- `4A` 要做的是 bridge 隔离，本来就需要知道三类桥的真实差异，而不是抽成一个假统一模型
- `5B` 要收的是 runtime spec 旧字段，哪一条桥已经有替代路径、哪一条还没有，必须看组件专篇
- `5C` 要改 heavy fixtures / doctor / docs，哪些旧输入和旧断言还在保护主路径，也必须看组件专篇

默认要读的就是这三篇：

- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

### 4. 哪些 slice 只在出现阻塞时再下钻单组件专篇

下面这些 slice 默认不需要一开始就把三篇都读完：

- `4B`
- `4C`
- `5A`

更合适的节奏是：

- 先看总风险图
- 再按真实阻塞点决定补哪张单组件卡

例如：

- `4B`
  - 如果只是做 UI / layout projection ownership 拆分，通常先看总风险图就够
  - 只有当 `tabs` / `accordion` / `table` 的 projection helper 边界开始打架时，才下钻对应专篇
- `4C`
  - 如果 shell 清理没有被 legacy component fixture 拖住，通常不需要先把三张组件卡全读一遍
  - 如果 `ahtml-document-shell`、noscript fallback 或 preview/grid 断言被某个高风险组件旧桥钉死，再下钻对应专篇
- `5A`
  - 如果只是收“旧公开字段不再继续当主入口”的总口径，先看总风险图
  - 只有在判断某个字段能不能真的退出公开 schema 时，才下钻对应组件专篇

## 当前最容易混淆的边界

### `2C` 和 `4A`

最容易犯的错是：

- 还在做 `2C`
- 结果已经开始读 `tabs` / `accordion` / `table` 的旧桥专篇

这通常说明问题已经不再是：

- “低耦合试点 prop 能不能贯穿”

而已经变成：

- “legacy bridge 怎么隔离”

也就是范围已经漂到了 `Phase 4`。

### `4C` 和 `5C`

另一个常见混淆是：

- `4C` 处理的是 host / shell / gallery 边界
- `5C` 处理的是 doctor / heavy gates / docs 最终收口

如果为了清 `app.tsx` 的 shell，已经开始大改：

- `cli.build.heavy.test.ts`
- `cli.runtime.heavy.test.ts`
- `doctor-checks.mjs`

那通常说明已经混入了 `5C` 问题。

## 推荐搭配

如果现在要真的开工，推荐按下面的最小组合开文档：

### 做 `4A`

- `docs/architecture/slice-4a-execution-card.md`
- `docs/details/high-risk-runtime-bridges.md`
- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

### 做 `5B`

- `docs/architecture/slice-5b-execution-card.md`
- `docs/details/high-risk-runtime-bridges.md`
- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

### 做 `5C`

- `docs/architecture/slice-5c-execution-card.md`
- `docs/details/high-risk-runtime-bridges.md`
- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

### 做 `2C`

- `docs/architecture/slice-2c-execution-card.md`
- `docs/architecture/phase-2-design.md`

如果这时已经需要打开高风险组件专篇，先停，通常说明当前切片已经切大了。
