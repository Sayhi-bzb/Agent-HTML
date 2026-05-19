# Phase Completion Criteria

本文不回答“下一刀先改什么”，而是回答另一个同样容易被做虚的问题：

- 每个 phase 到底什么时候才算完成
- 哪些证据足以支持“完成”这个说法
- 哪些证据看起来像进展，但其实还不足以宣称 phase 完成

它和其他执行文档的分工是：

- `docs/roadmap.md`
  - 定义 phase 目标、边界和整体节奏
- `docs/architecture/implementation-slices.md`
  - 定义 phase 内部切片顺序
- `docs/architecture/execution-checklist.md`
  - 定义每刀开工入口、停手边界和最窄 gate
- 本文
  - 定义 phase 完成声明需要的最低证据

## 使用规则

任何 phase 的“完成”都至少要回答四个问题：

1. 当前 phase 的目标行为是否已经体现在真实代码路径里，而不是只体现在文档或草案里。
2. 当前 phase 触及的主链是否已经有对应 gate 证明，而不是只过了旁支测试。
3. 当前 phase 明确要求收紧或退出的旧路径，是否已经不再作为主路径存在。
4. 还没做的下一个 phase 问题，是否仍被清楚地留在下一阶段，而不是混成一个半完成状态。

如果这四个问题里任何一个答不清，就不应宣称 phase 完成。

## 通用不足证据

下面这些单独出现时，都不够证明某个 phase 完成：

- 只有文档更新，没有对应代码主路径变化
- 只有代码重排，没有行为、contract 或 gate 变化
- 只有单个测试通过，但该测试不覆盖本 phase 的主链
- “看起来更干净”或“结构更合理”的主观判断
- 兼容桥还在主路径，但没有显式退出边界
- heavy tests 通过，但上游 schema / parser / runtime contract 的轻量 gate 没验证

## Phase 1 Completion

### 完成定义

`Phase 1` 只负责把当前事实审清、把顶层口径收紧、把后续 phase 的迁移输入固定下来。

### 必须已经为真

- 当前 public contract 主链已经被指认到真实文件，而不是抽象模块名。
- 旧字段 `tone`、`kind`、`mode`、`default` 在主路径中的位置已经被点名。
- runtime shell、renderer spec、schema source 的主要错位已经被具体记录。
- 后续 phases 不再需要先做“当前事实考古”才能开工。

### 最低证据

- `docs/details/current-contract-audit.md`
- `docs/details/current-contract-component-matrix.md`
- `docs/architecture/execution-map.md`
- `docs/roadmap.md`
- `docs/todo.md`

### 允许的验证方式

- 以文档 diff 和人工回读为主
- 不要求跑测试

### 不足以证明完成的情况

- 只写目标架构，不写当前工作树事实
- 仍继续引用当前工作树里不存在的 `spec/` 文件作为主计划入口
- 只说“有 legacy 字段”，但不指出它们在哪条主链上出现

## Phase 2 Completion

### 完成定义

`Phase 2` 完成不等于“加了几个新 props”，而是：

- public schema 的来源已经从混合 overlay 走向 exposure-state 驱动
- prompt 只消费最终公开 schema
- 第一批试点 prop 已在 schema / prompt / runtime 三层贯通
- legacy 字段不再是新增公开能力入口

### 必须已经为真

- `schema-overlays.ts` 不再继续同时承担语义字段、历史包装字段和原厂 prop 暴露规则的唯一来源职责。
- `generate-component-schema.mjs` 已经显式做 resolved exposure decision，而不是 overlay 直抄。
- `createPublicAgentContract()` 输出的 props 来源已经依赖 resolved schema。
- `formatPrompt()` 不再把 legacy field 当默认推荐 authoring 入口。
- 第一批试点仅限低耦合样本，第二批候选仍保持锁住。

### 最低证据

- 代码：
  - `packages/core/src/types.ts`
  - `packages/core/src/schema-overlays.ts`
  - `scripts/generate-component-schema.mjs`
  - `packages/core/src/component-schema.ts`
  - `packages/core/src/public-agent-contract.ts`
  - `packages/ahtml/src/cli/schema.mjs`
- 测试：
  - `packages/core/src/types.test.ts`
  - `packages/core/src/component-schema.test.ts`
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`

### 不足以证明完成的情况

- core 类型拆了，但 CLI prompt 仍默认暴露 legacy field
- schema 看起来正确，但 runtime mapping 还需要靠临时 legacy 解释才能通过
- 一次放开太多 raw-candidate props，无法说明试点范围
- 只过 `cli.test.ts`，但 `component-schema.test.ts` / `public-agent-contract.test.ts` 没证明上游主链已改

## Phase 3 Completion

### 完成定义

`Phase 3` 完成不等于“renderer 里能渲染出一些 wrapper”，而是：

- layout primitive 已进入正式 contract 和 parse/validate 主链
- 最小 layout 集合和复杂 layout 集合都能诚实表达结构关系
- layout schema 没有泄露配置层实现参数
- 至少一组 UI/layout 混合 authoring 已从 parse 走到 runtime projection

### 必须已经为真

- `stack`、`cluster`、`split`、`grid`、`switcher`、`frame` 已进入正式 schema surface。
- parser 已把 layout tag 当标准语义节点处理。
- validator 已按 layout children contract 判定合法性。
- sanitize 如仍保持薄封装，也必须能解释为什么此阶段不需要归一化逻辑。
- runtime 至少已对 layout 做最小 projection，而不再只是 document shell 假支持。

### 最低证据

- 代码：
  - `packages/core/src/component-schema.ts`
  - `packages/core/src/parse/parse-agent-html.ts`
  - `packages/core/src/parse/validate-agent-html.ts`
  - `packages/core/src/parse/sanitize-agent-html.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 测试：
  - `packages/core/src/component-schema.test.ts`
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

### 不足以证明完成的情况

- layout 名字只出现在 renderer mapping，没进 parser / validator 主链
- parser 接受了 layout，但 schema 仍开放 gap、columns、ratio、breakpoint 这类实现参数
- 只有 parse/validate 通过，runtime 仍完全依赖 `app.tsx` 的默认文档壳表达结构
- 只过一个 renderer 测试，但没有 UI/layout 混合 authoring 样例

## Phase 4 Completion

### 完成定义

`Phase 4` 完成不等于“把大文件拆开”，而是：

- legacy bridge 已从主渲染分支隔离
- UI projection 和 layout projection 的 ownership 已成立
- runtime host 不再通过默认 shell 反向定义页面结构
- doctor / runtime parity 仍能证明 schema 到 runtime 的同源链没有断

### 必须已经为真

- `render-node.tsx` 不再同时散落 legacy 翻译、UI projection、layout projection 和 host-like 结构注入。
- `renderer/types.ts` 已不再把 legacy bridge 伪装成普通长期 spec 字段。
- layout projection 有独立模块边界，而不是继续借用 tabs/select/table 的结构 helper。
- `app.tsx` 中 document shell、gallery shell、runtime host 的职责已被区分。
- `doctor-checks.mjs` 仍能证明 runtime contract / mapping / surface parity。

### 最低证据

- 代码：
  - `packages/ahtml/src/config/component-capabilities.mjs`
  - `packages/ahtml/src/config/render-capabilities.mjs`
  - `packages/ahtml/src/config/runtime-contract.mjs`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `packages/ahtml/src/cli/runtime-template/src/app.tsx`
  - `packages/ahtml/src/cli/doctor-checks.mjs`
- 测试：
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`

### 不足以证明完成的情况

- 只是把 `render-node.tsx` 拆成多个文件，但 ownership 仍然混在一起
- legacy bridge 还在主 projection 分支散落判断
- shell class 还在偷偷提供 `ahtml-document-shell` / `ahtml-section-stack` / `ahtml-prose-block` 作为默认结构真相
- 只有 renderer tests 通过，但 `runtime-contract.test.ts` / `runtime-surface.test.ts` 没证明 parity 链还在

## Phase 5 Completion

### 完成定义

`Phase 5` 完成不等于“删掉几个字段”，而是：

- public contract、runtime spec、host shell、doctor、heavy tests、docs 已收成一条最终单路径
- legacy 写法即使还有兼容入口，也已不再作为主路径事实存在

### 必须已经为真

- `tone`、`kind`、`mode`、`default` 不再作为主公开 schema / prompt 的新增入口。
- `kindProp`、`modeProp`、`defaultProp`、`defaultMode` 不再作为主路径 runtime spec 成员。
- `app.tsx` 不再依赖默认文档壳替 authoring surface 提供页面结构。
- `doctor-checks.mjs` 的 parity 口径已经对准最终 contract，而不是“旧桥还活着也算通过”。
- heavy fixtures 和断言已经从 legacy authoring surface 切到最终 authoring surface。
- docs 不再把迁移桥描述成当前有效结构事实。

### 最低证据

- 代码：
  - `packages/core/src/schema-overlays.ts`
  - `packages/core/src/public-agent-contract.ts`
  - `packages/ahtml/src/cli/schema.mjs`
  - `packages/ahtml/src/config/component-capabilities.mjs`
  - `packages/ahtml/src/config/render-capabilities.mjs`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `packages/ahtml/src/cli/runtime-template/src/app.tsx`
  - `packages/ahtml/src/cli/doctor-checks.mjs`
- 测试：
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - 按改动面至少补：
    - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
    - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
    - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`

### 视改动面追加关注

- 如果 gallery preview 或 gallery authoring contract 被碰到，还要看：
  - `packages/ahtml/src/cli/cli.gallery.heavy.test.ts`
  - `packages/ahtml/src/cli/gallery-workflow.test.ts`

### 不足以证明完成的情况

- 只改 docs，不改 doctor / heavy gates
- 只改上游 schema，不改 runtime spec 和 fixtures
- heavy tests 还在直接使用 `tone`、`kind`、`default`
- `ahtml-document-shell` 仍是默认断言，但文档声称 host 已脱模板

## 最后检查

当某个 phase 看起来“差不多完成”时，至少再问一遍：

1. 当前 phase 的主要旧路径，是真的退出主路径了，还是只是被藏起来了。
2. 当前 phase 的最低 gate，是否覆盖了它真正改动的主链。
3. 当前 phase 的下一个问题，是否还清楚地留在下一阶段，而不是已经形成一个解释不清的半迁移状态。

如果其中任何一个答案不够硬，就继续做，不宣称完成。
