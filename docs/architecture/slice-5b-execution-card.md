# Slice: 5B

## 归属

- Phase: 5
- Slice: 5B
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-5-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `5A` 收的是公开 contract；`5B` 收的是 runtime spec。两者必须拆开，否则会把“schema 已切换”和“runtime 还在吃旧桥”混成一次不可解释的大改。
- 当前 `renderer/types.ts`、`render-capabilities.mjs`、`component-capabilities.mjs` 仍把 `kindProp`、`modeProp`、`defaultProp`、`defaultMode` 当正式字段承认，这会持续鼓励下游实现把旧桥视为常规能力。
- `tabs`、`accordion`、`table` 这三条 bridge 目前仍是真实主路径依赖；`5B` 不能写成“删旧字段”，而要写成“确认替代路径已存在后，才收类型面和 mapping 主路径”。

## 这刀要证明什么

- 必须为真的结果 1:
  runtime spec 的主路径形状已经开始朝最终 contract 收口，而不是继续把 legacy bridge 当长期组成部分。
- 必须为真的结果 2:
  `kindProp`、`modeProp`、`defaultProp`、`defaultMode` 如果暂时还存在，也已经退成显式兼容点，而不是 renderer kind requiredFields 的默认前提。
- 必须为真的结果 3:
  `tabs`、`accordion`、`table` 的替代路径已经在 `Phase 2/3/4` 建好；如果没有，就必须诚实停手，不硬删。

## 第一批入口文件

- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/render-capabilities.mjs`
- 视需要改 `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

## 明确不碰

- `packages/ahtml/src/cli/doctor-checks.mjs`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- `docs/roadmap.md` / `docs/todo.md` 的最终收尾口径

## 当前现实依据

- 代码入口:
  - `renderer/types.ts` 当前仍正式允许：
    - `defaultProp`
    - `modeProp`
    - `defaultMode`
    - `headerKind`
    - `kindProp`
  - `render-capabilities.mjs` 当前仍要求：
    - `table.requiredFields` 包含 `kindProp`、`headerKind`
    - `accordion.requiredFields` 包含 `modeProp`、`defaultProp`
    - `tabs.requiredFields` 包含 `defaultProp`
  - `component-capabilities.mjs` 当前仍明写：
    - `table.renderer.kindProp = "kind"`
    - `table.renderer.headerKind = "header"`
    - `tabs.renderer.defaultProp = "default"`
    - `accordion.renderer.modeProp = "mode"`
    - `accordion.renderer.defaultProp = "default"`
    - `accordion.renderer.defaultMode = "multiple"`
    - `accordion.behavior.modeProp/defaultProp/defaultMode`
- 现有 bridge / 旧路径:
  - `tabs` 仍靠 `default -> defaultProp` 决定默认选中项
  - `accordion` 仍靠 `mode/default/defaultMode` 决定展开模式和默认状态
  - `table` 仍靠 `row.kind -> kindProp/headerKind` 做 header/body 分流
- 当前测试或 fixture:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
    - 主要证明 verification/mapping/manifest 同源，不证明 legacy field 已可安全删除
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
    - `accordion` 有明确 default-state 保护
    - `tabs` 只证明 spec prop names 与基础内容投影，默认状态保护偏弱
    - `table` 缺少聚焦 header/body 分流断言的证据
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
    - happy-path 已切到结构化 tabs / 标准 table 输入
    - 但 tabs 默认状态和 table header/body 的 focused artifact 断言仍偏弱
    - 仍继续覆盖 `accordion`
- 对应审计文档:
  - `docs/architecture/execution-checklist.md`
  - `docs/architecture/phase-5-implementation-draft.md`
  - `docs/details/high-risk-runtime-bridges.md`
  - `docs/details/tabs-migration-card.md`
  - `docs/details/accordion-migration-card.md`
  - `docs/details/table-migration-card.md`

## 前置条件

1. `5A` 已经把 legacy field 从主公开 contract 方向上收紧，至少不再把它们继续当新增公开能力入口。
2. `4A/4B` 已经把 legacy bridge 从主渲染分支中显式隔离，能够定位哪些逻辑是兼容层，哪些是主 projection 路径。
3. 对 `tabs`、`accordion`、`table`，至少已有一种可执行的新路径或显式兼容退场方案；不能一边没有替代，一边删 requiredFields。

## 计划改动

1. 先在 `renderer/types.ts` 收类型面，明确哪些字段仍是正式 projection 成员，哪些只是兼容桥字段。
2. 再在 `render-capabilities.mjs` 收 kind requiredFields，优先把“必须存在旧桥字段才算合法 spec”这件事拆掉。
3. 再在 `component-capabilities.mjs` 收定义层，把 runtime projection 必需字段和 legacy compatibility bridge 字段明确分层。
4. 只有在替代路径已存在时，才允许动 `render-node.tsx` 的主分支；否则只记录阻塞点，不做假收口。

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/config/render-capabilities.test.ts`
- 再跑:
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 不先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`

## 停手边界

- 一旦出现以下信号就先停:
  - `tabs` 仍无新默认状态路径，却准备删除 `defaultProp`
  - `accordion` 仍无新状态模型，却准备删除 `modeProp/defaultProp/defaultMode`
  - `table` 仍无新 header/body 结构语义，却准备删除 `kindProp/headerKind`
  - 开始回写 doctor / heavy tests / docs 最终口径
- 这说明已经混入了哪个下一阶段问题:
  - 改 doctor / heavy tests / docs 说明已经混入 `5C`
  - 没有替代路径却硬删字段，说明其实 `5A/4B` 甚至更早阶段并未完成

## 完成证据

- 代码证据:
  - `renderer/types.ts` 不再把旧桥字段视为默认常规 renderer spec 成员
  - `render-capabilities.mjs` 不再把 `kindProp`、`modeProp`、`defaultProp`、`defaultMode` 当主路径 requiredFields
  - `component-capabilities.mjs` 中 runtime projection 字段与 compatibility bridge 的边界已清楚
- 测试证据:
  - `packages/ahtml/src/config/render-capabilities.test.ts`
  - `packages/ahtml/src/config/runtime-contract.test.ts`
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- 文档证据:
  - 本卡与 `docs/architecture/execution-checklist.md`
  - `docs/details/tabs-migration-card.md`
  - `docs/details/accordion-migration-card.md`
  - `docs/details/table-migration-card.md`
    的口径保持一致

## 当前风险

- 风险 1:
  `tabs` 的默认状态行为保护偏弱；删桥前如果不补更聚焦的断言，容易出现行为回归但测试未及时报警。
- 风险 2:
  `table` 的 header/body 分流目前缺少足够 focused coverage；它比字段删除本身更危险。
- 风险 3:
  `accordion` 的桥最完整、测试也相对更强，所以它最不容易“静默回归”，但也最容易牵动 behavior/runtime parity。
- 风险 4:
  `runtime-contract.test.ts` 当前更像同源性测试，不足以单独证明 legacy bridge 已安全退出主路径。

## 回退判断

- 如果这刀失败，最可能是哪个桥接点没有替代路径:
  - `tabs.default -> defaultProp`
  - `row.kind -> kindProp/headerKind`
  - `accordion.mode/default/defaultMode`
- 如果测试爆炸，先看哪一层:
  - 先看 `render-capabilities.test.ts` 是否因为 requiredFields 被收紧而暴露 spec 缺口
  - 再看 `runtime-contract.test.ts` 是否因为 verification/mapping 同源数据仍携带旧字段而报警
  - 最后看 `render-node.test.ts` 是否暴露 `tabs` 默认状态、`accordion` 展开状态、`table` 分流行为仍依赖旧 spec 字段

## 交接说明

- 下一刀最自然的承接 slice:
  - `5C`
- 当前不能误判为“已经完成”的地方:
  - 只是从类型上删了字段，但 `render-capabilities.mjs` 和 `component-capabilities.mjs` 仍要求它们
  - 只是从 requiredFields 删了字段，但 `render-node.tsx` 仍默认依赖旧桥
  - `tabs` / `table` 仍无新路径，却靠测试保护薄弱“看起来没炸”
- 当前最需要补强的保护点:
  - `tabs` 默认状态 focused 断言
  - `table` header/body 分流 focused 断言
