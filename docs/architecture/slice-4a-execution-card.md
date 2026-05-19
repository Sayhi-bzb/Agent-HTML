# Slice: 4A

## 归属

- Phase: 4
- Slice: 4A
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-4-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- 当前 `tabs`、`accordion`、`table` 的 legacy bridge 已经进入 `render-node.tsx` 主渲染分支，继续放任会让后续 `4B` 只能在混合职责上拆文件。
- `Phase 3` 还没有证明 layout projection 已经足够稳到可以直接退出 shell 默认结构，因此现在不该先做 `4C`。
- `4A` 的职责是先把旧字段翻译责任显式化，让后续 `4B/5B` 有可定位、可替换、可删除的桥接层。

## 这刀要证明什么

- 必须为真的结果 1:
  `render-node.tsx` 主分支不再散落 `tone` / `kind` / `mode` / `default` 的直接翻译判断。
- 必须为真的结果 2:
  variant-like、state-like、structural-role 三类 legacy bridge 已经能在类型面和实现面上被单独定位。
- 必须为真的结果 3:
  当前 tabs / accordion / table 的渲染行为和最窄验证口仍与现有测试基线一致。

## 第一批入口文件

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`

## 明确不碰

- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- gallery preview shell
- `render-ui-node.tsx` / `render-layout-node.tsx`
- 新的 tabs / accordion / table 正式状态语义设计

## 当前现实依据

- 代码入口:
  - `render-node.tsx` 当前同时承担 tabs / accordion / table projection 与旧字段解释
  - `renderer/types.ts` 当前仍正式允许 `defaultProp`、`modeProp`、`defaultMode`、`kindProp`
  - `component-capabilities.mjs` 当前把 `tone`、`kind`、`default`、`mode` 的 bridge 写进 renderer/behavior 定义
- 现有 bridge / 旧路径:
  - `alert` / `badge` 仍有 `tone -> variant`
  - `table` 仍有 `row.kind -> kindProp -> header/body split`
  - `tabs` 仍有 `default -> defaultProp -> default selected tab`
  - `accordion` 仍有 `mode/default/defaultMode` 完整 state bridge
- 当前测试或 fixture:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- 对应审计文档:
  - `docs/architecture/execution-checklist.md`
  - `docs/architecture/phase-4-implementation-draft.md`
  - `docs/details/high-risk-runtime-bridges.md`
  - `docs/details/accordion-migration-card.md`

## 计划改动

1. 在 `renderer/types.ts` 先把当前 legacy bridge 字段按语义分组，至少显式区分：
   - variant-like bridge
   - explicit state bridge
   - structural-role bridge
2. 在 `render-node.tsx` 把散落在主渲染分支里的 bridge 解析抽成 helper，至少先覆盖：
   - `tone -> variant`
   - `default -> tabs default`
   - `mode/default/defaultMode -> accordion state`
   - `kind -> table header/body role`
3. 在 `component-capabilities.mjs` 让定义层能看出哪些字段是 runtime projection 必需字段，哪些字段只是 legacy compatibility bridge。
4. 保持 renderer 行为不变，只做职责隔离，不改 shell，不改模块 ownership，不改最终公开 contract。

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 再跑:
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 不先跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`

## 停手边界

- 一旦出现以下信号就先停:
  - 开始修改 `app.tsx`、shared shell CSS、gallery preview 布局
  - 开始新增 `render-ui-node.tsx` / `render-layout-node.tsx`
  - 开始删除 `modeProp/defaultProp/defaultMode/kindProp`
  - 开始设计新的 tabs/accordion/table 正式状态语义
- 这说明已经混入了哪个下一阶段问题:
  - 改 shell 说明已经混入 `4C`
  - 拆 UI/layout module 说明已经混入 `4B`
  - 删旧字段说明已经提前混入 `5B`
  - 设计新状态语义说明已经跨到了 `5A/5B`

## 完成证据

- 代码证据:
  - `render-node.tsx` 主渲染路径变薄，legacy bridge 已进入显式 helper
  - `renderer/types.ts` 不再把旧桥字段当成无差别平铺成员
  - `component-capabilities.mjs` 中 projection 字段与 compatibility bridge 的边界更清楚
- 测试证据:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 文档证据:
  - 本卡与 `docs/architecture/execution-checklist.md`
  - `docs/details/accordion-migration-card.md`
  - `docs/details/high-risk-runtime-bridges.md`
    的口径保持一致

## 当前风险

- 风险 1:
  `render-node.tsx` 体量太大，容易把“抽 helper”做成换位置不换职责。
- 风险 2:
  `component-capabilities.mjs` 既是 mapping source 又是 verification source，边界改写不清会波及 `render-capabilities.test.ts`。
- 风险 3:
  `accordion`、`tabs`、`table` 三类 bridge 并不完全同构，硬抽象成一个统一 helper 容易制造假共性。

## 回退判断

- 如果这刀失败，最可能是哪个桥接点没隔离:
  - `accordion` 的 `mode/default/defaultMode` state bridge
  - `table` 的 `kindProp` 结构分流
- 如果测试爆炸，先看哪一层:
  - 先看 `render-node.test.ts` 对 tabs / accordion / table 的运行时行为断言
  - 再看 `render-capabilities.test.ts` 是否因为 spec requiredFields 或 slot metadata 变化而报警

## 交接说明

- 下一刀最自然的承接 slice:
  - `4B`
- 当前仍显式保留的兼容点:
  - `tone -> variant`
  - `row.kind -> kindProp`
  - `tabs.default -> defaultProp`
  - `accordion.mode/default/defaultMode`
- 不能误判为“已经完成”的地方:
  - 只是把 helper 挪了位置，但 `render-node.tsx` 主分支仍继续做 bridge 决策
  - 只是补了类型分组，但 definition 层仍看不出 compatibility bridge
  - 只是测试还绿，但 `4B/5B` 仍找不到清晰替换点
