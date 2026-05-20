# Roadmap

## 目的

这份 `roadmap` 只记录当前能力状态、当前验证基线和仍值得继续观察的风险。

## 当前能力状态

当前工作树已经完成了这条主线：

- prop exposure 主链已从旧 overlay 直抄收紧到当前公开 schema
- layout primitives 已进入正式 schema / parse / validate / 最小 runtime projection
- runtime renderer 已把 UI projection / layout projection 从主 dispatcher 分离
- runtime host、document artifact shell、gallery shell 已拆开
- 旧公开字段 `kind` / `mode` / `default` 已不再作为主公开 contract 的新增入口
- runtime spec 主路径已不再把 `kindProp` / `modeProp` / `defaultProp` / `defaultMode` 当作 `RendererSpecComponent` 常规顶层字段

## 当前验证基线

当前关键 gate 包括：

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

## 当前风险与后续关注点

- `tabs` / `accordion` / `table` 的 compat bridge 仍是当前最需要持续关注的行为边界。
- 兼容桥仍保留在 authoring 接受面和 runtime bridge 中，因此后续若继续压缩，需要同步看 schema、renderer 和 heavy gates。
- `DocumentArtifactShell` 仍硬编码了文档型 width / padding / prose measure / section spacing。当前虽然 host 分层已经成立，但 runtime 还不能被写成完全 template-free。

## 当前事项

- 见 `todo.md`。
