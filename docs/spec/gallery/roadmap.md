# Gallery Roadmap

本文记录这轮 `gallery` 规范化重构与治理清理的开发节奏，以及当前实现已经落到哪一阶段。  
它不重复 `gallery` 的顶层产品定义；产品定义以 `docs/spec/gallery/gallery.md` 为准，runtime 层统一约束以 `docs/spec/runtime/index.md` 为准。

本路线图解决的是同一件事：

- 把 `gallery` 收敛为 runtime 内的受管 mode，而不是独立前端工程
- 把 gallery 的实现从大体量 feature 单体，持续收敛为 orchestrator + modules
- 把 gallery 的样式、组件来源和 layout/token 使用方式，持续收敛到 runtime 统一治理标准

## 本轮固定约束

- `gallery` 是 `runtime` 的一个 mode，不是独立的前端脚手架或第二套 runtime shell
- `gallery` 继续服务于 artifact profile 的选择、编辑、保存与预览，不扩展成语义 authoring 入口
- runtime 的目标标准保持为：
  - 一套顶层 CSS
  - 默认直接消费 shadcn 基线组件
  - 页面与布局统一消费 token
- `runtime-host/components/ui/*` 只允许保留显式 managed override，不再承载 baseline 镜像副本
- `gallery` 的大文件应持续收敛为 orchestrator，具体 tab / scene / shared 实现下沉到子模块

## 当前实现快照（2026-05-21）

- `packages/ahtml/src/cli/runtime-host/app.tsx` 仍是统一 runtime 入口，根据 `mode` 在 `GalleryApp` 与 `DocumentApp` 之间切换
- `gallery` 当前已经形成明确的 feature 子目录：
  - `controls/`
  - `preview/`
  - `shared/`
  - `styles/`
- `preview.tsx` 已收敛为 orchestrator，具体 preview scene 已下沉到 `preview/*`
- `controls.tsx` 已收敛为 orchestrator，具体 control tab 已下沉到 `controls/*`
- 原先单体 `shared.tsx` 已移除，改为 `shared/index.tsx` 作为 export surface，具体实现下沉到 `shared/*`
- runtime managed UI 已切成两层来源：
  - shadcn 基线组件来源：`scripts/verify-pack/shadcn-test-fixtures/components/ui/*`
  - runtime override 来源：`packages/ahtml/src/cli/runtime-host/components/ui/*`
- 当前 runtime 只保留一个显式 managed override：`slider.tsx`
- `host-styles.tsx` 已接管大量 gallery shell、toolbar、panel 与部分 grid / spacing token
- `gallery/styles.ts` 及 `styles/*` 仍保留 preview scene 级样式装配，不再是单一巨型字符串文件
- `gallery/app.tsx` 已收敛为薄 orchestrator：page shell、mobile tabs 与 panel 装配仍留在 `app.tsx`，workbench state / actions / derived state / fullscreen / inspector 组合已下沉到 `state.ts`、`actions.tsx`、`hooks.tsx`

## Phase 1: Runtime Surface Governance

### Phase 1 目标

- 收口 runtime UI 基线来源和 override 策略

### Phase 1 关键改动

- 将 runtime UI baseline 改为来自受管的 shadcn fixtures
- 将 runtime UI override 收口为显式注册表，而不是目录即 override
- 让 runtime-host 源码侧默认回落到 shared shadcn 基线，而不是优先消费本地镜像副本

### Phase 1 不做什么

- 不把 gallery 变成独立 shadcn project
- 不把视觉偏好当作 override 理由
- 不恢复 runtime-host 内的 baseline 组件镜像副本

### Phase 1 完成标准

- baseline 与 override 来源明确分离
- 每个 override 都有显式登记与理由
- runtime-host 默认消费 shared shadcn 基线组件

### Phase 1 当前状态

- 状态：已完成
- 已落地实现：
  - `runtime-managed-ui.mjs` 已改为显式 managed override 注册表
  - shadcn baseline 已切到 `scripts/verify-pack/shadcn-test-fixtures/components/ui/*`
  - `runtime-host/components/ui/*` 当前只保留 `slider.tsx`
  - runtime-host type-check 已默认回落到 shadcn fixture 基线

## Phase 2: Gallery Module Decomposition

### Phase 2 目标

- 把 gallery 的 preview、controls、shared 从单体文件拆成受控模块

### Phase 2 关键改动

- `preview.tsx` 只保留 preview shell、mode bar 与 scene orchestration
- `controls.tsx` 只保留 control shell、tab routing 与 state handoff
- `shared/index.tsx` 只保留 shared export surface
- consumer 改为依赖具体 `shared/*` 模块，而不是继续消费 shared monolith

### Phase 2 不做什么

- 不把 gallery 的所有状态与行为继续堆回 orchestrator 文件
- 不恢复 `shared.tsx` 这种大一统 shared monolith
- 不在 orchestrator 文件里重新内联大块 tab / scene JSX 实现

### Phase 2 完成标准

- preview、controls、shared 都有清晰的模块边界
- orchestrator 文件不再内嵌大段 tab / scene / shared 实现
- 治理测试能够阻止 monolith import 与结构回退

### Phase 2 当前状态

- 状态：已完成
- 已落地实现：
  - `preview.tsx -> preview/*`
  - `controls.tsx -> controls/*`
  - `shared.tsx -> shared/index.tsx + shared/*`
  - `governance-sync.test.ts` 已覆盖 orchestrator 约束与 shared import 约束

## Phase 3: Host Style And Token Centralization

### Phase 3 目标

- 把 gallery 的页面壳层、toolbar、panel、micro spacing 持续上收至 shared host token 与 shared shell

### Phase 3 关键改动

- 将 header、mobile tabs、sidebar、divider、preview toolbar、stage toolbar 等 shell selector 上收至 `host-styles.tsx`
- 将高频 micro spacing、surface padding 与部分 column policy 提升为 shared runtime token
- 将 feature CSS 收敛到 scene-specific 样式，而不是继续扩张页面壳层体系

### Phase 3 不做什么

- 不让 feature 继续维持并列的 page shell 标准
- 不把已上收的 spacing / padding / grid policy 退回为字面量
- 不把无法复用的 feature 样式伪装成 shared shell

### Phase 3 完成标准

- page shell 与 editor shell 主要由 `host-styles.tsx` 持有
- feature CSS 只保留 preview scene 或确实无法上收的例外样式
- 治理测试能够阻止 micro spacing 与 surface padding 回退成字面量

### Phase 3 当前状态

- 状态：进行中
- 已落地部分：
  - `host-styles.tsx` 已接管大量 gallery shell selector 与 frame ownership
  - 多组 micro spacing 与 surface padding 已提升为 shared token
  - 部分 grid column policy 已由治理测试锁定
- 尚未收口部分：
  - `gallery/styles.ts` 与 `styles/*` 仍保有较多 feature-local layout 常量
  - gallery workbench 还没有完全达到单一顶层 CSS + token-first 的状态

## Phase 4: GalleryApp State And Effect Decomposition

### Phase 4 目标

- 把 `gallery/app.tsx` 收敛成真正的 orchestrator，而不是继续承载完整工作台状态机

### Phase 4 关键改动

- 将 initial editor state factory、filtered preset/token selectors、active profile summary 等纯状态逻辑下沉到 state/selectors 模块
- 将 draft update、token update、preset select/create/save/delete/reset、clipboard copy、focus/open-tab helpers 下沉到 actions 模块
- 将 fullscreen state sync 与 toggle handler 下沉到独立 effect/hook 模块
- 将 inspector hover / pin / esc / scroll 行为与 inspector state 组装下沉到独立 effect/hook 模块
- `app.tsx` 最终只保留：
  - refs
  - state wiring
  - hook composition
  - final JSX shell

### Phase 4 不做什么

- 不再向 `app.tsx` 回填新的大块 `useCallback` 与 `useEffect`
- 不把 inspector 与 fullscreen 行为继续和 render shell 紧耦合
- 不用“文件仍然可运行”替代 orchestrator 收口

### Phase 4 完成标准

- `app.tsx` 不再混合大段 state、actions 与 effect 实现
- gallery 的核心行为有独立模块边界，可被治理测试约束
- `GalleryApp` 的职责收敛到 runtime shell 组装与 feature 组合

### Phase 4 当前状态

- 状态：已完成
- 已落地实现：
  - initial editor state、preset / token filtering、active profile summary 与 renderer / preview derived state 已下沉到 `state.ts`
  - draft update、theme token update、profile select / create / save / delete / reset、clipboard copy、focus / open-tab helpers 已下沉到 `actions.tsx`
  - hydrate、fullscreen、focus reset、inspector 行为与 `useGalleryAppController` 已下沉到 `hooks.tsx`
  - `gallery/app.tsx` 当前只保留 gallery shell JSX、mobile tab 切换与 pane 组装，不再直接持有大块 state / action / effect 实现
  - `governance-sync.test.ts` 已显式约束 `app.tsx` 通过 `useGalleryAppController` 和 pane prop bags 维持 orchestrator 边界

## 总体验收

当下面五件事同时成立时，这轮 gallery 规范化主线才算完成：

- gallery 已稳定收敛为 runtime 内的受管 mode
- runtime UI 已默认消费 shadcn 基线，override 仅保留必要例外
- gallery 的 preview、controls、shared 已具备受控模块边界
- gallery 的页面壳层与 layout/token 已主要收敛到 shared host standard
- `gallery/app.tsx` 已从 feature 单体收敛为 orchestrator

## 当前验收判断（2026-05-21）

- 已满足：
  - gallery 已稳定作为 runtime mode 挂在统一入口之下
  - runtime UI baseline / override 治理已显式化
  - preview、controls、shared 三块模块拆分已完成
  - `gallery/app.tsx` 已从 feature 单体收敛为 orchestrator
- 基本满足但仍需继续收口：
  - host style / token centralization 已有明显进展，但 gallery workbench 仍未完全收敛

## 当前未收口主线

- `gallery/styles.ts` 与 `styles/*` 仍保有一批 feature-local layout 常量与 scene-specific policy，尚未完全达到单一顶层 CSS + token-first 的状态
- 当前治理主要已锁住 shell ownership、micro spacing、surface padding 与部分 grid policy；仍需要继续把可复用的 workbench layout policy 从 scene CSS 上收

## 当前验证快照（2026-05-21）

当前状态至少已由下面这些验证覆盖：

- `npx tsc -p packages/ahtml/tsconfig.runtime-host.json`
- `npx vitest run packages/ahtml/src/cli/governance-sync.test.ts packages/ahtml/src/cli/gallery-alignment.test.ts`

## 备注

- 本文只记录 gallery 规范化主线的阶段推进，不重复 `gallery.md` 的产品信息架构与交互定义
- 若后续 gallery 的治理目标改变，应先更新本路线图，再更新实现与治理测试
