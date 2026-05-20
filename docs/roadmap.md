# Roadmap

## 目的

这份 `roadmap` 不再回放完整 `Phase 1-5` 迁移剧本。  
它现在只记录三件事：

- 当前实现已经落到哪里
- 哪些阶段可以视为已完成验收
- 剩余收尾工作还差什么

如果需要追溯历史切片、实施稿和旧验收口径，请转到：

- `docs/history.md`

## 当前状态

当前工作树已经完成了这条主线：

- prop exposure 主链已从旧 overlay 直抄收紧到当前公开 schema
- layout primitives 已进入正式 schema / parse / validate / 最小 runtime projection
- runtime renderer 已把 UI projection / layout projection 从主 dispatcher 分离
- runtime host、document artifact shell、gallery shell 已拆开
- 旧公开字段 `kind` / `mode` / `default` 已不再作为主公开 contract 的新增入口
- runtime spec 主路径已不再把 `kindProp` / `modeProp` / `defaultProp` / `defaultMode` 当作常规顶层字段

当前项目不再处于“如何拆 `2A-5B`”或“`5C` 能不能收官”的阶段。  
当前主线已经完成 `Phase 5` 收口，进入 post-phase cleanup。

## 已完成验收结论

- `Phase 2`
  - 已完成。
  - schema / prompt 主路径已经切到当前公开 schema 口径，首批低耦合 prop 已贯通。
- `Phase 3`
  - 已完成。
  - `stack`、`cluster`、`split`、`grid`、`switcher`、`frame` 已进入正式语义面，并有最小 runtime projection。
- `Phase 4`
  - 已完成。
  - legacy bridge 已显式隔离，UI/layout projection 已分流，runtime host/document/gallery 边界已拆开。
- `Phase 5A`
  - 已完成。
  - 旧公开 contract 字段已退出主公开入口。
- `Phase 5B`
  - 已完成。
  - runtime spec 主路径已切到新口径，旧桥通过显式 compatibility bridge 保留。
- `Phase 5`
  - 已完成。
  - public contract、runtime spec、host shell、doctor、heavy gates、主 docs 入口已经收成同一条最终主路径。

## 当前剩余工作

当前剩余工作已经不再是 `Phase 5` blocker，而是后续整理项：

- CLI tests 里仍有一些过渡期重复 helper 和命名层级混杂的问题，需要做低风险结构收口
- heavy/test 脚本与 fixtures 仍有可继续压缩的依赖面
- CLI tests 里仍有一些过渡期重复 helper 和命名层级混杂的问题，需要做低风险结构收口

## 当前验证基线

本轮已直接确认通过的 focused gates：

- `npm run test:run -- packages/core/src/component-schema.test.ts`
- `npm run test:run -- packages/core/src/public-agent-contract.test.ts`
- `npm run test:run -- packages/core/src/parse/sanitize-agent-html.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/cli.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `npm run test:run -- packages/ahtml/src/config/render-capabilities.test.ts`
- `npm run test:run -- packages/ahtml/src/config/runtime-contract.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/runtime-renderability.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/runtime-template.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/runtime-surface.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/gallery-workflow.test.ts`

本轮已直接确认通过的关键 gates：

- `doctor-checks.mjs`
- `runtime-template.test.ts`
- `runtime-surface.test.ts`
- `cli.build.heavy.test.ts`
- `cli.preview.heavy.test.ts`
- `cli.runtime.heavy.test.ts`
- `cli.gallery.heavy.test.ts`

当前 completion proof 已单列在：

- `docs/phase-5-completion-proof.md`

本轮直接补齐的 `doctor` 证据包括：

- `runs managed runtime doctor checks`
- `prints machine-readable doctor reports for app integrations`
- `fails doctor when runtime capabilities drift from schema`
- `fails doctor when runtime renderer mapping drifts from schema`

## 现在的优先顺序

1. 清理测试和脚本中的重复 helper、过渡命名和低价值残留。
2. 继续保持主 docs 的现实入口地位，避免历史迁移资料回流成默认导航。
3. 只在未来真正压缩 compat bridge 时，重新打开新的阶段性实现工作。

## 完成标准

`5C` 当前已经满足以下条件：

- 主 docs 不再把历史切片稿、issue 草稿、实施 checklist 当默认入口
- `roadmap.md` 和 `todo.md` 只描述当前现实与剩余收尾
- doctor / runtime-surface / heavy build / preview / runtime gates 与最终 contract 一致
- 测试入口、脚本入口和 docs 描述不再各说各话
- 兼容桥若仍保留，位置和理由在现实文档中明确可见
