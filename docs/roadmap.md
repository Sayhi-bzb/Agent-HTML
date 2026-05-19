# Roadmap

## 背景

当前 `blueprint/` 已经定义了项目的新架构口径，`docs/` 负责把这些结论展开成工程化解释与执行节奏：

- `architecture.md` 定义总分层
- `schema.md` 定义 UI 组件的 prop exposure mechanism
- `layout.md` 定义 layout primitive contract
- `syntax.md` 定义新的 agent-html syntax 方向
这份 roadmap 关注的不是重新发明目标架构，而是让实现逐步追上 `blueprint` 已确定、并由 `docs/` 解释展开的方向。

`roadmap.md` 负责阶段节奏和阶段边界，`todo.md` 负责阶段内当前待做的小项、收尾项和验证补项。

如果需要把 phase 继续拆成可单独开工的改动批次，请看 `docs/architecture/implementation-slices.md`。`roadmap.md` 保持阶段视角，不承载切片级改动顺序。

如果需要看接近真实 patch 设计粒度的实施稿，请分别看：

- `Phase 2`
  - `docs/architecture/phase-2-design.md`
  - `docs/architecture/phase-2-implementation-draft.md`
- `Phase 3`
  - `docs/architecture/phase-3-implementation-draft.md`
- `Phase 4`
  - `docs/architecture/phase-4-implementation-draft.md`
- `Phase 5`
  - `docs/architecture/phase-5-implementation-draft.md`

如果需要看“每个切片现在该先改什么、做到哪一步该停、用哪个 gate 证明够了”，请看：

- `docs/architecture/execution-checklist.md`

如果需要看“某个 phase 什么时候才算真的完成、哪些证据不够”，请看：

- `docs/architecture/phase-completion-criteria.md`

## 当前实现基线

在开始任何重构前，应先把当前主路径视为真实约束，而不是把文档目标误当成已实现事实。当前工作树里最关键的代码锚点是：

- `packages/core/src/public-agent-contract.ts`
  - CLI schema 输出的公共 contract 总入口。
- `packages/core/src/component-schema.ts`
  - 标准组件集合、blocked 名单和 allowedChildren 校验入口。
- `packages/core/src/schema-overlays.ts`
  - 当前 hand-written public contract 主体，仍承载 `tone`、`kind`、`mode`、`default` 等历史字段。
- `packages/core/src/parse/parse-agent-html.ts`
  - 语法层当前只围绕 `STANDARD_COMPONENT_NAMES` 做解析别名和根节点收集。
- `packages/core/src/parse/validate-agent-html.ts`
  - 当前按 `ComponentSchema` 的 props / allowedChildren 做验证，是 layout 落地时必须联动的上游闸门。
- `packages/core/src/parse/sanitize-agent-html.ts`
  - 目前只是 parse + validate 的薄封装，本身没有独立 layout 归一化逻辑。
- `packages/ahtml/src/cli/schema.mjs`
  - prompt/schema 输出入口，当前直接消费 `createPublicAgentContract()`。
- `packages/ahtml/src/config/component-capabilities.mjs`
  - renderer mapping、slot 结构、propMappings、历史字段别名和 runtime 行为模型的集中定义点。
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - runtime renderer spec 类型面，仍显式包含 `kindProp`、`modeProp`、`defaultProp` 等旧字段通道。
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - 当前 runtime 主渲染路径；UI 映射、旧字段解释、fallback、默认文档型布局假设都集中在这里。
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
  - runtime shell 和 gallery 样式结构入口，仍带有明显 document-shell / preview-grid 假设。

当前还应记录两个工作树事实：

- 仓库根目录当前没有 `spec/` 目录，说明 `AGENTS.md` 中对 `spec/map.md`、`spec/roadmap.md` 的引用在这份工作树里暂时不可用；执行计划应以现有 `blueprint/`、`docs/` 和代码为准。
- `.git/index.lock` 当前存在且会干扰 `git status`，说明提交前的变更盘点需要先确认锁文件状态，避免把 git 异常误判成代码风险。

## 当前施工进度

下面这组状态用于帮助下一个开发者快速判断“已经落了什么、下一刀该从哪接”。

- `2A`
  - 已完成。
  - 当前工作树已经引入 `packages/core/src/prop-exposure-policy.ts`，并把类型面和 exposure policy 从旧 overlay 里拆开。
- `2B`
  - 已完成。
  - schema 生成链已经切到 resolved exposure decision，`component-schema.generated.ts` 已按新链路更新。
- `2C`
  - 已完成。
  - 当前最小试点已经聚焦到 `alert.variant` / `badge.variant`，并贯通到 schema / prompt / runtime。
- `3A`
  - 已完成。
  - `stack`、`cluster`、`split`、`grid`、`switcher`、`frame` 已进入正式 schema / public contract。
- `3B`
  - 已完成。
  - `stack` / `cluster` 已被 parse + validate 正式接受，零 props 边界已进 focused tests。
- `3C`
  - 已完成。
  - 复杂 layout 已有最小 runtime projection；当前故意只补最小 wrapper，不清 `app.tsx` shell。
- `4A`
  - 已完成。
  - legacy bridge 现在已按三类显式隔离：
    - variant-like
    - state-like
    - structural-role
  - 当前 `render-node.tsx` 主分支不再散落 `tone` / `kind` / `mode` / `default` 的直接翻译判断。
- `4B`
  - 未完成，当前只停在开工草稿状态。
  - 已新增 `packages/ahtml/src/cli/runtime-template/src/renderer/render-layout-node.tsx` 草稿文件，但它还没有接入主 dispatcher。
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx` 目前不存在。
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx` 仍然同时承担 UI projection、layout projection、structured child extraction、fallback 和递归调度，所以不能把当前状态误判成 `4B` 已落地。

最近一轮已确认通过的 focused gates：

- `npm run test:run -- packages/core/src/component-schema.test.ts`
- `npm run test:run -- packages/core/src/public-agent-contract.test.ts`
- `npm run test:run -- packages/core/src/parse/sanitize-agent-html.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/cli.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `npm run test:run -- packages/ahtml/src/config/render-capabilities.test.ts`

如果下一个开发者从这里继续，当前最自然的入口不是回头重做 `4A`，而是：

1. 先把 `render-node.tsx` 压成真正的 dispatcher。
2. 把 UI projection 整体迁入 `render-ui-node.tsx`。
3. 再把 `render-layout-node.tsx` 真正接线，并确认 layout child selection 不再复用以 `tabs` / `select` / `table` 为中心的 UI helper。

## 目标状态

重构完成后的目标状态是：

- 配置层、语义使用层、engine、渲染层、runtime host 的职责边界清晰
- UI 和 layout 都作为正式语义积木进入公共 contract
- UI 组件的原厂 props 通过 `blocked` / `raw-candidate` 机制决定是否进入 schema 和 prompt
- layout 使用层只表达稳定结构关系，具体 spacing / partition / reflow / measure 实现留在配置层
- renderer 和 runtime host 服务公开 contract，而不是继续反向塑造 contract

## 执行原则

- 先收紧上游 contract，再推进 syntax / renderer / runtime。不要先改 runtime 再倒推公开面。
- 每个阶段只解决一个主要矛盾，不把 contract 收敛、layout 落地、runtime 脱模板混成一次大迁移。
- 新路径落地前，可以保留短期兼容桥，但必须让桥接点显式、可清理、可验证。
- 阶段验收必须指向真实文件和真实行为，不接受“文档已经说明但代码还没跟上”的假完成。
- docs 更新要和代码入口一一对应，避免再写出一套脱离工作树的理想化 roadmap。

## 阶段难度总览

- `Phase 1`
  - 难度：低到中
  - 原因：主要是事实审计、边界冻结和文档口径对齐，风险集中在“误把目标当现状”。
- `Phase 2`
  - 难度：中高
  - 原因：要改公开 contract 上游主链，`schema-overlays.ts -> generate-component-schema.mjs -> component-schema.ts -> public-agent-contract.ts -> schema.mjs` 任何一步都可能把 schema / prompt 拉成半迁移状态。
- `Phase 3`
  - 难度：高
  - 原因：layout 一旦进入正式 surface，就会同时撞到 parser、validator、sanitize 和 renderer；它不是单层加节点。
- `Phase 4`
  - 难度：极高
  - 原因：当前 `schema.mjs -> runtime-contract.mjs -> render-capabilities.mjs -> render-node.tsx -> app.tsx -> doctor` 是一条真实耦合链，拆 runtime host 和 renderer 不是局部重排。
- `Phase 5`
  - 难度：中
  - 原因：实现动作本身比 `Phase 3/4` 少，但回归风险高，因为 heavy tests、doctor、preview/build gate 还在保护旧路径。

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

代码锚点：

- `packages/core/src/public-agent-contract.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/schema-overlays.ts`
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`

建议执行顺序：

1. 先产出一份“当前 public contract 事实表”，按组件列出：
   - 当前对外 props
   - 当前 runtime 消费的历史字段
   - 当前被隐藏但仍在映射中的原厂 props
2. 标记旧 contract 仍在主路径出现的位置：
   - `schema-overlays.ts` 中的 `tone`、`kind`、`mode`、`default`
   - `component-capabilities.mjs` 中的 `attrAliases`、`propMappings`、`modeProp`、`defaultProp`
   - `render-node.tsx` 中对这些字段的直接读取
3. 产出一份“文档目标 vs 当前实现”的差异清单，作为后续 phase 的唯一迁移输入。
4. 明确 `gallery` 的配置层职责和 runtime shell 职责分别落在哪些模块，避免后面把 Phase 4 问题提前混进 Phase 2。

不要做：

- 不在这一阶段做大规模 renderer 或 runtime 改写

验收口径：

- 新增能力不再继续依赖旧 overlay / 白名单式 public contract
- `docs/` 与 `blueprint` 不再存在顶层架构口径漂移
- 至少形成一份可追踪到真实文件的差异表，后续 phase 不再凭印象开工

执行参考：

- `docs/details/current-contract-audit.md`
- `docs/details/current-contract-component-matrix.md`
- `docs/architecture/execution-map.md`

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

代码锚点：

- `packages/core/src/types.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/schema-overlays.ts`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/public-agent-contract.ts`
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/cli/cli.test.ts`

建议执行顺序：

1. 先在 core 类型面里明确 prop exposure state 的承载位置，不要直接从 runtime 侧倒推。
2. 把 `schema-overlays.ts` 中“语义字段”和“原厂 prop 暴露规则”拆开，避免继续在一个对象里同时表达内容 contract、历史包装字段和 hiddenProps。
3. 让 `createPublicAgentContract()` 输出的组件 props 来自 exposure decision，而不是继续直接依赖 hand-written overlay 结果。
4. 更新 `schema.mjs` 的 prompt 格式化逻辑，让 prompt 只消费最终公开 schema，不再默认继承历史字段。
5. 先接入小范围稳定候选：
   - `variant`
   - `size`
   只在少数组件上验证，不一次铺开到所有组件。
6. 对历史语义字段做分流：
   - 内容字段保留
   - 旧包装字段冻结新增
   - 必要时保留短期兼容解析，但不再进入主公开 contract

主要风险：

- `schema-overlays.ts` 仍是当前 schema 真正来源，拆分时最容易把“还能跑的旧路径”误删。
- `component-schema.generated.ts` 和 runtime verification data 之间如果没有同步策略，Phase 2 会出现 schema 对了但 runtime mapping 仍是旧字段的半迁移状态。

设计入口：

- 具体执行设计见 `docs/architecture/phase-2-design.md`
- 代码级执行图见 `docs/architecture/execution-map.md`
- 切片级改动顺序见 `docs/architecture/implementation-slices.md`
- 接近真实 patch 的实施稿见 `docs/architecture/phase-2-implementation-draft.md`

不要做：

- 不一次把所有 `raw-candidate` 都开放到 agent-facing schema

验收口径：

- `blocked` props 不进入 CLI schema 和 prompt
- 被锁住的 `raw-candidate` 不进入 prompt
- prompt 输出不再依赖 renderer 临时解释历史字段
- `packages/ahtml/src/cli/cli.test.ts` 至少覆盖：
  - `className` / `style` 继续不可见
  - `variant` / `size` 只在明确放开的组件上出现
  - `tone` / `mode` / `kind` / `default` 不再作为新增公开能力入口

### Phase 3: Layout 语义落地

目标：

- 把 layout 从文档概念变成真实公共能力

主要工作：

- 把 `stack`、`cluster`、`split`、`switcher`、`grid`、`frame` 接成正式 layout primitive
- 明确哪些 layout 是零 props，哪些 layout 只允许少量结构 props
- 保持 layout 使用层只表达结构关系
- 让 layout primitive 真正在 syntax 和语义层中可用
- 把 partition / measure / breakpoint / density / reflow 的具体实现留在配置层

代码锚点：

- `packages/core/src/component-schema.ts`
- `packages/core/src/parse/parse-agent-html.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/core/src/parse/sanitize-agent-html.ts`
- `packages/core/src/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

建议执行顺序：

1. 先把 layout primitive 作为正式节点名进入 schema / type surface，而不是先在 renderer 里偷偷支持。
2. 调整 parser 对标准节点集合的认识，让 layout tag 和 UI tag 共享同一 authoring surface。
3. 更新 validate / sanitize：
   - 明确 layout 节点 allowedChildren
   - 明确哪些 layout props 为零，哪些为受控结构 props
   - 明确 layout 嵌套 UI / layout 的合法组合
4. 再补 renderer 的 layout projection：
   - `stack`
   - `cluster`
   - `split`
   - `switcher`
   - `grid`
   - `frame`
5. 最后才讨论配置层如何给这些 layout primitive 提供 realization；不要让 parser/validate 直接吞数值型实现参数。

主要风险：

- 当前 `parse-agent-html.ts` 只对 `STANDARD_COMPONENT_NAMES` 做标准化，layout 进入后会直接改变解析入口。
- 当前 `validate-agent-html.ts` 强依赖 `allowedChildren`，如果 layout slots/children 边界没有先设计清楚，会让 layout 一接入就触发大量误报。
- 当前 `sanitize-agent-html.ts` 过薄，后续可能需要承担 layout 节点归一化或结构约束整理职责。

设计入口：

- 切片级改动顺序见 `docs/architecture/implementation-slices.md`
- 接近真实 patch 的实施稿见 `docs/architecture/phase-3-implementation-draft.md`

不要做：

- 不把 layout primitive 退化成自由 flex / grid 参数面

验收口径：

- 常见页面结构可以用 layout primitive 诚实表达
- layout 可以嵌套 UI 和 layout
- layout schema 不泄露实现层数值参数
- 至少补一组 parser + validate + renderer 联动样例，而不是只测某一层的字符串输出

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

代码锚点：

- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`

建议执行顺序：

1. 先把 renderer spec 分成两块：
   - UI projection spec
   - layout projection spec
2. 从 `render-node.tsx` 中把历史字段解释逻辑逐步挪出主渲染分支，避免 renderer 继续兼任 contract 解释器。
3. 识别并清理 document-shell 假设：
   - `ahtml-section-stack`
   - `ahtml-prose-block`
   - 写死的 `grid gap-*`
   - preview/grid shell 结构
4. 让 `app.tsx` 中的 gallery / preview / document shell 分别对应配置预览、运行时宿主、artifact 展示，不再混用一套页面骨架。
5. 保留 fallback，但 fallback 只能兜底“缺实现”，不能继续定义公开语义。

主要风险：

- `render-node.tsx` 当前体量大、职责杂，Phase 4 最容易把“拆分职责”做成“再包一层不改变结构”的假重构。
- runtime verification、renderer mapping、heavy CLI tests 三者耦合度高，任何字段改名都可能引起大面积快照/契约波动。

设计入口：

- 切片级改动顺序见 `docs/architecture/implementation-slices.md`
- 接近真实 patch 的实施稿见 `docs/architecture/phase-4-implementation-draft.md`

不要做：

- 不继续强化 runtime-template 的架构中心地位

验收口径：

- renderer 的主要决策来自 schema 和配置层
- layout 结构不再被 document-shell 默认排版强行扭曲
- runtime host 不再隐含“只有文档页”这一前提
- UI projection 和 layout projection 至少在模块边界上已经分开，而不是继续共处一个超大分支函数

### Phase 5: 旧机制下线与收尾

目标：

- 下线旧架构残留，收束成单一路径

主要工作：

- 清理旧语义包装字段的主路径依赖
- 清理仍然依赖旧 public contract 的 renderer / schema 分支
- 清理旧 template 结构假设的残留路径
- 收敛 docs，使目标架构和当前实现差距最小
- 补齐 doctor / test / preview 的最终验证链路

代码锚点：

- `packages/core/src/schema-overlays.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/doctor-checks.mjs`
- `packages/ahtml/src/cli/cli.test.ts`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- `packages\ahtml\src\cli\cli.runtime.heavy.test.ts`

主要风险：

- heavy tests 仍直接使用 `tone`、`kind`、`default` 等旧 authoring 输入，如果不先同步 fixture，收口会被测试重新钉回双轨状态。
- `doctor-checks.mjs` 会把 schema、runtime contract、renderer mapping、runtime surface 一起拉进 parity 链；这里的失败通常不是单点失败。
- `app.tsx` 的 `ahtml-document-shell` / `ahtml-section-stack` / `ahtml-prose-block` 断言还代表旧默认壳结构，不能把它们误当成最终 contract 的自然组成。

设计入口：

- 切片级改动顺序见 `docs/architecture/implementation-slices.md`
- 接近真实 patch 的实施稿见 `docs/architecture/phase-5-implementation-draft.md`

不要做：

- 不保留双轨 public contract

验收口径：

- 公共 contract、schema、prompt、renderer 映射、runtime 表达走同一路径
- `tone`、`default`、`mode`、`kind` 不再作为新增能力入口
- 项目不再维持两套并行公共语义系统
- `schema-overlays.ts` 不再继续承担旧包装字段的主 contract 职责；若仍保留兼容层，其位置和退出条件必须显式可见
- doctor / preview / build 的验证口径与最终 contract 一致，而不是继续接受旧 prompt 形状

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
- 每个阶段的完成声明都应附带真实代码证据：至少包含入口文件、已删除或保留的兼容点、以及对应测试或人工检查口径
