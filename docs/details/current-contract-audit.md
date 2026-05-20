# Current Contract Audit

本文记录当前工作树里 agent-html 公共 contract、schema 生成链路、runtime 消费点和 layout/runtime shell 状态的**当前事实**。

它不定义新架构目标；它的作用是给 `docs/roadmap.md` 和 `docs/architecture/schema.md` 提供可追踪到代码的现状证据。

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

当前判断：

- 公开 schema / prompt 主链已经完成切换。
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
- `packages/ahtml/src/cli/prompt-schema.test.ts`
  - prompt 明确不再输出：
    - `alert(title? tone?`
    - `badge(tone?`
    - `tabs(default?`
    - `row(kind?`
    - `accordion(mode?`

因此更准确的表述应是：

- legacy 语义字段仍保留在 resolved semantic layer / compatibility layer
- 但它们已经退出主公开 contract / prompt 主路径

当前判断：

- 主公开 contract 已完成收口。
- 当前仍可继续保留 compatibility bridge，不等于双轨公开 contract 仍在主路径。

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

当前判断：

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

当前判断：

- runtime spec 顶层主路径已经完成收口。
- 当前 legacy bridge 仍深入运行时行为，但它们已经是显式兼容层，而不是顶层正式 spec 成员。

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

当前判断：

- layout primitive 已进入正式 surface，并打通 parse/validate/runtime 最小投影。
- 当前剩余问题不再是“layout 是否存在”，而是后续是否还需要更强的结构归一化与测试覆盖。

## 6. renderer 已完成 ownership 分层

当前 renderer 不再是单文件集中实现：

- `render-node.tsx`
  - 负责 dispatcher、文本渲染、路径/元数据/children 通用逻辑
- `render-ui-node.tsx`
  - 负责 UI projection、compatibility bridge、fallback、structured slot/state logic
- `render-layout-node.tsx`
  - 负责 layout projection

当前判断：

- renderer ownership 分层已经落地。
- 当前不能再把“render-node.tsx 仍集中承载 UI/layout/fallback 全部分支”写成现状。

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

当前判断：

- host / document / gallery shell 分层已经落地。
- heavy gate 主宿主断言已经不再把 `ahtml-document-shell` 当默认真相。

## 8. 当前验证口径

当前最关键的现实不是阶段标签怎么写，而是这条链路仍由代码和测试共同保护：

- public contract
  - `packages/core/src/public-agent-contract.ts`
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/ahtml/src/cli/schema.mjs`
  - `packages/ahtml/src/cli/prompt-schema.test.ts`
- runtime contract / capability mapping
  - `packages/ahtml/src/config/component-capabilities.mjs`
  - `packages/ahtml/src/config/render-capabilities.mjs`
  - `packages/ahtml/src/config/runtime-contract.mjs`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
- renderer / runtime shell
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.gallery.heavy.test.ts`

本轮已直接复核通过：

- `npm run build`
- `npm run test:run -- packages/ahtml/src/cli/prompt-schema.test.ts packages/ahtml/src/cli/cli-surface.test.ts packages/ahtml/src/cli/runtime-setup-contract.test.ts packages/ahtml/src/cli/validate-inspect-contract.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/runtime-template.test.ts`
- `node scripts/verify-packed-ahtml.mjs`
- `npm run docs:lint`
- `npm run test:run:cli-heavy:runtime`
- `npm run test:run:cli-heavy:build`
- `npm run test:run:cli-heavy:preview`
- `npm run test:run:cli-heavy:gallery`

因此本文既记录当前代码事实，也记录这轮已经重新拿到的核心 gate 证据。
