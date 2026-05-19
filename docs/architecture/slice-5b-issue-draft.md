# Issue Draft: Slice 5B Runtime Spec Legacy Field Exit

## 标题

`Phase 5 / Slice 5B`: 收 runtime spec 主路径中的旧 bridge 字段

## 为什么现在开这张单

- `5A` 收公开 contract，`5B` 收 runtime spec；两者不拆开，会把“schema 已切换”和“runtime 还在吃旧桥”混成一次不可解释的大改。
- 当前 `renderer/types.ts`、`render-capabilities.mjs`、`component-capabilities.mjs` 仍把 `kindProp`、`modeProp`、`defaultProp`、`defaultMode` 当正式字段承认。
- 如果不先把这些字段从主路径收掉，后续任何实现都还会自然地把旧桥当常规能力继续沿用。

## 当前现实

当前仍在主路径里的旧字段：

- `tabs.default -> defaultProp`
- `accordion.mode/default/defaultMode`
- `row.kind -> kindProp/headerKind`

当前真实代码入口：

- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/render-capabilities.mjs`
- 视需要:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

当前最重要的现实限制：

- `tabs` 默认状态 focused 保护偏弱
- `table` header/body 分流 focused 保护偏弱
- `accordion` 保护较强，但也最容易牵动 runtime parity

## 目标

这张单要证明的不是“字段删掉了”，而是：

- runtime spec 的主路径形状已经朝最终 contract 收口
- 旧 bridge 字段如果暂时还存在，也已经退成显式兼容点，而不是 requiredFields 或正式 projection 成员

## 范围

第一批入口文件：

- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/render-capabilities.mjs`

只在前置条件成立时才允许动：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

建议交付内容：

1. 收 `renderer/types.ts`
   - 明确哪些字段仍是正式 projection 成员
   - 哪些只是 compatibility bridge
2. 收 `render-capabilities.mjs`
   - 把“必须存在旧 bridge 字段才算合法 spec”这件事拆掉
3. 收 `component-capabilities.mjs`
   - 让 runtime projection 字段与 legacy compatibility bridge 字段明确分层

## 明确不做

- 不改 `packages/ahtml/src/cli/doctor-checks.mjs`
- 不改 `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- 不改 `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- 不改 `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- 不回写 `docs/roadmap.md` / `docs/todo.md` 的最终收尾口径
- 不在这张单里发明新的 tabs / accordion / table 语义

## 前置条件

必须先确认下面三条，否则这张单应直接标成阻塞，不应开工：

1. `5A` 已把 legacy field 从主公开 contract 方向上收紧
2. `4A/4B` 已把 legacy bridge 从主渲染分支中显式隔离
3. `tabs`、`accordion`、`table` 至少各自已有一种可执行的新路径或显式兼容退场方案

如果上面任一条件不成立，这张单的正确输出不是“硬删字段”，而是“记录阻塞点”。

## 完成标准

必须同时满足：

1. `renderer/types.ts` 不再把旧 bridge 字段视为默认常规 renderer spec 成员
2. `render-capabilities.mjs` 不再把 `kindProp`、`modeProp`、`defaultProp`、`defaultMode` 当主路径 requiredFields
3. `component-capabilities.mjs` 中 runtime projection 字段与 compatibility bridge 的边界已清楚
4. `tabs`、`accordion`、`table` 没有在“无替代路径”的情况下被硬删

下面这些不足以支持“完成”：

- 只是从类型上删了字段，但 `render-capabilities.mjs` 和 `component-capabilities.mjs` 仍要求它们
- 只是从 requiredFields 删了字段，但 `render-node.tsx` 仍默认依赖旧桥
- `tabs` / `table` 仍无新路径，却因为 focused 保护薄弱看起来没炸

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 再跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`

## 停手信号

出现下面任一信号就应停手并重新切片：

- `tabs` 仍无新默认状态路径，却准备删除 `defaultProp`
- `accordion` 仍无新状态模型，却准备删除 `modeProp/defaultProp/defaultMode`
- `table` 仍无新 header/body 结构语义，却准备删除 `kindProp/headerKind`
- 开始回写 doctor / heavy tests / docs 最终口径

这分别说明：

- 实际上 `5A/4B` 甚至更早阶段并未完成
- 或已经混入 `5C`

## 风险提醒

- `tabs` 默认状态行为保护偏弱，删桥前如果不补 focused 断言，容易出现静默回归
- `table` header/body 分流缺少足够 focused coverage，它比字段删除本身更危险
- `accordion` 保护更强，但也最容易牵动 behavior/runtime parity
- `runtime-contract.test.ts` 更像同源性测试，不足以单独证明 legacy bridge 已安全退出主路径

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 5 / Slice 5C`

当前最需要补强的保护点：

- `tabs` 默认状态 focused 断言
- `table` header/body 分流 focused 断言

## 参考文档

- `docs/architecture/slice-5b-execution-card.md`
- `docs/architecture/phase-5-implementation-draft.md`
- `docs/architecture/slice-risk-card-map.md`
- `docs/details/high-risk-runtime-bridges.md`
- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`
