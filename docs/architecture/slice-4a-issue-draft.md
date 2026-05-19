# Issue Draft: Slice 4A Legacy Bridge Isolation

## 标题

`Phase 4 / Slice 4A`: 从 `render-node.tsx` 主分支隔离 legacy bridge

## 为什么现在开这张单

- 当前 `tabs`、`accordion`、`table` 的 legacy bridge 仍直接散落在 `render-node.tsx` 主渲染路径里。
- 如果跳过这刀直接做 `4B`，很容易把“拆文件”做成“把混合职责搬到多个文件”。
- 当前也还不该直接做 `4C`，因为 `app.tsx` / shell 边界清理依赖 layout projection 和 renderer ownership 先站稳。

## 当前现实

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - 同时承担：
    - UI / layout / fallback projection
    - legacy field 解释
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - 当前仍正式允许：
    - `defaultProp`
    - `modeProp`
    - `defaultMode`
    - `kindProp`
- `packages/ahtml/src/config/component-capabilities.mjs`
  - 当前仍把旧桥字段写进 renderer / behavior 定义

当前最需要先隔离的 bridge：

- `tone -> variant`
- `tabs.default -> defaultProp`
- `accordion.mode/default/defaultMode`
- `row.kind -> kindProp -> header/body split`

## 目标

这张单不是删字段，也不是重写 renderer。它只证明一件事：

- legacy bridge 已从 `render-node.tsx` 主渲染分支中显式隔离出来，后续 `4B` 和 `5B` 已经有可定位的替换点。

## 范围

第一批入口文件：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`

建议交付内容：

1. 在 `renderer/types.ts` 明确区分：
   - variant-like bridge
   - state-like bridge
   - structural-role bridge
2. 在 `render-node.tsx` 抽出显式 helper，至少覆盖：
   - tabs 默认状态来源
   - accordion 状态来源
   - table header/body 角色分流
   - variant-like bridge
3. 在 `component-capabilities.mjs` 让 projection 字段与 compatibility bridge 字段更容易一眼区分。

## 明确不做

- 不改 `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- 不新增 `render-ui-node.tsx` / `render-layout-node.tsx`
- 不删除 `modeProp` / `defaultProp` / `defaultMode` / `kindProp`
- 不设计新的 tabs / accordion / table 正式状态语义
- 不改 doctor / heavy tests 的最终口径

## 前置条件

开工前应先确认：

1. 当前目标仍是 bridge 隔离，而不是 contract 收口
2. 当前不要求 layout projection 或 shell 已完成最终形态
3. 执行人已经读过：
   - `docs/architecture/slice-4a-execution-card.md`
   - `docs/details/high-risk-runtime-bridges.md`
   - `docs/details/tabs-migration-card.md`
   - `docs/details/accordion-migration-card.md`
   - `docs/details/table-migration-card.md`

## 完成标准

必须同时满足：

1. `render-node.tsx` 主分支不再散落 `tone` / `kind` / `mode` / `default` 的直接翻译判断
2. legacy bridge 能在类型面和实现面被单独定位
3. 当前 tabs / accordion / table 的渲染行为仍与现有最窄验证口一致

下面这些不足以支持“完成”：

- 只是把长逻辑挪到 helper，但主分支仍继续直接做 bridge 决策
- 只是给类型加注释，但 definition 层仍看不出 compatibility bridge
- 只是测试没炸，但 `4B/5B` 仍找不到清晰替换点

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 再跑:
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始修改 `app.tsx`、shared shell CSS、gallery preview 布局
- 开始新增 `render-ui-node.tsx` / `render-layout-node.tsx`
- 开始删除旧 bridge 字段
- 开始设计新的 tabs / accordion / table 正式状态语义

这分别说明：

- 已经混入 `4C`
- 已经混入 `4B`
- 已经提前混入 `5B`
- 已经跨到 `5A/5B`

## 风险提醒

- `render-node.tsx` 体量很大，最容易出现“抽 helper 但职责没变”的假重构
- `accordion`、`tabs`、`table` 三类桥并不完全同构，硬抽统一抽象容易制造假共性
- `component-capabilities.mjs` 同时是 mapping source 和 verification source，定义边界改写不清会牵动 `render-capabilities.test.ts`

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 4 / Slice 4B`

当前仍会显式保留的兼容点：

- `tone -> variant`
- `tabs.default -> defaultProp`
- `accordion.mode/default/defaultMode`
- `row.kind -> kindProp`

## 参考文档

- `docs/architecture/slice-4a-execution-card.md`
- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/slice-risk-card-map.md`
- `docs/details/high-risk-runtime-bridges.md`
- `docs/details/tabs-migration-card.md`
- `docs/details/accordion-migration-card.md`
- `docs/details/table-migration-card.md`
