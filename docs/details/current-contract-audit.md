# Current Contract Audit

本文记录当前工作树里 agent-html 公共 contract、schema 生成链路、runtime 消费点和 layout/runtime shell 状态的**当前事实**。

它不定义新架构目标；它的作用是给 `docs/roadmap.md`、`docs/architecture/schema.md` 和 `docs/architecture/phase-completion-criteria.md` 提供可追踪到代码的现状证据。

## 范围

本审计只覆盖当前工作树中的这些入口：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`
- `packages/core/src/parse/parse-agent-html.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/core/src/parse/sanitize-agent-html.ts`
- `scripts/generate-component-schema.mjs`
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`
- `packages/ahtml/src/config/runtime-contract.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-layout-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`

## 结论概览

- 当前公开 schema / prompt 的真实上游已经不再直接暴露 `tone`、`kind`、`mode`、`default` 这类 legacy 字段。
- `schema-overlays.ts` 里仍保留 legacy 语义字段定义，但它们当前属于显式兼容语义层，不再等于主公开 contract。
- runtime spec 顶层已经不再正式承认 `kindProp`、`modeProp`、`defaultProp`、`defaultMode`；兼容桥当前通过 `legacyBridges` 和 `behavior.stateBridge` 保留。
- parser / validate / sanitize 已经正式接受 layout primitive；layout 不再只是文档目标。
- runtime renderer 已完成 dispatcher / UI projection / layout projection 分层。
- runtime host、document artifact shell、gallery shell 已拆开；`ahtml-document-shell` 仍存在，但当前是 artifact shell，而不是 host 默认页面骨架真相。

## 1. 当前 schema 的真实生成链路

当前链路是：

```txt
schema-overlays.ts
  -> COMPONENT_SEMANTIC_CONTRACTS
  -> scripts/generate-component-schema.mjs
  -> generated/component-schema.generated.ts
  -> component-schema.ts
  -> public-agent-contract.ts
  -> ahtml cli schema.mjs
```

关键事实：

- `scripts/generate-component-schema.mjs`
  - 当前会同时读取：
    - `COMPONENT_SEMANTIC_CONTRACTS`
    - `prop-exposure-policy.ts`
    - shadcn introspection
  - 生成结果已经带：
    - `semanticProps`
    - `legacyPublicProps`
    - `rawCandidateProps`
    - `exposedRawProps`
    - `blockedPropNames`
- `packages/core/src/component-schema.ts`
  - `RESOLVED_STANDARD_COMPONENT_SCHEMAS` 直接消费 generated resolved schemas
  - `STANDARD_COMPONENT_SCHEMAS` 仍保留“完整 agent-facing schema”视角，因此会同时看到：
    - legacy semantic props
    - opened raw candidate props
- `packages/core/src/public-agent-contract.ts`
  - 公开主路径不再直接透传 `STANDARD_COMPONENT_SCHEMAS`
  - 当前会过滤：
    - `origin === "legacy"` 的 semantic props
    - 被 opened raw candidate 替代掉的 legacy 包装 prop
- `packages/ahtml/src/cli/schema.mjs`
  - prompt 直接消费 `createPublicAgentContract()`
  - 当前 prompt 已不再把 `tone` / `kind` / `mode` / `default` 当公开主入口

阶段含义：

- `Phase 2` 的主链切换已经完成。
- 当前不能再把“公开 contract 仍直接来自 overlay 原始 props”写成现状。

## 2. 当前公开 contract 与兼容语义层已经分开

`schema-overlays.ts` 里仍保留这些 legacy 语义字段定义：

- `alert.tone`
- `badge.tone`
- `row.kind`
- `tabs.default`
- `accordion.mode`
- `accordion.default`

但当前代码真相已经是：

- `packages/core/src/public-agent-contract.test.ts`
  - `alert` 公开 props 为 `title`, `variant`
  - `badge` 公开 props 为 `variant`
  - `row` / `tabs` / `accordion` 公开 props 当前都为空
- `packages/ahtml/src/cli/cli.test.ts`
  - prompt 明确不再输出：
    - `alert(title? tone?`
    - `badge(tone?`
    - `tabs(default?`
    - `row(kind?`
    - `accordion(mode?`

因此更准确的表述应是：

- legacy 语义字段仍保留在 resolved semantic layer / compatibility layer
- 但它们已经退出主公开 contract / prompt 主路径

阶段含义：

- `Phase 5A` 已完成“主公开 contract 收口”
- 当前仍可继续保留 compatibility bridge，不等于双轨公开 contract 仍在主路径

## 3. 当前仍同时保留两类 core 视图

当前 core 有两种不同用途的 schema 视图：

- `STANDARD_COMPONENT_SCHEMAS`
  - 面向 parse / validate / sanitize 的完整 agent-facing schema
  - 当前仍会看到 legacy semantic props 与 opened raw candidates 并存
- `createPublicAgentContract()`
  - 面向 CLI schema / prompt 的最终公开 contract
  - 当前会过滤掉 legacy semantic props，只保留最终公开字段

这不是“旧公开 contract 和新公开 contract 并存”，而是：

- 一个完整 authoring validation surface
- 一个最终 agent-facing public contract

阶段含义：

- 当前若继续审计“是否仍维护两套公开 contract”，应回答：
  - **主公开 contract 没有双轨**
  - 但 parse/validate 仍保留显式兼容 authoring surface

## 4. runtime compatibility bridge 仍保留，但主 runtime spec 已收紧

`packages/ahtml/src/config/component-capabilities.mjs` 当前仍明确保留 compatibility bridge：

- `alert` / `badge`
  - `legacyBridges.variant`
- `table`
  - `legacyBridges.structuralRole`
- `tabs`
  - `legacyBridges.state`
- `accordion`
  - `legacyBridges.state`
  - `behavior.stateBridge = "accordion-state"`

`packages/ahtml/src/cli/runtime-template/src/renderer/types.ts` 当前的主 spec 形状已经是：

- `RendererSpecComponent`
  - 不再顶层声明 `kindProp` / `modeProp` / `defaultProp` / `defaultMode`
  - 统一通过 `legacyBridges` 保存兼容桥
- `RuntimeVerificationState.behavior`
  - 不再直接保存 `modeProp/defaultProp/defaultMode`
  - 改成显式 `stateBridge`

`packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx` 当前负责兼容桥解释：

- `resolveTabsLegacyDefaultValue()`
- `resolveAccordionLegacyState()`
- `partitionTableRowsByLegacyRole()`
- `getLegacyVariantPropMappings()`

阶段含义：

- `Phase 5B` 已完成“runtime spec 顶层主路径收口”
- 当前 legacy bridge 仍深入运行时行为，但它们已经是显式兼容层，而不是顶层正式 spec 成员

## 5. parser / validate / sanitize 已经接受 layout primitive

当前 parser / validate / sanitize 的事实与早期审计已不同：

- `packages/core/src/parse/parse-agent-html.ts`
  - 仍只围绕 `STANDARD_COMPONENT_NAMES` 识别节点
  - 但 `STANDARD_COMPONENT_NAMES` 当前已经包含：
    - `stack`
    - `cluster`
    - `split`
    - `grid`
    - `switcher`
    - `frame`
- `packages/core/src/parse/validate-agent-html.ts`
  - 当前继续依赖 `ComponentSchema.allowedChildren`
  - layout primitive 已能作为正式节点被 validate 接受
- `packages/core/src/parse/sanitize-agent-html.ts`
  - 仍是薄封装
  - 但不再意味着“layout 仍停留在文档目标阶段”

阶段含义：

- `Phase 3` 已完成“layout primitive 进入正式 surface 并打通 parse/validate/runtime 最小投影”
- 当前剩余问题不再是“layout 是否存在”，而是后续是否还需要更强的结构归一化与测试覆盖

## 6. renderer 已完成 ownership 分层

当前 renderer 不再是单文件集中实现：

- `render-node.tsx`
  - 负责 dispatcher、文本渲染、路径/元数据/children 通用逻辑
- `render-ui-node.tsx`
  - 负责 UI projection、compatibility bridge、fallback、structured slot/state logic
- `render-layout-node.tsx`
  - 负责 layout projection

阶段含义：

- `Phase 4B` 已完成
- 当前不能再把“render-node.tsx 仍集中承载 UI/layout/fallback 全部分支”写成现状

## 7. runtime host / document shell / gallery shell 的当前关系

`packages/ahtml/src/cli/runtime-template/src/app.tsx` 当前的真实边界是：

- `DocumentArtifactShell`
  - 仍输出 `ahtml-document-shell`
  - 但它当前是 artifact/document shell
- runtime host 样式
  - 由 `createRuntimeHostCss()` 提供
- gallery shell
  - 由 `createGalleryShellCss()` 与 gallery preview surface 负责

当前最准确的判断不是“document shell 已消失”，而是：

- `ahtml-document-shell` 仍存在
- 但它不再是 host 默认补出来的页面结构真相
- `cli.build.heavy.test.ts` / `cli.preview.heavy.test.ts` 当前主宿主断言已经切到：
  - `class="ahtml-runtime-host ahtml-runtime-document"`

阶段含义：

- `Phase 4C` 已完成“host/document/gallery shell 分层”
- `Phase 5C` 已完成“heavy gate 不再把 `ahtml-document-shell` 当宿主主断言”

## 8. 当前工作树的额外事实

- 仓库根目录当前没有 `spec/` 目录，因此任何依赖 `spec/map.md` 或 `spec/roadmap.md` 的执行计划都无法直接在这份工作树里核验。
- 当前 `.git/index.lock` 不存在，`git status` 已可正常使用。

这些事实不改变架构方向，但会影响执行节奏和验证方式。

## 9. 当前 gate 证据

当前 `Phase 5` 最关键的 gate 已经至少拿到下面这些直接证据：

- focused gates
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/gallery-workflow.test.ts`
  - 最近实跑均通过
- heavy gates
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.gallery.heavy.test.ts`
  - 当前轮全文件已直接通过
- doctor 成功路径
  - `runs managed runtime doctor checks`
  - `prints machine-readable doctor reports for app integrations`
- doctor 漂移失败路径
  - `fails doctor when runtime capabilities drift from schema`
  - `fails doctor when runtime renderer mapping drifts from schema`

这些证据当前能直接支持的判断是：

- `doctor-checks.mjs` 不只是“能跑”，而且会对 verification data parity、renderer mapping parity、renderer registry parity 做真实失败保护
- `runtime-template.test.ts` 和 `runtime-surface.test.ts` 仍在保护模板、runtime surface、doctor 输出与 contract 的同源链
- heavy build / preview / runtime gates 当前已经切到最终 authoring / host 口径，不再把 `tone`、`kind`、`default` 或 `ahtml-document-shell` 当主断言

这些证据当前已经足够支持：

- `Phase 5` 正式完成
- `docs/phase-5-completion-proof.md` 从“最后一轮审计”转为“完成证明”
- 后续剩余工作只再属于测试组织和脚本整理，不再属于主线 contract/runtime 收口

## 10. 对各阶段的直接影响

### Phase 1

`Phase 1` 的事实审计工作已经不再是当前主线；它的结论已下沉到：

- 当前公开 contract 与兼容语义层分离
- 当前 renderer/runtime host 已有明确分层

### Phase 2

`Phase 2` 的主链切换已完成。当前更值得盯住的是：

- 是否还有文档仍把 legacy 字段误写成“当前公开主路径”

### Phase 3

layout 已进入正式公共能力。当前不应再把“layout 仍停留在文档目标阶段”写成现状。

### Phase 4

runtime 解耦的核心实现已完成；当前遗留主要是文档与总验收，而不是 renderer ownership 本身。

### Phase 5

`Phase 5` 当前已经完成。后续最值得继续推进的是：

- CLI tests / helpers 的重复收口
- 测试命名与职责边界的后续整理
- 仅在未来需要真实压缩 compat bridge 时，再开启新的实现阶段

## 推荐下一步

如果继续沿这条线推进，最值得优先做的是：

1. 把 CLI tests 中重复的 style-profile fixture helper 收到公共 helper
2. 复核 `artifact-workflow.test.ts`、`gallery-workflow.test.ts`、`runtime-build.test.ts`、`command-contract.test.ts`、`governance-sync.test.ts` 的职责边界
3. 复核 `scripts/shadcn-test-server.mjs` 与 `scripts/shadcn-test-fixtures/` 的真实依赖面
