# Phase 5 Completion Proof

本文不是迁移实施稿，而是当前工作树对 `Phase 5` 完成度的证据汇总。

它的用途只有两个：

- 对照 `docs/architecture/phase-completion-criteria.md` 回答“哪些条件已经被当前证据证明”
- 记录哪些实现和 gate 已经足够支持正式宣称 `Phase 5` 收官

如果只想先看现实基线，请先读：

- `docs/details/current-contract-audit.md`
- `docs/details/current-contract-component-matrix.md`
- `docs/details/high-risk-runtime-bridges.md`

## 当前结论

当前证据已经可以直接支持：

- `Phase 2`
  - 完成
- `Phase 3`
  - 完成
- `Phase 4`
  - 完成
- `Phase 5A`
  - 完成
- `Phase 5B`
  - 完成
- `Phase 5`
  - 完成

原因是：

- required focused gates 与 heavy gates 当前轮已经补齐直接 green evidence
- compat 现实与主 docs 入口口径已经完成按完成判据的逐项回读
- 当前剩余事项已经退到 post-phase cleanup，而不是 `Phase 5` 收官阻塞

## 对照 `Phase 5 Completion`

以下对照项都来自：

- `docs/architecture/phase-completion-criteria.md`

### 1. `tone` / `kind` / `mode` / `default` 不再作为主公开 schema / prompt 的新增入口

状态：`已证明`

直接证据：

- 代码
  - `packages/core/src/public-agent-contract.ts`
  - `packages/ahtml/src/cli/schema.mjs`
- 测试
  - `packages/core/src/public-agent-contract.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`

当前结论：

- `alert` 公开 `title`、`variant`
- `badge` 公开 `variant`
- `row` / `tabs` / `accordion` 当前公开 props 为空
- prompt 不再输出：
  - `tone`
  - `kind`
  - `mode`
  - `default`

### 2. `kindProp` / `modeProp` / `defaultProp` / `defaultMode` 不再作为主路径 runtime spec 成员

状态：`已证明`

直接证据：

- 代码
  - `packages/ahtml/src/config/component-capabilities.mjs`
  - `packages/ahtml/src/config/render-capabilities.mjs`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- 测试
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`

当前结论：

- 顶层 renderer spec 已收进：
  - `legacyBridges.variant`
  - `legacyBridges.state`
  - `legacyBridges.structuralRole`
- `RuntimeVerificationState.behavior` 已收进：
  - `stateBridge`
  - `multiValueDelimiter`

### 3. `app.tsx` 不再依赖默认文档壳替 authoring surface 提供页面结构

状态：`已证明`

直接证据：

- 代码
  - `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- 测试
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.gallery.heavy.test.ts`

当前结论：

- runtime host、document artifact shell、gallery shell 已分开
- document artifact shell 仍输出 `ahtml-document-shell`
- 但 build / preview / gallery 当前宿主断言都已对准：
  - `ahtml-runtime-host`

### 4. `doctor-checks.mjs` 的 parity 口径已经对准最终 contract

状态：`已证明`

直接证据：

- 测试
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`

本轮直接跑过的 doctor 关键场景：

- `runs managed runtime doctor checks`
- `prints machine-readable doctor reports for app integrations`
- `fails doctor when runtime capabilities drift from schema`
- `fails doctor when runtime renderer mapping drifts from schema`

当前结论：

- doctor 不只是“能跑”
- 它会对：
  - verification data parity
  - renderer mapping parity
  - renderer registry parity
  - runtime surface
  做真实失败保护

### 5. heavy fixtures 和断言已经从 legacy authoring surface 切到最终 authoring surface

状态：`已证明`

直接证据：

- 测试
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.gallery.heavy.test.ts`
  - `packages/ahtml/src/cli/gallery-workflow.test.ts`

本轮直接通过的结果：

- `cli.build.heavy.test.ts`
  - 全文件通过
- `cli.preview.heavy.test.ts`
  - 全文件通过
- `cli.runtime.heavy.test.ts`
  - 全文件通过
- `cli.gallery.heavy.test.ts`
  - 全文件通过
- `gallery-workflow.test.ts`
  - 本轮通过

当前结论：

- heavy 断言已经保护：
  - `class="ahtml-runtime-host ahtml-runtime-document"`
  - `class="ahtml-runtime-host ahtml-gallery-shell"`
- artifact 不应重新泄露：
  - `tone="`
  - `kind="`
  - `default="`

### 6. docs 不再把迁移桥描述成当前有效结构事实

状态：`已证明`

直接证据：

- 已更新现实文档
  - `docs/index.md`
  - `docs/reading-map.md`
  - `docs/phase-5-completion-proof.md`
  - `docs/architecture/schema.md`
  - `docs/layout.md`
  - `docs/syntax.md`
  - `docs/details/current-contract-audit.md`
  - `docs/details/current-contract-component-matrix.md`
  - `docs/details/high-risk-runtime-bridges.md`
  - `docs/roadmap.md`
  - `docs/todo.md`

当前结论：

- 主入口文档已经不再把 legacy 字段写成公开主路径事实
- compat bridge 的位置也已经改成当前现实口径
- 现实资料与主入口文档当前没有新的口径漂移

## Focused / Heavy Gate Evidence

当前已直接确认通过的 focused gates：

- `packages/core/src/public-agent-contract.test.ts`
- `packages/ahtml/src/cli/cli.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`
- `packages/ahtml/src/cli/gallery-workflow.test.ts`

当前已直接确认通过的 heavy gates：

- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- `packages/ahtml/src/cli/cli.gallery.heavy.test.ts`

## Remaining Gaps

当前已经没有阻止 `Phase 5` 宣称完成的缺口。

当前剩余工作属于 post-phase cleanup：

1. 收紧 CLI tests 的重复 fixture/helper
2. 清理测试命名和职责边界的过渡残留
3. 复核 heavy/test 脚本仍真实使用的 fixture 与 server 依赖面

## 当前判断

截至当前工作树：

- `Phase 5` 已满足 `docs/architecture/phase-completion-criteria.md` 的完成判据
- `Phase 2` 到 `Phase 5` 的主线收口已经可以正式宣称完成
- 当前后续工作已经转入 `Phase 5` 之后的低风险整理阶段
