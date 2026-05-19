# Docs Index

`docs/` 是当前项目的工程化解释层与人工导航层。它帮助工程师和 agent 快速判断“先看哪篇、每篇解决什么问题”。顶层架构事实以 `blueprint/` 为准，`docs/` 负责把这些事实展开成更便于实现、维护和排查的问题描述。阅读时先看决策，再看资料。

如果你只想先找到最短阅读路径，请先看 [reading-map.md](./reading-map.md)。

## 快速入口

- 想知道项目目标分层：先看 `architecture/architecture.md`
- 想知道当前代码真实状态：先看 `details/current-contract-audit.md`
- 想知道阶段节奏：先看 `roadmap.md`
- 想知道下一刀怎么开工：先看 `architecture/execution-checklist.md`
- 想知道什么时候才算阶段完成：先看 `architecture/phase-completion-criteria.md`
- 想知道这套资料现在覆盖到什么程度、还缺什么：先看 `coverage-audit.md`

## 推荐阅读顺序

1. [reading-map.md](./reading-map.md)
   压缩导航页：把 `docs/` 分成目标层、现实层、开工层、完工层，并给出三条最短阅读路径。
2. [coverage-audit.md](./coverage-audit.md)
   覆盖审计：把当前目标拆成要求矩阵，说明哪些已经有证据、哪些仍只是部分覆盖，以及当前总判断。
3. [architecture/architecture.md](./architecture/architecture.md)
   项目总分层：配置层、语义使用层、engine、渲染层、runtime host、output、组件事实层。
4. [architecture/schema.md](./architecture/schema.md)
   prop 暴露机制：`blocked` / `raw-candidate`、`ComponentFacts` 到 schema / prompt 的链路、当前公开字段边界。
5. [architecture/phase-2-design.md](./architecture/phase-2-design.md)
   Phase 2 执行设计：怎样拆分内容字段、历史包装字段与原厂 prop 暴露规则，以及首批试点组件怎么选。
6. [architecture/execution-map.md](./architecture/execution-map.md)
   代码级执行图：把各阶段落到关键函数、下游消费者和最窄验证口。
7. [architecture/phase-2-implementation-draft.md](./architecture/phase-2-implementation-draft.md)
   Phase 2 实施草案：把 `Slice 2A/2B` 写到接近真实 patch 设计的粒度，包含类型草案、文件职责和兼容桥边界。
8. [architecture/phase-3-implementation-draft.md](./architecture/phase-3-implementation-draft.md)
   Phase 3 实施草案：把 layout 接入拆到 parser、validator、sanitize、renderer 的真实改动顺序，并标出 `3A/3B/3C` 的停手边界。
9. [architecture/phase-4-implementation-draft.md](./architecture/phase-4-implementation-draft.md)
   Phase 4 实施草案：把 renderer/runtime host 解耦拆成 contract、mapping、projection、shell 四层真实切刀，并标出 `4A/4B/4C` 的验证口。
10. [architecture/phase-5-implementation-draft.md](./architecture/phase-5-implementation-draft.md)
   Phase 5 实施草案：把旧机制下线和最终单路径收口拆成 contract、runtime spec、doctor、heavy tests、docs 的真实收尾顺序。
11. [architecture/implementation-slices.md](./architecture/implementation-slices.md)
   实施切片文档：把 roadmap phase 继续拆成可单独开工、单独停手、单独验收的改动批次。
12. [architecture/execution-checklist.md](./architecture/execution-checklist.md)
   切片级执行检查表：把 `2A-5C` 每刀的入口文件、完成证据、不要混入的问题和最窄 gate 绑在一起。
13. [architecture/slice-execution-template.md](./architecture/slice-execution-template.md)
   执行模板：把单个 `Slice` 压成可直接填写的开工单 / issue 草稿 / PR 描述草稿格式。
14. [architecture/instance-card-coverage-audit.md](./architecture/instance-card-coverage-audit.md)
   实例卡覆盖审计：核对 `implementation-slices.md` 中定义的 `2A-5C` 是否都已有对应执行卡，并明确剩余缺口已经下沉到切片以下的派生资料。
15. [architecture/slice-risk-card-map.md](./architecture/slice-risk-card-map.md)
   风险卡对照表：把 `2A-5C` 每刀与是否需要补读 `tabs` / `accordion` / `table` 等高风险专篇直接绑起来，减少 Phase 4/5 开工歧义。
16. [architecture/slice-artifact-map.md](./architecture/slice-artifact-map.md)
   切片资料地图：把每个 slice 当前已有的执行卡、issue-ready 稿、风险专篇和最短阅读组合放进一张消费表，减少后续交叉查找成本。
17. [architecture/slice-4a-issue-draft.md](./architecture/slice-4a-issue-draft.md)
   `4A` issue-ready 样例：把 legacy bridge 隔离这一刀压成更接近可直接提交的开工单，避免执行者再从执行卡和风险专篇手动拼接。
18. [architecture/slice-4b-issue-draft.md](./architecture/slice-4b-issue-draft.md)
   `4B` issue-ready 样例：把 UI projection / layout projection ownership 拆分这一刀压成更接近可直接提交的开工单，并明确它不是 shell 清理，也不是删旧字段。
19. [architecture/slice-5a-issue-draft.md](./architecture/slice-5a-issue-draft.md)
   `5A` issue-ready 样例：把旧公开 contract 入口下线这一刀压成更接近可直接提交的开工单，并明确它先收 schema/prompt 主路径，不提前混入 runtime spec。
20. [architecture/slice-5b-issue-draft.md](./architecture/slice-5b-issue-draft.md)
   `5B` issue-ready 样例：把 runtime spec 收旧字段这一刀压成更接近可直接提交的开工单，并把“无替代路径时不硬删”写成明确前置条件。
21. [architecture/slice-2b-issue-draft.md](./architecture/slice-2b-issue-draft.md)
   `2B` issue-ready 样例：把 schema 生成闸口切换这一刀压成更接近可直接提交的开工单，并明确它不该提前滑入 `2C` 或 runtime bridge 问题。
22. [architecture/slice-2a-issue-draft.md](./architecture/slice-2a-issue-draft.md)
   `2A` issue-ready 样例：把类型面和职责拆分这一刀压成更接近可直接提交的开工单，并明确它不提前改 generated schema 或公开输出。
23. [architecture/slice-2c-issue-draft.md](./architecture/slice-2c-issue-draft.md)
   `2C` issue-ready 样例：把首批低耦合 prop 试点这一刀压成更接近可直接提交的开工单，并明确它受 `2A/2B` 前置条件约束，不提前扩张到高耦合 bridge。
24. [architecture/slice-3a-issue-draft.md](./architecture/slice-3a-issue-draft.md)
   `3A` issue-ready 样例：把 layout node 注册成正式标准节点这一刀压成更接近可直接提交的开工单，并明确它只先收 schema/public contract，不提前混入 parse 或 runtime。
25. [architecture/slice-3b-issue-draft.md](./architecture/slice-3b-issue-draft.md)
   `3B` issue-ready 样例：把 `stack` / `cluster` 的 parse + validate 打通这一刀压成更接近可直接提交的开工单，并明确它不提前混入 runtime projection 或 shell 问题。
26. [architecture/slice-3c-issue-draft.md](./architecture/slice-3c-issue-draft.md)
   `3C` issue-ready 样例：把复杂 layout 的最小 runtime projection 这一刀压成更接近可直接提交的开工单，并明确它不提前清 shell，也不开放 layout 数值参数。
27. [architecture/slice-4c-issue-draft.md](./architecture/slice-4c-issue-draft.md)
   `4C` issue-ready 样例：把 host shell 边界清理这一刀压成更接近可直接提交的开工单，并明确它不是删旧字段，也不是重新发明 layout。
28. [architecture/slice-5c-issue-draft.md](./architecture/slice-5c-issue-draft.md)
   `5C` issue-ready 样例：把最终 gate 收口这一刀压成更接近可直接提交的开工单，并明确“doctor 还绿”本身不足以证明最终收口完成。
29. [architecture/slice-4a-execution-card.md](./architecture/slice-4a-execution-card.md)
   `4A` 实例执行卡：把 legacy bridge 隔离这一刀压成可直接开工的执行单。
30. [architecture/slice-4b-execution-card.md](./architecture/slice-4b-execution-card.md)
   `4B` 实例执行卡：把 UI projection / layout projection ownership 拆分这一刀压成可执行卡，并明确它不该提前混入 shell 问题。
31. [architecture/slice-4c-execution-card.md](./architecture/slice-4c-execution-card.md)
   `4C` 实例执行卡：把 runtime host / document shell / gallery shell 边界清理这一刀压成可执行卡，并明确它会触碰 template/surface/proof gate。
32. [architecture/slice-2a-execution-card.md](./architecture/slice-2a-execution-card.md)
   `2A` 实例执行卡：把类型面和职责拆分这一刀压成可执行卡，并明确它当前只是把 semantic contract / exposure policy 落位，不提前改公开输出。
33. [architecture/slice-2b-execution-card.md](./architecture/slice-2b-execution-card.md)
   `2B` 实例执行卡：把 schema 生成闸口切换这一刀压成可执行卡，并明确它要先切 props 来源，不提前开放试点 prop。
34. [architecture/slice-2c-execution-card.md](./architecture/slice-2c-execution-card.md)
   `2C` 实例执行卡：把首批低耦合 prop 试点压成可执行卡，并诚实写出它仍受 `2A/2B` 前置条件约束。
35. [architecture/slice-3a-execution-card.md](./architecture/slice-3a-execution-card.md)
   `3A` 实例执行卡：把 layout node 注册成正式标准节点这一刀压成可执行卡，并明确它只先收 schema/public contract，不提前混入 parse 或 runtime。
36. [architecture/slice-3b-execution-card.md](./architecture/slice-3b-execution-card.md)
   `3B` 实例执行卡：把 `stack` / `cluster` 的 parse + validate 打通这一刀压成可执行卡，并明确它不该提前混入 runtime projection 或 shell 问题。
37. [architecture/slice-3c-execution-card.md](./architecture/slice-3c-execution-card.md)
   `3C` 实例执行卡：把复杂 layout 的最小 runtime projection 这一刀压成可执行卡，并明确它只补 layout kind / capability / renderer 最小投影，不提前清 shell。
38. [architecture/slice-5a-execution-card.md](./architecture/slice-5a-execution-card.md)
   `5A` 实例执行卡：把旧公开 contract 入口下线这一刀压成可执行卡，并明确它只先收 schema/prompt 主路径，不在这刀里混入 runtime spec。
39. [architecture/slice-5b-execution-card.md](./architecture/slice-5b-execution-card.md)
   `5B` 实例执行卡：把 runtime spec 旧字段下线这一刀压成可执行卡，并明确 `tabs` / `accordion` / `table` 的真实阻塞点和最窄 gate。
40. [architecture/slice-5c-execution-card.md](./architecture/slice-5c-execution-card.md)
   `5C` 实例执行卡：把 doctor、heavy gates 和执行文档最终收口这一刀压成可执行卡，并明确它仍受 `5A/5B/4C` 完成度约束。
41. [architecture/phase-completion-criteria.md](./architecture/phase-completion-criteria.md)
   阶段完成判据：定义 `Phase 1-5` 各自的最低完成证据、必过 gate，以及哪些证据不足以支持“完成”。
42. [layout.md](./layout.md)
   layout primitive 语义 contract：最小集合、零 props 边界、少量结构 props、配置层职责。
43. [syntax.md](./syntax.md)
   新的 agent-html syntax 方向：让 UI 和 layout 作为并列语义节点进入 authoring surface。
44. [roadmap.md](./roadmap.md)
   新架构落地节奏：按阶段推进 schema、layout、renderer 和 runtime host 与 `blueprint` 收敛。
45. [todo.md](./todo.md)
   当前阶段性待办与零散实施清单：按 roadmap phase 归档的小项、收尾项和验证补项。
46. [components.md](./components.md)
   组件事实总表：家族、exports、slots、variant props、来源。
47. [details/component-details.md](./details/component-details.md)
   更细的实现资料：host elements、显式 props、risky props、依赖。

## 压缩导航

- [reading-map.md](./reading-map.md)
  导航文档。把 `docs/` 压成目标层、现实层、开工层、完工层四层，并给出不同角色的最短阅读路径。

## 架构

- [architecture/architecture.md](./architecture/architecture.md)
  决策文档。对 `blueprint` 中的总分层做工程化展开，说明配置层、语义使用层、渲染层和 runtime host 的职责分工。
- [architecture/schema.md](./architecture/schema.md)
  决策文档。说明原厂 prop 如何被标记状态，并如何影响公开 schema、prompt 和组件配置。
- [architecture/phase-2-design.md](./architecture/phase-2-design.md)
  执行设计文档。说明当前工作树下 Phase 2 的具体改动顺序、兼容桥和首批试点范围。
- [architecture/phase-2-implementation-draft.md](./architecture/phase-2-implementation-draft.md)
  执行设计文档。说明 `Slice 2A/2B` 的类型草案、文件职责重排和迁移顺序。
- [architecture/phase-3-implementation-draft.md](./architecture/phase-3-implementation-draft.md)
  执行设计文档。说明 `Slice 3A/3B/3C` 的真实代码入口、迁移顺序和验证口。
- [architecture/phase-4-implementation-draft.md](./architecture/phase-4-implementation-draft.md)
  执行设计文档。说明 `Slice 4A/4B/4C` 的真实耦合点、迁移顺序和测试闸口。
- [architecture/phase-5-implementation-draft.md](./architecture/phase-5-implementation-draft.md)
  执行设计文档。说明 `Slice 5A/5B/5C` 的真实残留点、下线顺序和最终 gate。
- [architecture/execution-map.md](./architecture/execution-map.md)
  执行设计文档。说明各阶段会碰到的关键函数、下游消费者和最窄验证口。
- [architecture/implementation-slices.md](./architecture/implementation-slices.md)
  执行设计文档。说明每个 phase 建议拆成哪些可单独实施和单独验收的切片。
- [architecture/execution-checklist.md](./architecture/execution-checklist.md)
  执行设计文档。说明 `2A-5C` 每个切片的第一批入口文件、完成证据、不要混入的问题和最窄验证口。
- [architecture/slice-execution-template.md](./architecture/slice-execution-template.md)
  执行设计文档。把单个 `Slice` 压成可直接填写的开工单 / issue 草稿 / PR 描述草稿格式。
- [architecture/instance-card-coverage-audit.md](./architecture/instance-card-coverage-audit.md)
  审计文档。核对 `implementation-slices.md` 中定义的 `2A-5C` 是否都已有实例执行卡，并明确剩余缺口已经下沉到切片以下的派生资料。
- [architecture/slice-risk-card-map.md](./architecture/slice-risk-card-map.md)
  执行辅助文档。把 `2A-5C` 每刀与是否需要补读 `tabs` / `accordion` / `table` 等高风险专篇直接绑起来，减少 Phase 4/5 的开工歧义。
- [architecture/slice-artifact-map.md](./architecture/slice-artifact-map.md)
  执行辅助文档。把每个 slice 当前已有的执行卡、issue-ready 稿、风险专篇和最短阅读组合收成一张消费地图，减少后续交叉查找成本。
- [architecture/slice-4a-issue-draft.md](./architecture/slice-4a-issue-draft.md)
  执行辅助文档。把 `4A` 压成更接近 issue-ready 的开工稿，减少执行者手动拼接执行卡与风险专篇的成本。
- [architecture/slice-4b-issue-draft.md](./architecture/slice-4b-issue-draft.md)
  执行辅助文档。把 `4B` 压成更接近 issue-ready 的开工稿，并明确它的主矛盾是 projection ownership，而不是 shell 清理。
- [architecture/slice-5a-issue-draft.md](./architecture/slice-5a-issue-draft.md)
  执行辅助文档。把 `5A` 压成更接近 issue-ready 的开工稿，并明确它先收主公开 contract，不提前滑进 runtime spec 收口。
- [architecture/slice-5b-issue-draft.md](./architecture/slice-5b-issue-draft.md)
  执行辅助文档。把 `5B` 压成更接近 issue-ready 的开工稿，并把“无替代路径不硬删”固定成显式前置条件。
- [architecture/slice-2b-issue-draft.md](./architecture/slice-2b-issue-draft.md)
  执行辅助文档。把 `2B` 压成更接近 issue-ready 的开工稿，并明确它的主矛盾是“切生成闸口”，不是“提前开放试点 prop”。
- [architecture/slice-2a-issue-draft.md](./architecture/slice-2a-issue-draft.md)
  执行辅助文档。把 `2A` 压成更接近 issue-ready 的开工稿，并明确它的主矛盾是职责拆分，而不是提前改公开输出。
- [architecture/slice-2c-issue-draft.md](./architecture/slice-2c-issue-draft.md)
  执行辅助文档。把 `2C` 压成更接近 issue-ready 的开工稿，并明确它只验证首批低耦合试点，不提前扩张到高耦合 bridge。
- [architecture/slice-3a-issue-draft.md](./architecture/slice-3a-issue-draft.md)
  执行辅助文档。把 `3A` 压成更接近 issue-ready 的开工稿，并明确它只先收 layout 正式 contract，不提前混入 parse 或 runtime。
- [architecture/slice-3b-issue-draft.md](./architecture/slice-3b-issue-draft.md)
  执行辅助文档。把 `3B` 压成更接近 issue-ready 的开工稿，并明确它只打通 `stack` / `cluster` 的 parse + validate。
- [architecture/slice-3c-issue-draft.md](./architecture/slice-3c-issue-draft.md)
  执行辅助文档。把 `3C` 压成更接近 issue-ready 的开工稿，并明确它只补 layout 最小 runtime projection，不提前清 shell。
- [architecture/slice-4c-issue-draft.md](./architecture/slice-4c-issue-draft.md)
  执行辅助文档。把 `4C` 压成更接近 issue-ready 的开工稿，并明确它的主矛盾是 host shell 边界，而不是 contract 下线。
- [architecture/slice-5c-issue-draft.md](./architecture/slice-5c-issue-draft.md)
  执行辅助文档。把 `5C` 压成更接近 issue-ready 的开工稿，并明确“doctor 还绿”本身不足以证明最终 gate 已经收口。
- [architecture/slice-4a-execution-card.md](./architecture/slice-4a-execution-card.md)
  执行设计文档。把 `4A` 继续实例化成可直接开工的执行单。
- [architecture/slice-4b-execution-card.md](./architecture/slice-4b-execution-card.md)
  执行设计文档。把 `4B` 继续实例化成可直接开工的执行单，并明确 UI projection / layout projection 的模块 ownership 仍未自动成立。
- [architecture/slice-4c-execution-card.md](./architecture/slice-4c-execution-card.md)
  执行设计文档。把 `4C` 继续实例化成可直接开工的执行单，并明确 host shell 清理会真实波及 template/surface/proof gate。
- [architecture/slice-2a-execution-card.md](./architecture/slice-2a-execution-card.md)
  执行设计文档。把 `2A` 继续实例化成可执行卡，并明确当前工作树里它已经部分落位，但仍不该提前改 generated schema / public contract 输出。
- [architecture/slice-2b-execution-card.md](./architecture/slice-2b-execution-card.md)
  执行设计文档。把 `2B` 继续实例化成可执行卡，并明确真正的切点在 `generate-component-schema.mjs`，而不是把复杂决策错误堆进 `public-agent-contract.ts`。
- [architecture/slice-2c-execution-card.md](./architecture/slice-2c-execution-card.md)
  执行设计文档。把 `2C` 继续实例化成可执行卡，并明确它当前仍受 `2A/2B` 前置条件约束。
- [architecture/slice-3a-execution-card.md](./architecture/slice-3a-execution-card.md)
  执行设计文档。把 `3A` 继续实例化成可执行卡，并明确 layout 第一批只先进入 schema/public contract，不提前混入 parse、validate 或 runtime 问题。
- [architecture/slice-3b-execution-card.md](./architecture/slice-3b-execution-card.md)
  执行设计文档。把 `3B` 继续实例化成可执行卡，并明确 `stack` / `cluster` 的第一批目标是 parse + validate 站稳，而不是提前混入 runtime projection 或 shell 问题。
- [architecture/slice-3c-execution-card.md](./architecture/slice-3c-execution-card.md)
  执行设计文档。把 `3C` 继续实例化成可执行卡，并明确复杂 layout 的第一批目标是最小 runtime projection 站稳，而不是提前进入 shell 清理或 renderer ownership 大拆分。
- [architecture/slice-5a-execution-card.md](./architecture/slice-5a-execution-card.md)
  执行设计文档。把 `5A` 继续实例化成可直接开工的执行单，并明确旧字段退出主公开面不等于 runtime 已完成收口。
- [architecture/slice-5b-execution-card.md](./architecture/slice-5b-execution-card.md)
  执行设计文档。把 `5B` 继续实例化成可直接开工的执行单，并明确 runtime spec 收口仍受 `tabs` / `accordion` / `table` 替代路径约束。
- [architecture/slice-5c-execution-card.md](./architecture/slice-5c-execution-card.md)
  执行设计文档。把 `5C` 继续实例化成可直接开工的执行单，并明确 doctor / heavy gates / docs 的最终收口仍受 `5A/5B/4C` 约束。
- [architecture/phase-completion-criteria.md](./architecture/phase-completion-criteria.md)
  执行设计文档。说明 `Phase 1-5` 各自的最低完成证据、必过 gate，以及哪些证据不足以支持完成声明。
- [layout.md](./layout.md)
  决策文档。说明 layout primitive 的最小集合、职责边界，以及哪些结构关系留在使用层、哪些实现参数留在配置层。
- [syntax.md](./syntax.md)
  决策文档。说明新的 agent-html syntax 如何同时容纳 UI 和 layout 语义节点。
- [roadmap.md](./roadmap.md)
  执行决策文档。说明当前新架构如何按阶段落地到 schema、layout、renderer 和 runtime host。

## 执行辅助

- [todo.md](./todo.md)
  执行辅助文档。承载按 roadmap phase 分组的当前待办、零散收尾和验证补项，不负责定义架构结论。

## 组件资料

- [components.md](./components.md)
  资料文档。用于盘点 shadcn 组件家族、exports、slots、variant props 和来源，不等于公开 schema。

## 细节资料

- [details/component-details.md](./details/component-details.md)
  资料文档。用于核对底层实现细节和风险暴露面，比如 `className`、`asChild`、host elements 和依赖。
- [details/current-contract-audit.md](./details/current-contract-audit.md)
  审计文档。用于核对当前 public contract 真正从哪里生成、哪些旧字段还在主路径、以及 layout / runtime 的真实缺口。
- [details/current-contract-component-matrix.md](./details/current-contract-component-matrix.md)
  审计文档。用于按组件查看当前公开 props、历史包装字段、hiddenProps 与 runtime bridge 的对应关系。
- [details/high-risk-runtime-bridges.md](./details/high-risk-runtime-bridges.md)
  风险卡文档。用于聚焦 `tabs`、`accordion`、`table` 这些跨过 schema、runtime spec、renderer 和 heavy tests 的旧桥接样本。
- [details/tabs-migration-card.md](./details/tabs-migration-card.md)
  风险卡文档。用于把 `tabs` 的单状态 legacy bridge 拆成 `4A/4B/5A-5C` 的实际执行顺序、停手边界、验证口和覆盖缺口。
- [details/accordion-migration-card.md](./details/accordion-migration-card.md)
  风险卡文档。用于把 `accordion` 这条完整 legacy state bridge 拆成 `4A/4B/5A-5C` 的实际执行顺序、停手边界和验证口。
- [details/table-migration-card.md](./details/table-migration-card.md)
  风险卡文档。用于把 `table` 的结构角色 legacy bridge 拆成 `4A/4B/5A-5C` 的实际执行顺序、停手边界、验证口和覆盖缺口。

## 阅读边界

- `architecture/*` 是决策文档，定义项目想怎么做。
- `blueprint/` 是顶层架构事实来源；`docs/` 负责解释和执行组织。
- `architecture/*` 是决策文档，解释项目按什么方式落地 `blueprint`。
- `layout.md` 与 `architecture/*` 一样属于决策文档，定义 layout primitive contract，而不是实现事实表。
- `todo.md` 是执行辅助文档，不是架构决策文档，也不是事实资料文档。
- `components.md` 和 `details/component-details.md` 是事实资料，帮助查清组件源码和能力边界。
- 资料文档不等于 agent-facing contract；公开 schema 和 prompt 规则以架构文档和实现为准。
