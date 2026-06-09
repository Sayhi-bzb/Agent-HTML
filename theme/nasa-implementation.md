# Artemis II 沉浸式 Artifact 实现设计

## 设计定位

这不是 NASA 风格网页，不是发射图片集，也不是任务资料页。

这个 artifact 应该像一段可滚动的深空任务纪录片：观众跟随 Orion 离开地球，进入载人任务建立、发射、路线验证、月球飞掠和安全返回。界面语言来自 Orion 舷窗视角、飞控任务界面和 NASA 任务影像档案。

第一屏必须先证明一个事实，再解释任何参数：人类已经离开地表，正在回望地球。

## Block 结构

使用一个 React Canvas artifact，内部用语义化 Block 组织。每个 Block 是一个镜头，不是通用内容区块。

- `orion-window`：通过 Orion 舷窗建立离开地球后的第一视角。
- `crew-formation`：把四名宇航员作为任务成员引入，而不是人物履历卡。
- `system-ignition`：让 SLS 发射成为整套深空系统启动的可见入口。
- `mission-route`：把九天任务转译成一条可跟随的飞行路线。
- `lunar-flyby`：让月球飞掠成为视觉和情绪高潮。
- `return-closure`：从深空返回海面回收，并指向后续任务。
- `sources`：保留 NASA 素材 credit 和使用说明，但不打断纪录片节奏。

## 场景组件

### SceneShell

所有场景共用的 full-bleed 舞台。它负责高度、背景层、前景位置和响应式约束。它不应该看起来像 Card，而是一块电影化舞台，承载影像、HUD 线、短文案和任务注释。

SceneShell 支持：

- 大幅图片或视频画面。
- 可选星场或轻微胶片颗粒层。
- 场景编号，例如 `ACT 01 / EARTH DEPARTURE`。
- 一个主标题。
- 一句纪录片式短文案。
- 两到三条任务注释。
- 低对比度素材来源 credit。

### OrionWindowScene

开场首屏组件。

构图：

- 稀疏、缓慢移动的深空背景。
- 厚重 Orion 舷窗框，带金属阴影和轻微玻璃反光。
- 地球只通过舷窗局部可见，优先使用裁切构图，不要完整居中展示。
- 舷窗周围有舱内暗部 vignette。
- 小型任务标签：`ARTEMIS II / CREWED LUNAR FLYBY`。
- 主文案：`人类正在重新学习如何抵达月球。`

设计要点：

- 舷窗是第一屏记忆点。不要加入主按钮或传统页面导航。
- 地球漂移要慢到像轨道视角，而不是装饰动画。
- 文案压在太空画面上，不放进浮动营销卡片。

### CrewFormationScene

Reid Wiseman、Victor Glover、Christina Koch、Jeremy Hansen 的任务成员介绍。

构图：

- 四个 `CrewSeat` 以 crew manifest 或飞行编队方式排列。
- 信号线把成员连接到 Orion 或任务路线。
- 用角色标签标识 commander、pilot、mission specialist。
- 一句集体叙事短文案，说明这支队伍为什么代表现代 Artemis。

CrewSeat 内容：

- 姓名。
- 任务角色。
- 一个身份或国际合作意义。
- 一条任务相关注释。

设计要点：

- 不写长履历。
- 不做普通头像卡片。
- 视觉参考是飞控屏上的 crew manifest，不是企业团队介绍区。

### SystemIgnitionScene

发射场景，但 SLS 不是唯一主角。

构图：

- SLS 垂直发射图作为画面主轴。
- `IgnitionMeter` 展示克制的状态读数，例如 `T-00:00 / IGNITION`。
- 四个 `SystemNode` 标记：SLS、Orion、Ground Systems、Mission Control。
- 发射橙色光线打进深色任务界面。
- 主文案：`一整套深空系统，从地面同时启动。`

SystemNode 内容：

- 系统名。
- 一句职责说明。
- active 或 verified 状态。

设计要点：

- 这是唯一可以“响亮”的场景。
- 下一拍要迅速从发射奇观转向系统协同。

### MissionRouteScene

整个 artifact 的结构核心。

构图：

- `TrajectoryLine` 随场景推进逐段解锁。
- `RouteNode` 呈现任务关键检查点。
- `MissionClock` 提供 Day 1 到 Day 9 的时间感。
- `ActiveNodeBrief` 解释当前节点。

RouteNode 顺序：

- Launch。
- Earth orbit checkout。
- Trans-lunar injection。
- Lunar flyby。
- Free-return trajectory。
- Re-entry。
- Splashdown recovery。

RouteNode 内容：

- 任务日或阶段标签。
- 节点标题。
- 一句“为什么这一步关键”。
- 与滚动位置或选中节点绑定的 active 状态。

设计要点：

- 不要做成普通 timeline list。
- 它应该像任务回放屏：这条路线之所以存在，是因为安全、验证和返回几何共同约束了飞行。
- 事实说明要短。路线本身承担解释。

### LunarFlybyScene

情绪高潮组件。

构图：

- 大幅月球表面或飞掠影像。
- 小型地球标记，用来建立尺度。
- 很细的 Orion ghost path 或窗口视角提示。
- 极少量距离或方向注释。
- 主文案：`月球不再只是夜空里的远方，而是一次飞行中的真实地标。`

设计要点：

- UI 几乎要消失。
- 不堆图片。选择一张主导性的月球画面，再加一个辅助尺度提示。
- 观众应该感到接近、尺度、安静，以及地月关系。

### ReturnClosureScene

从深空回到地球的收束场景。

构图：

- 返回、降落伞、溅落、回收或任务控制确认影像。
- `MissionCompleteSeal` 做成操作确认样式，而不是庆祝徽章。
- 小型 `FuturePointer` 指向 Artemis III 或重返月面。
- 结尾文案：`这次任务的终点，是下一次真正重返月面的起点。`

设计要点：

- 用安全返回、回收和验证证明任务闭环。
- 避免宏大口号墙。
- 后续任务只作为克制的延续标记出现，不展开成新主题。

### SourceCreditScene

低干扰的素材来源和使用说明区域。

构图：

- 按场景列出素材。
- NASA source URL。
- credit。
- alt text。
- usage note。

设计要点：

- 内容必须可读、可选择。
- 可以作为最后一个 Block，也可以作为每幕底部的低对比度信息栏。
- 不要把已有媒体搜索工作流暴露进最终沉浸式 artifact。

## Primitive 使用

主体验使用为这个故事定制的 rich scene components。`agent-html/components/ui` 里的本地 primitive 只在有明确角色时使用。

适合使用：

- `Badge`：任务标签、角色、任务日标记、验证状态。
- `Separator`：细微仪表分隔线。
- `Progress`：点火或路线完成度，但必须读起来像 telemetry。
- `Accordion`：如果最终 sources 列表较长，用于展开素材来源。
- `Tabs` 或 `ToggleGroup`：仅在路线节点需要手动导航时使用。

避免使用：

- 重复 Card 网格。
- 营销式 hero 按钮。
- 轮播优先的媒体图库。
- Data table。
- Kanban board。
- Code block。
- 通用导航栏。

主导 UI 组件应该为这个叙事而生：Orion 舷窗、任务成员清单、点火系统、任务路线、月球舞台和返回确认。

## 视觉系统

色彩：

- 深空黑。
- 地球蓝。
- 仪表白。
- 月面灰。
- 发射橙。
- NASA 红只作为少量状态标记，不做主色。

字体：

- 气质偏工程纪录片。
- 标题应窄、精确、有任务感。
- 正文保持清晰、冷静。
- 不用玩具化科幻字体，也不做通用产品页字体处理。

布局：

- 优先 full-bleed 场景，而不是被框住的 section。
- caption 要短，并且放在有意图的位置。
- 让影像占据屏幕主导权。
- HUD 线用于测量和定位，不做纯装饰。
- 不把 Card 放进 Card。

质感：

- 稀疏星场。
- 极轻颗粒。
- 舷窗反光。
- 细轨迹线。
- 低对比度坐标标记。

## 动效规则

动效应该像任务回放，不像预告片。

- 开场：地球缓慢漂移、星场微动、文字延迟显现。
- Crew：成员画面稳定后，信号线再出现。
- Launch：一次强点火瞬间，然后系统节点依次 verified。
- Route：轨迹线按节点解锁。
- Lunar flyby：几乎静止，只让细轨迹或尺度提示轻微移动。
- Return：深空黑过渡到海面回收蓝。

需要尊重 reduced-motion 偏好。静态 fallback 必须保留场景顺序、当前路线状态、来源可见性和文本可读性。

## 本地素材策略

使用少量官方 NASA 精选素材，从 `agent-html/assets` import。最终故事不要做成媒体图库。

按叙事角色组织素材：

- `orion-window-earth`。
- `artemis-ii-crew`。
- `sls-launch-pad`。
- `orion-systems`。
- `mission-route-map`。
- `lunar-flyby`。
- `moon-earthset`。
- `orion-recovery`。

每条素材记录包含：

- `id`。
- `sceneId`。
- `title`。
- 本地 import。
- `sourceUrl`。
- `credit`。
- `alt`。
- `usageNote`。

已有 Artemis II Media Story Builder 可以保留为寻找和筛选素材的制作工具。沉浸式 artifact 只消费策展后的本地素材。

## 验收标准

- 第一视口明确读作 Orion 舷窗中的地球回望。
- 六个 Block 不依赖额外解释也能形成连续故事。
- 路线场景能让九天任务被理解为一条由安全约束塑造的飞行路径。
- 月球飞掠是视觉高潮，并且 UI 最少。
- NASA credit 和 usage note 存在，但不破坏体验。
- artifact 不能看起来像 NASA 首页、图库、dashboard 或 slide deck。
