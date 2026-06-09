# Three Speeds of Tokyo Artifact 设计文档

## 总体方向

这个 artifact 不做 NASA 式的六幕大图叙事。Tokyo 的页面应该像一块城市节奏控制台：观众不是被一张张主视觉推着往下看，而是在地图、时间块、交通强度和兴趣选择之间理解“三天如何读东京”。

核心命题：

`东京太丰富，所以真正的问题不是去哪，而是如何取舍。`

页面主角是城市节奏，不是摄影图集。图片只在需要建立身体感、城市密度、安静质感和返程情绪时出现；地图、路线、时间块和数据层才是主要结构。

视觉气质应是现代、克制、信息清楚的 city operating surface。避免旅游广告、赛博霓虹、复古滤镜和景点排行榜。不要自己搓装饰性矢量图来冒充素材；如果需要非摄影视觉，只能是地图、路线、区域、节点、时间块、数据强度这类 UI 信息表达。

## 全局布局语言

- 首屏像路线控制台，不像 hero poster。
- 每个 block 由一个明确的工作对象主导：地图、三日节奏板、路线对比、交通强度、真实图片或 source index。
- 用少量真实照片建立城市触感，用更多交互组件解释选择逻辑。
- 不要每幕都放一张大图加标题加卡片；这是 NASA artifact 的语言，不适合 Tokyo。
- 不要堆叠很多 box/border。用对齐、密度、状态、时间线、地图层和进度条建立层次。
- Source 集中在结尾，图片附近只放必要的短 credit。

## 第一幕：Arrival Strip

### 场景目标

建立 Soft Landing。观众看到的不是“东京景点开始了”，而是“身体正在从机场进入城市”。

### 页面布置

首屏采用横向 arrival strip：左侧是短路线状态，右侧是机场到城市的第一段视觉。画面可以是羽田机场、东京单轨、列车窗外、酒店周边或便利店夜景。不要开场就进入涩谷人潮。

这一幕不是 cinematic hero，而是一个进城状态面板：到达、换乘、酒店、晚餐、睡眠。

### UI 组件

- `Timeline`：展示 `Haneda -> train -> hotel area -> first dinner -> sleep`。
- `Badge`：标记 `Day 1`、`Soft Landing`、`low intensity`。
- `Progress`：显示体力消耗低、移动半径短。
- 真实图片：只放一张 arrival 语义素材，承担“刚进入城市”的身体感。
- 小型 observation list：机场出口、车站标识、便利店、酒店周边。

### 内容细节

主句：

`第一天的任务不是打卡，而是让身体抵达。`

短项：

- airport to city：羽田进城，先完成第一段移动。
- first base：酒店周边比景点更重要。
- energy level：低强度、短半径。
- first night：便利店、晚餐、睡眠。

### 素材资源

- 推荐正式图片：Tokyo Monorail Haneda Airport Terminal 3 platform
  - address：<https://commons.wikimedia.org/wiki/File:Tokyo-Monorail_Haneda-Airport-Terminal-3-STA_Platforms.jpg>
  - 用途：`arrival`，作为第一幕真实进城素材，表达机场到城市的受控第一步。
  - credit/licensing note：Wikimedia Commons，作者 MaedaAkihiko，CC0。
- Haneda airport access：<https://www.gotokyo.org/en/plan/airport-access/haneda-airport/index.html>
- Tokyo Monorail category：<https://commons.wikimedia.org/wiki/Category:Tokyo_Monorail>
- Tokyo Monorail Haneda 示例：<https://commons.wikimedia.org/wiki/File:Tokyo_monorail_-_Haneda_airport_view_from_Keihinjima_island_(488414141).jpg>
- FamilyMart night：<https://unsplash.com/photos/familymart-convenience-store-at-night-with-a-person-walking-VtWiBy8fSDM>
- Lawson night：<https://unsplash.com/photos/lawson-convenience-store-at-night-with-illuminated-signs-QUV6cR60KLU>

GO TOKYO Haneda access 用作路线可信背书，不直接抓网页图。Unsplash 便利店夜景只作为备选，不要替代第一幕的交通进入语义。

### 避免事项

- 不用涩谷人潮开场。
- 不用歌舞伎町霓虹定义第一印象。
- 不做巨幅旅游海报。
- 不把 arrival 做成摄影展示墙。

## 第二幕：Three-Day Rhythm Board

### 场景目标

建立三天结构：Day 1 Soft Landing、Day 2 High Density、Day 3 Quiet Tokyo。观众要理解这是节奏计划，不是景点清单。

### 页面布置

主体是一块三日节奏板。三天横向排列，每天有体力、移动半径、换乘压力、城市速度、关键区域和取舍理由。旁边可以放一张轻量东京区域地图，地图只表达移动范围，不做完整导航。

### UI 组件

- `Tabs` 或 `ToggleGroup`：切换 `Day 1`、`Day 2`、`Day 3`。
- `Progress`：分别显示 energy、transfer load、walking load。
- `Timeline`：展示三天的速度变化。
- `Badge`：标记 `soft`、`dense`、`quiet`。
- 地图区域层：用 Shibuya、Shinjuku、Omotesando、Yanaka、Kiyosumi、Jimbocho 等区域块表达移动半径。

### 内容细节

主句：

`东京太丰富，所以真正的问题不是去哪，而是如何取舍。`

三日结构：

- Day 1 Soft Landing：短半径，先适应。
- Day 2 High Density：把高密度体验集中处理。
- Day 3 Quiet Tokyo：降速，延长停留。

### 素材与数据资源

- OpenStreetMap copyright：<https://www.openstreetmap.org/copyright>
  - 用途：`rhythm / map`，表达东京区域、移动半径、路线线和区域关系。
  - credit/licensing note：必须显示 `© OpenStreetMap contributors`，并遵守 ODbL；生产分发不要直接滥用 OSM 免费 tile。
- GO TOKYO Shibuya：<https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html>
- GO TOKYO Shinjuku：<https://www.gotokyo.org/en/destinations/western-tokyo/shinjuku/index.html>
- GO TOKYO Aoyama & Omotesando：<https://www.gotokyo.org/en/destinations/western-tokyo/aoyama-and-omotesando/>
- GO TOKYO subways：<https://www.gotokyo.org/en/plan/getting-around/subways/index.html>

这些 GO TOKYO 区域页用于 Day 2 / Day 3 区域结构背书，不当作图库。地图主体可以是区域抽象层，不要求真实 tile，但 attribution 仍要可追溯。

### 避免事项

- 不做景点排行榜。
- 不做照片拼贴。
- 地图不要复杂到像导航产品。
- 不用大图压过三日节奏板。

## 第三幕：Density Layer

### 场景目标

表现 High Density Tokyo，但重点是秩序、效率、流动、站点逻辑和商业界面，而不是“赛博东京”。

### 页面布置

这幕像打开一层 density overlay：地图上的 Shibuya、Shinjuku、Omotesando 亮起，同时出现交通节点、人流强度、夜间活动强度和换乘压力。真实图片或视频只作为右侧证据，不作为整幕背景。

### UI 组件

- `Tabs`：切换 `Shibuya`、`Shinjuku`、`Omotesando`。
- `Progress`：显示 crowd、transfer、night energy、commercial density。
- `Timeline`：表达下午到夜间的节奏推进。
- `Table`：列出区域、适合时间、强度、注意事项。
- 真实素材窗口：人流、站点、街道或商业界面，用一张即可。

### 内容细节

主句：

`在高密度东京，秩序本身就是风景。`

观察点：

- crowd flow：人流是组织方式，不是混乱。
- station logic：出口、换乘和步行连接决定体验。
- commercial layer：商业界面是城市密度的一部分。
- night energy：夜景是能量，不是全部。

### 素材资源

- 推荐正式图片：Omotesando mirror crowd
  - address：<https://commons.wikimedia.org/wiki/File:Street_crowd_reflecting_in_the_polyhedral_mirrors_of_the_station_Tokyu_Plaza_Omotesando,_Harajuku,_Tokyo,_Japan.jpg>
  - 用途：`density`，比普通人潮更适合新版设计，表达高密度、秩序、反射和城市商业界面。
  - credit/licensing note：Wikimedia Commons，作者 Basile Morin，CC BY-SA 4.0；使用时需要署名，并注意 share-alike。
- 辅助密度素材：Shibuya Crossing night, 2006
  - address：<https://commons.wikimedia.org/wiki/File:Shibuya_crossing_at_night,_2006.jpg>
  - 用途：`density / evidence`，可作为涩谷密度辅助图，不建议做整幕主视觉。
  - credit/licensing note：CC BY-SA 3.0；页面提示部分元素可能涉及 de minimis，避免裁切聚焦广告牌。
- Shibuya Crossing video：<https://commons.wikimedia.org/wiki/File:Shibuya_Crossing,_Tokyo,_Japan_(video).webm>
- Featured Pictures of Tokyo：<https://commons.wikimedia.org/wiki/Category:Featured_pictures_of_Tokyo>
- Tokyo Tokyo Video：<https://tokyotokyo-video.jp/index_en.html>
- Shinjuku crowd Unsplash：<https://unsplash.com/photos/a-group-of-people-walking-down-a-street-at-night-7N8tAlPrfQM>
- Kabukicho Wikimedia：<https://commons.wikimedia.org/wiki/File:Kabukicho_red_gate_and_colorful_neon_street_signs_at_night,_Shinjuku,_Tokyo,_Japan.jpg>

Tokyo Tokyo Video 更适合正式可申请场景；轻量 artifact 优先使用 Wikimedia/Unsplash 中可核对授权的真实素材。

### 避免事项

- 不用自制矢量图替代真实密度素材。
- 不做满屏霓虹和雨夜反光。
- 不让人潮看起来失控。
- 不让摄影图抢走地图和数据层的主体位置。

## 第四幕：Quiet Layer

### 场景目标

证明东京不是只有人潮和夜景。Quiet Tokyo 是日常、细节、停留和低刺激路线，不是复古滤镜。

### 页面布置

地图上的 Yanaka、Kiyosumi、Jimbocho 形成一条低刺激路线。画面节奏变慢，信息密度下降。真实图片可以更大一些，但仍然与停留时间、步行半径和低刺激指标一起出现。

### UI 组件

- `Timeline`：上午到下午的慢速路线。
- `Progress`：显示 low stimulus、walking、dwell time。
- `Badge`：标记 `garden`、`bookstores`、`morning street`、`pause`。
- 真实图片：庭园、书店、街角或清晨街道。
- `Accordion`：收纳安静路线的备选点，避免把页面堆成卡片墙。

### 内容细节

主句：

`东京也可以很低声量。`

观察点：

- pause：停下来本身就是目的。
- texture：书店、门面、喫茶店和街角构成城市纹理。
- morning：清晨解释另一种东京。
- low stimulus：低刺激路线不是低质量路线。

### 素材资源

- 推荐正式图片：Kiyosumi Garden
  - address：<https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg>
  - 用途：`quiet`，作为 Quiet Layer 的主照片，表达停留、水面、庭园和低刺激。
  - credit/licensing note：Wikimedia Commons，作者 Guilhem Vellut，CC BY 2.0。
- 书店细节备选：Books along a walkway in Kanda-Jimbocho
  - address：<https://commons.wikimedia.org/wiki/File:Books_along_a_walkway_in_the_Kanda-Jimbocho_area_of_Tokyo.JPG>
  - 用途：`quiet / bookstores`，表达神保町书店和可停留的城市纹理。
  - credit/licensing note：Wikimedia Commons，作者 Nick-D，CC BY-SA 3.0。
- GO TOKYO Yanaka & Nezu：<https://www.gotokyo.org/en/destinations/northern-tokyo/yanaka-and-nezu/index.html>
- GO TOKYO Yanaka Ginza：<https://www.gotokyo.org/en/spot/170/index.html>
- GO TOKYO Kiyosumi Gardens：<https://www.gotokyo.org/en/spot/25/index.html>
- Wikimedia Kiyosumi Garden：<https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg>
- GO TOKYO Kanda & Jimbocho：<https://www.gotokyo.org/en/destinations/central-tokyo/kanda-and-jimbocho/index.html>

GO TOKYO Kiyosumi / Yanaka / Jimbocho 用作地点可信背书。GO TOKYO stock photo 使用通常需要申请并保留 `©Tokyo Convention & Visitors Bureau` 或 `© TCVB`。

### 避免事项

- 不用樱花、神社、怀旧滤镜统治整幕。
- 不把 quiet 做成“次要路线”。
- 不做复古明信片。
- 不堆很多小图。

## 第五幕：City Selector

### 场景目标

这是页面核心。观众要看到：同一座东京可以按食物、设计、书店、夜生活、低刺激被重新组织。路线选择要可见、可切换、可比较。

### 页面布置

主体是一个城市选择器，不是摄影区。左侧是兴趣切换，中央是东京区域地图和路线层，右侧是三天时间块被改写后的结果。底部放强度对比：步行、换乘、排队、夜间活动、停留时间。

### UI 组件

- `ToggleGroup`：选择 `food`、`design`、`bookstores`、`nightlife`、`low stimulus`。
- `Tabs`：在 `route`、`time`、`load` 三种视图间切换。
- 地图区域层：显示区域、路线线、站点点位和移动半径。
- `Progress`：比较 walking、transfer、queue、night energy、dwell time。
- `Table` 或 `DataTable`：对比五种兴趣路线的成本与收益。
- `HoverCard`：悬停区域点位时显示来源和路线理由。

### 内容细节

主句：

`同一座城市，可以被不同的人用不同速度阅读。`

五种路线：

- food：餐食密度、排队成本、移动范围。
- design：青山、表参道、商店、展览、视觉文化。
- bookstores：神保町和长停留。
- nightlife：夜间移动、返程计划、体力消耗。
- low stimulus：少换乘、少人潮、更多坐下来的时间。

### 数据与素材资源

- OpenStreetMap copyright：<https://www.openstreetmap.org/copyright>
  - 用途：`selector / map`，用于区域底图、路线线、移动半径和地图 attribution。
  - credit/licensing note：显示 `© OpenStreetMap contributors`，遵守 ODbL。
- ODPT overview：<https://www.odpt.org/en/overview/>
  - 用途：`selector / transit`，用于铁路、巴士、航空、GTFS、REST API 和换乘强度表达。
  - credit/licensing note：使用需注册开发者并遵守开发者站点使用条件。
- ODPT developer：<https://developer.odpt.org/>
- Tokyo Tourism Data Catalog：<https://data.tourism.metro.tokyo.lg.jp/en/>
  - 用途：`selector / density`，用于访问热度、区域强度和兴趣路线比较。
  - credit/licensing note：按数据集要求标注来源；加工后不能表现成东京都官方结论。
- Tokyo Tourism mobile data：<https://data.tourism.metro.tokyo.lg.jp/data/mobile/>
  - 用途：`selector / mobile data`，用于移动空间统计相关的区域强度提示。
  - credit/licensing note：移动数据需标注 `出典：モバイル空間統計`。

### 避免事项

- 不用 Google Maps 截图。
- 不用未授权 POI 数据。
- 不用照片解释选择器。
- 不做复杂后台仪表盘。
- 不把 City Selector 放成一个小尾巴，它必须是整页核心。

## 第六幕：Open Loop

### 场景目标

离开东京，但不把城市消费完。结尾要留下下一次路线入口。

### 页面布置

这幕回到安静状态：返程列车、机场动线、清晨街道或未完成收藏点。重点不是 CTA，而是一条 open loop：未去的书店、下一次清晨路线、更慢的东京。

### UI 组件

- `Timeline`：返程动线和下次入口。
- `Badge`：标记 `next time`、`unfinished`、`return route`。
- 简短未完成清单：最多三项。
- 真实素材：返程列车、机场或清晨街道。
- 集中 `Sources`：把所有照片、地图、数据源统一收束。

### 内容细节

主句：

`好的城市计划，不是把城市用完，而是知道下次从哪里继续。`

未完成入口：

- missed bookstore：没有去完的书店。
- morning neighborhood：下一次清晨街区。
- slower return：更低速度的东京。

### 素材资源

- 推荐正式图片：Bookshop in Kanda-Jimbocho
  - address：<https://commons.wikimedia.org/wiki/File:Bookshop_in_Kanda-Jimbocho_area_of_Tokyo.JPG>
  - 用途：`openLoop`，作为“未完成路线”的真实素材，比返程列车更能表达没有去完的书店和下一次入口。
  - credit/licensing note：Wikimedia Commons，作者 Nick-D，CC BY-SA 3.0。
- 备选返程素材：Tokyo Monorail category
  - address：<https://commons.wikimedia.org/wiki/Category:Tokyo_Monorail>
  - 用途：`departure`，用于返程列车或机场动线；必须逐张核对 license 和署名。
- GO TOKYO Haneda：<https://www.gotokyo.org/en/spot/69/index.html>
- Tokyo Monorail category：<https://commons.wikimedia.org/wiki/Category:Tokyo_Monorail>
- Unsplash Tokyo search：<https://unsplash.com/s/photos/tokyo-japan>
- FamilyMart night：<https://unsplash.com/photos/familymart-convenience-store-at-night-with-a-person-walking-VtWiBy8fSDM>

结尾优先使用 Jimbocho 书店素材表达 open loop；只有当返程动线成为主叙事时，才使用 Tokyo Monorail / Haneda 类素材。

### 避免事项

- 不做旅游广告式再见东京。
- 不用东京塔、烟花或煽情大高潮。
- 不把未完成路线做成景点清单。
- 不重复第一幕同一张图片，除非语义上明确表达“回到同一个入口”。

## 组件总表

优先使用现有 Canvas 组件和普通内容类，不新建通用组件。

- `Tabs`：日期、区域、route/time/load 视图切换。
- `ToggleGroup`：兴趣路线选择器。
- `Timeline`：三日节奏、arrival strip、return route。
- `Progress`：体力、换乘、步行、排队、夜间能量、停留时间。
- `Badge`：速度、区域、路线状态。
- `Table` / `DataTable`：路线成本与收益对比。
- `Accordion`：Quiet Tokyo 的备选低刺激点。
- `HoverCard`：地图点位和数据来源提示。
- `ScrollArea`：移动端或横向密集路线面板。

地图不是新组件，而是一个内容对象：区域块、线路、点位、半径、来源标注共同构成。它可以用普通 DOM 结构表达，但必须看起来像路线/区域界面，而不是装饰插画。

## 素材规则

- 不要自己搓装饰性矢量图充当东京图片。
- 当前 artifact 中如果存在临时自制 SVG，只能视为占位，正式实现必须替换成真实图片或地图/数据 UI。
- 真实图片用于 arrival、density、quiet、departure 四类语义。
- 地图、路线和数据层用于 rhythm、selector 两类语义。
- 图片需要本地化时，放入 `agent-html/public/tokyo-three-speeds/`，在 artifact 中用 `/__agent-html/public/tokyo-three-speeds/...`。
- GO TOKYO 页面用于官方地点和路线背书；stock photo 使用通常需要申请并 credit。
- Wikimedia 逐张核对 license、作者、attribution、share-alike。
- Unsplash 可作补充摄影，建议 credit 摄影师。
- OpenStreetMap 必须标注 `© OpenStreetMap contributors` 和 ODbL。
- ODPT 需要遵守开发者使用条件。
- Tokyo Tourism Data Catalog 的移动数据需按其要求标注来源，加工后不能表现成东京都官方结论。

## 验收检查

- 第一眼像东京路线节奏工具，不像 NASA artifact 换皮。
- City Selector 是核心场景，不是普通信息块。
- 至少两幕以地图、路线、时间块或数据层为主体，而不是图片。
- 没有自制装饰 SVG 当作素材图片。
- `arrival` 使用 Haneda / Tokyo Monorail 真实素材。
- `density` 优先使用 Omotesando mirror crowd 或 Shibuya Crossing 真实素材。
- `quiet` 优先使用 Kiyosumi Garden / Jimbocho 真实素材。
- `openLoop` 优先使用 Jimbocho bookshop/books walkway 真实素材。
- 图片都承担明确职责：arrival、density、quiet、departure。
- High Density 有秩序，不只是霓虹。
- Quiet Tokyo 有日常感，不是怀旧滤镜。
- Sources 集中收束，不打断每幕阅读。
- 文档只描述设计、布景、组件、素材和验收，不包含代码实现。
