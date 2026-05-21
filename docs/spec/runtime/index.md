# Runtime Audit And Target Standard

`runtime` 是 `agent-html` 的前端运行时外壳。  
它承接 `runtime-bootstrap` 产出的 Vite shell，消费 `document` / `gallery` 两种 mode，并把 artifact profile、renderer registry、managed UI 与宿主样式连接到最终浏览器界面。

本文既是当前 `runtime` 的实现审计，也是后续重构的目标规范。  
若未来 runtime 重构与本文冲突，以本文作为 runtime 层的约束基线。

实时预览主线的开发节奏见 `docs/spec/realtime-preview/roadmap.md`。

## 1. Current Runtime Shape

当前 runtime 不是单一 `gallery` 前端，而是完整的前端 runtime：

- `packages/ahtml/src/cli/runtime-host/app.tsx`
  - 是统一入口。
  - 根据 `runtimeState.mode` 在 `GalleryApp` 与 `DocumentApp` 之间切换。
- `packages/ahtml/src/cli/runtime-host/features/document/app.tsx`
  - 也是 React 前端界面。
  - 通过 `RuntimeStyleElements`、`DocumentArtifactShell` 与 `RendererNode` 渲染文档模式。
- `packages/ahtml/src/cli/runtime-host/features/gallery/*`
  - 承担 gallery mode 的 UI、workbench、inspector 与 profile 编辑体验。
- `packages/ahtml/src/cli/runtime-host/renderer/*`
  - 是 document 与 gallery 共用的前端渲染层，不属于某一个 feature 私有实现。
- `packages/ahtml/src/cli/runtime-bootstrap/index.mjs`
  - 会把 `runtime-host/features`、`runtime-host/renderer`、`artifact-shell.tsx`、`host-styles.tsx`、`profile-theme.ts` 注入 runtime shell。
- `packages/ahtml/src/cli/runtime-surface.mjs`
  - 明确 runtime shell 的基础来源已经进入 `ahtml-managed-runtime` 治理语义：
  - surface source: `ahtml-managed-runtime`
  - shell source: `ahtml-runtime-shell`
  - init source: `ahtml-bootstrap`
  - 它依然以 shadcn Vite runtime surface 为基底，但 provenance 已不再直接暴露为旧的 `shadcn-init` / `shadcn-cli` 表达。

因此，runtime 的现实结构是：

```text
runtime shell
├── app entry
├── document mode
├── gallery mode
├── shared renderer
├── shared token/theme layer
└── managed runtime ui overrides
```

## 2. Audit Findings

### 顶层 CSS 是否统一

结论：**部分统一，但还不是单一顶层标准。**

已统一的层：

- `packages/ahtml/src/cli/runtime-host/host-styles.tsx`
  - 注入 `createRuntimeHostCss()`、`createArtifactShellCss()`、`createDocumentLayoutPolicyCss()`、`createGalleryLayoutPolicyCss()`。
  - 这说明 runtime 已经存在共享宿主层与共享 layout policy 层。
- `packages/ahtml/src/cli/runtime-host/artifact-shell.tsx`
  - 为 document / gallery 共用 `.ahtml-artifact-root` 和 layout policy class。
  - page gap、page padding 等已经开始通过共享变量消费。

未统一的层：

- `packages/ahtml/src/cli/runtime-host/features/gallery/styles.ts`
  - 现在应只作为 gallery scene CSS 的装配入口。
  - `styles/base.ts`、`styles/custom.ts`、`styles/cards.ts`、`styles/colors.ts`、`styles/typography.ts`、`styles/dashboard.ts`、`styles/mail.ts`、`styles/pricing.ts`、`styles/responsive.ts`
    承担 preview scene 级样式分片。
  - 这层仍然保有大量 `ahtml-gallery-*` 手写 CSS，但已经不再以单一巨型字符串文件承载全部 preview scene。
- `host-styles.tsx` 的 shared shell 只提供了基础宿主样式与通用布局 policy。
  - 还没有把 feature 页面壳层也统一收敛到同一套 runtime shell 标准。
- 但最近一轮治理已经开始把 `gallery` 的壳层布局常量持续上移到 `host-styles.tsx`：
  - page header / mobile tabs / sidebar / divider / control header
  - preview toolbar / toolbar group / preview shell / preview mode bar
  - stage toolbar / stage toolbar inset 这类宿主 frame
  - preset rail / preset chooser / preset popover
  - font picker / token editor / color token popover 这类 editor shell
  - preview stage panel / preview document prose policy / stage title copy 这类 shared preview shell
  - stage frame / preview shell
  - custom / dashboard / mail / pricing 的列宽和 panel gap
  - color / typography / workbench footer 的展示区 grid min-width 与 card padding
  - inspector panel、custom browser toolbar、preview empty state、connection status 这类 preview/content 壳层的 padding 与 width policy
  - cards workbench、custom rich grid、dashboard cards、mail attachments、pricing grid 这类 page-level column policy
  - preset stats、color popover、inspector grid 以及部分 responsive column fallback 也开始通过 shared token 管理
  - 高频微布局节奏也已开始上收：
    - `0.35rem` / `0.45rem` / `0.5rem` / `0.55rem` / `0.7rem` 这组 gap
    - `0.8rem` / `0.9rem` 这组 surface padding
  - 这些值现在应优先通过 runtime 顶层 token 消费，而不是继续在 `gallery/styles.ts` 内散落成字面量

审计判断：

- runtime 不是“每个页面完全各写各的 CSS”。
- 但也不是“只有一套顶层 CSS，然后所有 feature 只消费这套标准”。
- 当前更接近：
  - shared host css
  - shared artifact/layout css
  - feature-specific shell css

### 是否直接消费 shadcn 原装组件

结论：**部分直接消费，但不是纯原装。**

直接消费的证据：

- `packages/ahtml/src/cli/runtime-host/renderer/elements.tsx`
  - 直接注册并消费大量 shadcn 组件：
  - `Accordion`
  - `Alert`
  - `Badge`
  - `Card`
  - `Checkbox`
  - `Combobox`
  - `Field`
  - `Input`
  - `Progress`
  - `RadioGroup`
  - `Select`
  - `Separator`
  - `Slider`
  - `Switch`
  - `Tabs`
  - `Textarea`
  - `ToggleGroup`
- `gallery` 的 `controls.tsx` 与 `preview.tsx`
  - 也直接 import 并组合这些 runtime UI 组件。

不是纯原装的证据：

- `packages/ahtml/src/cli/runtime-managed-ui.mjs`
  - 当前已经改成显式 managed override 注册表，而不是“目录里有文件就算 override”。
- 当前仍保留 runtime-specific managed override 的组件：
  - `slider.tsx`
  - 理由是 runtime renderer 需要把 field semantics 透传到 slider thumb / control 语义层。
- `runtime-host` 源码侧现在也只保留 `slider.tsx` 这一个本地 override。
- baseline shadcn 组件源现在应来自 `scripts/verify-pack/shadcn-test-fixtures/components/ui/*`。
- `runtime-host/components/ui/*` 不再承载 baseline 镜像副本，只承载显式 override。
- `runtime-host` 的本地 type-check 也应默认回落到 shadcn fixture 基线，而不是继续优先消费本地镜像副本。

审计判断：

- runtime 并不是完全绕开 shadcn，自造一套组件。
- 但也不是“100% 直接吃官方 shadcn 原装组件源码”。
- 当前更接近：
  - runtime surface 以 shadcn 组件体系为基底
  - 少数组件通过 managed override 维持 runtime 特殊行为或兼容层

### 页面与布局是否统一消费 token

结论：**token 层已经统一，但页面与布局层还没有完全 token-first。**

已统一的层：

- `packages/ahtml/src/cli/runtime-host/profile-theme.ts`
  - 把 `artifactProfile.globalStyle` 统一映射到 CSS 变量。
  - 包含 `--background`、`--foreground`、`--border`、`--radius`、`--font-sans`、`--font-heading`、`--spacing`、`--surface-shadow` 等。
- `createDocumentStyleCss()` 与 `createGalleryPreviewThemeCss()`
  - 说明 document 与 gallery preview 都在消费同一套 artifact profile token。
- `artifact-shell.tsx`
  - 已经让 `gap`、`page padding`、`page width` 走共享变量和 layout policy。

未统一的层：

- `gallery/styles.ts` 与 `gallery/styles/*`
  - 虽然大量使用了 `var(--background)`、`var(--border)`、`var(--foreground)` 等 token，
  - 但页面壳层自身仍写入了大量 feature 常量：
    - `padding: 0.7rem 1rem`
    - `min-height: 3.5rem`
    - `width: min(31rem, 33vw)`
    - 多组 preview panel 的固定 gap / grid / shell 节奏
- 这些值没有统一提升到 runtime layout token 层。
- 当前这些值已经不再只停留在最早的 page shell 上。
  - 一部分 gallery 展示区布局参数已经提升为共享 token。
  - 但仍有剩余 feature-local 常量尚未完全消化。

审计判断：

- runtime 不是“没有 token”。
- runtime 已经拥有统一 token 生成层，并且大量 UI 都在消费这些 token。
- 真正的差距在于：
  - 页面壳层
  - workbench 布局
  - feature panel 密度与间距
    还没有系统化地统一提升到 layout token 层。

## 3. Gap Classification

### 符合目标

- runtime 有统一前端入口，不是 feature 各自独立前端。
- runtime 已经建立统一 token 映射层。
- runtime 已经建立统一 renderer 组件层。
- runtime shell 明确依赖 `tailwindcss`、`tw-animate-css`、`shadcn/tailwind.css`，不是脱离 shadcn 体系的纯自造方案。
- runtime surface provenance 已经显式进入 ahtml 管理语义，而不是继续把治理状态表述为 shadcn 原始初始化产物。

### 部分符合目标

- 顶层 CSS 已有 shared host shell，但 feature 页面层仍有扩张。
- 大量组件已直接消费 shadcn 体系，但存在 managed override。
- 页面和布局已部分消费 token，但 layout rhythm 还未完全抽象成统一标准。

### 明显偏离目标

- `gallery` 的 workbench CSS 过重，已经形成一套独立页面壳层体系。
- feature 层仍持有大量布局常量，难以称为“统一 layout token 消费”。
- managed UI override 的存在说明 runtime 还没有收敛到“默认直接用原装 shadcn，例外极少”的状态。

## 4. Runtime Target Standard

未来 runtime 应收敛到以下标准。

### 顶层 CSS

- runtime 只保留一套共享宿主样式入口。
- 共享宿主层应覆盖：
  - page shell
  - shared toolbar rhythm
  - panel density
  - layout policy
  - artifact shell baseline
- `gallery` 的 header / tabs / sidebar / divider / preview toolbar / stage toolbar 这类 shell 或 frame 级结构，应优先由 `host-styles.tsx` 持有。
- `preset chooser`、`font picker`、`token editor`、`inspector` 这类 gallery editor 通用壳层，也应优先由 `host-styles.tsx` 持有。
- feature 不应继续扩张并列的页面壳层体系。
- 若 feature 需要附加样式，应限定为：
  - 局部组件状态
  - 预览内容特有样式
  - 无法提升到 shared shell 的例外样式
- `runtime-host` 源码本身也必须进入显式源码约束。
  - 至少应保有独立的 `tsx` 类型检查入口，而不是只依赖生成后的 runtime shell 自检。
  - 这条约束不应只停留在手动脚本层。
    当前应进入默认 `build` / workspace gate，而不是依赖开发者额外记忆。

### 组件策略

- 默认直接消费 shadcn 原装组件。
- `runtime-host` 源码侧应默认通过 shared alias 消费 shadcn 基线组件，不保留无理由的本地镜像副本。
- 只有 runtime 特殊约束确实存在时，才允许 managed override。
- managed override 必须是显式注册表，而不是“目录里存在文件就默认算 override”。
- 每个 managed override 都应有明确理由：
  - runtime-specific behavior
  - packaging constraint
  - compatibility contract
- 不允许把“局部视觉偏好”作为 override 理由。

### Token 策略

- 颜色、字体、radius、spacing、shadow 继续从 artifact profile 统一导出。
- layout rhythm 也应提升到统一 token 层：
  - page padding
  - panel gap
  - toolbar height
  - shell density
  - sidebar width policy
- 高频 micro spacing / surface padding 也应属于共享 runtime host token：
  - `space-2xs` / `space-xs` / `space-sm` / `space-md` / `space-lg`
  - `surface-padding-sm` / `surface-padding-md`
- feature 不应再维持并列的 spacing / shell 常量体系。
- 对已经完成上收的常量，应通过治理测试阻止字面量回退。

### 布局策略

- document 与 gallery 应共用 runtime shell 规则，而不是各自定义页面标准。
- feature 页面只表达：
  - 模式差异
  - 交互差异
  - preview 内容差异
- 通用结构差异不应继续停留在 feature CSS 内。

## 5. Follow-up Refactor Directions

本文不实现重构，只定义方向。

- 收敛 `gallery` 的 workbench CSS 到 shared shell 和 shared layout token。
- 盘点 `runtime-host/components/ui/*` 的 managed override，区分必要 override 与历史漂移。
- 让 document 与 gallery 的页面级节奏、padding、panel policy 从同一 runtime 标准导出，而不是在 feature 层各自扩张。

## 6. Final Audit Position

runtime 不是“完全没有继承 shadcn 哲学”。  
更准确的结论是：

- 它已经继承了 shadcn 的 token 和组件消费思路。
- 它已经以 shadcn runtime surface 作为前端基底。
- 但它还没有把页面壳层、布局系统、feature workbench 全部收敛到同样纯粹的 token-first + direct-component-consumption 标准。

因此，runtime 当前状态应定义为：

**部分继承 shadcn 哲学，但尚未完成 runtime 层面的系统化收敛。**
