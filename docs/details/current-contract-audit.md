# Current Contract Audit

本文记录当前工作树里 agent-html 公共 contract、schema 生成链路、runtime 消费点和 layout 缺口的基线事实。

它不定义新架构目标；它的作用是给 `docs/roadmap.md` 的 Phase 1 和 Phase 2 提供可追踪到代码的当前状态证据。

## 范围

本审计只覆盖当前工作树中的这些入口：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/generated/component-schema.generated.ts`
- `packages/core/src/component-schema.ts`
- `packages/core/src/public-agent-contract.ts`
- `packages/core/src/parse/parse-agent-html.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- `packages/core/src/parse/sanitize-agent-html.ts`
- `scripts/generate-component-schema.mjs`
- `packages/ahtml/src/cli/schema.mjs`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/config/render-capabilities.mjs`
- `packages/ahtml/src/config/runtime-contract.mjs`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`

## 结论概览

- 当前公开 schema 的真实源头不是运行时，而是 `schema-overlays.ts` 经过生成脚本写入 `component-schema.generated.ts` 后，再由 core 导出。
- 历史字段 `tone`、`kind`、`mode`、`default` 不是纯文档残留；它们已经进入生成后的公共 schema，并继续被 runtime mapping 消费。
- runtime spec 类型面已经把 `kindProp`、`modeProp`、`defaultProp`、`defaultMode` 写成正式字段，说明旧 contract 已跨过 schema 层进入 renderer 契约。
- 当前 parser / validate / sanitize 还没有 UI node 与 layout node 并列的模型；layout 仍停留在文档目标阶段。
- runtime shell 仍带有明显 document-shell 与 preview-grid 假设，Phase 4 不能只改 render function，必须连同 `app.tsx` 一起处理。

## 1. 当前 schema 的真实生成链路

当前链路是：

```txt
schema-overlays.ts
  -> scripts/generate-component-schema.mjs
  -> generated/component-schema.generated.ts
  -> component-schema.ts
  -> public-agent-contract.ts
  -> ahtml cli schema.mjs
```

证据：

- `scripts/generate-component-schema.mjs`
  - 读取 `packages/core/src/schema-overlays.ts`
  - 生成 `packages/core/src/generated/component-schema.generated.ts`
  - 输出的 `schemas` 直接来自 overlay 的 `name`、`description`、`props`、`allowedChildren`
- `packages/core/src/component-schema.ts`
  - `STANDARD_COMPONENT_SCHEMAS` 直接等于 `GENERATED_STANDARD_COMPONENT_SCHEMAS`
  - `VALIDATED_STANDARD_COMPONENT_SCHEMAS` 只是对 generated 结果做校验
- `packages/core/src/public-agent-contract.ts`
  - `createPublicAgentContract()` 直接返回 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`
- `packages/ahtml/src/cli/schema.mjs`
  - `getCliSchemaOutput()` 直接消费 `createPublicAgentContract()`
  - `formatPrompt()` 遍历 `schema.components` 输出 agent prompt

阶段含义：

- Phase 2 如果要改 schema / prompt，不能只在 `schema.mjs` 打补丁。
- 真正要动的上游是：
  - `schema-overlays.ts`
  - 生成脚本
  - `component-schema.ts`
  - `public-agent-contract.ts`

## 2. 当前公共 schema 仍包含历史包装字段

`schema-overlays.ts` 仍把历史包装字段写进公开 props：

- `alert.tone`
- `badge.tone`
- `row.kind`
- `tabs.default`
- `accordion.mode`
- `accordion.default`

生成后的 `packages/core/src/generated/component-schema.generated.ts` 中也能看到这些字段，说明它们已经进入当前 public schema，而不是只存在于源 overlay 中。

同时，overlay 继续用 `hiddenProps` 表达“原厂 prop 不直接公开”的手工规则，例如：

- `alert` 隐藏 `variant`
- `card` 隐藏 `size`
- 输入类组件隐藏 `defaultValue`
- 选择类组件隐藏 `defaultValue` / `type` / `variant` / `size` / `spacing`

阶段含义：

- 当前 schema 同时混合了三类信息：
  - 内容字段
  - 历史包装字段
  - 原厂 prop 隐藏规则
- Phase 2 的第一步不是“再加 exposure state”，而是先把这三类职责拆开。

## 3. blocked 名单和 introspection 已存在，但公开 prop 决策主链还没切通

当前 core 已经具备两类基础材料：

- `packages/core/src/generated/component-schema.generated.ts`
  - 保存由 shadcn introspection 得到的 `variantProps`、`blockedProps` 等实现事实
- `packages/core/src/component-schema.ts`
  - 定义全局 blocked 名单：
    - `asChild`
    - `class`
    - `className`
    - `css`
    - `dangerouslySetInnerHTML`
    - `onClick`
    - `onclick`
    - `script`
    - `style`
同时，`packages/core/src/types.ts` 现在其实已经有一批 `2A` 脚手架类型：

- `PropExposureState`
- `ComponentSemanticPropSchema`
- `ComponentSemanticContract`
- `ComponentExposurePolicy`
- `ResolvedComponentSchema`

`packages/core/src/schema-overlays.ts` 也已经额外导出：

- `COMPONENT_SEMANTIC_CONTRACTS`

并且 `packages/core/src/prop-exposure-policy.ts` 已经单独存在。

但这些脚手架还没有把公开 prop 决策主链真正切通：

- `scripts/generate-component-schema.mjs` 仍直接读取 `COMPONENT_SCHEMA_OVERLAYS`
- `GENERATED_STANDARD_COMPONENT_SCHEMAS` 仍只反映 overlay 的 `props`
- `public-agent-contract.ts` 仍直接公开 `VALIDATED_STANDARD_COMPONENT_SCHEMAS`

阶段含义：

- 项目已经不再是“完全没有 exposure-state 类型脚手架”。
- 更准确的现状是：
  - 类型面和 policy 文件已经部分落位
  - 但“实现事实 + blocked 名单 + exposure policy”还没有接成统一的 public prop 决策链
- Phase 2 不需要从零发明原始数据，但仍需要重构生成链路和职责边界。

## 4. runtime 仍在直接消费旧字段

`packages/ahtml/src/config/component-capabilities.mjs` 中的运行时定义仍显式依赖旧字段：

- `tabs` 使用 `attrAliases.default -> "default-value"`
- `alert` 和 `badge` 通过 `propMappings` 把 `tone` 映射到原厂 `variant`
- `table` 使用 `kindProp: "kind"`
- `tabs` 使用 `defaultProp: "default"`
- `accordion` 使用：
  - `modeProp: "mode"`
  - `defaultProp: "default"`
  - `defaultMode: "multiple"`

`packages/ahtml/src/config/render-capabilities.mjs` 进一步把这些字段写成 renderer kind 的必填要求：

- `table` kind 要求 `kindProp`
- `accordion` kind 要求 `modeProp`、`defaultProp`
- `tabs` kind 要求 `defaultProp`

`packages/ahtml/src/cli/runtime-template/src/renderer/types.ts` 也把这些字段纳入正式类型：

- `kindProp?: string`
- `modeProp?: string`
- `defaultProp?: string`
- `defaultMode?: string`

`packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx` 则在主渲染路径里直接读取这些字段：

- 读取 `kindProp` 决定表格 header/body 行分流
- 读取 `modeProp` / `defaultProp` / `defaultMode` 计算 accordion 默认展开状态
- 读取 `defaultProp` 计算 tabs 默认项

阶段含义：

- 历史字段并不只存在于 schema。
- 它们已经跨入：
  - runtime capability definition
  - renderer kind contract
  - runtime render function
- 所以 Phase 2 完成后，Phase 4 才能真正下线这些字段；两者不能被误认为独立问题。

## 5. parser / validate / sanitize 还没有 layout 语义模型

`packages/core/src/parse/parse-agent-html.ts` 当前只围绕 `STANDARD_COMPONENT_NAMES` 构造正则：

- `AGENT_COMPONENT_NAME_PATTERN`
- `SELF_CLOSING_AGENT_COMPONENT_PATTERN`
- `AGENT_COMPONENT_TAG_PATTERN`

这意味着 parser 只认识“当前标准组件集合”，并没有单独的 layout node 集合。

`packages/core/src/parse/validate-agent-html.ts` 的约束也完全建立在当前 `ComponentSchema` 上：

- 顶层要求唯一 `<page>`
- 节点合法性取决于 `getComponentSchema(node.name)`
- 子节点合法性取决于 `allowedChildren`
- 属性合法性取决于 `componentSchema.props`

`packages/core/src/parse/sanitize-agent-html.ts` 当前只是 parse + validate 的薄封装，并没有额外的 layout 归一化步骤。

阶段含义：

- Phase 3 不能只在 renderer 增加 `stack` / `grid` 的渲染分支。
- layout 真正接入时至少要同步改：
  - parser 的标准节点识别
  - schema/type surface
  - validate 的 children contract
  - sanitize 的结构整理职责

## 6. runtime template 仍有 document-shell 假设

`packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx` 当前仍在渲染过程中写入默认文档型结构类名：

- `ahtml-section-stack`
- `ahtml-prose-block`

同一个文件里也能看到写死的结构样式片段，例如：

- `grid gap-3`

`packages/ahtml/src/cli/runtime-template/src/app.tsx` 继续把 artifact 展示包在 document-shell 语义里：

- 根部存在 `ahtml-document-shell`
- 多处存在 `ahtml-gallery-stack`
- UI 中直接出现 `Preview grid`
- CSS 中有大量 `.ahtml-document-shell ...` 规则

阶段含义：

- Phase 4 不只是拆 `render-node.tsx`。
- `app.tsx` 里的 shell、gallery、preview 样式结构也属于 runtime host 假设的一部分。

## 7. 当前工作树的额外事实

- 当前仓库根目录没有 `spec/` 目录，因此任何依赖 `spec/map.md` 或 `spec/roadmap.md` 的执行计划都无法直接在这份工作树里核验。
- 当前 `.git/index.lock` 存在，并且会干扰 `git status`；提交前的工作树确认需要先处理锁文件状态。

这些事实不改变架构方向，但会影响执行节奏和验证方式。

## 8. 对各阶段的直接影响

### Phase 1

当前最重要的不是继续补方向文档，而是把这份审计继续细化为组件级事实表：

- 每个组件当前公开哪些 props
- 哪些 props 是内容字段
- 哪些 props 是历史包装字段
- 哪些原厂 props 被隐藏但仍在 runtime 映射中

### Phase 2

最先要拆的是 `schema-overlays.ts` 的混合职责，而不是先改 renderer：

- 内容字段定义
- 历史包装字段
- 原厂 prop 暴露规则

### Phase 3

layout 若要进入公共能力，必须从 `ComponentSchema` / parser / validate 开始接入；不能先在 runtime 偷跑。

### Phase 4

runtime 解耦的实质工作是：

- 把 renderer 从旧字段解释器改成 projection consumer
- 把 `app.tsx` 从 document shell / preview shell 中拆出真正的 runtime host 职责

### Phase 5

只有当 schema、runtime mapping、render function、heavy tests 都不再把旧字段当主路径时，才算真正下线双轨 contract。

## 推荐下一步

如果继续沿这条线推进，下一份应优先参考 [current-contract-component-matrix.md](./current-contract-component-matrix.md) 中的组件级事实表，再决定 Phase 2 的首批试点组件和兼容桥位置。
