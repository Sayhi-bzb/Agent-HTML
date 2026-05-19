# Execution Map

本文把当前重构路线再往前推一层，从“阶段设计”细化成“代码级执行图”。

和 `roadmap.md`、`phase-2-design.md` 的区别是：

- 它不再只说改哪个模块。
- 它明确列出每个阶段会碰到的关键函数、下游消费者、以及最窄可用的验证口。

目标是降低后续真实改造时的上下文切换成本。

## 1. 总链路

当前从 authoring 到 runtime 的主链路是：

```txt
schema-overlays.ts
  -> scripts/generate-component-schema.mjs
  -> generated/component-schema.generated.ts
  -> component-schema.ts
  -> public-agent-contract.ts
  -> cli/schema.mjs
  -> config/runtime-contract.mjs
  -> config/render-capabilities.mjs
  -> cli/runtime-template/*
  -> doctor / runtime-surface / preview / build
```

平行的 parse 链路是：

```txt
parse-agent-html.ts
  -> validate-agent-html.ts
  -> sanitize-agent-html.ts
  -> cli/validate.mjs
  -> artifact-workflow / build / inspect / preview
```

这两条链路分别对应：

- Phase 2 以上游 public contract 为主
- Phase 3 以 parse/validate/sanitize + schema 为主
- Phase 4 以 runtime contract / renderer / template 为主

## 2. Phase 2 代码级执行图

### 2.1 关键入口

核心入口按执行顺序排是：

1. `packages/core/src/schema-overlays.ts`
2. `scripts/generate-component-schema.mjs`
3. `packages/core/src/generated/component-schema.generated.ts`
4. `packages/core/src/component-schema.ts`
5. `packages/core/src/public-agent-contract.ts`
6. `packages/ahtml/src/cli/schema.mjs`
7. `packages/ahtml/src/config/runtime-contract.mjs`
8. `packages/ahtml/src/config/render-capabilities.mjs`

### 2.2 每个入口的职责和影响面

#### `schema-overlays.ts`

当前职责：

- 内容字段定义
- 结构字段定义
- 历史包装字段定义
- hiddenProps 规则

下游消费者：

- `scripts/generate-component-schema.mjs`

Phase 2 改动含义：

- 它不应继续同时承担四类职责。

最小验证口：

- `packages/core/src/component-schema.test.ts`

#### `generate-component-schema.mjs`

当前职责：

- 读取 overlay
- 读取 shadcn introspection
- 但最终只把 overlay 的 `name/description/props/allowedChildren` 写入 generated schema

下游消费者：

- `generated/component-schema.generated.ts`
- 所有 core public contract 导出

Phase 2 改动含义：

- 这里是从“内容 contract”切换到“resolved exposure decision”的真正闸口。

最小验证口：

- `packages/core/src/component-schema.test.ts`
- `packages/core/src/public-agent-contract.test.ts`

#### `component-schema.ts`

当前职责：

- 公开 `STANDARD_COMPONENT_SCHEMAS`
- 做 blocked 名单和 allowedChildren 校验
- 暴露 generated introspection facts

下游消费者：

- `public-agent-contract.ts`
- parse/validate
- tests

Phase 2 改动含义：

- 这里需要开始承载 exposure-state 之后的稳定 schema 出口。

最小验证口：

- `packages/core/src/component-schema.test.ts`

#### `public-agent-contract.ts`

当前职责：

- 组装 CLI 公开 contract

下游消费者：

- `packages/ahtml/src/cli/schema.mjs`
- `scripts/verify-packed-ahtml.mjs`
- `packages/core/index.mjs`

Phase 2 改动含义：

- 改这里等于改 CLI schema 和后续 runtime contract 的共同输入。

最小验证口：

- `packages/core/src/public-agent-contract.test.ts`
- `packages/ahtml/src/cli/cli.test.ts`

#### `cli/schema.mjs`

当前职责：

- `getCliSchemaOutput()`
  - 取 public contract
  - 同时生成 runtime contract
- `formatPrompt()`
  - 从最终 schema 生成 prompt

下游消费者：

- `packages/ahtml/src/cli/index.mjs`
- `gallery-workflow.mjs`
- `doctor-checks.mjs`
- `runtime-template.test.ts`

Phase 2 改动含义：

- prompt 的形状变化会直接影响 CLI、doctor、runtime bootstrap。

最小验证口：

- `packages/ahtml/src/cli/cli.test.ts`

#### `runtime-contract.mjs`

当前职责：

- 用 schema components 生成：
  - `verificationData`
  - `rendererMapping`
  - `elementRegistrySpec`
  - `rendererKindSpec`

下游消费者：

- `schema.mjs`
- `doctor-checks.mjs`
- `runtime-template.mjs`
- `runtime-status.mjs`
- `runtime-renderability.mjs`

Phase 2 改动含义：

- schema 一变，这里会自动把变化传播到 runtime parity 系统。

最小验证口：

- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`

#### `render-capabilities.mjs`

当前职责：

- 把 schema components 投影成 runtime verification data 和 renderer mapping
- 校验 renderer kind 所需字段

下游消费者：

- `runtime-contract.mjs`
- runtime parity 检查

Phase 2 改动含义：

- 试点组件只要新增公开 prop 且 runtime 要消费，就得在这里补进映射或保留兼容桥。

最小验证口：

- `packages/ahtml/src/config/render-capabilities.test.ts`

### 2.3 Phase 2 推荐验证顺序

最窄路径应按这个顺序走：

1. `packages/core/src/component-schema.test.ts`
   - schema 生成逻辑
2. `packages/core/src/public-agent-contract.test.ts`
   - public contract 输出
3. `packages/ahtml/src/cli/cli.test.ts`
   - prompt/schema 可见性
4. `packages/ahtml/src/config/runtime-contract.test.ts`
   - schema 到 runtime contract 的传播
5. `packages/ahtml/src/config/render-capabilities.test.ts`
   - renderer mapping 和 kind 约束

不要一开始就跑 heavy CLI tests。

## 3. Phase 3 代码级执行图

### 3.1 关键入口

1. `packages/core/src/types.ts`
2. `packages/core/src/component-schema.ts`
3. `packages/core/src/parse/parse-agent-html.ts`
4. `packages/core/src/parse/validate-agent-html.ts`
5. `packages/core/src/parse/sanitize-agent-html.ts`
6. `packages/ahtml/src/cli/validate.mjs`
7. `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`

### 3.2 影响路径

#### `parse-agent-html.ts`

当前职责：

- 基于 `STANDARD_COMPONENT_NAMES` 构造标准标签识别正则

Phase 3 影响：

- 只要 layout node 进入标准节点集合，这里会第一时间受影响。

最小验证口：

- `packages/core/src/parse/sanitize-agent-html.test.ts`

#### `validate-agent-html.ts`

当前职责：

- 所有节点合法性取决于 `getComponentSchema()`
- 所有 children 合法性取决于 `allowedChildren`
- 所有 attrs 合法性取决于 `componentSchema.props`

Phase 3 影响：

- layout node 接入不能绕过这里。

最小验证口：

- `packages/core/src/parse/sanitize-agent-html.test.ts`

#### `sanitize-agent-html.ts`

当前职责：

- parse + validate 的薄封装

Phase 3 影响：

- 如果 layout 需要归一化或结构补全，这里很可能要增职责。

最小验证口：

- `packages/core/src/parse/sanitize-agent-html.test.ts`

#### `cli/validate.mjs`

当前职责：

- CLI validate 直接调用 `sanitizeAgentHtml`

Phase 3 影响：

- parse/sanitize contract 一变，这里就是所有 CLI 校验命令的入口。

最小验证口：

- `packages/ahtml/src/cli/cli.test.ts`

### 3.3 Phase 3 推荐验证顺序

1. `packages/core/src/component-schema.test.ts`
2. `packages/core/src/parse/sanitize-agent-html.test.ts`
3. `packages/ahtml/src/cli/cli.test.ts`
4. 再考虑 renderer 侧样例测试

## 4. Phase 4 代码级执行图

### 4.1 关键入口

1. `packages/ahtml/src/config/component-capabilities.mjs`
2. `packages/ahtml/src/config/render-capabilities.mjs`
3. `packages/ahtml/src/config/runtime-contract.mjs`
4. `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
5. `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
6. `packages/ahtml/src/cli/runtime-template/src/app.tsx`
7. `packages/ahtml/src/cli/runtime-template.mjs`
8. `packages/ahtml/src/cli/doctor-checks.mjs`
9. `packages/ahtml/src/cli/runtime-surface.test.ts`

### 4.2 影响路径

#### `component-capabilities.mjs`

当前职责：

- 定义组件 render kind
- 定义 slot 结构
- 定义 propMappings / rootByProp / attrAliases
- 定义 legacy bridge

Phase 4 影响：

- 这里是拆 UI projection / layout projection 的第一站。

最小验证口：

- `packages/ahtml/src/config/render-capabilities.test.ts`

#### `renderer/types.ts`

当前职责：

- 定义 renderer spec 允许出现的字段

Phase 4 影响：

- 移除 legacy bridge 前，先要改这里的类型面。

最小验证口：

- `packages/ahtml/src/config/render-capabilities.test.ts`

#### `render-node.tsx`

当前职责：

- 渲染所有 runtime component
- 同时承担 legacy 字段解释
- 同时承担文档型结构类名拼装

Phase 4 影响：

- 它是最大风险点。

最小验证口：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

#### `app.tsx`

当前职责：

- 承载 `ahtml-document-shell`
- 承载 `ahtml-gallery-stack`
- 承载 preview/grid 结构假设

Phase 4 影响：

- runtime host 脱模板必须碰这里。

最小验证口：

- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`

#### `doctor-checks.mjs`

当前职责：

- 用 `getCliSchemaOutput()` 和 `createRuntimeContractFromSchema()` 做 parity 检查

Phase 4 影响：

- renderer mapping / verification data 一改，doctor 就会第一时间报警。

最小验证口：

- `packages/ahtml/src/cli/runtime-surface.test.ts`

### 4.3 Phase 4 推荐验证顺序

1. `packages/ahtml/src/config/render-capabilities.test.ts`
2. `packages/ahtml/src/config/runtime-contract.test.ts`
3. `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
4. `packages/ahtml/src/cli/runtime-template.test.ts`
5. `packages/ahtml/src/cli/runtime-surface.test.ts`
6. 最后才是 heavier CLI/runtime checks

## 5. 关键验证口总览

| Scope | Main files | Narrowest verification |
|---|---|---|
| Public schema generation | `schema-overlays.ts`, `generate-component-schema.mjs`, `component-schema.ts` | `packages/core/src/component-schema.test.ts` |
| Public contract output | `public-agent-contract.ts`, `schema.mjs` | `packages/core/src/public-agent-contract.test.ts`, `packages/ahtml/src/cli/cli.test.ts` |
| Parse / validate / sanitize | `parse-agent-html.ts`, `validate-agent-html.ts`, `sanitize-agent-html.ts` | `packages/core/src/parse/sanitize-agent-html.test.ts` |
| Runtime contract propagation | `runtime-contract.mjs`, `render-capabilities.mjs` | `packages/ahtml/src/config/runtime-contract.test.ts`, `packages/ahtml/src/config/render-capabilities.test.ts` |
| Renderer behavior | `renderer/types.ts`, `render-node.tsx` | `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts` |
| Runtime shell / parity | `app.tsx`, `runtime-template.mjs`, `doctor-checks.mjs` | `packages/ahtml/src/cli/runtime-template.test.ts`, `packages/ahtml/src/cli/runtime-surface.test.ts` |

## 6. 推荐下一步

如果下一步开始真正改代码，最合理的顺序是：

1. 先改 Phase 2 类型与生成链路草案
2. 只用 core + CLI schema tests 验证
3. 再接试点组件的 runtime bridge
4. 最后再让 runtime contract / doctor parity 通过

这样可以避免一开始就被 runtime-template 和 heavy tests 拖进大范围调试。
