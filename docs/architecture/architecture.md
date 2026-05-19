# Architecture

本文是 `blueprint/architecture-design/architecture.md` 的工程化解释稿。

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

- `gallery` 是配置层的场所，用来配置和预览 style / layout / component config。
- `gallery` 不属于语义使用层，不是 agent authoring contract 本身，也不是 runtime host 本身。

### 全局style
- typography:包括字体家族、标题和正文字重、字号层级、行高、字距
- radius:圆角风格
- spacing scale:间距单位表
- shadow scale:阴影层级
- semantic colors:语义颜色系统
### 全局layout
- frame:负责页面和区域“站多大、摆在哪”
- measure:负责正文“读起来舒服的行宽”
- rhythm:负责纵向节奏
- density posture:负责整体是紧凑还是舒展
- partition:负责并列区域怎么分空间
- reflow:负责空间不够时怎么变形

### 组件配置
组件配置分成两部分：

- UI 组件配置：定义视觉映射和 prop exposure policy
- layout 组件配置：定义每个 layout primitive 消费哪些 layout 配置轴

#### UI组件：页面的名词积木
- UI组件配置不仅定义视觉映射，也定义原厂 props 的 exposure policy：哪些 prop 是 `blocked`，哪些是 `raw-candidate`，以及哪些候选 prop 在当前配置下对 agent prompt schema 可见。
- 文档级配置选择入口可以存在，但它不是总架构中心，也不是 agent 必须显式书写的严格 authoring 指令。
- 这意味着 prop 暴露不是 renderer 临时决定，也不是 engine 内核自由推断，而是先由配置层的 UI 组件配置给出规则，再由 schema / prompt 消费。
- 详见 [schema.md](./schema.md)。
#### layout组件：页面的关系积木
- 下面的 `stack:measure/rhythm/density` 这类记号表示“该 layout primitive 消费哪些配置轴”，不是公开 props 清单。
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
- layout 结构来自语义节点和配置层投影后的结果，而不是 runtime shell 预设
- React
- Vite
- Tailwind
- shadcn

runtime host 是执行宿主，不是页面模板中心。

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
