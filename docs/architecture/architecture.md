## 配置层
引用：style-ref

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
#### UI组件：各标准UI组件的视觉映射
- UI组件配置不仅定义视觉映射，也定义原厂 props 的 exposure policy：哪些 prop 是 `blocked`，哪些是 `raw-candidate`，以及哪些候选 prop 在当前 `style-ref` 下对 agent prompt schema 可见。
- 这意味着 prop 暴露不是 renderer 临时决定，也不是 engine 内核自由推断，而是先由配置层的 UI 组件配置给出规则，再由 schema / prompt 消费。
- 详见 [schema.md](./schema.md)。
#### layout组件：各标准layout组件怎么排
- stack:measure/rhythm/density
- cluster:rhythm/density/reflow
- split:frame/partition/reflow/density
- switcher:partition/reflow/density
- grid: frame / partition / rhythm / reflow / density
- frame: frame / measure / density

## 语义使用层
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

## engine 层	
- ComponentSchema:积木说明书
- parse:解析
- validate:查格式
- sanitize:安全清洗
- RenderConfig:渲染配置结果
- diagnostics:报错和提示清单

## 渲染层
- semantic node resolver:认积木的人
- component/layout projection:把抽象意思投影成具体结构
- renderer registry:语义积木与 renderer/runtimecontract 的对照表
- fallback generation:兜底版本生成器

## Runtime Host 层
- runtime host: runtime 胶水模板 //template 不再是架构中心，未来目标是 template-free runtime host
- React
- Vite
- Tailwind
- shadcn

## output 层
- preview
- build
- portable artifact

## 组件资料层
- `docs/components.md`: 组件盘点和家族分类
