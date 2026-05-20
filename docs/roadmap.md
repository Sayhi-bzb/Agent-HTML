# Roadmap

## 目的

这份 `roadmap` 只记录当前主线状态、本轮复验结论和仍值得继续观察的方向。

## 当前状态

当前工作树已经完成了这条主线：

- prop exposure 主链已从旧 overlay 直抄收紧到当前公开 schema
- layout primitives 已进入正式 schema / parse / validate / 最小 runtime projection
- runtime renderer 已把 UI projection / layout projection 从主 dispatcher 分离
- runtime host、document artifact shell、gallery shell 已拆开
- 旧公开字段 `kind` / `mode` / `default` 已不再作为主公开 contract 的新增入口
- runtime spec 主路径已不再把 `kindProp` / `modeProp` / `defaultProp` / `defaultMode` 当作常规顶层字段

旧实施稿、切片卡和独立 completion proof 已经从 `docs/` 移除。  
当前 `docs/` 只保留当前事实入口、当前验证口径和仍存在的 compat 现实。

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

## 当前验证基线

本轮直接复核通过：

- `npm run build`
- `npm run test:run -- packages/ahtml/src/cli/prompt-schema.test.ts packages/ahtml/src/cli/cli-surface.test.ts packages/ahtml/src/cli/runtime-setup-contract.test.ts packages/ahtml/src/cli/validate-inspect-contract.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/runtime-template.test.ts`
- `node scripts/verify-packed-ahtml.mjs`
- `npm run docs:lint`
  - 当前同时覆盖既有 markdownlint 入口与 `docs/` 的 discipline guard
- `cli.build.heavy.test.ts`
- `cli.runtime.heavy.test.ts`
- `cli.preview.heavy.test.ts`
- `cli.gallery.heavy.test.ts`

## 当前剩余工作

当前没有新的具体收尾项。  
如果未来继续推进，只剩两类事情值得单独开工：

1. 压缩 `tabs` / `accordion` / `table` 的 compat bridge。
2. 在新工作出现时继续维持 `docs/` 只记录当前现实，不恢复历史迁移稿。

## 完成标准

`5C` 当前已经满足以下条件：

- 主 docs 不再把历史切片稿、issue 草稿、实施 checklist 当默认入口
- `roadmap.md` 和 `todo.md` 只描述当前现实与剩余收尾
- doctor / runtime-surface / heavy build / preview / runtime gates 与最终 contract 一致
- 测试入口、脚本入口和 docs 描述不再各说各话
- 兼容桥若仍保留，位置和理由在现实文档中明确可见
