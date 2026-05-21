# agent-html Type Surface

本文记录当前稳定的公共类型表面。它不展开实现细节，只标记跨层共享、需要保持稳定的对象。

## Change Rules

- 公共类型表面变更必须同步 schema、renderer 和 tests
- agent-facing 类型不得泄漏实现 props、Tailwind class 或源码结构
- core 类型不得依赖 React、Vite、Tailwind、shadcn 或 runtime host
- 同一概念只保留一个正式名称

## 1. ComponentFacts

Ownership: component facts layer

Purpose: 表示从源码、registry 和 runtime surface 抽取出的组件事实。

Consumers: mapping, verification, drift check

Note: 它服务于校验和映射，不直接成为 agent-facing contract。

## 2. PropExposureState

Ownership: configuration contract

Purpose: 表示原厂 prop 的公开状态。

Consumers: component config, schema generation, prompt generation

Stable values:

- `blocked`
- `raw-candidate`

## 3. ComponentSchema

Ownership: semantic contract

Purpose: 表示一个 agent-facing 语义组件或 layout 节点的公开定义。

Consumers: agent, parse, validate, sanitize, renderer

Note: 它描述用途、内容字段、结构边界和受控公开 props，不等于底层实现 props。

## 4. ComponentPropSchema

Ownership: semantic contract

Purpose: 描述 agent 可见的公开 prop。

Consumers: schema output, prompt generation, validate

Note: 它只包含最终公开的 prop，不包含内部实现 prop。

## 5. SemanticNode

Ownership: authoring boundary

Purpose: 表示 agent-html 中的语义节点。

Consumers: parse, validate, sanitize

Stable kinds:

- UI node
- layout node

## 6. AgentHtmlDocument

Ownership: authoring boundary

Purpose: 表示完整 agent-html 文档。

Consumers: parse, validate, sanitize

## 7. RenderConfig

Ownership: configuration resolution

Purpose: 表示配置选择被解析后的结果。

Consumers: sanitize, renderer, runtime host

Note: 它承接全局 style、全局 layout 和组件配置结果，不是自由样式入口。

## 8. SanitizedAgentHtml

Ownership: engine boundary

Purpose: 表示经过 parse / validate / sanitize 后、可交给渲染层的结构。

Consumers: rendering layer

## 9. RendererRegistry

Ownership: rendering layer

Purpose: 表示语义节点到运行时实现的映射表。

Consumers: semantic node resolver, projection layer

## 10. RuntimeHostConfig

Ownership: runtime host

Purpose: 表示 runtime host 的必要配置。

Consumers: CLI, runtime bootstrap, preview, build

Note: 它只表达运行时宿主所需配置，不是 agent-facing schema。

## 11. RenderedArtifact

Ownership: output layer

Purpose: 表示沿共享渲染链路产出的可消费结果。

Consumers: preview, build, sharing flow

Note: 它可以驱动 preview，也可以被 materialize 成 portable artifact。
