# Todo

`todo.md` 负责承载当前阶段性待办与零散实施清单。它和 `roadmap.md` 的分工是：

- `roadmap.md` 负责项目级重构节奏、阶段目标和阶段验收口径
- `todo.md` 负责每个阶段内当前待做的小项、收尾项和验证补项

如果某个事项会改变架构方向，应先更新决策文档，再回到这里记录执行任务。

如果需要看“这一 phase 应按哪几个切片开工、每刀先改哪些文件、做到哪一步该停”，请对照：

- `docs/architecture/implementation-slices.md`
- `docs/architecture/phase-2-implementation-draft.md`
- `docs/architecture/phase-3-implementation-draft.md`
- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/phase-5-implementation-draft.md`

## 使用规则

- 每条 todo 都应归属某个 roadmap phase
- 每条 todo 都应描述一个明确动作，而不是抽象口号
- 优先记录行为级任务，不写文件流水账
- 已完成项可以打勾，但不在这里写长复盘
- 如果任务跨阶段，拆成多个阶段子项，不写成一条巨型任务

## Phase 1 Todo

- [x] 列出当前 public contract 的真实生成链路：`public-agent-contract.ts` -> `component-schema.ts` -> `schema-overlays.ts` -> `schema.mjs`
- [x] 标出 `schema-overlays.ts` 中所有仍属于旧包装 contract 的字段：`tone`、`kind`、`mode`、`default`
- [x] 标出 `component-capabilities.mjs` 和 `render-node.tsx` 中仍直接消费这些旧字段的位置
- [x] 记录 `renderer/types.ts` 里哪些字段已经把旧 contract 写死进 runtime spec：`kindProp`、`modeProp`、`defaultProp`、`defaultMode`
- [x] 盘点 `app.tsx` 中哪些结构属于 gallery 预览，哪些结构属于 document shell，哪些结构只是运行时宿主包装
- [x] 记录当前工作树缺少 `spec/` 目录这一事实，避免后续计划继续引用不存在的文件

## Phase 2 Todo

当前难度判断：`中高`

推荐先后顺序：

- `2A` 先拆类型面和职责，不改公开行为
- `2B` 再切 schema 生成闸口
- `2C` 最后只开最小试点 prop

如果现在准备评估 `2A` 是否能开工，先对照：

- `docs/architecture/slice-2a-execution-card.md`

如果现在准备评估 `2B` 是否能开工，先对照：

- `docs/architecture/slice-2b-execution-card.md`

如果现在准备评估 `2C` 是否能开工，先对照：

- `docs/architecture/slice-2c-execution-card.md`

- [ ] 先按 `docs/architecture/phase-2-design.md` 固定四类概念拆分：内容字段、结构字段、历史包装字段、原厂 prop 暴露规则
- [ ] 把“内容字段定义”和“原厂 prop 暴露规则”从 `schema-overlays.ts` 的同一层对象里拆开
- [ ] 在 core 类型面标出 `PropExposureState` 的实际承载位置，并让 schema 生成消费它
- [ ] 找出 `component-schema.generated.ts` 与手写 overlay 的合流点，确定生成链路应在哪一层做 exposure 过滤
- [ ] 改写 `schema.mjs` 的 prompt 来源，使 prompt 只依赖最终公开 schema
- [ ] 首批试点只选低成本样本：`alert.variant`、`badge.variant`，把 `select.size`、`switch.size` 放到第二批；`card.size` 先降级为待核实假设
- [ ] 补 `cli.test.ts` 场景，覆盖 blocked 名单、锁住的 raw-candidate、放开的 raw-candidate、历史字段冻结

阶段内停手边界：

- `2A` 不应改 `public-agent-contract.ts` 的最终公开输出形状
- `2B` 不应顺手把试点 prop 开放到 runtime
- `2C` 不应扩张到 `tabs.default`、`accordion.mode` 这类高耦合旧字段

## Phase 3 Todo

当前难度判断：`高`

推荐先后顺序：

- `3A` 先把 layout node 注册成正式语义节点
- `3B` 只打通 `stack` / `cluster`
- `3C` 再接 `split` / `grid` / `switcher` / `frame`

如果现在准备评估 `3A` 是否能开工，先对照：

- `docs/architecture/slice-3a-execution-card.md`

如果现在准备评估 `3B` 是否能开工，先对照：

- `docs/architecture/slice-3b-execution-card.md`

如果现在准备评估 `3C` 是否能开工，先对照：

- `docs/architecture/slice-3c-execution-card.md`

- [ ] 把 layout primitive 名单接入标准节点集合，明确它们首先落在哪个 schema/type 文件
- [ ] 标出 `parse-agent-html.ts` 中依赖 `STANDARD_COMPONENT_NAMES` 的入口，确认 layout tag 接入时要改哪些正则和别名逻辑
- [ ] 标出 `validate-agent-html.ts` 中所有依赖 `allowedChildren` 的路径，先设计 layout children contract 再动实现
- [ ] 判断 `sanitize-agent-html.ts` 是否需要新增 layout 归一化步骤，而不是继续只做薄透传
- [ ] 产出一组最小 layout 样例：`stack`/`cluster` 零 props，`split`/`grid`/`switcher`/`frame` 仅结构 props
- [ ] 为 layout 嵌套 UI / layout 增加至少一组 parse + validate + renderer 联动验证样例

阶段内停手边界：

- `3A` 不应先做 renderer projection
- `3B` 不应提前引入 gap / columns / breakpoint 等实现参数
- `3C` 不应顺手清 `app.tsx` 的 document shell

## Phase 4 Todo

当前难度判断：`极高`

推荐先后顺序：

- `4A` 先把 legacy bridge 从 `render-node.tsx` 主分支隔离
- `4B` 再拆 UI projection / layout projection 模块边界
- `4C` 最后清 gallery / runtime host / document shell 混用

如果现在真的开始做 `4A`，先对照：

- `docs/details/tabs-migration-card.md`
- `docs/architecture/slice-4a-execution-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`

如果现在准备评估 `4B` 是否能开工，先对照：

- `docs/architecture/slice-4b-execution-card.md`

如果现在准备评估 `4C` 是否能开工，先对照：

- `docs/architecture/slice-4c-execution-card.md`

- [ ] 从 `render-node.tsx` 中标出 UI projection、layout projection、历史字段解释、fallback 四类逻辑的边界
- [x] 从 `render-node.tsx` 中标出 UI projection、layout projection、历史字段解释、fallback 四类逻辑的边界
- [ ] 标出 `app.tsx` 中所有 document-shell 假设：`ahtml-section-stack`、`ahtml-prose-block`、写死的 `grid gap-*`、preview grid
- [x] 明确 `component-capabilities.mjs` 里哪些 renderer spec 仍在携带旧 contract 字段，哪些已经可以迁到更纯的 projection spec
- [x] 标出 fallback 仍在决定公开语义的分支，而不是只做缺实现兜底
- [ ] 梳理 `gallery` 的配置入口与 runtime host 的执行入口，避免继续共用一套页面结构
- [x] 为 UI projection / layout projection 拆分拟定最小模块边界，避免继续扩张 `render-node.tsx`
- [x] 在真正拆 `render-node.tsx` 之前，先确认 `4A` 已经把 legacy bridge 责任隔离出来；否则 `4B` 只是在搬运未解耦逻辑
- [ ] 在真正清理 shell 前，先确认 layout projection 已足够站稳；否则 `4C` 会把 host 问题和 projection 问题混成一团

当前交接补记：

- `4A` 已完成，focused gates 已通过：
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- `4B` 已经确认目标边界，但当前尚未完成：
  - `render-layout-node.tsx` 已新增草稿
  - `render-ui-node.tsx` 尚未创建
  - `render-node.tsx` 仍未退回 dispatcher
- 因此下一刀应继续 `4B`，而不是提前跳到 `4C`

阶段内停手边界：

- `4A` 不应提前改 `app.tsx`
- `4B` 不应只是把一个大文件切成多个大文件
- `4C` 不应重新发明 layout prop 面

## Phase 5 Todo

当前难度判断：`中`

风险提醒：

- 难点不在字段删除本身，而在 heavy tests、doctor 和 runtime parity 还在保护旧路径

推荐先后顺序：

- `5A` 先下线旧公开 contract 入口
- `5B` 再下线 runtime spec 里的旧字段
- `5C` 最后收 docs、doctor 和 heavy gates

如果现在准备评估 `5A` 是否能开工，先对照：

- `docs/architecture/slice-5a-execution-card.md`

如果现在准备评估 `5B` 是否能开工，先对照：

- `docs/architecture/slice-5b-execution-card.md`

如果现在准备评估 `5C` 是否能开工，先对照：

- `docs/architecture/slice-5c-execution-card.md`

- [ ] 清理 `schema-overlays.ts` 中仍作为主路径存在的旧包装字段定义，必要时只保留显式兼容层
- [ ] 清理 `component-capabilities.mjs`、`renderer/types.ts`、`render-node.tsx` 中仍残留的 `kind` / `mode` / `default` 主路径依赖
- [ ] 检查是否仍同时维护“旧公开 contract”和“新 exposure-state contract”两套 schema 入口
- [ ] 补齐 doctor / build / preview / runtime heavy tests 对最终 contract 的覆盖缺口
- [ ] 回写 docs，确保 `roadmap.md`、`schema.md`、`layout.md`、`syntax.md` 只描述当前仍有效的迁移路径
- [ ] 在真正删除 runtime spec 旧字段前，先确认 `tabs` / `accordion` / `table` 的替代路径和 focused 测试保护是否已经存在；没有就停在阻塞记录，不硬删
- [ ] 在回写完成声明前，先把 heavy build fixtures、preview 断言、doctor/parity gate 一起切到最终口径；不能只改其中一层
- [ ] 在真正动 runtime spec 之前，先把 `tone` / `kind` / `mode` / `default` 从主公开 schema/prompt 入口降成显式兼容层；否则 `5B` 和 `5C` 都会继续被上游双轨 contract 拖住

阶段内停手边界：

- `5A` 不应直接去改 runtime shell
- `5B` 不能在没有替代路径时硬删 tabs / accordion / table 所依赖的旧桥接
- `5C` 不能只改 docs 而不证明最终 gate
