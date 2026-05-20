# Issue Draft: Slice 4C Host Shell Boundary Cleanup

## 标题

`Phase 4 / Slice 4C`: 清理 runtime host / document shell / gallery shell 的职责混用

## 为什么现在开这张单

- `4A` 和 `4B` 解决的是 renderer 责任与 projection ownership；`4C` 解决的是 host shell。只有前两刀站稳后，才有资格判断哪些结构还应由宿主提供，哪些必须退出主路径。
- 当前 `app.tsx` 同时承载：
  - `DocumentApp`
  - `GalleryApp`
  - `createGalleryPreviewDocument()`
  - `createSharedShellCss()`
  - `ahtml-document-shell` / `ahtml-gallery-shell` / `ahtml-section-stack` / `ahtml-prose-block`
  这说明 runtime host、document shell、gallery shell、preview sample 目前仍然混用。
- `runtime-template.mjs` 和 `runtime-surface.mjs` 还把 `src/app.tsx`、`src/renderer/render-node.tsx` 纳入 `ahtmlGlueProof`；所以这刀一旦动壳结构，就会真实波及 template/surface/proof 链，不能再被写成“顺手清 CSS”。

## 当前现实

- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
  - 当前同时有：
    - `DocumentApp`
    - `GalleryApp`
    - `createGalleryPreviewDocument()`
    - `createSharedShellCss()`
  - `createSharedShellCss()` 当前直接定义：
    - `.ahtml-document-shell`
    - `[data-agent-html-component="page"] { display: grid; gap: ... }`
    - `.ahtml-prose-block`
    - `.ahtml-section-stack`
    - `.ahtml-gallery-shell` 及 sidebar / preview grid 结构
- `createGalleryPreviewDocument()` 当前还直接构造带 `tone`、`kind`、`default` 的示例内容。
- `packages/ahtml/src/cli/runtime-template.mjs`
  - 当前把 checked-in `src/app.tsx` 注入 runtime，并记录到 glue proof。
- `packages/ahtml/src/cli/runtime-surface.mjs`
  - 当前 `ahtmlGlueFiles` 明确包含：
    - `src/app.tsx`
    - `src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-surface.test.ts`
  - 当前锁定 shell/base layer completeness、glue proof / managed UI proof drift、doctor 在 surface 缺口下的失败形态。
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 当前主宿主断言已切到 `class="ahtml-runtime-host ahtml-runtime-document"`。

## 目标

这张单不是删 legacy field，也不是重新设计 layout primitive。它只证明一件事：

- runtime host 不再默认替 authoring surface 提供文档型页面骨架，gallery shell、document artifact shell、runtime host bootstrap 的职责边界已经更清楚。

## 范围

第一批入口文件：

- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- `packages/ahtml/src/cli/runtime-template.mjs`
- `packages/ahtml/src/cli/runtime-surface.mjs`

视需要改：

- `packages/ahtml/src/cli/runtime-status.mjs`
- `packages/ahtml/src/cli/doctor-checks.mjs`

建议交付内容：

1. 先在 `app.tsx` 内把三类职责逻辑分开看待：
   - runtime host bootstrap
   - document artifact shell
   - gallery/editor shell
2. 把 shared shell CSS 里的默认结构假设单独聚类并决定去留：
   - `ahtml-document-shell`
   - `page` 默认 grid
   - `ahtml-prose-block`
   - `ahtml-section-stack`
3. 把 gallery preview sample document 的职责和 host 默认页面骨架分离：
   - preview sample 可以保留
   - 但不能继续作为“runtime 默认怎么排版”的真相来源
4. 只在必要时同步 `runtime-template.mjs` / `runtime-surface.mjs` / `runtime-status.mjs`：
   - 让 glue proof 和 surface 检查仍能解释新的壳边界
   - 不是放宽 proof 范围来掩盖未完成的结构清理

## 明确不做

- 不重新设计 layout primitive 或 layout prop 面
- 不改 `tabs` / `accordion` / `table` 的状态或结构语义替代设计
- 不删除 `kindProp` / `defaultProp` / `modeProp` / `defaultMode`
- 不把 `4C` 做成 `5A/5B` 的 contract/runtime spec 下线动作
- 不在不需要时回头重拆 `render-node.tsx`

## 前置条件

开工前应先确认：

1. `4B` 已经拆清 UI/layout projection ownership；否则很难判断页面塌了是 host 壳问题还是 projection 问题。
2. `3C` 至少让 layout projection 有最小落点；否则一去掉默认 document shell，页面结构会直接失真。
3. 当前不在这一刀里删除 legacy spec 字段；否则 `4C` 和 `5B` 会混成一把。

## 完成标准

必须同时满足：

1. runtime host 不再默认替 authoring surface 提供文档型页面骨架
2. `app.tsx` 中 host / document shell / gallery shell 的职责边界更清楚
3. `runtime-template.mjs` / `runtime-surface.mjs` 仍能解释新的注入与 proof 边界
4. gallery preview sample 仍可存在，但不再决定 runtime host 的默认结构真相

下面这些不足以支持“完成”：

- 只是挪了 CSS 位置，但 host 仍继续默认提供文档型结构
- 只是 gallery 还能用，但 runtime surface / glue proof 没有同步解释
- 只是删了 `ahtml-document-shell` 断言，却没有给出新的宿主边界
- 只是为了让 proof 通过，放宽了检查范围

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
- 再按改动面补:
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/config/render-capabilities.test.ts`

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始重新设计 layout prop 面
- 为了维持页面结构，重新把 shell 当主语义层补回去
- 开始删除 `kindProp` / `defaultProp` / `modeProp` / `defaultMode`
- 为了让 surface/proof 通过，放宽 proof 文件范围而不是修正真实壳职责

这分别说明：

- 已经退回 `Phase 3`
- 这刀并没有真正完成 host shell 清理
- 已经提前混入 `5B`
- 这刀是在掩盖 `4C` 未完成

## 风险提醒

- `app.tsx` 当前既是 host，又是 shell，又是 gallery 入口；这刀最容易把“先拆逻辑边界”做成“全文件重写”
- `runtime-surface.test.ts` 与 glue proof 会把 `src/app.tsx` 的任何壳变化放大成 final gate 失败；这是正确的，但会让失败面很大
- `cli.build.heavy.test.ts` 仍在断言 `ahtml-document-shell`，说明 `4C` 和 `5C` 之间存在真实交界；这刀不能假装这层不存在

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 5 / Slice 5A`

当前仍会显式保留、但不应在这刀里收掉的东西：

- runtime spec 中的 legacy 字段
- renderer 对 legacy bridge 的兼容入口
- doctor / heavy gate 的最终收口

## 参考文档

- `docs/architecture/slice-4c-execution-card.md`
- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/phase-5-implementation-draft.md`
- `docs/architecture/slice-risk-card-map.md`
