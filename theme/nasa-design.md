# Artemis II Artifact 设计稿

## 设计意图

本文件细化 `theme/nasa.md`，定义 Artemis II Canvas artifact 的目标设计。

设计目标是把六幕任务剧本编排成一次从 Orion 视角展开的深空任务回放。页面
应该先建立“人类重新离开地球”的体验，再进入 crew、系统启动、九天路线、
月球飞掠和返回闭环。

它不是 NASA 资料页、图片合集、Apollo 怀旧页、发射海报或普通时间线百科。

## 主体与姿态

- primary subject：Artemis II 载人深空验证任务。
- 观看方式：先被观看，再被检查；视觉引导在前，任务逻辑解释在后。
- artifact posture：cinematic mission surface，带任务控制台秩序。
- 情绪：现代、克制、技术化、公共观看感，不做复古 Apollo 情绪。
- 密度：图像承担场景，短文案解释意义，数据和标签只做定位。
- 节奏：Orion 视角开场，crew 进入，系统启动，路线展开，月球飞掠高潮，返回地球闭环。

## 目标 Block 编排

| Block | 叙事任务 | 主导对象 | 布局形态 | 组件策略 |
| --- | --- | --- | --- | --- |
| `orion-window` | 建立“人类离开地球”的视角 | Orion 舷窗中的地球 | 大图开场 + 任务标签 + 遥测短项 | 图片、Badge、content classes |
| `crew-manifest` | 让四名宇航员成为任务的人类入口 | official crew portraits | 四人任务证件式并列 | Badge、等权人物面板 |
| `system-ignition` | 把发射解释为系统同时启动 | SLS 发射与地面系统 | 发射主图 + 系统状态说明 | 图片、状态面板、短说明 |
| `mission-route` | 把九天任务讲成安全约束下的路线 | 地月路线与阶段节点 | Timeline + mission map aside | 复用 Timeline，不自造路线组件 |
| `lunar-flyby` | 形成靠近月球的视觉高潮 | 月球飞掠影像 | 强主图 + 辅助影像 + 意义说明 | 图片组、阶段标签、短注释 |
| `return-future` | 从太空回到地球，完成验证闭环 | Orion 返回与海上回收 | 返回主图 + 闭环四项 | 图片、简短状态项 |
| `sources` | 收束 NASA 素材来源 | 官方资源与 credit | 集中来源区 | 链接清单，避免打断主叙事 |

## 分幕设计说明

### Orion 舷窗开场

第一屏必须先建立“离开地球”的体验。主视觉应让观众像站在 Orion 内部，
通过舷窗或任务影像回望地球。

- 使用深色太空、地球、Orion 视角或等价的官方任务视觉作为第一对象。
- 标题使用短句，表达“人类正在重新学习如何抵达月球”。
- 任务标签只承担识别：`ARTEMIS II`、`CREWED LUNAR FLYBY`、`9 DAYS`、`ORION + SLS`。
- 遥测短项只建立尺度：crew count、mission duration、launch site、destination。
- 不要把火箭、NASA 标识、参数表或资料入口放成首屏主角。

### Crew Manifest

这一幕回答“谁在飞”。四名宇航员应像任务成员板，而不是普通人物履历卡。

- 四人视觉权重保持一致。
- 每人只放姓名、角色、机构和一句任务意义。
- 角色和机构用短标签帮助扫描。
- 人物说明强调现代、多元、国际合作和任务身份。
- 不写长 biography，不做社交媒体头像墙。

### System Ignition

发射是入口，不是唯一主角。画面可以震撼，但叙事必须转向系统协同。

- 使用 SLS 在 39B 发射台点火、升空或发射台结构同框素材作为主视觉。
- 同屏解释 `SLS`、`Orion`、`Ground Systems`、`Mission Control` 各自负责什么。
- 状态语言可以有任务控制台感，但不要编造实时数值。
- 发射段只承担系统启动阶段，不吞掉后续路线和月球飞掠叙事。

### Nine-Day Mission Route

这一幕的主对象是“被安全设计约束的深空路线”，不是普通时间线。

- 路线节点使用 Launch、Earth Orbit Testing、Trans-Lunar Injection、Lunar Flyby、Free Return、Splashdown。
- 每个节点必须回答“为什么关键”。
- 地图或轨迹图服务任务回放，不做装饰背景。
- 优先复用本地 Timeline 组件，让周边说明承担路线约束解释。
- 不要只画地月连线，不要用长文解释轨道机制。

### Lunar Flyby

这是视觉高潮。观众应感到月球成为飞行中的真实地标。

- 使用一张最强月球飞掠、月球地形、Earthset 或 Orion 视角图作为主对象。
- 辅助图分别承担距离、尺度、孤独感、地月关系等不同职责。
- 文案解释飞掠如何验证深空导航和月球空间飞行。
- 不要堆月球图库，不要把高潮写成空泛口号。

### Return And Future

结尾从深空回到地球，证明任务闭环，并指向后续 Artemis 登月。

- 主视觉优先选择 Orion 返回、溅落、海上回收或任务完成确认。
- 闭环信息围绕 Return、Recovery、Validation、Next Artemis Step。
- 结尾语气平静、可信、有完成感。
- 不做营销 CTA，不堆“未来”“梦想”类口号。

## 视觉与组件策略

- 官方 NASA 影像是视觉骨架，Canvas UI 负责组织、标注和解释。
- 使用 Canvas public content classes、semantic tokens 和本地 primitives。
- 优先使用 Badge、Timeline、图片、短说明、来源链接等本地能力。
- 用间距、对齐、标题、caption、边线和状态标记建立层级。
- 面板只用于真实对象、状态组、数据范围或说明范围。
- 不要把每张图、每段 caption、每个来源和每条说明都包成卡片。
- 不要使用 raw palette、随意渐变、通用科幻 HUD、厚重发光、装饰星云或随机粒子。
- NASA 红、地球蓝、白色可以作为少量重点，不应变成饱和品牌页面。

## 素材与署名计划

| 用途 | 素材方向 | 官方来源 | Credit |
| --- | --- | --- | --- |
| 开场 | Orion 视角、地球远景、Artemis II 官方视觉 | Artemis II Multimedia、NASA Images Search | 图片附近保留 |
| Crew | 四名宇航员官方肖像或任务合影 | Artemis II Crew、Artemis II Media Resources | 每张或每组保留 |
| 发射 | SLS 点火、升空、39B 发射台 | Artemis II Launch Gallery、Media Resources | 图片附近保留 |
| 路线 | Artemis II Map、Flight Path Animation | NASA image article、SVS | 路线区保留 |
| 飞掠 | 月球飞掠、Earthset、月球地形、Orion 视角 | Lunar Flyby Gallery、Multimedia | 图片附近保留 |
| 返回 | Orion 返回、溅落、海上回收、任务确认 | Media Resources、NASA Images Search | 结尾或来源区保留 |

所有图片、视频和音频优先使用 `theme/nasa.md` 列出的 NASA 官方资源方向。
使用 NASA 标识、人物肖像、视频帧和第三方署名素材时遵守 NASA media usage
规则：<https://www.nasa.gov/nasa-brand-center/images-and-media/>。

素材选择必须服务叙事节点。可用素材不能反过来重定义主题。

## 文案策略

- 每个 block 只有一个主句。
- 主句负责情绪和方向，正文负责解释任务意义。
- caption 负责素材说明和 credit，不承担主要叙事。
- source 区集中收束长来源，不打断前面的观看节奏。
- 中文短、硬、清楚；英文标签只做任务识别和组件扫描。
- 避免长 biography、百科式轨道解释、宣传口号和泛太空修辞。

## 响应式策略

- 桌面端保留图像主对象和说明区域的并置关系。
- 移动端保持六幕顺序，不改变叙事身份。
- 图片可以先于说明出现，但来源和 caption 不能丢失。
- 路线、人物和系统状态在窄屏下允许堆叠，但语义顺序不变。
- 不在 artifact source 中渲染 host chrome、block prompt action 或检查覆盖层。

## 验收检查

- 第一屏不看文件名也能识别 Artemis II、Orion 视角、地球回望和载人深空飞行。
- 六幕都被具象化，并且每一幕有不同视觉职责。
- 每个 block 有一个 leading object。
- 四名宇航员、SLS、Orion、地面系统、九天路线、月球飞掠和回收都进入叙事。
- 发射不是唯一主角。
- 路线段解释安全约束和系统验证，不只是 chronological list。
- 月球飞掠是视觉高潮，不是月球图库。
- 返回段完成任务闭环，不变成营销结尾。
- 素材来源可追踪，但不支配页面节奏。
- 页面读起来像一次现代深空任务回放，不像组件展板或 NASA 官网换皮。
