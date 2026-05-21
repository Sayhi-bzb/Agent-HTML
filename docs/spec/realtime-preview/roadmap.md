# Realtime Preview Roadmap

本文记录这轮 `realtime preview` 重构主线的开发节奏，以及当前实现已经落到哪一阶段。  
它不重复顶层架构背景；顶层边界以 `blueprint/*` 和 `docs/spec/runtime/index.md` 为准。

本路线图解决的是同一件事：

- 把 `preview = build + serve static output` 切到 `preview = long-lived runtime session`
- 把预览主路径从“先产出 artifact 再查看”切到“先实时渲染与协作，再按需导出 artifact”
- 把 `build` 从预览前置条件收口为导出与交付能力

## 本轮固定约束

- preview 是首要工作模式，不再把 static artifact 视为默认工作形态
- build / portable artifact 继续保留，但服务交付、分享和归档
- preview 与 build 必须共用同一条语义到渲染链路
- 本轮不设计 agent 回流动作协议
- 本轮不扩展成通用前端交互系统

## 当前实现快照（2026-05-21）

- `preview` 已不再走 `buildArtifact(...) -> serveDirectory(...)`；CLI 主路径已切到 `runRuntimePreviewSession(...)`。
- `build` 仍保留导出职责，但其前置准备已拆成共享的 `prepareDocumentRuntime(...)`，供 preview 与 build 共同消费。
- preview session 现为长驻 runtime：
  - 启动 managed runtime
  - 写入当前 document / runtime state
  - 监听 `.agent.html` 文件变化
  - 在文档变化后刷新 runtime state
  - 在文档非法时保持 preview 进程存活并展示 diagnostics
- runtime host 已支持 `mode: "document" | "gallery" | "diagnostics"`，document preview 以 runtime state 中的 document 为主输入。
- 当前 live update 依赖 managed runtime 下的 generated runtime files 与 Vite dev reload，不是单独设计的一套浏览器端 preview-state 订阅协议。
- `README.md`、`docs-web/content/docs/index.mdx`、`.agents/skills/ahtml/references/*` 与 CLI help 已同步到 preview-first / build-as-export 口径。
- `preview --out` 兼容参数已从公开命令面移除，preview 不再保留输出目录兼容入口。

## Phase 1: Preview Path Decoupling

### Phase 1 目标

- 把 `preview` 从 `buildArtifact -> serveDirectory` 解耦为独立的 preview 主路径

### Phase 1 关键改动

- 将当前 artifact workflow 拆成：
  - document prepare / validate / renderability 主路径
  - artifact materialize / export 主路径
- `preview` 改为消费 prepare 结果，而不是强依赖完整 artifact 目录
- `build` 保留当前导出职责，但不再承载 preview 的前置语义

### Phase 1 不做什么

- 不引入浏览器自动刷新协议
- 不改 runtime host 的 document 输入模型
- 不新增交互组件或回流动作

### Phase 1 完成标准

- `preview` 不再以“先 build 完整目录”作为必要前提
- `build` 与 `preview` 的职责边界在 CLI 和 workflow 中明确分开
- preview 主路径已经能消费统一的 prepared document 结果

### Phase 1 当前状态

- 状态：已完成
- 已落地实现：
  - `packages/ahtml/src/cli/artifact-workflow.mjs` 已将 document prepare / validate / renderability 路径与 artifact materialize 路径拆开。
  - `packages/ahtml/src/cli/index.mjs` 的 `previewCommand` 已改为直接调用 `runRuntimePreviewSession(...)`。
  - `buildArtifact(...)` 现在消费 `prepareDocumentRuntime(...)` 的结果，再进入导出物化流程。

## Phase 2: Runtime State Driven Preview

### Phase 2 目标

- 让 runtime host 通过运行时 state 驱动 preview，而不是静态 import 生成文件

### Phase 2 关键改动

- runtime host 的 document mode 改为从 preview state 读取当前 document
- preview session 提供当前 document、diagnostics、profile 与 mode 所需状态
- `document.generated.json` / 同类静态输入不再是 preview 的主入口

### Phase 2 不做什么

- 不做文件监听
- 不做自动刷新
- 不改 gallery 的产品定义

### Phase 2 完成标准

- preview runtime 可以在不重启整个 CLI 的前提下重新接收 document 状态
- runtime host 的 preview 输入不再依赖构建期静态 import
- document mode 与 build mode 继续共用同一 renderer path

### Phase 2 当前状态

- 状态：主目标已完成
- 已落地实现：
  - `packages/ahtml/src/cli/runtime-host/app.tsx` 已支持读取 `runtimeState.document`，并支持 `diagnostics` mode。
  - `packages/ahtml/src/cli/runtime-preview.mjs` 会在每次刷新时写入 document、artifact profile、diagnostics 与 inputPath。
  - build 与 preview 仍共用同一条 runtime host / renderer path，没有重新分叉第二套 renderer。
- 当前保留：
  - `document.generated.json` 仍在 runtime host 中保留为 fallback / 共享输入的一部分，但 preview 主输入已切到 runtime state。

## Phase 3: Live Update Loop

### Phase 3 目标

- 建立真正的实时 preview loop，让 authoring 修改自动反映到浏览器

### Phase 3 关键改动

- preview session 增加文件监听与状态刷新机制
- 浏览器端增加 preview state 更新订阅
- diagnostics 改为长驻显示与自动恢复，而不是 preview 失败后直接退出

### Phase 3 不做什么

- 不把错误恢复做成第二套 renderer
- 不引入业务型交互状态机
- 不把本轮扩展成任意脚本执行入口

### Phase 3 完成标准

- 修改 `.agent.html` 后，preview 页面无需手动重启即可更新
- 文档非法时 preview 进程保持存活，并向页面展示 diagnostics
- 文档修复后，preview 可自动恢复正常渲染

### Phase 3 当前状态

- 状态：当前主线已落地
- 已落地实现：
  - `packages/ahtml/src/cli/runtime-preview.mjs` 已建立文件监听、去抖刷新与长驻 preview server。
  - 非法文档时 preview 不再退出，而是进入 diagnostics mode。
  - 文档修复后，preview 会自动恢复到 document mode。
- 当前实现方式：
  - 浏览器更新依赖 runtime generated files 的变化与 Vite dev server 的重载能力。
  - 这满足当前 realtime preview 主线，但并未额外设计一套独立的浏览器端状态订阅协议。

## Phase 4: Build As Export

### Phase 4 目标

- 把 `build` 收口为导出与物化能力，而不是预览前提

### Phase 4 关键改动

- `build` 只负责把共享渲染结果 materialize 成交付物
- preview 与 build 的差异收敛为：
  - preview：长驻会话与实时状态更新
  - build：导出 `index.html`、assets、inspection 与相关交付文件
- tests、docs、help text 与残留实现口径统一改成 preview-first

### Phase 4 不做什么

- 不重新引入双路径 renderer
- 不把 preview 再降回静态目录服务器包装层
- 不在本轮同步设计交互协议

### Phase 4 完成标准

- build 被定义为 export/materialize，而不是 preview 前置条件
- preview-first 口径在 CLI、runtime、tests 和 docs 中一致
- static artifact 成为明确的交付形态，而不是默认工作形态

### Phase 4 当前状态

- 状态：主线已完成
- 已落地部分：
  - CLI runtime 与测试主路径已经切到 preview-first。
  - `packages/ahtml/src/cli/command-contract.mjs` 已把 `preview` 描述为 realtime preview session。
  - `build` 在实现层面已收口为 export / materialize。
  - `README.md`、`docs-web/content/docs/index.mdx` 与 `.agents/skills/ahtml/*` 已统一成 preview-first 文案。
  - `preview --out` 已从 CLI help、测试和用户文档中移除。
- 当前保留：
  - 还需要在后续常规维护中持续防止旧的 static-preview 叙述重新回流到新文档或帮助文本。

## 总体验收

当下面五件事同时成立时，这轮主线才算完成：

- preview 已成为默认工作模式
- preview 不再依赖完整 static artifact 目录生成
- runtime host 已由运行时 state 驱动 preview
- preview 与 build 仍共用同一条语义到渲染链路
- build 已收口为交付、分享和归档能力

## 当前验收判断（2026-05-21）

- 已满足：
  - preview 已成为默认工作模式
  - preview 不再依赖完整 static artifact 目录生成
  - runtime host 已由运行时 state 驱动 preview
  - preview 与 build 仍共用同一条语义到渲染链路
  - build 已收口为交付、分享和归档能力
- 当前剩余风险：
  - 主线本身暂无已知功能缺口；后续主要是常规维护中防止旧的 static-preview 叙述或错误编译边界重新回流。

## 当前验证快照（2026-05-21）

当前状态至少已由下面这些验证覆盖：

- `npm run build`
- `npm run test:run:cli-heavy:preview`
- `npm run test:run -- packages/ahtml/src/cli/command-contract.test.ts packages/ahtml/src/cli/cli-surface.test.ts packages/ahtml/src/cli/governance-sync.test.ts`
- `npm run test:run -- packages/ahtml/src/cli/gallery-alignment.test.ts packages/ahtml/src/cli/governance-sync.test.ts packages/ahtml/src/cli/cli-surface.test.ts packages/ahtml/src/cli/command-contract.test.ts`
- `npm run docs:web:build`
- 既有实现验证记录：
  - `npx vitest run packages/ahtml/src/cli/command-contract.test.ts`
  - `npx vitest run packages/ahtml/src/cli/cli-surface.test.ts`
  - `npx vitest run packages/ahtml/src/cli/runtime-bootstrap.test.ts`
  - `npx vitest run packages/ahtml/src/cli/runtime-surface.test.ts`

## 备注

- 零散修复、临时阻塞和子任务拆分不放在本文；后续应放到对应 `todo` 文档
- 若中途需要改变 preview-first 策略，应先改本路线图，再改实现
