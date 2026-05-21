# agent-html Architecture Design Constitution

本章程规定 agent-html 的架构设计方向。

## Product North Star

agent-html 存在的原因是让 agent 用可实时 preview 的语义 HTML 工作流替代冗长 Markdown 输出。

agent 应写 AI-native 的语义结构；人应先在同一条 preview loop 中阅读、比较、反馈和协作，并在需要交付、分享或归档时获得稳定的 HTML artifact。

安全、schema、sanitize、runtime host 和 renderer 约束都服务这个产品目标；它们不是产品本体。

## 1. Human-readable First

artifact 的首要目标是帮助人理解、比较和判断。

视觉和交互应服务于信息清晰度，避免为了表现形式削弱可读性。

## 2. Portable

artifact 应便于交付、打开、分享和归档。

应避免为了 portability 牺牲 preview loop 的工作效率，或让协作流程过度依赖专用环境和难以迁移的上下文。

## 3. Stable Visual Semantics

相同语义应保持稳定、一致、可迁移的表达方式。

应避免让读者和 agent 在每个 artifact 中重新学习视觉语言。

## 4. Round-trippable

artifact 应支持人的反馈、选择和修改重新进入 agent 工作流。

应避免把 artifact 设计成只能 build 后再查看、无法形成协作闭环的静态终点。

## 5. Agent-friendly

系统应降低 agent 的无效认知负担，让 agent 专注于内容结构和信息关系。

应避免让 agent 反复处理低语义、易出错的样式和实现噪声。

## 6. Moat Through Semantic Artifacts

agent-html 的护城河应来自稳定 artifact 语义，而不是通用页面能力。

系统应优先强化以下长期价值：实时 preview loop、风格稳定、语义 authoring、低实现噪声、低 token 成本、安全可检查，以及可回到 agent 工作流的受控反馈闭环。

应避免把产品做成简化版 HTML、轻量 React 或通用前端交互系统。

## 7. Atomic Composability

系统应支持由稳定、可组合的表达单元构建 artifact。

应在一致性和自由度之间保持平衡，避免每次从零开始，也避免把表达限制成僵硬表单。

## 8. Generic Adaptation First

系统应优先建设通用 schema 抽取、通用适配器和通用 renderer，而不是为每个组件手写一条特殊路径。

当组件事实、slot 结构和安全映射规则足以支撑通用路径时，不应新增逐组件特判主路径。

## 9. Runtime Host Boundary

runtime host 是渲染执行边界，不是页面模板中心。

runtime host 承载 React、Vite、Tailwind 和 shadcn 等实现依赖；core、schema 和 sanitize 不反向依赖这些实现层。

## 10. Configuration Owns Realization

配置层负责视觉和布局的具体实现方式。

agent-facing 层只表达稳定语义，不承担实现参数选择题。

## 11. Lightweight

系统应保持轻量，优先服务于生成、理解和协作。

应避免为 artifact 引入不必要的应用复杂度。

## 12. Constrained Freedom

系统应为 agent 保留表达空间，同时限制低价值或高风险的自由度。

应避免在完全自由和完全僵化之间走向任一极端。

## 13. Inspectable and Safe

artifact 应易于检查、理解和信任。

应避免隐藏行为、不透明依赖和难以审查的副作用。
