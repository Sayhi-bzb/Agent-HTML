# Issue Draft: Slice 4B Projection Ownership Split

## 标题

`Phase 4 / Slice 4B`: 把 UI projection 和 layout projection 从主 renderer 分支中拆成独立 ownership

## 为什么现在开这张单

- `4A` 解决的是 legacy bridge 隔离；`4B` 解决的是 runtime projection ownership。如果这两刀不拆开，最后只会得到“旧桥逻辑从主分支移到了 helper，但 `render-node.tsx` 仍然是总控大文件”的假进展。
- 当前 renderer 目录里仍只有：
  - `render-node.tsx`
  - `types.ts`
  - `parity.ts`
  - `kinds.ts`
  - `elements.tsx`
  这说明 UI projection 和 layout projection 现在还没有真实模块边界。
- `Phase 3` 已经把 layout 写成正式语义目标面；如果 `4B` 不明确 layout projection 的 ownership，后续 `4C` 清 shell 时就会继续让 layout 借 UI helper 或 document-shell 假设活着。

## 当前现实

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - 当前同时承担：
    - dispatcher
    - primitive / compound / field / choice / overlay / table / tabs / accordion projection
    - structured child extraction
    - noscript fallback
    - 部分 shell-like class 注入
- `packages/ahtml/src/cli/runtime-template/src/renderer`
  - 当前没有：
    - `render-ui-node.tsx`
    - `render-layout-node.tsx`
- 当前 `getSlotChildren()` / `getStructuredItemsForNode()` 这类 helper 仍在主文件里，且设计重心明显偏 UI structured slots，而不是 layout projection。
- `packages/ahtml/src/config/component-capabilities.mjs`
  - 当前仍把 renderer mapping、slot 结构和 legacy bridge 线索混在同一个定义层里。

## 目标

这张单不是清 shell，也不是删旧字段。它只证明一件事：

- runtime projection 的模块边界已经开始真实分层，`render-node.tsx` 退回 dispatcher，UI projection 和 layout projection 各自有明确 ownership。

## 范围

第一批入口文件：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 新文件：`packages/ahtml/src/cli/runtime-template/src/renderer/render-ui-node.tsx`
- 新文件：`packages/ahtml/src/cli/runtime-template/src/renderer/render-layout-node.tsx`

视需要改：

- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`

建议交付内容：

1. 把 `render-node.tsx` 压成薄 dispatcher：
   - 读 node type
   - 查 renderer spec
   - 分发到 text / UI / layout projection
2. 把 UI projection 落到 `render-ui-node.tsx`：
   - primitive / compound / field / option set
   - `tabs` / `accordion` / `table`
   - UI-specific structured slot extraction
   - UI-specific fallback
3. 把 layout projection 落到 `render-layout-node.tsx`：
   - 只承接 layout kinds
   - child selection / composition helper 按 layout 语义组织
4. 只在必要时更新 `component-capabilities.mjs` / `render-capabilities.mjs`：
   - 让 rule 层正式承认 layout kinds
   - 但不在这刀里滑进 shell 问题

## 明确不做

- 不改 `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- 不清 `ahtml-document-shell` / `ahtml-prose-block` / `ahtml-section-stack`
- 不删除 `kindProp` / `defaultProp` / `modeProp` / `defaultMode`
- 不重新设计 layout prop 面
- 不回写 doctor / runtime-surface / heavy tests 的最终口径

## 前置条件

开工前应先确认：

1. `4A` 已经把 legacy bridge 放进显式 helper 或显式责任层；否则这张单只是在搬运未解耦逻辑。
2. `3C` 已经至少定义好复杂 layout 的目标投影方向；否则 `render-layout-node.tsx` 只会变成临时杂物间。
3. 当前不要求同步清 shell；如果布局还靠 `app.tsx` 默认骨架兜底，那是 `4C` 的问题。

## 完成标准

必须同时满足：

1. `render-node.tsx` 主体已退回 dispatcher，不再继续承担大量 UI / layout / fallback 细节
2. `render-ui-node.tsx` 与 `render-layout-node.tsx` 已有清晰 ownership，而不是两个新的中转文件
3. layout projection 的 child selection / composition helper 不再直接复用围绕 `tabs` / `select` / `table` 设计的 UI helper
4. layout kinds 已至少在 mapping / rule 层有显式承认，不只是实现文件名变了

下面这些不足以支持“完成”：

- 只是把一个大文件切成多个大文件
- `render-node.tsx` 仍然直接承载 tabs / accordion / table / fallback 的主要细节
- layout projection 文件存在，但只负责调用 UI helper
- 测试没炸，但 projection ownership 仍说不清

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 再跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
- 视改动面决定是否补:
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始大面积改 `app.tsx` 或 shared shell CSS
- 开始删除 legacy bridge 字段
- 开始重新设计 layout prop 面
- `render-node.tsx` 仍保留大量 projection 细节，只是加了几个转发函数

这分别说明：

- 已经混入 `4C`
- 已经提前混入 `5B`
- 已经退回 `Phase 3`
- 这刀实际上没有完成 ownership 拆分

## 风险提醒

- `render-node.tsx` 当前体量过大，最容易出现“拆文件不拆职责”的假解耦
- layout projection 如果继续复用 UI structured slot helper，很容易把 tabs/select/table 的历史结构假设带进 layout
- `runtime-contract.test.ts` 能证明 contract 同源，但不能单独证明 projection ownership 已清楚

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 4 / Slice 4C`

当前仍会显式保留、但不应在这刀里收掉的东西：

- legacy bridge helper
- shell 默认结构假设
- doctor / runtime surface / heavy gate 最终收口

## 参考文档

- `docs/architecture/slice-4b-execution-card.md`
- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/slice-risk-card-map.md`
- `docs/details/high-risk-runtime-bridges.md`
