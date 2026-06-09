# Three Speeds of Tokyo Artifact 页面设计分镜

## 总体方向

这个 artifact 要把东京设计成三种城市速度，而不是一份景点清单。东京的难点不是“去哪”，而是如何在体力、时间、天气、预算和兴趣之间做取舍。

页面的核心结构是：

- Day 1：Soft Landing
- Day 2：High Density
- Day 3：Quiet Tokyo

整体气质应是现代城市编辑路线图：清晰、克制、有节奏，表达东京的秩序、密度、细节和日常感。不要把东京压缩成霓虹、寿司、动漫、涩谷十字路口或旅游广告。

每一幕都应先建立城市速度，再放路线信息。地图、交通、图片、视频和开放数据共同构成可执行城市体验，但页面不应变成地图产品、数据后台或景点排行榜。

## 页面结构

### 第一幕：抵达东京，不急着征服城市

**场景目标**

建立 Soft Landing。观众进入页面时，先感到“身体刚抵达城市”，而不是被东京的景点密度立刻压住。

**画面布置**

主视觉应是机场进城、列车窗外、酒店周边或便利店夜景。城市还没有完全展开，画面重点是第一层街区秩序、移动后的疲劳感和低强度进入。

不要一开场就放涩谷人潮、歌舞伎町霓虹或宏大天际线。

**UI 组件**

- **沉浸式抵达场景**：机场、列车或便利店夜景作为主视觉。
- **抵达状态条**：显示 `arrival`、`low intensity`、`first neighborhood` 等状态。
- **低强度行程卡**：只放酒店周边、便利店、晚餐、早睡等轻任务。
- **第一晚街区观察**：用短句记录“街区秩序”“灯光”“便利店”“车站出口”。
- **素材 credit 小字**：靠近图片，不打断首屏情绪。

**内容细节**

主句使用：

`第一天的任务不是打卡，而是让身体抵达。`

可以放四个短项：

- airport to city：机场进城
- first base：酒店周边
- energy level：低强度
- first night：便利店、晚餐、睡眠

**素材资源**

- Haneda / airport access 官方信息：<https://www.gotokyo.org/en/plan/airport-access/haneda-airport/index.html>
- Tokyo Monorail / Haneda Wikimedia：<https://commons.wikimedia.org/wiki/Category:Tokyo_Monorail>
- Tokyo Monorail 示例文件：<https://commons.wikimedia.org/wiki/File:Tokyo_monorail_-_Haneda_airport_view_from_Keihinjima_island_(488414141).jpg>
- FamilyMart 夜景 Unsplash：<https://unsplash.com/photos/familymart-convenience-store-at-night-with-a-person-walking-VtWiBy8fSDM>
- Lawson 夜景 Unsplash：<https://unsplash.com/photos/lawson-convenience-store-at-night-with-illuminated-signs-QUV6cR60KLU>

**授权与 credit**

- GO TOKYO 官方素材适合做可信背书；如使用其 stock photo，通常需要申请下载并保留指定 credit。
- Wikimedia 必须逐张核对 license、作者和 attribution。
- Unsplash 可免费使用，署名非强制但建议 credit 摄影师。

**避免事项**

- 不要用涩谷大人潮开场。
- 不要用歌舞伎町霓虹定义第一印象。
- 不要用过度宣传式机场航拍。
- 不要用看不出“抵达后身体状态”的宏大城市天际线。

### 第二幕：三天不是清单，是节奏

**场景目标**

建立页面结构。观众应理解这是一个城市节奏计划，而不是旅游景点排行榜。

**画面布置**

主体是三日节奏板。Day 1 Soft Landing、Day 2 High Density、Day 3 Quiet Tokyo 三列并排，每一天都有体力强度、移动范围、城市情绪和选择理由。

地图只作为区域和移动半径的辅助，不要成为复杂导航界面。

**UI 组件**

- **三日节奏板**：三列展示三种城市速度。
- **速度标签**：`Soft Landing`、`High Density`、`Quiet Tokyo`。
- **体力强度条**：每一天用低、中、高或简短刻度表示体力消耗。
- **移动范围提示**：说明当天移动半径和换乘压力。
- **天气 / 预算 / 兴趣提示**：作为路线调整因素，而不是完整表单。
- **轻量地图/区域底图**：用抽象区域块和线路表达城市阅读方式。

**内容细节**

主句使用：

`东京太丰富，所以真正的问题不是去哪，而是如何取舍。`

三日内容：

- Day 1 Soft Landing：少移动、少目标、先适应街区。
- Day 2 High Density：集中处理高密度区域和强节奏体验。
- Day 3 Quiet Tokyo：降速、停留、留出余地。

**素材资源**

- OpenStreetMap Copyright：<https://www.openstreetmap.org/copyright>
- GO TOKYO Shibuya：<https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html>
- GO TOKYO Shinjuku：<https://www.gotokyo.org/en/destinations/western-tokyo/shinjuku/index.html>
- GO TOKYO Aoyama & Omotesando：<https://www.gotokyo.org/en/destinations/western-tokyo/aoyama-and-omotesando/>
- GO TOKYO subway / getting around：<https://www.gotokyo.org/en/plan/getting-around/subways/index.html>

**授权与 credit**

- OpenStreetMap 需要显示 `© OpenStreetMap contributors`，并遵守 ODbL。
- 生产分发不要直接滥用 OSM 免费 tile，应使用合规 tile 服务或自托管。
- GO TOKYO 区域页适合做路线结构背书，不应当作可直接抓取的图库。

**避免事项**

- 不要做成景点排行榜。
- 不要满屏照片拼贴。
- 不要过早出现强烈夜景。
- 不要把地图做成复杂导航产品。

### 第三幕：High Density Tokyo

**场景目标**

表现高密度东京，但重点是秩序、效率、流动和城市界面，而不是混乱或赛博霓虹滤镜。

**画面布置**

主视觉可以使用涩谷、新宿、表参道、地铁换乘、人流、夜景、商业界面和城市标识。画面节奏可以快，但必须让观众看到东京如何在高密度中保持秩序。

**UI 组件**

- **高密度主视觉**：人流、换乘、商业界面或城市标识。
- **换乘节点组**：用短节点表达站点、出口、换乘和步行切换。
- **城市标识图组**：站内标识、队列、交通引导、商业招牌。
- **密度说明条**：解释“高密度但不混乱”。
- **夜景辅助图**：作为局部能量，不支配整幕。

**内容细节**

主句使用：

`在高密度东京，秩序本身就是风景。`

可以放四个观察点：

- crowd flow：人流不是混乱，而是组织方式。
- station logic：站点、出口和换乘决定节奏。
- commercial layer：商业界面是城市密度的一部分。
- night energy：夜景是能量，不是全部。

**素材资源**

- Wikimedia Shibuya Crossing video：<https://commons.wikimedia.org/wiki/File:Shibuya_Crossing,_Tokyo,_Japan_(video).webm>
- Wikimedia Featured Pictures of Tokyo：<https://commons.wikimedia.org/wiki/Category:Featured_pictures_of_Tokyo>
- Tokyo Tokyo Video：<https://tokyotokyo-video.jp/index_en.html>
- Shinjuku / crowd Unsplash：<https://unsplash.com/photos/a-group-of-people-walking-down-a-street-at-night-7N8tAlPrfQM>
- Kabukicho Wikimedia：<https://commons.wikimedia.org/wiki/File:Kabukicho_red_gate_and_colorful_neon_street_signs_at_night,_Shinjuku,_Tokyo,_Japan.jpg>

**授权与 credit**

- Shibuya Crossing video 使用 CC BY-SA 4.0，需署名作者 Basile Morin，并注意相同方式共享要求。
- Wikimedia Featured Tokyo 分类下每张素材 license 不同，不能只按分类授权。
- Tokyo Tokyo Video footage 通常需要申请，使用需显示 `©Tokyo Tokyo`；PR video 可用 YouTube 链接嵌入，但不能编辑。
- Unsplash 建议署名摄影师。

**避免事项**

- 不要整幕只剩赛博霓虹。
- 不要只用雨夜反光和歌舞伎町招牌。
- 不要让人潮看起来失控。
- 不要把高密度东京做成混乱拼贴。

### 第四幕：Quiet Tokyo

**场景目标**

拉开东京的层次，证明东京不是只有人潮和夜景。Quiet Tokyo 应该是日常、细节和可停留感，不是复古滤镜。

**画面布置**

主视觉可以是谷中、清澄白河、神保町、庭园、书店、喫茶店、住宅街或清晨街道。镜头速度变慢，色彩从高对比转向更安静的日常质感。

**UI 组件**

- **低声量路线**：少节点、长停留、低移动压力。
- **慢速停留点**：庭园、书店、咖啡、住宅街。
- **日常细节图组**：门面、街角、书架、庭园水面、清晨街道。
- **停留时间提示**：不是打卡时长，而是“可停留感”。
- **低刺激提示**：适合疲劳、雨天或不想排队的路线。

**内容细节**

主句使用：

`东京也可以很低声量。`

可以放四个观察点：

- pause：停下来比赶路更重要。
- texture：书店、喫茶店和街角构成城市纹理。
- morning：清晨比夜景更能说明另一种东京。
- low stimulus：低刺激路线不是低质量路线。

**素材资源**

- GO TOKYO Yanaka & Nezu：<https://www.gotokyo.org/en/destinations/northern-tokyo/yanaka-and-nezu/index.html>
- GO TOKYO Yanaka Ginza：<https://www.gotokyo.org/en/spot/170/index.html>
- GO TOKYO Kiyosumi Gardens：<https://www.gotokyo.org/en/spot/25/index.html>
- Wikimedia Kiyosumi Garden：<https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg>
- GO TOKYO Kanda & Jimbocho：<https://www.gotokyo.org/en/destinations/central-tokyo/kanda-and-jimbocho/index.html>

**授权与 credit**

- GO TOKYO stock photo 使用需申请，并标注 `©Tokyo Convention & Visitors Bureau` 或 `© TCVB`。
- Wikimedia Kiyosumi Garden 示例文件为 CC BY 2.0，作者 Guilhem Vellut，需署名。
- 官方区域页适合路线和地点背书，具体图片仍需按素材条款处理。

**避免事项**

- 不要复古滤镜过重。
- 不要用樱花、神社或明信片构成整幕。
- 不要把 quiet 做成怀旧东京。
- 不要让安静路线看起来像“次要路线”。

### 第五幕：城市选择器

**场景目标**

展示同一座城市如何被不同兴趣重新组织。这是页面最能体现体验的一幕：路线选择应可见、可切换、可比较。

**画面布置**

主体不是摄影，而是城市选择器。地图底图、时间块、路线强度和兴趣分支共同展示“食物、设计、书店、夜生活、低刺激路线”如何改变三日计划。

**UI 组件**

- **兴趣选择器**：食物、设计、书店、夜生活、低刺激。
- **路线强度对比**：显示步行、换乘、停留和夜间活动强度。
- **地图 / 区域底图**：表达移动范围和区域关系。
- **时间块对比**：展示同一天如何被不同兴趣改写。
- **交通密度提示**：站点、线路、换乘压力。
- **数据来源提示**：把 OSM、ODPT、Tourism Data 的来源放在集中 source 区。

**内容细节**

主句使用：

`同一座城市，可以被不同的人用不同速度阅读。`

五种分支：

- food：餐食密度和排队成本。
- design：表参道、青山、书店、展览。
- bookstores：神保町和慢速停留。
- nightlife：夜间移动和能量管理。
- low stimulus：少换乘、少人潮、可停留。

**素材资源**

- OpenStreetMap Copyright：<https://www.openstreetmap.org/copyright>
- ODPT Overview：<https://www.odpt.org/en/overview/>
- ODPT Developer：<https://developer.odpt.org/>
- Tokyo Tourism Data Catalog：<https://data.tourism.metro.tokyo.lg.jp/en/>
- Tokyo Tourism Mobile Data：<https://data.tourism.metro.tokyo.lg.jp/data/mobile/>

**授权与 credit**

- OpenStreetMap 必须标注 `© OpenStreetMap contributors` 和 ODbL。
- ODPT 提供公共交通数据和 API；使用需注册开发者并遵守开发者站点的使用条件。
- Tokyo Tourism Data Catalog 的移动数据需标注 `出典：モバイル空間統計`；如加工数据，需说明加工来源，不要表现成东京都官方生成的结论。

**避免事项**

- 不要用大量照片解释选择器。
- 不要使用 Google Maps 截图。
- 不要使用未授权 POI 数据。
- 不要把选择器做成复杂后台仪表盘。

### 第六幕：离开东京，保留一条未完成路线

**场景目标**

从密度和选择回到安静结束。结尾要让观众感觉东京没有被用完，而是留下下一次进入城市的入口。

**画面布置**

主视觉可以是返程列车、机场动线、清晨街道、便利店余光或未完成收藏点。结尾应克制、有余味，不要做旅游广告式收束。

**UI 组件**

- **返程视觉**：列车、机场或清晨街道。
- **未完成清单**：保留几个没有完成的点。
- **下一次路线入口**：说明下次可以从哪里继续。
- **安静收束文案**：避免营销 CTA。
- **集中 Sources 区**：把素材和数据来源集中收束，不打断前面五幕。

**内容细节**

主句使用：

`好的城市计划，不是把城市用完，而是知道下次从哪里继续。`

可以放三个未完成入口：

- missed bookstore：没有去完的书店。
- morning neighborhood：下一次清晨街区。
- slower return：更低速度的东京。

**素材资源**

- GO TOKYO Haneda / return transit：<https://www.gotokyo.org/en/spot/69/index.html>
- Tokyo Monorail Wikimedia：<https://commons.wikimedia.org/wiki/Category:Tokyo_Monorail>
- Unsplash Tokyo Search：<https://unsplash.com/s/photos/tokyo-japan>
- FamilyMart 夜景 Unsplash：<https://unsplash.com/photos/familymart-convenience-store-at-night-with-a-person-walking-VtWiBy8fSDM>

**授权与 credit**

- GO TOKYO stock photo 使用需申请，网页图不可直接抓用。
- Wikimedia 逐张确认 license 和署名。
- Unsplash 建议署名摄影师，避免过度商业旅游感。

**避免事项**

- 不要用旅行广告式“再见东京”。
- 不要用烟花、东京塔大高潮或煽情字幕。
- 不要把城市讲成已经被完整消费。
- 不要在结尾重新堆景点清单。

## 组件清单

整个页面优先使用这些设计模块：

- 沉浸式抵达场景
- 抵达状态条
- 三日节奏板
- 速度标签
- 体力强度条
- 路线强度对比
- 地图 / 区域底图
- 交通 / 换乘密度提示
- 图像双联或三联组
- 兴趣选择器
- 时间块对比
- 低刺激路线提示
- 未完成路线清单
- 集中 Sources 区

组件应服务城市节奏，不要把页面做成组件展示。地图、数据和素材 credit 要可追溯，但不应打断叙事。

## 素材规则

- GO TOKYO 官方页面适合做地点可信背书；使用 stock photo 通常需要申请下载并保留指定 credit。
- Wikimedia Commons 适合开放图片和视频，但必须逐张核对 license、作者、attribution 和 share-alike 条件。
- Unsplash 适合氛围图和补充镜头；虽然署名非强制，但建议 credit 摄影师。
- OpenStreetMap 可用于路线和区域表达，需标注 `© OpenStreetMap contributors`，生产分发应使用合规 tile 服务或自托管。
- ODPT 和 Tokyo Tourism Data Catalog 适合选择器、路线强度和交通/访问数据表达，不应当作普通图片素材库。
- 第二幕和第五幕更适合地图和数据，而不是摄影主导。
- 第一幕、第四幕和第六幕可以用低刺激摄影建立城市身体感。
- 第三幕可以使用视频或高密度图像，但必须保留秩序和流动感。

## 视觉规则

- 页面应表达城市节奏设计，不是旅游营销。
- 每一幕只让一个视觉或对象成为主导。
- 图片必须承担语义职责：arrival、rhythm、density、quiet、selector、departure。
- 重复图片必须表达不同职责，否则替换。
- 不要把 source links 放在每一幕底部打断阅读；适合集中到 Sources 区或低调 credit。
- 使用地图时强调区域、移动范围和路线强度，不追求完整导航。
- 色彩避免过度霓虹化；High Density 可以更强，但 Quiet Tokyo 要回到日常质感。
- 中文文案保持短、清楚、有节奏，不写成长篇攻略。

## 验收检查

- 第一屏能读出“抵达东京”和 Soft Landing，而不是景点冲刺。
- 三天速度清楚：Soft Landing、High Density、Quiet Tokyo。
- 页面没有变成景点排行榜、图库、地图产品或旅游广告。
- High Density 有秩序，不只是霓虹。
- Quiet Tokyo 有日常感，不是怀旧滤镜。
- City Selector 能看出路线可切换、可比较。
- 结尾保留未完成路线，而不是消费完整座城市。
- 所有素材来源、授权和 credit 注意事项清楚可追溯。
- 文档只描述设计、布景、组件、素材和内容细节，不包含代码、技术栈、导入语句或实现步骤。
