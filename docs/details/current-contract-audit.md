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
- `schema-overlays.ts` 已移除 `alert.tone`、`badge.tone`、`row.kind`、`tabs.default`、`accordion.mode/default`。
- runtime spec 与 renderer 已移除 `legacyBridges`、`behavior.stateBridge` 及相关 legacy payload 类型。
- parser / validate / sanitize 已经正式接受 layout primitive；layout 不再只是文档目标。
- runtime renderer 已完成 dispatcher / UI projection / layout projection 分层。
- runtime host、artifact root、document layout policy、gallery shell 已拆开；`ahtml-document-shell` 兼容 class 已移除，文档型默认值只由 document layout policy 承载。

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
    - `rawCandidateProps`
    - `exposedRawProps`
    - `blockedPropNames`
- `packages/core/src/component-schema.ts`
  - `RESOLVED_STANDARD_COMPONENT_SCHEMAS` 直接消费 generated resolved schemas
  - `STANDARD_COMPONENT_SCHEMAS` 当前直接反映现行 authoring schema 与已公开 raw props
- `packages/core/src/public-agent-contract.ts`
  - 公开主路径仍通过投影函数生成
  - 当前不再承担 legacy prop 过滤职责
- `packages/ahtml/src/cli/schema.mjs`
  - prompt 直接消费 `createPublicAgentContract()`
  - 当前 prompt 已不再把 `tone` / `kind` / `mode` / `default` 当公开主入口

当前判断：

- 公开 schema / prompt 主链已经切到当前生成链路。
- 当前不能再把“公开 contract 仍直接来自 overlay 原始 props”写成现状。

## 2. 当前公开 contract 与 authoring schema 已重新对齐

当前已经移除这些 legacy 字段：

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

当前判断：

- 主公开 contract 与 authoring schema 在 props 级别已经重新对齐。
- 当前不再保留 compat props 的额外接受面。

## 3. 当前仍同时保留两类 core 视图

当前 core 有两种不同用途的 schema 视图：

- `STANDARD_COMPONENT_SCHEMAS`
  - 面向 parse / validate / sanitize 的完整 agent-facing schema
  - 当前不再含 legacy semantic props
- `createPublicAgentContract()`
  - 面向 CLI schema / prompt 的最终公开 contract
  - 当前主要负责稳定输出格式，而不是兼容收口

这不是“旧公开 contract 和新公开 contract 并存”，而是：

- 一个完整 authoring validation surface
- 一个最终 agent-facing public contract

当前判断：

- 当前若继续审计“是否仍维护两套公开 contract”，应回答：
  - **主公开 contract 没有双轨**
  - parse/validate 也不再保留 compat props 接受面

## 4. runtime spec 与 renderer 已完成 compat 拆除

当前已经移除：

- `alert` / `badge` 的 `legacyBridges.variant`
- `table` 的 `legacyBridges.structuralRole`
- `tabs` 的 `legacyBridges.state`
- `accordion` 的 `legacyBridges.state`
- `accordion.behavior.stateBridge`

`packages/ahtml/src/cli/runtime-template/src/renderer/types.ts` 当前的主 spec 形状已经是：

- `RendererSpecComponent`
  - 不再顶层声明 `kindProp` / `modeProp` / `defaultProp` / `defaultMode`
  - 也不再保留 `legacyBridges`
- `RuntimeVerificationState.behavior`
  - 不再保留 `stateBridge`

`packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx` 当前已切到新行为来源：

- `tabs`
  - 默认选中第一个 tab
- `accordion`
  - 固定 `type="multiple"`
- `table`
  - 多行时首行作为 header

当前判断：

- runtime bridge metadata 和相关 helper 已退出当前实现。
- 当前风险点已转成新固定行为是否满足边界预期。

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
- 当前更值得关注的是后续是否还需要更强的结构归一化与测试覆盖。

## 6. renderer 已完成 ownership 分层

当前 renderer 不再是单文件集中实现：

- `render-node.tsx`
  - 负责 dispatcher、文本渲染、路径/元数据/children 通用逻辑
- `render-ui-node.tsx`
  - 负责 UI projection、fallback、structured slot/state logic
- `render-layout-node.tsx`
  - 负责 layout projection

当前判断：

- renderer ownership 分层已经落地。
- 当前不能再把“render-node.tsx 仍集中承载 UI/layout/fallback 全部分支”写成现状。

## 7. runtime host / document shell / gallery shell 的当前关系

`packages/ahtml/src/cli/runtime-template/src/app.tsx` 当前的真实边界是：

- `DocumentArtifactShell`
  - 当前输出 artifact root 与 layout policy class
  - width、padding、prose measure、`ahtml-section-stack` 和 card content 邻接规则已从单一 shell CSS 拆成 document layout policy
- runtime host 样式
  - 由 `createRuntimeHostCss()` 提供
- gallery shell
  - 由 `createGalleryShellCss()` 与 gallery preview surface 负责

当前最准确的判断是：

- artifact root / runtime host / gallery shell 已明确分层
- 当前文档型排版默认值只由 document layout policy 承载
- `cli.build.heavy.test.ts` / `cli.preview.heavy.test.ts` 当前主宿主断言已经切到：
  - `class="ahtml-runtime-host ahtml-runtime-document"`

当前判断：

- host / artifact root / document layout policy / gallery shell 分层已经落地。
- 但 document layout policy 仍明显带有文档页面预设，当前还不能把 runtime 写成完全 template-free。

## 8. 当前验证口径

当前最关键的现实是这条链路仍由代码和测试共同保护：

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

当前验证基线包括：

- `npm run build`
- `npm run test:run -- packages/ahtml/src/cli/prompt-schema.test.ts packages/ahtml/src/cli/cli-surface.test.ts packages/ahtml/src/cli/runtime-setup-contract.test.ts packages/ahtml/src/cli/validate-inspect-contract.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/runtime-template.test.ts`
- `node scripts/verify-packed-ahtml.mjs`
- `npm run docs:lint`
- `npm run test:run:cli-heavy:runtime`
- `npm run test:run:cli-heavy:build`
- `npm run test:run:cli-heavy:preview`
- `npm run test:run:cli-heavy:gallery`

本文记录的是当前代码事实和当前工作树中已有的关键 gate 入口，不把这些命令是否在本轮重新执行当作文档事实。
