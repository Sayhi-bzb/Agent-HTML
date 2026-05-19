# Reading Map

本文是 `docs/` 的压缩导航页。

它不重复每篇文档的细节，只回答两个问题：

- 你现在应该先看哪一层文档
- 你不该把哪些文档混成同一种“真相来源”

如果只想快速进入当前这轮重构，请先记住下面四层：

1. 目标层
   - 项目想变成什么
2. 现实层
   - 当前工作树真实长什么样
3. 开工层
   - 下一刀先改什么、做到哪一步该停
4. 完工层
   - 什么时候才算真的完成

## 四层文档

### 1. 目标层

这层定义目标 contract 和职责边界，不等于当前代码已经做到。

先看：

- `docs/architecture/architecture.md`
- `docs/architecture/schema.md`
- `docs/layout.md`
- `docs/syntax.md`

回答的问题：

- 配置层、语义层、renderer、runtime host 应该怎么分工
- prop exposure 的目标机制是什么
- layout primitive 的目标边界是什么
- syntax 的目标 surface 是什么

不要误读：

- 这层描述的是目标方向和保守边界
- 不是当前代码事实表

### 2. 现实层

这层定义当前工作树真实状态，是后续所有 phase 的落地基线。

先看：

- `docs/details/current-contract-audit.md`
- `docs/details/current-contract-component-matrix.md`
- `docs/architecture/execution-map.md`

必要时补看：

- `docs/components.md`
- `docs/details/component-details.md`

回答的问题：

- 当前 public contract 真正从哪里生成
- 哪些旧字段还在主路径上
- 哪些 runtime bridge 还没退出
- 当前代码链路和测试闸口分别落在哪

不要误读：

- 这层不是目标设计
- 这层也不直接告诉你“下一刀怎么切”

### 3. 开工层

这层定义阶段顺序、切片顺序和每刀的入口文件与停手边界。

先看：

- `docs/roadmap.md`
- `docs/architecture/implementation-slices.md`
- `docs/architecture/execution-checklist.md`

按 phase 深入：

- `docs/architecture/phase-2-design.md`
- `docs/architecture/phase-2-implementation-draft.md`
- `docs/architecture/phase-3-implementation-draft.md`
- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/phase-5-implementation-draft.md`

补充：

- `docs/todo.md`

回答的问题：

- 当前应该先做哪个 phase / slice
- 这一刀先改哪些文件
- 这一刀不要混入什么
- 跑哪个最窄 gate 才够

不要误读：

- `todo.md` 不是架构结论文档
- `execution-checklist.md` 不是阶段完成证明

### 4. 完工层

这层定义“什么时候才算完成”，防止把局部进展说成 phase 完成。

先看：

- `docs/architecture/phase-completion-criteria.md`

回答的问题：

- 每个 phase 的最低完成证据是什么
- 哪些测试至少要过
- 哪些看起来像进展但其实不够

不要误读：

- 这层不是开工清单
- 它是完成声明的最低证据要求

## 三条最短阅读路径

### 路径 A：第一次接手这轮重构

按这个顺序读：

1. `docs/reading-map.md`
2. `docs/architecture/architecture.md`
3. `docs/details/current-contract-audit.md`
4. `docs/roadmap.md`
5. 对应 phase 的 implementation draft
6. `docs/architecture/execution-checklist.md`

适合：

- 刚接手这轮架构收口的人
- 需要先建立全局图，再落到当前 phase 的人

### 路径 B：已经知道 phase，只想开工

按这个顺序读：

1. `docs/roadmap.md`
2. 对应 phase 的 implementation draft
3. `docs/architecture/implementation-slices.md`
4. `docs/architecture/execution-checklist.md`
5. 必要时回看 `docs/architecture/execution-map.md`

适合：

- 已经知道自己要做 `Phase 2/3/4/5`
- 只想知道下一刀入口文件和 gate 的人

### 路径 C：要审核“某个 phase 已完成”这句话

按这个顺序读：

1. `docs/architecture/phase-completion-criteria.md`
2. 对应 phase 的 implementation draft
3. `docs/architecture/execution-checklist.md`
4. 当前代码和对应测试入口

适合：

- 做收尾审计
- 判断“完成”是不是只是文档口头完成

## 最容易混淆的几组文档

- `architecture.md` vs `current-contract-audit.md`
  - 前者讲目标分层
  - 后者讲当前代码现实

- `roadmap.md` vs `implementation-slices.md`
  - 前者讲阶段节奏
  - 后者讲切片顺序

- `execution-checklist.md` vs `phase-completion-criteria.md`
  - 前者讲怎么开工和何时停手
  - 后者讲什么时候才算完成

- `todo.md` vs 以上所有文档
  - `todo.md` 只是当前待办清单
  - 不负责定义目标、现实或完成标准

## 当前推荐入口

如果只能先读 5 篇，当前最划算的是：

1. `docs/reading-map.md`
2. `docs/details/current-contract-audit.md`
3. `docs/roadmap.md`
4. `docs/architecture/execution-checklist.md`
5. 当前 phase 对应的 implementation draft
