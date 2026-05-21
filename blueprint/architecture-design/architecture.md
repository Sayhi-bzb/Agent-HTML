# agent-html Architecture

本文记录 agent-html 的目标架构主干。
当前工作树里的实现事实以 `docs/` 和代码为准。

## Product Shape

agent-html 的产品形态是：

```txt
agent work
        ↓
semantic agent-html
        +
configuration selection
        ↓
shared renderer path
   ↙                    ↘
real-time preview loop   build / portable artifact
```

agent 负责表达内容、关系和结构；系统负责把这些语义节点投影到同一条渲染链路中，先服务实时 preview 与协作，再在需要交付、分享或归档时产出稳定 HTML artifact。

这条产品形态的优势应来自 artifact 语义本身：用实时 preview、稳定风格、语义 authoring、低实现噪声与受控反馈回流，替代通用页面能力竞争。

## System Layers

### 1. Configuration Layer

配置层负责定义 artifact 怎样被实现。

它包含三部分：

- 全局 style：typography、radius、spacing scale、shadow scale、semantic colors
- 全局 layout：frame、measure、rhythm、density posture、partition、reflow
- 组件配置：UI 组件视觉映射与 prop exposure policy；layout 组件的配置消费规则

`gallery` 属于配置层，用来配置和预览 style、layout 和 component config。
当前产品形态是左侧配置页与右侧组件画廊预览；它服务配置选择，不承担语义 authoring。

### 2. Semantic Usage Layer

语义使用层负责定义 artifact 说什么、怎么组织。

它包含两类并列积木：

- UI 组件：表达对象语义
- layout 组件：表达空间关系

当前 layout primitive 集合为：

- `stack`
- `cluster`
- `split`
- `switcher`
- `grid`
- `frame`

### 3. Engine Layer

engine 负责：

- parse
- validate
- sanitize
- ComponentSchema
- RenderConfig
- diagnostics

engine 只处理可检查的语义结构和配置结果，不依赖 React、Vite、Tailwind 或 shadcn。

### 4. Rendering Layer

渲染层负责把语义节点投影成运行时可渲染结构。

它包含：

- semantic node resolver
- component / layout projection
- renderer registry
- fallback generation

渲染层服务公开 contract，不反向决定公开 contract。

### 5. Runtime Host Layer

runtime host 承载 React、Vite、Tailwind、shadcn 和 renderer glue。

它的职责是执行渲染，不预设页面必须服从某个文档模板。layout 结构来自语义节点和配置层投影，而不是 runtime shell 预先写死。

### 6. Output Layer

output 层负责面向外部的结果形态：

- real-time preview loop
- build result
- portable artifact

preview 是首要工作模式；build 和 portable artifact 服务交付、分享和归档。

### 7. Component Facts Layer

组件事实层记录底层实现事实，用于校验、映射和 drift check。

它不是 agent-facing contract。

## Public Contract

公开面由两部分组成：

- 语义节点 contract
- 配置选择入口

schema 只暴露稳定语义，不暴露实现细节。agent 可以看到的能力来自：

- 组件与 layout 的名称
- 内容字段
- slots / children 边界
- 受控公开 props

## Prop Exposure

原厂 props 不直接成为公开面。

每个原厂 prop 必须先进入 exposure policy：

- `blocked`
- `raw-candidate`

最终是否进入 schema 和 prompt，由组件配置决定。

## Main Flow

默认链路是：

```txt
agent writes semantic agent-html
        ↓
engine parses / validates / sanitizes
        ↓
rendering layer resolves semantic nodes
        ↓
runtime host renders
   ↙                    ↘
preview loop            build / portable artifact output
```

## Stable Decisions

- UI 和 layout 是并列语义积木
- 配置层决定 realization，使用层决定 meaning
- layout 使用层只表达结构关系，不表达实现参数
- schema / prompt 只暴露最终公开的 props
- runtime host 是执行宿主，不是架构中心模板
- preview 是首要工作模式，portable artifact 是交付形态
- preview 与 build 共用同一条语义到渲染链路
- 组件事实服务映射与校验，不直接成为公开 contract
