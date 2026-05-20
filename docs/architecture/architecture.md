# Architecture

本文解释的是当前工作树里可由代码证据支撑的架构边界。  
`blueprint/architecture-design/architecture.md` 记录目标架构，不等于当前实现完成度。

## Product Shape

agent-html 的产品形态是：

```txt
agent work
        ↓
semantic agent-html
        +
configuration selection
        ↓
stable shareable HTML artifact
```

agent 负责表达内容、关系和结构；系统负责把这些语义节点投影成稳定、可读、可分享的 HTML artifact。

## System Layers

## 1. Configuration Layer

- 当前稳定的配置选择入口仍是 `style-ref`。
- `gallery` 当前用于配置和预览 style profile，不属于语义使用层，也不是 runtime host 本身。
- 当前产品形态是左侧配置器与右侧组件画廊；右侧以组件家族预览为主，不以连续文档阅读流为主。

### 全局style

- typography:当前稳定实现里包含 `fontSans` / `fontHeading`
- radius:当前稳定实现里包含 `radiusScale`
- semantic colors:当前稳定实现里通过 light / dark token sets 提供
- `spacing scale` 与 `shadow scale` 仍是设计词汇，当前还没有写入稳定 `styleProfile`

### 全局layout

- `frame`、`measure`、`rhythm`、`density posture`、`partition`、`reflow`
- 这些仍是当前设计词汇，用来解释未来 layout realization 应该落在哪一层。
- 它们当前还没有作为独立 `RenderConfig` 结构写入稳定实现。

### 组件配置

当前稳定实现里的组件配置仍只有 `componentStyle.treatments`。

- 它承载组件 treatment 映射。
- layout 组件配置与 prop exposure config 目前仍未作为独立运行时配置结构落地。

#### UI组件：页面的名词积木

- 当前原厂 props 的 exposure policy 仍由静态 schema 生成链路决定，而不是由 gallery 或 runtime config 临时决定。
- `blocked` / `raw-candidate` 的当前来源是 exposure policy 与 generated schema。
- `style-ref` 在 parse / runtime 层允许 fallback，但在当前 CLI prompt 主路径中仍是规范写法。
- 详见 [schema.md](./schema.md)。

#### layout组件：页面的关系积木

- 下面的 `stack:measure/rhythm/density` 这类记号当前只表示目标配置分工，不是已经实现的公开 props 或稳定 config 结构。
- stack:measure/rhythm/density
- cluster:rhythm/density/reflow
- split:frame/partition/reflow/density
- switcher:partition/reflow/density
- grid:frame/partition/rhythm/reflow/density
- frame:frame/measure/density

## 2. Semantic Usage Layer

### UI组件

- alert
- badge
- progress
- input
...

### layout组件

- stack
- cluster
- split
- switcher
- grid
- frame

UI 组件表达对象语义，layout 组件表达空间关系。二者都属于语义使用层。

## 3. Engine Layer

- ComponentSchema:积木说明书
- parse:解析
- validate:查格式
- sanitize:安全清洗
- RenderConfig:渲染配置结果
- diagnostics:报错和提示清单

engine 只处理可检查的语义结构和配置结果，不依赖 React、Vite、Tailwind 或 shadcn。

## 4. Rendering Layer

- semantic node resolver:认积木的人
- component/layout projection:把抽象意思投影成具体结构
- renderer registry:语义积木与运行时实现的对照表
- fallback generation:兜底版本生成器

渲染层服务公开 contract，不反向决定公开 contract。

## 5. Runtime Host Layer

- runtime host:承载 React / Vite / Tailwind / shadcn 的运行时宿主与胶水层
- layout primitive 的节点选择来自语义树与 renderer projection，而不是 runtime host 反推出来
- `DocumentArtifactShell` 当前已收口成 artifact root；文档型默认值现在主要下沉到 document layout policy，例如全局宽度、padding、prose measure 与 section spacing
- React
- Vite
- Tailwind
- shadcn

runtime host 是执行宿主；当前文档排版默认值仍存在，但已经不再直接塞在 host 本身。

## 6. Output Layer

- preview
- build
- portable artifact

## 7. Component Facts Layer

- `docs/components.md`: 组件盘点和家族分类
- `docs/details/component-details.md`: 更细的底层实现事实

组件事实层服务于校验、映射和 drift check，不直接成为 agent-facing contract。

## Public Contract

公开面由两部分组成：

- 语义节点 contract
- 配置选择入口

schema 只暴露稳定语义，不暴露实现细节。agent 可以看到的能力来自：

- 组件与 layout 的名称
- 内容字段
- slots / children 边界
- 受控公开 props
- 当前公开配置选择入口仍是 `style-ref`。
