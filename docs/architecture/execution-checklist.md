# Execution Checklist

本文不是再解释架构原则，也不是重复 `execution-map.md` 的代码链路图。

它只回答一个更直接的问题：

- 如果今天真的开始做下一刀，应先碰哪些文件
- 这一刀必须证明什么
- 这一刀故意不解决什么
- 用哪个最窄 gate 判断“现在可以停手了”

推荐和以下文档配合使用：

- `docs/roadmap.md`
  - 看 phase 目标、阶段边界和整体难度
- `docs/architecture/implementation-slices.md`
  - 看切片顺序
- `docs/architecture/execution-map.md`
  - 看代码链路和下游影响面
- `docs/architecture/phase-2-implementation-draft.md`
- `docs/architecture/phase-3-implementation-draft.md`
- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/phase-5-implementation-draft.md`

## 使用方式

每次只拿一个切片开工，并按下面顺序自查：

1. 先确认当前这一刀的主入口属于哪条链：
   - public contract
   - parse / validate / sanitize
   - renderer / runtime host
2. 只改当前切片列出的第一批入口文件，不先铺开到下一阶段。
3. 只跑当前切片列出的最窄 gate，不先上 heavy tests。
4. 如果为了让当前 gate 通过，不得不大量改下游壳结构或高耦合 legacy bridge，先停，说明切片切大了。

## 切片总表

| Slice | Primary entry | Must prove | Do not mix yet | Narrowest gate |
|---|---|---|---|---|
| `2A` | `types.ts`, `schema-overlays.ts` | 类型面和职责已拆，但公开输出未变 | prompt/runtime 改造 | `types.test.ts`, `component-schema.test.ts` |
| `2B` | `generate-component-schema.mjs`, `component-schema.ts`, `public-agent-contract.ts` | schema 来源切到 resolved exposure decision | 试点 prop 开放 | `component-schema.test.ts`, `public-agent-contract.test.ts` |
| `2C` | `prop-exposure-policy.ts`, `schema.mjs`, `component-capabilities.mjs` | 最小试点 prop 贯通 schema/prompt/runtime | tabs/accordion/table 旧状态字段收口 | `cli.test.ts`, `runtime-contract.test.ts`, `render-capabilities.test.ts` |
| `3A` | `component-schema.ts` | layout node 成为正式语义节点 | runtime projection | `component-schema.test.ts`, `public-agent-contract.test.ts` |
| `3B` | `parse-agent-html.ts`, `validate-agent-html.ts` | `stack` / `cluster` 被 parse + validate 正式接受 | gap/columns/breakpoint 数值参数 | `sanitize-agent-html.test.ts`, `cli.test.ts` |
| `3C` | `validate-agent-html.ts`, `renderer/types.ts`, `render-node.tsx` | 复杂 layout 节点最小可投影 | `app.tsx` shell 清理 | `sanitize-agent-html.test.ts`, `render-node.test.ts` |
| `4A` | `render-node.tsx`, `renderer/types.ts`, `component-capabilities.mjs` | legacy bridge 从主渲染分支隔离 | app shell 拆分 | `render-node.test.ts`, `render-capabilities.test.ts` |
| `4B` | `render-node.tsx`, `render-ui-node.tsx`, `render-layout-node.tsx` | UI/layout projection 模块边界成立 | gallery/runtime shell 清理 | `render-node.test.ts`, `runtime-contract.test.ts` |
| `4C` | `app.tsx`, `runtime-template.mjs`, `doctor-checks.mjs` | runtime host 不再替 authoring surface 提供默认页面骨架 | 新 layout prop 面设计 | `runtime-template.test.ts`, `runtime-surface.test.ts` |
| `5A` | `schema-overlays.ts`, `public-agent-contract.ts`, `schema.mjs` | legacy field 退出主公开 contract | runtime spec 和 shell 收尾 | `public-agent-contract.test.ts`, `cli.test.ts` |
| `5B` | `component-capabilities.mjs`, `renderer/types.ts`, `render-capabilities.mjs` | runtime spec 不再把旧字段当主路径成员 | docs/heavy gate 收尾 | `render-capabilities.test.ts`, `runtime-contract.test.ts`, `render-node.test.ts` |
| `5C` | `doctor-checks.mjs`, heavy tests, docs | docs/doctor/heavy gates 与最终单路径一致 | 新架构追加设计 | `runtime-template.test.ts`, `runtime-surface.test.ts`, 必要 heavy gates |

## Slice Checklists

### `2A` 类型面和职责拆分

开工前确认：

- 当前目标只是把“语义字段”和“prop 暴露规则”拆开。
- 当前不应改变 `PublicAgentContract` 的最终外观。

先改这些文件：

- `packages/core/src/types.ts`
- `packages/core/src/schema-overlays.ts`
- 新文件：`packages/core/src/prop-exposure-policy.ts`

必须证明：

- 代码里已经能分别表达：
  - 内容字段
  - 结构字段
  - 历史包装字段
  - 原厂 prop 暴露规则
- generated schema 结果仍与当前基线一致

不要混进来：

- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/runtime-contract.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`

完成证据：

- `ComponentSchemaOverlay` 不再是唯一 schema source 概念
- 新的 policy 类型和 contract 类型已落位，但没有强迫 CLI/runtime 改断言

最窄 gate：

- `packages/core/src/types.test.ts`
- `packages/core/src/component-schema.test.ts`

停手信号：

- 如果要改 `public-agent-contract.ts` 的输出形状，说明已经进入 `2B`

### `2B` schema 生成闸口切换

开工前确认：

- 当前目标是把 schema 生成从 overlay 直抄切到 resolved exposure decision。
- 当前默认公开结果仍应尽量保持现状。

先改这些文件：

- `scripts/generate-component-schema.mjs`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`

必须证明：

- generated schema 已明确区分：
  - semantic props
  - blocked props
  - raw-candidate props
  - legacy public fields
- `createPublicAgentContract()` 的 props 来源已经不再只是 overlay 直抄

不要混进来：

- `alert.variant` / `badge.variant` 正式开放
- `select.size` / `switch.size` 试点
- runtime renderer 行为补丁

完成证据：

- core 层可以在不修改 CLI prompt 断言的前提下证明 schema 来源已切换

最窄 gate：

- `packages/core/src/component-schema.test.ts`
- `packages/core/src/public-agent-contract.test.ts`

停手信号：

- 如果 `cli.test.ts` 需要因 prop 可见性变化而改断言，说明已经进入 `2C`

### `2C` 最小试点 prop 贯通

开工前确认：

- 当前只验证最小试点能贯穿 schema、prompt、runtime。
- 当前不扩张到高耦合旧字段。

先改这些文件：

- `packages/core/src/prop-exposure-policy.ts`
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`

建议试点：

- `alert.variant`
- `badge.variant`

必须证明：

- `variant` 已出现在对应组件的 schema 和 prompt 中
- runtime mapping 已能解释这些新公开 prop
- `tone` 仍可兼容，但不再是新增推荐入口

不要混进来：

- `tabs.default`
- `accordion.mode`
- `row.kind`
- `select.size`
- `switch.size`
- `card.size`

完成证据：

- prompt、schema、runtime 三层都已接受首批试点
- 第二批候选仍保持锁住

最窄 gate：

- `packages/ahtml/src/cli/cli.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`

停手信号：

- 如果需要改 `tabs` / `accordion` / `table` 的 state bridge，说明范围已经漂到 `Phase 4`

### `3A` layout node 注册

开工前确认：

- 当前只把 layout primitive 拉进正式 contract。
- 当前不承诺 runtime 已能投影这些节点。

先改这些文件：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`

建议先注册：

- `stack`
- `cluster`
- `split`
- `grid`
- `switcher`
- `frame`

必须证明：

- layout 名字已进入 `STANDARD_COMPONENT_NAMES`
- `getComponentSchema()` 已能返回这些节点的 schema
- schema props 不泄露 gap / ratio / columns / breakpoint 这类实现参数

不要混进来：

- `render-node.tsx`
- `app.tsx`

完成证据：

- layout 已成为正式 authoring surface 成员，而不是 runtime 私货

最窄 gate：

- `packages/core/src/component-schema.test.ts`
- `packages/core/src/public-agent-contract.test.ts`

停手信号：

- 如果开始为 layout 节点写 projection 或 CSS wrapper，说明已经进入 `3B/3C`

### `3B` `stack` / `cluster` parse + validate 打通

开工前确认：

- 当前目标只证明 UI/layout 并列 authoring 先在最小 layout 集合上成立。
- 当前不把配置层参数面带进 schema。

先改这些文件：

- `packages/core/src/parse/parse-agent-html.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- 视需要再碰 `packages/core/src/parse/sanitize-agent-html.ts`

必须证明：

- `stack` / `cluster` 能包裹 UI
- `stack` / `cluster` 能互相嵌套
- `page` 已允许最小 layout 入口
- `stack` / `cluster` 仍保持零 props 边界

不要混进来：

- `split`
- `grid`
- `switcher`
- `frame`
- gap / columns / breakpoint / ratio 数值参数

完成证据：

- parse/validate 已经把 layout 当正式节点处理
- 非法实现参数会被拒绝，而不是被忽略

最窄 gate：

- `packages/core/src/parse/sanitize-agent-html.test.ts`
- `packages/ahtml/src/cli/cli.test.ts`

停手信号：

- 如果要为 layout 节点加 runtime projection 或 host shell 补丁，说明已经进入 `3C/4`

### `3C` 复杂 layout 最小投影

开工前确认：

- parse/validate 已经站稳。
- 当前只给复杂 layout 补最小 projection，不清 runtime shell。

先改这些文件：

- `packages/core/src/component-schema.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/config/component-capabilities.mjs`

范围限定：

- `split`
- `grid`
- `switcher`
- `frame`

必须证明：

- 这些节点能表达结构关系
- schema 不开放列数、比例、gap、max-width 之类实现参数
- runtime 已能做最小 layout projection

不要混进来：

- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- 默认文档壳清理

完成证据：

- layout 节点已不是“能 parse 但不能 render”的假支持

最窄 gate：

- `packages/core/src/parse/sanitize-agent-html.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

停手信号：

- 如果开始大量改 `app.tsx` shared shell CSS，说明已经进入 `Phase 4`

### `4A` legacy bridge 从主渲染分支隔离

开工前确认：

- 当前不是删 legacy 字段，而是先把 legacy 解释责任抽离。
- 主渲染分支不应继续散落 `tone` / `kind` / `mode` / `default` 判断。

先改这些文件：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`

必须证明：

- variant-like、state-like、structural-role 三类 legacy bridge 已被显式分组
- `render-node.tsx` 主分支不再直接承担这些翻译

不要混进来：

- `app.tsx`
- UI/layout projection 模块拆分

完成证据：

- legacy bridge 还存在，但它已经是可定位、可删的显式层

最窄 gate：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`

停手信号：

- 如果开始拆 gallery/runtime shell，说明已经进入 `4C`

当前状态：

- 这一步已经完成。
- 当前工作树中，legacy bridge 已按以下三类显式分组：
  - variant-like
  - state-like
  - structural-role
- focused gate 已跑过并通过：
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`

### `4B` UI / layout projection 分流

开工前确认：

- legacy bridge 已经不再散落在主渲染分支。
- 当前目标是 ownership 分离，不是物理切文件交差。

先改这些文件：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 新文件：`packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx`
- 新文件：`packages/ahtml/src/cli/runtime-template/src/renderer/render-layout-node.tsx`

必须证明：

- `render-node.tsx` 已退回 dispatcher
- UI 节点和 layout 节点已在模块边界上分离
- layout projection 不再复用以 tabs/select/table 为中心设计的 helper

不要混进来：

- `app.tsx`
- gallery 预览骨架重排

完成证据：

- 这一步即使不改 shell，也能单独解释 runtime projection 的 ownership

最窄 gate：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`

停手信号：

- 如果拆完后只是从一个超大文件变成多个超大文件，这一步不算完成

当前状态：

- 这一步未完成。
- 当前工作树只新增了 `packages/ahtml/src/cli/runtime-template/src/renderer/render-layout-node.tsx` 草稿。
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx` 还不存在。
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx` 仍保留大量 UI / layout / fallback / structured child extraction 细节，所以还不能算 dispatcher。

给下一个开发者的直接入口：

1. 先让 `render-node.tsx` 只保留：
   - text node 渲染
   - spec 查找
   - UI / layout 分发
2. 把现有 UI projection 连同 structured slot extraction 和 fallback 一起迁入 `render-ui-node.tsx`
3. 让 `render-layout-node.tsx` 只承接 layout kinds，并避免继续复用以 `tabs` / `select` / `table` 为中心的 UI helper

### `4C` runtime host / document shell / gallery 边界清理

开工前确认：

- layout projection 已经站稳。
- 当前才轮到清 shared shell 对页面结构的默认定义。

先改这些文件：

- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- `packages/ahtml/src/cli/runtime-template.mjs`
- `packages/ahtml/src/cli/doctor-checks.mjs`

优先清理：

- `ahtml-document-shell`
- `ahtml-section-stack`
- `ahtml-prose-block`
- preview grid 默认骨架

必须证明：

- gallery 预览结构、runtime host 包装、artifact 展示结构已经区分
- runtime host 不再反向定义 layout 语义

不要混进来：

- 新 layout prop 面
- 新语义节点设计

完成证据：

- 没有 layout 的情况下，host 不再偷偷补一套文档型页面骨架

最窄 gate：

- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`

停手信号：

- 如果为了维持页面外观而重新把 shell 当主语义层，这一步等于回滚目标

### `5A` 下线旧公开 contract 入口

开工前确认：

- 当前先收紧上游 contract，不先碰 runtime shell。
- 兼容字段如果还保留，必须显式，不再默认公开。

先改这些文件：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/public-agent-contract.ts`
- `packages/ahtml/src/cli/schema.mjs`

必须证明：

- `tone`
- `kind`
- `mode`
- `default`

以上字段不再作为主公开 schema / prompt 的新增入口

不要混进来：

- runtime spec 删除
- app shell 收尾

完成证据：

- CLI schema 和 prompt 已从“默认推荐 legacy 写法”切到最终公开写法

最窄 gate：

- `packages/core/src/public-agent-contract.test.ts`
- `packages/ahtml/src/cli/cli.test.ts`

停手信号：

- 如果开始大改 `render-node.tsx` 或 `app.tsx`，说明已经混进 `5B/5C`

### `5B` 下线 runtime spec 里的旧字段

开工前确认：

- 替代路径已经在 `Phase 2/3/4` 建好。
- 当前可以开始收类型面和 mapping 主路径。

先改这些文件：

- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/render-capabilities.mjs`
- 视需要改 `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

必须证明：

- `kindProp`
- `modeProp`
- `defaultProp`
- `defaultMode`

不再作为主路径 renderer spec 成员存在

不要混进来：

- docs 收尾
- doctor/heavy gate 最终回写

完成证据：

- runtime 的稳定形状已经与最终公开 contract 对齐

最窄 gate：

- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

停手信号：

- 如果 table / tabs / accordion 仍无替代路径却被硬删，这一步不算完成

### `5C` 最终收口

开工前确认：

- schema、parse、renderer、runtime host 的主路径已经成形。
- 当前任务是把 docs、doctor、heavy gates 改成证明最终单路径，而不是继续保护旧路径。

先改这些文件：

- `packages/ahtml/src/cli/doctor-checks.mjs`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- `docs/roadmap.md`
- `docs/todo.md`
- 必要时 `docs/schema.md`、`docs/layout.md`、`docs/syntax.md`

必须证明：

- doctor / preview / build / runtime heavy gates 的验证口径已经对准最终 contract
- heavy fixtures 不再把 legacy authoring surface 当“当前正确输入”
- docs 不再把迁移桥写成长期结构事实

不要混进来：

- 新功能
- 新架构追加设计

完成证据：

- 项目只剩一条可解释的公共语义主路径
- 代码、docs、doctor、heavy tests 不再各说各话

最窄 gate：

- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`
- 再按改动面补：
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`

停手信号：

- 如果这里只改 docs，不改 doctor/heavy gates，就不能宣称收口完成
