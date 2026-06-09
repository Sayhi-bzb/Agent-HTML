# Three Speeds of Tokyo Route Console

## Design Thesis

Tokyo 不是一组按顺序观看的旅行分镜。这个 artifact 应该是一块路线编辑台：观众第一眼看到的是一张可读的东京路线控制面，而不是 hero、章节标题和一张张大图。

核心命题：

`东京太丰富，所以真正的问题不是去哪，而是如何取舍。`

页面的主对象是 `Tokyo Route Console`。三天、兴趣、地图、交通强度、时间块和照片证据都围绕这个 console 工作。Arrival、Density、Quiet、Open Loop 不再是纵向故事章节，而是 console 中可切换、可展开、可比较的 layer。

不要沿用 NASA artifact 的口吻：不做“六幕故事”、不做每段一张主图、不做 block-by-block 的 cinematic scroll。Tokyo 的新 taste 应是城市操作界面、路线编辑台、旅行节奏仪表，而不是漂亮分镜页。

## Primary Surface：Tokyo Route Console

首屏就是完整工作台。用户不需要先读完背景，应该马上看到“这是一个三天东京路线系统”。

### 版面结构

- 左侧控制列：三天速度、兴趣路线、当前体力策略。
- 中央主地图层：东京区域、路线线、站点点位、移动半径、active layer。
- 右侧 route inspector：当前选择的时间块、区域理由、照片证据、未完成点。
- 底部 load rail：walking、transfer、queue、night energy、dwell time 的横向强度轨。
- 顶部短标题：只说明命题，不做 hero 大文案。

### 默认状态

- 默认 interest：`bookstores`
- 默认 day：`Day 3`
- 默认 speed：`Quiet Tokyo`
- 默认 active route：`Kiyosumi -> Jimbocho -> missed bookstore`
- 默认 evidence：Kiyosumi Garden 或 Jimbocho bookshop

这个默认状态让页面从一开始就区别于旅游广告：它不是“东京必去”，而是“如何选择一个适合身体状态的东京”。

### 首屏应出现的元素

- `ToggleGroup`：`food`、`design`、`bookstores`、`nightlife`、`low stimulus`
- `Tabs`：`route`、`time`、`load`
- 中央 route map：区域块不是普通网格卡片，而要呈现空间关系、路径、移动半径和 active layer。
- Route inspector：当前路线的三段时间块、照片 evidence、下一次保留点。
- Load rail：五个强度指标，不做成孤立卡片。
- Source microcopy：地图层附近只放 `© OpenStreetMap contributors` 这类必要 attribution。

## Console Layers

Console layers 是 route console 的展开状态，不是顺序分幕。实现时可以拆成多个 `Block`，但视觉上必须感觉是同一个路线系统的不同层，而不是六个独立章节。

### Layer：Arrival

**职责**

Arrival 是 Day 1 的 route state，用来解释 Soft Landing 为什么成立。它不应该占据整页开场，也不应该变成机场 hero。

**在 console 中的位置**

- 左侧 day control 中显示 `Day 1 / Soft Landing`。
- 中央地图显示 Haneda 到城市的短动线。
- 右侧 inspector 显示 Haneda rail evidence 和 arrival load。

**组件**

- `Timeline`：`Haneda -> Monorail -> hotel area -> dinner -> sleep`
- `Progress`：energy、transfer、walking radius
- `Badge`：`arrival`、`low intensity`、`short radius`
- `img`：一张真实 arrival evidence

**素材**

- Tokyo Monorail Haneda Airport Terminal 3 platform
  - address：<https://commons.wikimedia.org/wiki/File:Tokyo-Monorail_Haneda-Airport-Terminal-3-STA_Platforms.jpg>
  - 用途：`arrival evidence`
  - credit：Wikimedia Commons，MaedaAkihiko，CC0
- GO TOKYO Haneda access
  - address：<https://www.gotokyo.org/en/plan/airport-access/haneda-airport/index.html>
  - 用途：arrival route context，不直接抓网页图

**避免**

- 不用涩谷人潮开场。
- 不让 arrival 变成单独大图章节。
- 不用便利店夜景替代交通进入语义。

### Layer：Rhythm

**职责**

Rhythm 是 console 的骨架。它说明三天不是清单，而是三种城市速度。

**在 console 中的位置**

- 左侧 day control 固定展示三天速度。
- 中央地图根据 day 切换移动半径。
- 底部 load rail 同步变化。

**组件**

- `Tabs` 或 `ToggleGroup`：Day 1 / Day 2 / Day 3
- `Progress`：energy、transfer、walking
- `Timeline`：只用于摘要三天速度，不重复成三段故事。
- 区域 map layer：Haneda、Shibuya、Shinjuku、Omotesando、Yanaka、Kiyosumi、Jimbocho。

**数据与 source**

- OpenStreetMap copyright
  - address：<https://www.openstreetmap.org/copyright>
  - 用途：地图 attribution、区域和路线语义
  - credit：必须显示 `© OpenStreetMap contributors`，遵守 ODbL
- GO TOKYO Shibuya
  - address：<https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html>
- GO TOKYO Shinjuku
  - address：<https://www.gotokyo.org/en/destinations/western-tokyo/shinjuku/index.html>
- GO TOKYO Aoyama & Omotesando
  - address：<https://www.gotokyo.org/en/destinations/western-tokyo/aoyama-and-omotesando/>
- GO TOKYO subways
  - address：<https://www.gotokyo.org/en/plan/getting-around/subways/index.html>

**避免**

- 不做三张 day card。
- 不做景点排行榜。
- 不让地图退化成普通文字网格。

### Layer：Density

**职责**

Density 是 Day 2 的 active layer。它不负责制造霓虹情绪，而是显示东京如何在高密度下保持秩序。

**在 console 中的位置**

- 中央地图高亮 Shibuya / Shinjuku / Omotesando。
- 右侧 inspector 切换 crowd、station logic、commercial layer。
- Evidence window 使用真实 Omotesando mirror crowd 或 Shibuya density material。

**组件**

- `Tabs`：Shibuya / Shinjuku / Omotesando
- `Progress`：crowd、transfer、commercial、night energy
- `Table`：只作为区域对比，不做主视觉。
- `HoverCard`：地图点位解释 route reason。

**素材**

- Omotesando mirror crowd
  - address：<https://commons.wikimedia.org/wiki/File:Street_crowd_reflecting_in_the_polyhedral_mirrors_of_the_station_Tokyu_Plaza_Omotesando,_Harajuku,_Tokyo,_Japan.jpg>
  - 用途：`density evidence`
  - credit：Wikimedia Commons，Basile Morin，CC BY-SA 4.0
- Shibuya Crossing night, 2006
  - address：<https://commons.wikimedia.org/wiki/File:Shibuya_crossing_at_night,_2006.jpg>
  - 用途：`density support`
  - credit：CC BY-SA 3.0；避免裁切聚焦广告牌
- Shibuya Crossing video
  - address：<https://commons.wikimedia.org/wiki/File:Shibuya_Crossing,_Tokyo,_Japan_(video).webm>
- Tokyo Tokyo Video
  - address：<https://tokyotokyo-video.jp/index_en.html>
  - note：正式 footage 通常需申请，使用需显示 `©Tokyo Tokyo`

**避免**

- 不用自制装饰 SVG 替代真实密度素材。
- 不做满屏赛博霓虹。
- 不让照片抢走地图层主体。

### Layer：Quiet

**职责**

Quiet 是 Day 3 或 low-stimulus interest 的 active layer。它把路线从“多移动”切换成“长停留”。

**在 console 中的位置**

- 中央地图高亮 Kiyosumi / Yanaka / Jimbocho。
- 底部 load rail 显示 low walking、low transfer、high dwell。
- 右侧 evidence window 显示 Kiyosumi Garden 或 Jimbocho books。

**组件**

- `Timeline`：Kiyosumi -> Yanaka -> Jimbocho
- `Progress`：low stimulus、walking、dwell time
- `Accordion`：收纳 quiet route 的备选点，不做卡片墙。
- `Badge`：garden、bookstore、morning、pause。

**素材**

- Kiyosumi Garden
  - address：<https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg>
  - 用途：`quiet evidence`
  - credit：Wikimedia Commons，Guilhem Vellut，CC BY 2.0
- Books along a walkway in Kanda-Jimbocho
  - address：<https://commons.wikimedia.org/wiki/File:Books_along_a_walkway_in_the_Kanda-Jimbocho_area_of_Tokyo.JPG>
  - 用途：`quiet / bookstores evidence`
  - credit：Wikimedia Commons，Nick-D，CC BY-SA 3.0
- GO TOKYO Kiyosumi Gardens
  - address：<https://www.gotokyo.org/en/spot/25/index.html>
- GO TOKYO Yanaka & Nezu
  - address：<https://www.gotokyo.org/en/destinations/northern-tokyo/yanaka-and-nezu/index.html>
- GO TOKYO Kanda & Jimbocho
  - address：<https://www.gotokyo.org/en/destinations/central-tokyo/kanda-and-jimbocho/index.html>

**避免**

- 不做怀旧明信片。
- 不把 quiet 做成次要路线。
- 不堆很多小图。

### Layer：Interest Selector

**职责**

Interest Selector 是 console 的交互核心，不是一个后置功能块。切换 interest 时，地图、route inspector、load rail 和 evidence 都应随之变化。

**route states**

- `food`：餐食密度、排队成本、短半径移动。
- `design`：Aoyama / Omotesando / gallery stop。
- `bookstores`：Kiyosumi / Jimbocho / missed shelf。
- `nightlife`：Shinjuku / late train / short morning。
- `low stimulus`：hotel area / garden / one bookstore。

**组件**

- `ToggleGroup`：interest switch
- `Tabs`：route / time / load
- `Progress`：walking、transfer、queue、night、dwell
- `Table` 或 `DataTable`：route comparison，只做辅助。
- `ScrollArea`：横向时间块，不让移动端挤坏。

**数据 source**

- ODPT overview
  - address：<https://www.odpt.org/en/overview/>
  - 用途：transit / transfer context
  - note：使用需注册开发者并遵守开发者站点条件
- ODPT developer
  - address：<https://developer.odpt.org/>
- Tokyo Tourism Data Catalog
  - address：<https://data.tourism.metro.tokyo.lg.jp/en/>
  - 用途：area intensity / interest comparison
  - note：加工后不能表现成东京都官方结论
- Tokyo Tourism mobile data
  - address：<https://data.tourism.metro.tokyo.lg.jp/data/mobile/>
  - note：移动数据需标注 `出典：モバイル空間統計`

**避免**

- 不用 Google Maps 截图。
- 不用未授权 POI 数据。
- 不让 Table 变成页面主体。
- 不把 selector 放到页面后半段。

### Layer：Open Loop

**职责**

Open Loop 是 route inspector 中的 unresolved slot，不是煽情结尾。它告诉观众：好的三天计划不是把东京用完，而是知道下次从哪里继续。

**在 console 中的位置**

- 右侧 inspector 的 bottom slot：`next time`
- 地图上保留一个未完成点：Jimbocho bookshop / morning neighborhood / slower return。
- Sources 前只做轻量收束，不做大结尾。

**组件**

- `Timeline`：next time slots
- `Badge`：unfinished、next time、open loop
- `img`：Jimbocho bookshop evidence

**素材**

- Bookshop in Kanda-Jimbocho
  - address：<https://commons.wikimedia.org/wiki/File:Bookshop_in_Kanda-Jimbocho_area_of_Tokyo.JPG>
  - 用途：`openLoop evidence`
  - credit：Wikimedia Commons，Nick-D，CC BY-SA 3.0
- Tokyo Monorail category
  - address：<https://commons.wikimedia.org/wiki/Category:Tokyo_Monorail>
  - 用途：departure 备选；必须逐张核对 license 和署名

**避免**

- 不做“再见东京”旅游广告。
- 不用东京塔、烟花或大高潮。
- 不重复第一屏同一张图。

## Implementation Shape

Artifact 可以仍然使用多个 `Block`，因为 `Block` 是协作边界。但视觉顺序必须改变：

1. `route-console`：首屏主舞台，包含 interest selector、day speed、map layer、route inspector、load rail。
2. `density-layer`：展开 High Density 的 map/evidence/metrics。
3. `quiet-layer`：展开 Quiet 的 route/evidence/dwell metrics。
4. `source-registry`：集中 sources、credits、attribution。

不要再使用 `soft-landing -> rhythm -> density -> quiet -> selector -> open-loop` 的纵向章节结构。Arrival、Rhythm、Open Loop 应该被吸收到首屏 console 和 inspector 里。

## Material Registry

### Photos

- Arrival：<https://commons.wikimedia.org/wiki/File:Tokyo-Monorail_Haneda-Airport-Terminal-3-STA_Platforms.jpg>
  - credit：Wikimedia Commons，MaedaAkihiko，CC0
- Density：<https://commons.wikimedia.org/wiki/File:Street_crowd_reflecting_in_the_polyhedral_mirrors_of_the_station_Tokyu_Plaza_Omotesando,_Harajuku,_Tokyo,_Japan.jpg>
  - credit：Wikimedia Commons，Basile Morin，CC BY-SA 4.0
- Quiet：<https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg>
  - credit：Wikimedia Commons，Guilhem Vellut，CC BY 2.0
- Open Loop：<https://commons.wikimedia.org/wiki/File:Bookshop_in_Kanda-Jimbocho_area_of_Tokyo.JPG>
  - credit：Wikimedia Commons，Nick-D，CC BY-SA 3.0

### Maps / Transit / Data

- OpenStreetMap：<https://www.openstreetmap.org/copyright>
  - required text：`© OpenStreetMap contributors`
  - license：ODbL
- ODPT：<https://www.odpt.org/en/overview/>
- ODPT Developer：<https://developer.odpt.org/>
- Tokyo Tourism Data Catalog：<https://data.tourism.metro.tokyo.lg.jp/en/>
- Tokyo Tourism mobile data：<https://data.tourism.metro.tokyo.lg.jp/data/mobile/>
  - required text：`出典：モバイル空間統計`

### Official Context

- GO TOKYO Haneda access：<https://www.gotokyo.org/en/plan/airport-access/haneda-airport/index.html>
- GO TOKYO Shibuya：<https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html>
- GO TOKYO Shinjuku：<https://www.gotokyo.org/en/destinations/western-tokyo/shinjuku/index.html>
- GO TOKYO Aoyama & Omotesando：<https://www.gotokyo.org/en/destinations/western-tokyo/aoyama-and-omotesando/>
- GO TOKYO Kanda & Jimbocho：<https://www.gotokyo.org/en/destinations/central-tokyo/kanda-and-jimbocho/index.html>
- GO TOKYO Kiyosumi Gardens：<https://www.gotokyo.org/en/spot/25/index.html>

## Component Rules

- `ToggleGroup` 是核心 selector，不是装饰按钮组。
- `Tabs` 是 route/time/load 的视图切换，不是章节导航。
- `Progress` 组成 load rail，不要散成很多孤立卡片。
- `Timeline` 只表达当前 route path 或 next-time slots，避免每个 layer 都重复一条 timeline。
- `Table` / `DataTable` 只能辅助比较，不做主画面。
- `HoverCard` 用在地图点位 source 和 route reason，不做普通 tooltip 堆叠。
- 图片是 evidence window，不是每个 block 的主视觉。
- 地图层可以用 DOM 表达，但必须像地图：有区域关系、路径、点位、半径、active layer。

## Acceptance Criteria

- 第一屏就是 `Tokyo Route Console`，不是 arrival hero。
- `City Selector` 在首屏主舞台，不在第五个 block。
- Artifact 不再呈现六段纵向故事。
- Arrival、Density、Quiet、Open Loop 都像 console layer 或 inspector state。
- 至少一个地图层占据页面主视觉。
- 照片作为 evidence 嵌入 route inspector 或 layer，不是大图章节。
- 没有自制装饰 SVG 作为东京图片。
- 图片全部使用真实素材，且保留 source 和 credit。
- Sources 集中为 registry，不打断主操作界面。
- 页面读起来像城市路线编辑台，不像组件展板、旅游攻略或 NASA artifact 换皮。
