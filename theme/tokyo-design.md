# Three Speeds of Tokyo Artifact 设计稿

## 设计意图

本文件细化 `theme/tokyo.md`，定义 Three Speeds of Tokyo Canvas artifact 的
目标设计。

设计目标是把“三天设计一座城市的节奏”编排成一块 Tokyo Route Console。
页面第一眼应该让观众看到一套可操作、可比较、可检查的三天东京路线系统。

它不是 arrival hero、旅游攻略、东京图库、景点排行榜、游客滤镜页面或六幕
滚动故事。

核心命题：

`东京太丰富，所以真正的问题不是去哪，而是如何取舍。`

## 主体与姿态

- primary subject：Tokyo Route Console。
- 观看方式：操作、比较、检查，而不是顺序观看。
- artifact posture：城市路线编辑台，带旅行节奏仪表。
- 默认状态：`bookstores`、`Day 3`、`Quiet Tokyo`、未完成书店路线。
- 情绪：现代、克制、日常、可执行，不做游客滤镜。
- 密度：地图和路线承担主结构，照片作为 evidence，强度指标解释取舍。
- 节奏：控制台先建立完整路线系统，再展开 density、quiet 和 sources。

## 目标结构编排

| Block | 设计任务 | 主导对象 | 布局形态 | 组件策略 |
| --- | --- | --- | --- | --- |
| `tokyo-header` | 提供城市影像入口 | 东京真实街区与路线证据 | 克制影像带 + caption | Carousel 或图片序列，不能取代 console |
| `route-console` | 建立首屏路线工作台 | 地图、路线、selector、inspector、load rail | 控制列 + 地图层 + 路线检查面板 | Button 或 ToggleGroup、Map、Progress、Badge |
| `density-layer` | 展开 High Density Tokyo | Shibuya、Shinjuku、Omotesando 等高密度区域 | evidence + 区域比较 + exit rule | Tabs、Table、短说明 |
| `quiet-layer` | 展开 Quiet Tokyo | Kiyosumi、Yanaka、Jimbocho 等低刺激路线 | route timeline + evidence + 备选点 | Timeline、Accordion、Badge |
| `source-registry` | 收束素材、地图、交通和数据来源 | credit、license、attribution | 集中来源区 | 链接清单，避免打断主操作界面 |

Arrival、Rhythm、Interest Selector 和 Open Loop 是 `route-console` 的状态与槽位，
不是独立纵向章节。

## Primary Surface：Tokyo Route Console

首屏就是完整工作台。用户不需要先读完整背景，应该马上看到一套三天东京路线
系统。

- 左侧控制列：interest、day speed、active route、体力策略。
- 中央地图层：东京区域、路线线、站点点位、移动半径、active layer。
- route inspector：当前时间块、区域理由、照片 evidence、下一次保留点。
- load rail：walking、transfer、queue、night energy、dwell time。
- 短标题：只说明取舍命题，不做大 hero 文案。
- attribution：地图附近显示 `© OpenStreetMap contributors`。

默认状态应该区别于旅游广告。页面不是“东京必去”，而是“如何选择适合身体
状态的东京”。

## Console Layers

Console layers 是 `route-console` 的展开状态。实现时可以拆成多个 `Block`，
但视觉上必须像同一个路线系统的不同层，而不是互不相干的章节。

### Arrival

Arrival 是 Day 1 的 route state，用来解释 Soft Landing 为什么成立。

- 在 day control 中显示 `Day 1 / Soft Landing`。
- 地图显示 Haneda 到城市的短动线。
- inspector 显示 arrival evidence 和低强度 load。
- 使用真实交通或抵达素材，不用涩谷人潮开场。
- 不让 arrival 变成单独大图章节。

### Rhythm

Rhythm 是控制台骨架。它说明三天不是清单，而是三种城市速度。

- day speed 固定展示 Soft Landing、High Density、Quiet Tokyo。
- 地图随 day 或 route 切换移动半径。
- load rail 同步显示体力、换乘、步行、排队和停留压力。
- Timeline 只用于摘要当前 route，不重复成三段故事。
- 不做三张 day card，不做景点排行榜。

### Density

Density 是 Day 2 的 active layer。它不负责制造霓虹情绪，而是显示东京如何
在高密度下保持秩序。

- 地图高亮 Shibuya、Shinjuku、Omotesando 等高密度区域。
- inspector 或 layer 解释 crowd、station logic、commercial layer、exit rule。
- evidence 使用真实人流、交通或城市界面素材。
- Table 只做区域对比，不做主画面。
- 不做满屏赛博霓虹，不让照片抢走地图层主体。

### Quiet

Quiet 是 Day 3 或 low-stimulus interest 的 active layer。它把路线从“多移动”
切换成“长停留”。

- 地图高亮 Kiyosumi、Yanaka、Jimbocho 等低刺激路线。
- load rail 显示 low walking、low transfer、high dwell。
- evidence 使用庭园、书店、街区或停留感素材。
- Accordion 可收纳备选点，避免卡片墙。
- 不做怀旧明信片，不把 quiet 做成次要路线。

### Interest Selector

Interest Selector 是控制台核心，不是后置功能块。

- interest 切换时，地图、route inspector、load rail 和 evidence 同步变化。
- route states 覆盖 `food`、`design`、`bookstores`、`nightlife`、`low stimulus`。
- 控件用于表达取舍，不是装饰按钮组。
- 不把 selector 放到页面后半段。
- 不使用未授权 POI 数据或 Google Maps 截图。

### Open Loop

Open Loop 是 inspector 中的 unresolved slot。它说明好的三天计划不是把东京用完，
而是知道下次从哪里继续。

- 在 inspector bottom slot 显示 `next time` 或等价短标签。
- 地图保留一个未完成点，如 Jimbocho bookshop、morning neighborhood 或 slower return。
- Sources 前只做轻量收束。
- 不做“再见东京”旅游广告，不用东京塔、烟花或大高潮。

## 视觉与组件策略

- 地图层是主视觉，不是装饰背景。
- 照片是 evidence window，不是每个 block 的 hero。
- `Button` 或 `ToggleGroup` 承担 route/interest 选择。
- `Progress` 组成 load rail，不散成孤立卡片。
- `Tabs` 用于 density 区域或 route/time/load 视图，不做章节导航。
- `Timeline` 只表达当前路线或 next-time slots。
- `Table` 只辅助比较区域，不做主画面。
- `Accordion` 只收纳 quiet 备选点或补充选择。
- 使用 Canvas content classes、semantic tokens 和本地 primitives。
- 不做旅游广告、赛博霓虹、通用城市海报或景点排行榜。

## 素材与数据计划

| 用途 | 来源方向 | 使用边界 |
| --- | --- | --- |
| 地图与路线 | OpenStreetMap | 显示 `© OpenStreetMap contributors`，地图语义服务 route console |
| 交通语境 | ODPT、GO TOKYO transit pages | 用于换乘、移动强度和可信语境，不伪装成实时官方结论 |
| 区域语境 | GO TOKYO area pages | 用于 Shibuya、Shinjuku、Omotesando、Kiyosumi、Yanaka、Jimbocho 等区域背景 |
| 城市强度 | Tokyo Tourism Data Catalog | 可作为 intensity 语义来源，加工后不能表现成东京都官方结论 |
| 真实影像 | Wikimedia Commons、GO TOKYO、Unsplash | 逐张核对 license、credit 和用途，避免通用旅游广告审美 |

素材选择服务控制台状态。Arrival 需要抵达 evidence，Density 需要真实密度
evidence，Quiet 需要停留 evidence，Open Loop 需要未完成路线 evidence。

不使用来源不明图片、未授权 POI 数据、Google Maps 截图或无法署名的第三方素材。

## 文案策略

- 主句只说明取舍命题，不做旅游宣传。
- route 文案回答“为什么这样安排”，不是罗列景点。
- load 文案解释体力、时间、排队、换乘和停留成本。
- evidence caption 说明图片如何证明路线状态，并保留 credit。
- source registry 集中收束来源，不打断主操作界面。
- 避免“必去”“打卡”“征服东京”“霓虹之城”等游客滤镜。

## 响应式策略

- 桌面端保留控制列、地图层、inspector 和 load rail 的工作台关系。
- 移动端可以堆叠，但顺序保持：选择器、地图、inspector、load、evidence。
- 地图不能退化成普通文字网格。
- 长路线、时间块和强度指标允许横向滚动或压缩，但不改变语义。
- attribution、caption 和 credit 不能在窄屏丢失。

## 验收检查

- 第一屏就是 `Tokyo Route Console`，不是 arrival hero。
- selector 在首屏主舞台，不在后续章节。
- artifact 不呈现六段纵向旅行故事。
- Arrival、Rhythm、Density、Quiet、Open Loop 都像 console layer 或 inspector state。
- 至少一个地图层占据页面主视觉。
- 照片作为 evidence 嵌入 route inspector 或 layer，不是大图章节。
- 三天速度和五类 interest 都服务路线取舍。
- Sources 集中为 registry，不打断主操作界面。
- 页面读起来像城市路线编辑台，不像组件展板或旅游攻略。
