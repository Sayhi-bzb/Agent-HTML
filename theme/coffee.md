# Coffee Chain Review：一家虚构咖啡连锁的真实经营难题

## 内容主线

- 增长不是答案：收入上涨不等于经营健康，漂亮的年度增长可能掩盖利润率下降、成本上涨和复购停滞。
- 门店不是平均的：CBD 店、社区店、商场店、大学店、交通枢纽店有不同客流、租金、人力和利润结构。
- 菜单不是菜单，而是利润结构：卖得最多的产品不一定最赚钱，高毛利产品也不一定能在所有门店卖动。
- 一天中的不同时段，是不同生意：早高峰卖效率，下午卖停留，周末卖体验，夜间可能拖累整体效率。
- 复盘的终点不是总结，而是明年的路线选择：优化菜单、扩张社区店、关闭低效店、重做早高峰，每条路都有收益和代价。

## 剧本

### 第一幕：今年增长了，但哪里不对

- 画面：第一屏给出年度收入 `+18%` 的漂亮数字，随后展开利润率下降、成本上涨、复购停滞。视觉从庆祝式增长转向经营压力。
- 文字：`收入增长，不等于生意变好。`
- 数据：虚构年度 P&L、月度收入、利润率、复购率。
- 素材：
  - Unsplash Coffee Shop：<https://unsplash.com/s/photos/coffee-shop>
- 注释：第一幕制造商业反转。不要做咖啡美学展示，也不要把页面做成单纯品牌宣传。

### 第二幕：把 12 家店摊开看

- 画面：12 家店以地图或矩阵呈现，区分 CBD 店、社区店、商场店、大学店、交通枢纽店。每家店展示收入、租金、人力、客流、利润、复购。
- 文字：`平均值掩盖了真正的问题门店。`
- 数据：虚构 `stores` 表，包含店型、区域、面积、租金、人力成本、月收入、利润率、复购率。
- 素材：
  - OpenStreetMap Copyright：<https://www.openstreetmap.org/copyright>
- 注释：不要使用真实品牌门店，避免误导。地图可以是虚构城市结构，重点是表现门店差异。

### 第三幕：菜单不是菜单，是利润结构

- 画面：菜单气泡图，横轴是销量，纵轴是毛利，气泡大小代表复购或外卖占比。拿铁、美式、冷萃、手冲、甜品、早餐组合、外卖爆品各自落在不同象限。
- 文字：`卖得最多的，不一定最赚钱。`
- 数据：虚构 `products` 和 `sales mix`，参考公开 coffee shop POS dataset 的字段结构。
- 素材：
  - Kaggle Coffee Shop Sales Dataset：<https://www.kaggle.com/datasets/keremkarayaz/coffee-shop-sales>
- 注释：不需要复制真实数据，使用合成数据讲清经营逻辑。重点是让观众看懂菜单如何影响利润结构。

### 第四幕：一天被切成不同生意

- 画面：时段热力图展示早高峰、午后停留、周末体验、夜间低效。堂食、外卖、排队流失和客单价随时间变化。
- 文字：`早上卖效率，下午卖停留，周末卖体验。`
- 数据：虚构 `hourly transactions`、排队流失、堂食/外卖占比、时段客单价。
- 素材：
  - Unsplash Coffee Shop：<https://unsplash.com/s/photos/coffee-shop>
- 注释：这一幕体现同一家店在不同时间其实是不同业务模型。不要只展示客流高低，要展示时段背后的经营目标差异。

### 第五幕：成本正在改写每一杯咖啡

- 画面：成本瀑布图从一杯咖啡的售价开始，咖啡豆、牛奶、租金、人力、平台佣金、包装逐步吃掉毛利。外卖订单和堂食订单可以并排比较。
- 文字：`涨价不是问题，问题是价值有没有被重新设计。`
- 数据：虚构成本结构，外部宏观数据只作为成本压力背景锚点。
- 素材：
  - International Coffee Organization Public Market Information：<https://ico.org/resources/public-market-information/>
  - ICO Coffee Market Report Statistics：<https://ico.org/resources/coffee-market-report-statistics-section>
  - BLS Average Retail Food and Energy Prices：<https://www.bls.gov/regions/mid-atlantic/data/averageretailfoodandenergyprices_usandmidwest_table.htm>
  - USDA ERS Food Price Outlook：<https://www.ers.usda.gov/data-products/food-price-outlook/>
- 注释：不做精确经济报告。外部数据只支撑“成本压力真实存在”的背景，不直接声称解释某个真实连锁品牌。

### 第六幕：明年怎么选

- 画面：三条策略路线并列：优化菜单、扩张社区店、关闭低效店并重做早高峰。每条路线显示收益、风险、执行难度和对收入/利润/复购的预期影响。
- 文字：`复盘的终点不是总结，而是选择。`
- 数据：虚构 `scenarios`，展示每个方案的收益、风险、执行难度。
- 素材：
  - OpenStreetMap Copyright：<https://www.openstreetmap.org/copyright>
- 注释：不要给唯一正确答案，呈现经营取舍。观众应感到自己在看一次真实的经营会议，而不是一份静态年报。

### 数据使用注释

- 核心经营数据使用合成案例，不伪装为真实品牌或真实门店。
- 合成数据要符合现实经营逻辑：收入增长、利润承压、外卖增长、成本上升、门店差异、时段差异。
- 公开数据只作为结构参考和背景锚点，不直接声称解释某个真实连锁品牌。
- 页面素材可以用开放照片营造氛围，但主角是图表、矩阵、热力图、瀑布图和策略选择。
