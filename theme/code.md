# Code Review Room：小 diff，大影响

## 内容主线

- 小 diff 不代表小风险：一个看起来普通的 checkout/session 重构，可能触碰支付、缓存、webhook、订阅、测试和上线风险。
- Diff 不是审查入口，风险才是：代码审查不应按文件顺序从上到下读，而应先识别最可能出事的行为路径。
- 真实影响藏在调用链和行为路径里：被改文件只是起点，真正的影响在调用方、下游依赖、用户行为和业务结果里。
- 测试通过不等于覆盖了真正风险：CI 绿灯只能说明测试跑过，不能说明重复扣款、缓存污染、迁移失败等风险被覆盖。
- 好的 review 输出不是评论列表，而是上线条件和路线选择：最终判断不是 approve 或 reject，而是选择一条可承担的发布路径。

## 剧本

### 第一幕：看起来很小的 PR

- 画面：一个普通 PR，标题为 `Refactor checkout session handling`，显示 `+420 -180`。文件列表看起来不大，评论数量也不夸张。
- 文字：`小 diff 不代表小风险。`
- 数据：合成 PR 标题、文件变更列表、改动统计。
- 注释：制造反差，先让观众以为这是常规重构。不要一开始就解释所有风险，让风险在后面逐层浮出。

### 第二幕：Diff 热力图

- 画面：每个文件是一块矩形，面积代表改动行数，颜色代表风险等级，文件类型区分 API、UI、DB、test、config。最大面积的文件不一定最红，最红的可能只是几行关键逻辑。
- 文字：`Changed lines show size. Heat shows consequence.`
- 数据：合成文件列表、改动行数、风险等级、文件类型。
- 注释：这一幕把线性 diff 变成可扫读的风险地形。重点是让观众理解“改动规模”和“行为后果”不是同一件事。

### 第三幕：Blast Radius 雷达图

- 画面：中心是被改模块，第一圈是直接调用者，第二圈是下游 API、后台 job、UI 页面，第三圈是用户行为和业务风险。checkout session 的一处改动向支付、订阅、webhook、缓存扩散。
- 文字：`The risky part is not where the edit happened. It is where the behavior lands.`
- 数据：合成调用链、上游调用者、下游依赖、业务影响。
- 注释：把线性 diff 转成系统地图。不要把图做成纯技术依赖图，要把终点连接到真实业务风险。

### 第四幕：Risk Matrix 风险矩阵

- 画面：横轴是发生概率，纵轴是影响程度。风险点包括重复扣款、订阅状态错乱、缓存污染、迁移失败、登录失效。点击每个风险点可以看到关联文件、证据和缺口。
- 文字：`Review starts with what can go wrong.`
- 数据：合成风险项、概率、影响、关联文件、证据。
- 注释：review 不从第一个文件开始，而从最高风险开始。这一幕负责把“代码阅读”转成“事故预防”。

### 第五幕：Test Evidence Map

- 画面：风险项与测试用例连线。绿色代表覆盖，黄色代表只覆盖 happy path，红色代表缺失。CI 总体是通过的，但有几个高风险点没有证据。
- 文字：`Passing tests are not the same as covered risks.`
- 数据：合成测试结果、测试用例、风险覆盖关系、缺失测试。
- 注释：把 CI 从状态灯变成证据地图。不要只展示 pass/fail，要展示测试和风险之间有没有对应关系。

### 第六幕：Comment Triage + Release Gate

- 画面：review comments 被整理成 Blocking、Question、Follow-up、Nit，并汇总为 release checklist。上线条件包括重复扣款测试、webhook retry 测试、迁移 dry run、rollback flag、dashboard alert、owner sign-off。
- 文字：`Approval is not a feeling. It is a set of conditions.`
- 数据：合成 review comments、上线条件、监控项、回滚项。
- 注释：好的 review 输出不是碎片评论，而是上线条件。评论区是原材料，release gate 才是决策材料。

### 第七幕：三条路线选择

- 画面：三张策略卡并列：Merge after fixes、Split PR、Hold for migration plan。每张卡展示 time cost、risk reduction、user impact、reviewer confidence。
- 文字：`The final question is not “approve or reject”, but “which path can we own?”`
- 数据：合成 scenarios，包含成本、风险、收益、执行条件。
- 注释：结尾不要给唯一正确答案，呈现工程取舍。观众应感到这不是一次代码展示，而是一场可视化的工程决策会议。

### 数据使用注释

- 使用合成 PR 案例包，不引用真实私有代码。
- 合成案例围绕 checkout/session refactor，因为它天然连接支付、缓存、webhook、订阅、测试和上线风险。
- 不依赖外部图片、视频或 CDN 素材。
- 页面主角是工程结构数据：diff 热力图、blast radius、风险矩阵、测试证据图、评论分流、release checklist 和路线选择。
