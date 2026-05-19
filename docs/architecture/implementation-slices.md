# Implementation Slices

本文把 `docs/roadmap.md` 的 phase 再往下拆成可单独开工、可单独停手、可单独验收的实施切片。

它的定位不是重新定义架构，而是回答三个更实际的问题：

- 下一刀先改哪几个文件
- 这一刀故意不碰什么
- 改完之后用哪一个最窄验证口判断“这一步够了”

使用方式：

- 一次只做一个切片，不把多个切片揉成一次大迁移
- 每个切片都应有明确停手条件
- 如果一个切片需要同时修改 core schema、parse、renderer、runtime shell，通常说明切法过大

## 总体节奏

建议按下面的顺序推进，而不是直接按 `Phase 2 -> Phase 5` 每阶段一次性做完：

1. `2A` 类型面和职责拆分，不改公开行为
2. `2B` schema 生成链切换到 exposure decision，默认仍保持现状
3. `2C` 小范围开放试点 prop
4. `3A` 只把 layout node 注册为正式语义节点
5. `3B` 先打通 `stack` / `cluster`
6. `3C` 再补 `split` / `grid` / `switcher` / `frame`
7. `4A` 把 renderer 里的 legacy bridge 挪出主分支
8. `4B` 把 UI projection 和 layout projection 模块边界拆开
9. `4C` 清理 runtime shell / gallery 混用
10. `5A` 下线旧公开 contract
11. `5B` 下线 runtime spec 中的旧字段
12. `5C` 收尾 docs 和最终 gate

这条顺序的重点是：

- 先收紧上游 contract
- 再引入 layout 语义
- 最后才拆 runtime host 和旧桥接

## 当前状态快照

为了减少接手成本，这里只记录切片级真实进度，不重复长复盘。

- 已完成：
  - `2A`
  - `2B`
  - `2C`
  - `3A`
  - `3B`
  - `3C`
  - `4A`
- 当前正在进行但未完成：
  - `4B`

`4B` 当前停手点：

- 已新增 `packages/ahtml/src/cli/runtime-template/src/renderer/render-layout-node.tsx` 草稿文件。
- `render-layout-node.tsx` 目前还没有接入 `render-node.tsx`。
- `render-ui-node.tsx` 还不存在。
- `render-node.tsx` 仍然保留 UI projection、layout projection、structured child extraction、fallback 和递归调度的主体实现。

因此当前不能宣称：

- `render-node.tsx` 已退回 dispatcher
- UI / layout projection ownership 已成立
- `4B` 已完成

最近一轮 focused 验证已确认通过：

- `packages/core/src/component-schema.test.ts`
- `packages/core/src/public-agent-contract.test.ts`
- `packages/core/src/parse/sanitize-agent-html.test.ts`
- `packages/ahtml/src/cli/cli.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`

## Phase 2 Slices

### Slice 2A: 拆数据模型，不改公开输出

目标：

- 先把“内容字段定义”和“prop 暴露规则”从概念上分开
- 在类型面里找到 `PropExposureState` 的稳定承载位置
- 暂时不改变 CLI schema、prompt、runtime contract 的可见结果

先改这些文件：

- `packages/core/src/types.ts`
- `packages/core/src/schema-overlays.ts`
- 新文件：`packages/core/src/prop-exposure-policy.ts`

故意不碰：

- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/runtime-contract.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`

完成标准：

- 代码中已经能分别表达：
  - 内容字段
  - 结构字段
  - 历史包装字段
  - 原厂 prop 暴露规则
- 但 generated schema 的最终可见输出仍和当前基线一致

停手条件：

- 只要开始改 `public-agent-contract.ts` 的输出形状，就说明已经越过 `2A`

最窄验证口：

- `packages/core/src/types.test.ts`
- `packages/core/src/component-schema.test.ts`

### Slice 2B: 切 schema 生成闸口

目标：

- 让 `generate-component-schema.mjs` 基于 resolved exposure decision 生成 schema
- 让 generated schema 不再只是 overlay 原样透传
- 默认策略仍尽量保持当前公开结果，避免一刀改行为

先改这些文件：

- `scripts/generate-component-schema.mjs`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`

故意不碰：

- 试点 prop 的开放策略
- layout node 接入
- renderer 主逻辑

完成标准：

- schema 生成代码已经明确区分：
  - blocked prop
  - raw-candidate prop
  - legacy public field
- `createPublicAgentContract()` 的 props 来源已经是 resolved schema，而不是 overlay 直接结果

停手条件：

- 如果需要同时修改 `render-node.tsx` 才能让测试通过，先回头确认是不是把试点开放混进了 `2B`

最窄验证口：

- `packages/core/src/component-schema.test.ts`
- `packages/core/src/public-agent-contract.test.ts`

### Slice 2C: 打开第一批试点 prop

目标：

- 只验证最便宜的一批公开候选能否真正贯穿 schema、prompt、runtime

建议只开：

- `alert.variant`
- `badge.variant`

先改这些文件：

- `packages/core/src/prop-exposure-policy.ts`
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`

故意不碰：

- `select.size`
- `switch.size`
- `card.size`（当前证据不足，先不当成已确认候选）
- `tabs`
- `accordion`

完成标准：

- `variant` 出现在 `alert` / `badge` 的 schema 和 prompt 中
- `tone` 仍可兼容解析或渲染，但不再作为新增推荐入口
- `select.size`、`switch.size` 等第二批样本仍保持锁住

停手条件：

- 一旦要动 `tabs.default` 或 `accordion.mode`，说明试点范围已经扩张到 Phase 4 风险区

最窄验证口：

- `packages/ahtml/src/cli/cli.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`

## Phase 3 Slices

### Slice 3A: 先注册 layout node，不做 renderer

目标：

- 先把 layout primitive 变成正式 schema / type surface 成员
- 暂时不追求所有 layout 都已经可渲染

先改这些文件：

- `packages/core/src/types.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`

建议先注册这些名字：

- `stack`
- `cluster`
- `split`
- `grid`
- `switcher`
- `frame`

故意不碰：

- `render-node.tsx`
- `app.tsx`

完成标准：

- layout node 已出现在正式 contract 中
- 但尚未承诺每个节点都完成 runtime projection

停手条件：

- 如果开始为 layout 节点拼 CSS class 或宿主壳结构，已经进入 `3B/3C`

最窄验证口：

- `packages/core/src/component-schema.test.ts`
- `packages/core/src/public-agent-contract.test.ts`

### Slice 3B: 打通 stack / cluster 的 parse + validate

目标：

- 先接最简单的一组 layout primitive
- 用最小 layout 集合验证 parser 和 validator 真的接受 UI/layout 并列 authoring

先改这些文件：

- `packages/core/src/parse/parse-agent-html.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/core/src/parse/sanitize-agent-html.ts`

故意不碰：

- `split`
- `grid`
- `switcher`
- `frame`

完成标准：

- `stack` / `cluster` 可以包裹 UI
- `stack` / `cluster` 也可以互相嵌套
- 当前零 props 边界已通过验证层体现

停手条件：

- 如果开始为 layout 引入比例、gap、breakpoint 等数值参数，说明把配置层问题带进来了

最窄验证口：

- `packages/core/src/parse/sanitize-agent-html.test.ts`
- `packages/ahtml/src/cli/cli.test.ts`

### Slice 3C: 再接复杂 layout projection

目标：

- 在 parse/validate 已站稳后，再引入需要少量结构 props 的 layout primitive

先改这些文件：

- `packages/core/src/component-schema.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

范围限定：

- `split`
- `grid`
- `switcher`
- `frame`

完成标准：

- 这些 layout 节点能表达结构关系
- schema 中不出现比例、列数、gap、max-width 这类实现参数

停手条件：

- 如果需要同时重写 `app.tsx` 的 shell，先停，因为那已经是 Phase 4

最窄验证口：

- `packages/core/src/parse/sanitize-agent-html.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

## Phase 4 Slices

### Slice 4A: 把 legacy bridge 从 render-node 主分支里隔离

目标：

- 先让 `render-node.tsx` 不再一边做 projection，一边做 legacy contract 翻译

先改这些文件：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`

建议拆出的 helper 边界：

- `resolveLegacyVariantLikeProps`
- `resolveLegacyTabsState`
- `resolveLegacyAccordionState`

完成标准：

- legacy 字段解释逻辑已经从主渲染分支抽离成显式 helper
- UI projection 主分支不再散落 `tone` / `mode` / `default` / `kind` 的直接判断

停手条件：

- 如果已经开始拆 `app.tsx` 的 host shell，就超出 `4A`

最窄验证口：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`

### Slice 4B: 拆 UI projection 和 layout projection

目标：

- 在 helper 先抽出后，再把 runtime projection 的模块边界分开

先改这些文件：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 新文件：`packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx`
- 新文件：`packages/ahtml/src/cli/runtime-template/src/renderer/render-layout-node.tsx`

故意不碰：

- `app.tsx`

完成标准：

- UI 节点和 layout 节点至少在模块边界上已经分离
- `render-node.tsx` 退回成分发器，而不是继续承载所有渲染细节

停手条件：

- 如果一个新文件里仍然同时塞满 UI/layout/legacy/fallback 四种逻辑，只是把大文件拆成多个大文件，这一步并没有成功

当前交接备注：

- `4A` 已完成，可以直接从 ownership 分流继续，不需要再回头做 bridge 隔离。
- 当前工作树里只落了 `render-layout-node.tsx` 的未接线草稿，这个文件本身不构成 `4B` 完成证据。
- 真正继续时，应先把 `render-node.tsx` 压成 dispatcher，再补 `render-ui-node.tsx`，最后接入 `render-layout-node.tsx`。

最窄验证口：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`

### Slice 4C: 清 gallery / runtime host / document shell 边界

目标：

- 让 runtime host 不再默认“文档页模板就是唯一宿主形态”

先改这些文件：

- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- `packages/ahtml/src/cli/runtime-template.mjs`
- `packages/ahtml/src/cli/doctor-checks.mjs`

优先清理这些假设：

- `ahtml-document-shell`
- `ahtml-section-stack`
- `ahtml-prose-block`
- preview grid 默认骨架

完成标准：

- gallery 预览结构、runtime host 包装、artifact 展示结构被明确区分
- runtime shell 不再反向定义 layout 语义

停手条件：

- 如果在这里重新发明 layout prop 面，说明把 Phase 3 的责任绕回来了

最窄验证口：

- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`

## Phase 5 Slices

### Slice 5A: 下线旧公开 contract 入口

目标：

- 停止把 legacy public field 当成主公开能力

先改这些文件：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/public-agent-contract.ts`
- `packages/ahtml/src/cli/schema.mjs`

完成标准：

- `tone`、`mode`、`kind`、`default` 不再作为主公开 schema 的新增入口
- 如仍保留兼容层，其位置和退出条件已显式可见

最窄验证口：

- `packages/core/src/public-agent-contract.test.ts`
- `packages/ahtml/src/cli/cli.test.ts`

### Slice 5B: 下线 runtime spec 中的旧字段

目标：

- 收掉 runtime 仍显式携带的 legacy 通道

先改这些文件：

- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/render-capabilities.mjs`

完成标准：

- `kindProp`
- `modeProp`
- `defaultProp`
- `defaultMode`

以上字段不再作为主路径 renderer spec 成员存在。

最窄验证口：

- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`

### Slice 5C: 收尾和最终 gate

目标：

- 把 docs、doctor、preview/build gate 收束成同一条最终 contract 路径

先改这些文件：

- `docs/roadmap.md`
- `docs/todo.md`
- `packages/ahtml/src/cli/doctor-checks.mjs`

完成标准：

- docs 不再描述已经废弃的迁移桥
- doctor / preview / build 的口径与最终 public contract 一致

最窄验证口：

- 最终 diff 自查
- `packages/ahtml/src/cli/runtime-surface.test.ts`
- 再根据改动面决定是否需要 `cli.build.heavy.test.ts` 或 `cli.preview.heavy.test.ts`

## 每个切片开工前都要先问的事

1. 这一刀的主入口是在 core contract、parse、renderer，还是 runtime shell？
2. 这一刀有没有把下一阶段的问题提前混进来？
3. 这一刀的成功证据是某个真实测试，还是只是“代码看起来更干净”？
4. 如果这个切片做完但下一刀还没做，系统是否仍然处于可解释的中间状态？

如果这四个问题答不清，通常不该立即开工，而应先把切片继续缩小。
