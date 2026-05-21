# Profile Ref Roadmap

本文只记录这轮 `profile-ref` 升级主线的开发节奏。  
它不重复顶层架构背景；顶层边界以 `docs/architecture/*`、`docs/layout.md` 为准。

本路线图解决的是同一件事：

- 把 `style-ref -> styleProfile` 升级为 `profile-ref -> artifact profile`
- 把配置层从“只有 style”升级为“style + layout + component realization”
- 把 layout primitive 从写死 preset 收口为 profile-driven projection

## 本轮固定约束

- authoring 入口切换为 `<meta-agent profile-ref="..." />`
- 旧 `style-ref` 在本轮视为正式废弃协议，直接报错，不做兼容 warning
- gallery 本轮只要求读和展示新 profile，不要求同步完成 layout 编辑器
- builtin profile id 继续使用当前三套：
  - `report-default`
  - `ops-compact`
  - `review-dense`

## Phase 1: 协议与类型切换

### Phase 1 目标

- 把公开协议与核心类型从 `style-ref/styleProfile/documentStyleConfigReference` 切到 `profile-ref/artifactProfile/artifactProfileReference`

### Phase 1 关键改动

- core 中的 `RenderConfig`、profile schema、normalize/parse/resolve API 改为新的 artifact profile 命名
- CLI schema、prompt、diagnostics、inspection、runtime state 主路径统一改用 `profile-ref`
- 旧 `style-ref` 输入改成明确失败，而不是 fallback 成功

### Phase 1 不做什么

- 不补 layout 配置字段
- 不动 layout projection 逻辑
- 不做 gallery layout 编辑 UI

### Phase 1 完成标准

- 主公开协议只出现 `profile-ref`
- validate / sanitize / prompt / schema 测试使用新入口
- 旧 `style-ref` 有明确失败断言
- 主类型命名不再以 `StyleProfile` 为中心

## Phase 2: 配置模型补全

### Phase 2 目标

- 把 profile 从“样式配置对象”补成“artifact realization 配置对象”

### Phase 2 关键改动

- 新 profile 正式包含：
  - `globalStyle`
  - `globalLayout`
  - `componentStyle`
  - `componentLayout`
- builtin profile、custom profile、storage、normalize、schema 全链路接受新结构
- runtime document meta、gallery state、preview document 全部流经新 profile 结构

### Phase 2 不做什么

- 不开放 layout agent-facing props
- 不在 gallery 中增加 layout 表单编辑器
- 不扩 builtin profile 集合

### Phase 2 完成标准

- profile 类型中正式存在 `globalLayout` 与 `componentLayout`
- builtin/custom profile 都能通过新 schema
- 运行时和 gallery 已经读新结构，而不是只保留旧 style 子树
- layout 配置不再只停留在文档概念层

## Phase 3: Layout Realization 收口

### Phase 3 目标

- 让 layout primitive 的最终实现来源从 capability 内联 preset 切到 profile-driven projection

### Phase 3 关键改动

- `stack/cluster/split/grid/switcher/frame` 的 realization 开始读取：
  - `globalLayout`
  - `componentLayout`
- `component-capabilities` 不再承担最终 layout preset 事实来源
- `DocumentArtifactShell` 的 document policy 优先读取 profile，而不是继续主导默认 layout

### Phase 3 不做什么

- 不引入第二套并行 profile 协议
- 不给 layout primitive 增加一组临时数值 props
- 不保留“profile 与写死 class 并行决策”的长期状态

### Phase 3 完成标准

- layout class / behavior 的来源是 projection + profile
- `frame` 开始消费 `frame/measure`
- `stack` 开始消费 `rhythm/density`
- `split/grid/switcher/cluster` 开始消费 `partition/reflow/density`
- host 中的 document layout policy 不再是唯一 layout 事实来源

## Phase 4: Runtime Host 与 Gallery 收尾

### Phase 4 目标

- 把 build / preview / inspect / gallery / runtime host 全部收口到新 profile 口径

### Phase 4 关键改动

- generated document、runtime state、inspection JSON 全部改成新字段
- gallery 改成读和展示 `artifactProfile`
- tests、docs、残留命名、help text、runtime surface 断言统一切到新口径

### Phase 4 不做什么

- 不新增 profile authoring 协议
- 不做 layout 编辑工作台
- 不把本轮扩展成新的 UI 组件开放计划

### Phase 4 完成标准

- 最终 artifact、inspection、gallery state 中不再出现旧命名
- build / preview / gallery / validate / inspect 全链路通过
- runtime host 不再把 `styleProfile` 作为主配置模型
- 文档与测试不再把 `style-ref` 当有效协议

## 总体验收

当下面五件事同时成立时，这轮主线才算完成：

- authoring 入口只认 `profile-ref`
- profile 正式承载 style + layout + component realization
- layout primitive 的 realization 已由 profile 驱动
- runtime host / gallery / preview / build / inspect 已统一到新口径
- `style-ref/styleProfile/documentStyleConfigReference` 已退出主链实现与主链断言

## 备注

- 零散做法、临时阻塞和子任务拆分不放在本文；后续应放到对应 `todo` 文档
- 若中途需要变更协议策略，必须先改本路线图，再改实现
