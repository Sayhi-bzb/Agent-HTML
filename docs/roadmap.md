# Roadmap

## 背景

当前 `blueprint/` 已经定义了项目的新架构口径，`docs/` 负责把这些结论展开成工程化解释与执行节奏：

- `architecture.md` 定义总分层
- `schema.md` 定义 UI 组件的 prop exposure mechanism
- `layout.md` 定义 layout primitive contract
- `syntax.md` 定义新的 agent-html syntax 方向
这份 roadmap 关注的不是重新发明目标架构，而是让实现逐步追上 `blueprint` 已确定、并由 `docs/` 解释展开的方向。

`roadmap.md` 负责阶段节奏和阶段边界，`todo.md` 负责阶段内当前待做的小项、收尾项和验证补项。

## 目标状态

重构完成后的目标状态是：

- 配置层、语义使用层、engine、渲染层、runtime host 的职责边界清晰
- UI 和 layout 都作为正式语义积木进入公共 contract
- UI 组件的原厂 props 通过 `blocked` / `raw-candidate` 机制决定是否进入 schema 和 prompt
- layout 使用层只表达稳定结构关系，具体 spacing / partition / reflow / measure 实现留在配置层
- renderer 和 runtime host 服务公开 contract，而不是继续反向塑造 contract

## 重构阶段

### Phase 1: Contract 对齐

目标：

- 先按 `blueprint` 固定公开 contract 的解释口径，避免继续沿旧路径增债

主要工作：

- 把 `blueprint` 作为顶层架构事实来源
- 让 `architecture.md`、`schema.md`、`layout.md`、`syntax.md` 成为对 `blueprint` 的工程化解释
- 确认 `gallery` 属于配置层入口
- 确认新的 agent-html syntax 方向，允许 UI / layout 并列表达
- 冻结旧语义包装字段的新增方向
- 明确哪些能力属于配置层，哪些属于语义使用层
- 盘点实现层与文档目标之间的差异

不要做：

- 不在这一阶段做大规模 renderer 或 runtime 改写

验收口径：

- 新增能力不再继续依赖旧 overlay / 白名单式 public contract
- `docs/` 与 `blueprint` 不再存在顶层架构口径漂移

### Phase 2: Schema / Prompt 重构

目标：

- 先改最上游公开面，让 schema 和 prompt 对齐新 contract

主要工作：

- 让 schema 生成链路基于 prop exposure state 工作
- 让 prompt 输出只暴露最终公开的 props
- 让文档级配置选择入口从强制 authoring 指令降为可选配置入口
- 让 schema / prompt 与新的 syntax surface 对齐
- 逐步退出 hand-written public prop 白名单主路径
- 首批稳定 `raw-candidate` 聚焦在 `variant`、`size`
- `layout primitive` 先作为 vocabulary 进入公开面，不急着一次开放所有结构 props

不要做：

- 不一次把所有 `raw-candidate` 都开放到 agent-facing schema

验收口径：

- `blocked` props 不进入 CLI schema 和 prompt
- 被锁住的 `raw-candidate` 不进入 prompt
- prompt 输出不再依赖 renderer 临时解释历史字段

### Phase 3: Layout 语义落地

目标：

- 把 layout 从文档概念变成真实公共能力

主要工作：

- 把 `stack`、`cluster`、`split`、`switcher`、`grid`、`frame` 接成正式 layout primitive
- 明确哪些 layout 是零 props，哪些 layout 只允许少量结构 props
- 保持 layout 使用层只表达结构关系
- 让 layout primitive 真正在 syntax 和语义层中可用
- 把 partition / measure / breakpoint / density / reflow 的具体实现留在配置层

不要做：

- 不把 layout primitive 退化成自由 flex / grid 参数面

验收口径：

- 常见页面结构可以用 layout primitive 诚实表达
- layout 可以嵌套 UI 和 layout
- layout schema 不泄露实现层数值参数

### Phase 4: Renderer / Runtime Host 解耦

目标：

- 让运行时真正服务新 contract，而不是继续由预设页面结构主导

主要工作：

- 让 renderer 按 semantic node resolver + projection 方式消费 UI / layout 节点
- 清理 runtime-template 里写死的文档型页面假设
- 让 `gallery` 与配置层对象和 runtime host 真正对齐
- 把 UI 投影和 layout 投影分层
- 保留必要 fallback，但不让 fallback 成为主路径
- 让 runtime host 只承担执行宿主职责

不要做：

- 不继续强化 runtime-template 的架构中心地位

验收口径：

- renderer 的主要决策来自 schema 和配置层
- layout 结构不再被 document-shell 默认排版强行扭曲
- runtime host 不再隐含“只有文档页”这一前提

### Phase 5: 旧机制下线与收尾

目标：

- 下线旧架构残留，收束成单一路径

主要工作：

- 清理旧语义包装字段的主路径依赖
- 清理仍然依赖旧 public contract 的 renderer / schema 分支
- 清理旧 template 结构假设的残留路径
- 收敛 docs，使目标架构和当前实现差距最小
- 补齐 doctor / test / preview 的最终验证链路

不要做：

- 不保留双轨 public contract

验收口径：

- 公共 contract、schema、prompt、renderer 映射、runtime 表达走同一路径
- `tone`、`default`、`mode`、`kind` 不再作为新增能力入口
- 项目不再维持两套并行公共语义系统

## Cross-Cutting Rules

- 文档中的公开 contract 优先于历史实现惯性
- `blueprint` 是顶层架构事实来源，`docs/` 负责解释与执行组织
- UI 和 layout 都是语义积木，但职责分离
- 配置层决定 exposure policy 与 layout realization
- 使用层只表达稳定语义，不表达实现参数
- 新组件接入必须走 shared semantic-to-runtime path
- 不再把 runtime-template 当架构中心

## 阶段验收口径

- 每个阶段都必须能独立验收，避免大爆炸迁移
- 上游 contract 收紧后，后续阶段不得重新放宽旧接口
- 新增实现必须朝新架构收敛，而不是补旧架构分支
- docs、schema、prompt、renderer、runtime 的最终方向必须一致
