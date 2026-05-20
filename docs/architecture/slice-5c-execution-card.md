# Slice: 5C

## 归属

- Phase: 5
- Slice: 5C
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-5-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `5A` 和 `5B` 收的是 contract 与 runtime spec；`5C` 收的是最终 gate。如果不把 gate 一起切到最终口径，前两刀即便做完，heavy tests 和 doctor 仍会把旧路径重新钉回主线。
- 当前 `cli.build.heavy.test.ts` 的 happy-path fixtures 已经切到 `variant` / 结构化 `tabs` / 标准 `table` authoring，并把主壳断言切到 `ahtml-runtime-host ahtml-runtime-document`；但 full heavy `build` / `runtime` gate 还没有在一轮完整命令里重新证明，preview heavy 的保护面也仍偏轻。
- `doctor-checks.mjs`、`runtime-template.test.ts`、`runtime-surface.test.ts` 当前已经是 runtime 最终 gate 的真实骨架，所以 `5C` 不是“顺手改文档”，而是要把这些 gate 的验证对象从迁移中状态切到最终单路径。

## 这刀要证明什么

- 必须为真的结果 1:
  doctor / runtime parity / runtime surface 现在验证的是最终 contract，而不是“旧桥接仍被接受也算通过”。
- 必须为真的结果 2:
  build / preview / runtime heavy tests 不再把 legacy authoring 输入和 document-shell 默认骨架当作当前主路径事实。
- 必须为真的结果 3:
  `roadmap.md`、`todo.md` 以及必要的执行型文档已经从迁移语气收回到“当前仍有效的最后路径”，不再保留已经退出的桥接描述。

## 第一批入口文件

- `packages/ahtml/src/cli/doctor-checks.mjs`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- 视改动面检查：
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
- 文档入口:
  - `docs/roadmap.md`
  - `docs/todo.md`
  - 必要时 `docs/schema.md`
  - 必要时 `docs/layout.md`
  - 必要时 `docs/syntax.md`

## 明确不碰

- 新的公开 contract 设计
- 新的 layout primitive 设计
- `tabs` / `accordion` / `table` 的替代语义发明
- 不需要时不回头重做 `5A` / `5B` 的主实现

## 当前现实依据

- doctor 当前真实 gate:
  - `doctor-checks.mjs` 当前明确检查：
    - `runtime:schema-renderer-parity`
    - `runtime:verification-data-parity`
    - `runtime:renderer-mapping-parity`
    - `runtime:renderer-registry-parity`
    - `runtime:shadcn-surface`
  - 这说明 `5C` 必须收 doctor 口径，而不是只收页面输出。
- build heavy 当前真实旧路径:
  - `cli.build.heavy.test.ts` 当前 happy-path 输入已经切到：
    - `<alert ... variant="destructive">`
    - `<badge variant="secondary">`
    - `<table><row>...`
    - `<tabs><tab ...`
  - 当前输出当前至少显式保护：
    - `class="ahtml-runtime-host ahtml-runtime-document"`
    - `tone="` / `kind="` / `default="` 不再出现在 artifact 中
    - accordion 的 noscript fallback 结构
    - tabs / table / accordion 的 runtime slot 存在
- preview heavy 当前真实保护面:
  - `cli.preview.heavy.test.ts` 目前只证明：
    - preview server 能启动
    - 输出 HTML 可访问
    - 代表性的最终 semantic syntax 可渲染
    - style profile 能影响页面
  - 但它相对 build/runtime heavy 仍是较轻的保护面。
- runtime heavy 当前真实保护面:
  - `cli.runtime.heavy.test.ts` 当前锁定：
    - doctor 输出项存在
    - runtime manifest / verification state 已生成
    - runtime drift 会触发 parity 失败
    - runtime surface / glue proof / managed UI proof 会报警
  - 它更像“最后守门器”，不是语义迁移设计稿。
- runtime template / surface 当前真实最终 gate:
  - `runtime-template.test.ts` 当前锁定 checked-in `elements.tsx` / `kinds.ts` 与 runtime contract 同步
  - `runtime-surface.test.ts` 当前锁定：
    - runtime surface completeness
    - shell/base layer 完整性
    - glue proof / managed UI proof drift
    - doctor 在 surface 缺口下的失败形态

## 前置条件

1. `5A` 已经收紧主公开 contract，否则 heavy tests 无法诚实切换到最终 authoring surface。
2. `5B` 已经把 runtime spec 主路径收紧到最终 contract 方向，否则 doctor/parity 只会在一堆半迁移数据之间来回打架。
3. `4C` 已经足够清楚地处理 runtime host / document shell / gallery 边界；否则 `cli.build.heavy.test.ts` 中哪些 shell 断言该保、哪些该删，没有判断依据。

## 计划改动

1. 先改 heavy build fixtures 和 expectations：
   - 保持 happy-path build fixtures 停留在最终输入
   - 不再把 `ahtml-document-shell` 这类 artifact shell 视为自然宿主 contract 断言
2. 再改 preview / runtime heavy tests：
   - preview 至少要证明最终输出仍可访问、能渲染代表性最终 syntax，且不回退到旧输入依赖
   - runtime heavy 继续证明 doctor/parity/surface，但断言语气不能默许旧桥仍是合法主路径
3. 再改 doctor / runtime surface 相关口径：
   - 保留 parity / proof 检查
   - 让失败信息和成功标准都面向最终单路径
4. 最后回写执行型文档：
   - `roadmap.md`
   - `todo.md`
   - 必要时 `schema.md` / `layout.md` / `syntax.md`

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
- 再跑:
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- 再按实际改动面补:
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- 不足以单独宣称完成:
  - 只跑 `cli.test.ts`
  - 只跑 `render-capabilities.test.ts`
  - 只看 docs diff

## 停手边界

- 一旦出现以下信号就先停:
  - heavy build fixtures 仍只能写 legacy 输入，说明 `5A/5B` 并未真的完成
  - preview/build 重新依赖 `ahtml-document-shell` 作为自然宿主主断言，说明 `4C` 边界还没站稳
  - 为了让 doctor 通过，开始重新放宽已经收紧的 runtime spec 或公开 contract
  - 开始在这一刀里设计新的语义节点或新的 layout 参数面
- 这说明已经混入了哪个上一阶段问题:
  - 重新放宽 contract/spec 说明退回了 `5A/5B`
  - 重新定义 shell 语义说明退回了 `4C`
  - 新增语义设计说明跳回了 `Phase 2/3`

## 完成证据

- 代码证据:
  - `doctor-checks.mjs` 的检查口径仍完整，但已对准最终单路径
  - `cli.build.heavy.test.ts` / `cli.preview.heavy.test.ts` / `cli.runtime.heavy.test.ts` 不再继续保护旧主路径
  - `runtime-template.test.ts` / `runtime-surface.test.ts` 仍能解释最终 gate 为什么成立
- 测试证据:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
  - 以及实际改动到的 `cli.build.heavy.test.ts` / `cli.preview.heavy.test.ts`
- 文档证据:
  - `docs/roadmap.md`
  - `docs/todo.md`
  - 必要时 `docs/schema.md` / `docs/layout.md` / `docs/syntax.md`
  已不再把迁移桥描述成当前长期结构事实

## 当前风险

- 风险 1:
  `cli.build.heavy.test.ts` 现在同时保护 authoring 输入、runtime slot、style profile、shell 结构；如果不先拆清哪些断言是最终 contract，改动面会非常混乱。
- 风险 2:
  `cli.preview.heavy.test.ts` 当前保护面太轻，容易在“看起来还能预览”时漏掉最终 contract 是否已经真正切换。
- 风险 3:
  `cli.runtime.heavy.test.ts` 与 `doctor-checks.mjs` 更偏 parity / completeness；如果前面 contract/spec 还半迁移，失败会是链式爆炸，不是单点报错。
- 风险 4:
  只回写 docs 而不切换 heavy gates，会留下“文档说完成，测试还在保护旧路径”的双轨真相。

## 回退判断

- 如果这刀失败，最可能是哪个 gate 还在保护旧路径:
  - `cli.build.heavy.test.ts` 或 `cli.preview.heavy.test.ts` 仍继续要求 legacy 输入
  - `cli.build.heavy.test.ts` 或 `cli.preview.heavy.test.ts` 重新把 document shell 当作自然宿主默认值
  - `doctor-checks.mjs` 仍把旧 runtime capability 形状当合法事实
- 如果测试爆炸，先看哪一层:
  - 先看 `cli.runtime.heavy.test.ts` 是否因为 doctor/parity 口径切换而暴露 manifest/runtimeVerificationState 仍是旧数据
  - 再看 `runtime-surface.test.ts` 是否因为 shell/surface 断言仍围绕旧模板结构而报警
  - 最后看 `cli.build.heavy.test.ts` / `cli.preview.heavy.test.ts` 是否仍在期待 legacy authoring 或旧壳输出

## 交接说明

- 下一步最自然的承接工作:
  - 做 Phase 5 的总验收清单和剩余缺口审计
- 当前不能误判为“已经完成”的地方:
  - 只是 doctor 还绿，但 full heavy `build` / `runtime` 命令还没被完整证明
  - 只是 heavy tests 改了输入，但 docs 仍在描述旧桥为当前路径
  - 只是 docs 改了，但 `runtime-template.test.ts` / `runtime-surface.test.ts` 没有重新证明最终 gate
- 当前最需要额外盯住的点:
  - `ahtml-document-shell` 是否仍被误当成 contract 自然组成
  - preview heavy 是否需要补一条更能证明最终 contract 的断言
