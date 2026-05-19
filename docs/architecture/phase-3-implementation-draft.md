# Phase 3 Implementation Draft

本文把 `docs/layout.md`、`docs/roadmap.md` 和 `docs/architecture/implementation-slices.md` 里的 `Phase 3` 再往下压一层，写成接近真实 patch 设计的实施草案。

它回答的是当前工作树下几个更实际的问题：

- layout primitive 进入代码主路径时，第一刀究竟落在哪个文件
- parser / validator / sanitize / renderer 现在哪一层最先会被 layout 撞到
- 哪些地方只是“还没支持”，哪些地方其实已经把旧文档壳结构写死了
- `3A/3B/3C` 分别应该停在什么边界上，避免把 `Phase 4` 提前混进来

## 1. 当前真实基线

基于当前代码，`Phase 3` 的真实约束不是抽象的“layout 还没做”，而是下面这些具体事实：

- `packages/core/src/parse/parse-agent-html.ts`
  - 用 `STANDARD_COMPONENT_NAMES.join("|")` 构造 `AGENT_COMPONENT_NAME_PATTERN`
  - 再用这个正则做：
    - 自闭合标准组件标签修正
    - `agent-html-` 前缀别名替换
  - 这意味着 layout node 只要不进标准节点集合，parser 根本不会把它当成 agent 组件语法处理
- `packages/core/src/parse/validate-agent-html.ts`
  - 顶层只允许一个根节点，且必须是 `<page>`
  - attrs 合法性完全来自 `componentSchema.props`
  - children 合法性完全来自 `componentSchema.allowedChildren`
  - `TEXT_CHILD` 是否允许也靠 `allowedChildren` 判定
- `packages/core/src/parse/sanitize-agent-html.ts`
  - 目前只是 `parse -> validate` 的薄封装
  - 没有 layout 节点归一化、slot 展开或结构补全逻辑
- `packages/ahtml/src/config/component-capabilities.mjs`
  - 当前所有 runtime projection 都围绕现有 UI 节点和少数 structural child 节点展开
  - `structuralAgentComponents` 里只有：
    - `accordion-item`
    - `cell`
    - `item`
    - `option`
    - `row`
    - `tab`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `rendererKindHandlers` 没有任何 layout kind
  - compound / noscript fallback 里写死了：
    - `ahtml-section-stack`
    - `ahtml-prose-block`
    - `grid gap-*`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
  - shell CSS 直接假设：
    - 文档容器是 `ahtml-document-shell`
    - `page` 是 grid stack
    - prose block 和 card-content stack 是默认内容骨架

所以 `Phase 3` 的工作不是“给 renderer 多加几个组件”。

真正的任务是：

1. 先让 layout node 进入正式 schema / parse surface
2. 再让 validator 真正理解这些节点的 children 和 prop 边界
3. 最后才把 runtime projection 补上

## 2. 当前阻塞点，不要混在一起

`Phase 3` 至少有三类不同阻塞点：

### 2.1 parser-level 阻塞

当前 `parse-agent-html.ts` 只会标准化 `STANDARD_COMPONENT_NAMES` 中的标签。

这意味着如果直接写：

```html
<stack>
  <card title="Summary">...</card>
</stack>
```

当前 parser 不会把 `<stack>` 纳入标准组件别名正则路径，也不会为它应用和现有标准节点一致的自闭合修正。

所以 layout 接入的第一刀必须碰标准节点集合，而不是先碰 renderer。

### 2.2 validator-level 阻塞

当前 validator 的模型很简单，也很硬：

- 每个节点的 attrs 来自 `componentSchema.props`
- 每个节点的 children 来自 `componentSchema.allowedChildren`

这会带来两个直接后果：

- layout 节点如果没有 schema，就连 parse 通过后也会在 validate 阶段变成 `unknown-component`
- layout 节点如果 schema 过宽，就会把 UI/layout 边界一次性放得太松

也就是说，`Phase 3` 不能靠“先在 renderer 偷偷支持，再回头补 schema”。

### 2.3 runtime-level 阻塞

当前 runtime 仍然是“UI 节点 + 少数结构子节点”的投影模型。

具体表现是：

- `render-node.tsx` 的 kind handler 没有 layout 类别
- `component-capabilities.mjs` 没有 layout capability definition
- `app.tsx` 的文档壳 CSS 仍然在替 agent 表达默认结构

这意味着 `3A` 和 `3B` 完全可以先不碰 runtime projection，但 `3C` 一定会撞上 runtime 层。

## 3. 现有测试说明了什么

### 3.1 `sanitize-agent-html.test.ts`

当前 parse/sanitize 测试覆盖了：

- `page` 根约束
- 当前 UI 组件和结构子节点的嵌套
- `tabs` / `accordion` / `table` / `list` 的第一批结构能力
- attrs 类型检查
- 旧自定义控件移除后的 unknown-component 诊断

它没有覆盖：

- 任意 layout primitive
- UI/layout 混合嵌套
- layout 零 props / 少量结构 props 边界
- layout 归一化

因此 `Phase 3` 的第一组验证不该去找 heavy runtime tests，而应先扩这个测试文件。

### 3.2 `render-node.test.ts`

当前 renderer 测试已经证明：

- structured child node 的选择大量依赖 `slot.childNames`
- compound 组件默认会带 `ahtml-section-stack` / `ahtml-prose-block`
- tabs / accordion / select 等结构类 UI 节点已经内建了自己的 fallback 和结构规则

这说明 layout projection 一旦进入 runtime，不能只是再复用 compound 分支，否则 layout 很容易再次被 document-shell 语义吞掉。

## 4. Phase 3 的真实入口文件

### 4.1 `component-schema.ts`

这里是 layout 进入正式节点集合的总入口之一。

当前它控制：

- `STANDARD_COMPONENT_SCHEMAS`
- `STANDARD_COMPONENT_NAMES`
- `getComponentSchema()`

因此只要 layout 要成为正式 authoring surface 成员，这里就必须先能拿到 schema。

### 4.2 `parse-agent-html.ts`

这里是最早撞到 layout 的地方，因为：

- 标准组件标签正则依赖 `STANDARD_COMPONENT_NAMES`
- 自闭合组件规范化也依赖这个正则

所以 `3A` 之后最先需要观察的文件不是 runtime，而是这里。

### 4.3 `validate-agent-html.ts`

这里是 `Phase 3` 的主战场。

原因不是它复杂，而是它过于直接：

- schema 一改，这里就会立刻放行或拒绝节点
- 没有中间缓冲层

它也是当前最适合保持收口的地方，因为 layout children contract 本来就该在这里落地。

### 4.4 `sanitize-agent-html.ts`

它现在几乎没有 Phase 3 逻辑，但这恰恰说明：

- `3A` 可以完全不碰它
- `3B` 如果只做 `stack` / `cluster`，大概率也不用碰它
- `3C` 一旦需要 layout 归一化、implicit wrapper、slot 补全，它会成为自然入口

所以不要过早把 sanitize 复杂化。

### 4.5 `component-capabilities.mjs`

这是 layout 进入 runtime 的配置入口。

当前它已经区分了：

- standard UI components
- structural child components

但还没有：

- layout capability definitions
- layout uiProtocol normalization
- layout renderer spec

这意味着 `3C` 不能绕开这个文件。

### 4.6 `render-node.tsx`

这是 layout projection 的最终运行时入口。

当前它的问题不是“代码太大”本身，而是：

- layout kind 还不存在
- compound / collection / fallback 分支已经带了文档壳前提

因此 `Phase 3` 在这里的目标应该很克制：

- 只加最小 layout projection
- 不在这一阶段清理全部 document-shell 假设

后者属于 `Phase 4`

## 5. 建议的代码模型，不要一步到位

`Phase 3` 不需要一上来重做全部节点类型系统。

更现实的路径是：

### 5.1 保持节点运行时形状不变

当前节点形状：

```ts
type StandardAgentNode = {
  type: "component"
  name: string
  props: Record<string, string>
  children: SanitizedNode[]
}
```

`3A/3B` 完全可以继续沿用它。

理由：

- layout node 在 parse/validate 看起来仍然只是 `name` 不同的 component node
- 没必要为了 layout 接入先改一轮 AST 结构

### 5.2 先靠 schema 区分 UI / layout

在当前工作树里，更便宜的做法不是先引入新的 AST 节点类型，而是先在 schema 层表达：

- 这些名字是 layout primitive
- 这些节点的 props 边界是什么
- 这些节点允许哪些 children

也就是说，`Phase 3` 的第一版“UI/layout 并列”更适合先是 schema 语义并列，而不是 AST 类型分叉。

### 5.3 等到 Phase 4 再决定是否要 runtime 节点类型分流

因为目前真正需要 UI/layout 分开处理的地方主要在 renderer，而不是 parser AST。

## 6. Slice 3A 的真实 patch 顺序

`3A` 的目标是：

- layout primitive 进入正式 contract
- 但不承诺已经可以 runtime render

### Step 1

先把 layout primitive 名单加进 schema source：

- `stack`
- `cluster`
- `split`
- `grid`
- `switcher`
- `frame`

这一步应该先改：

- `packages/core/src/schema-overlays.ts`
- `packages/core/src/component-schema.ts`

不要先改：

- `render-node.tsx`
- `app.tsx`

### Step 2

给这些节点定义最保守 schema：

- `stack`
  - 零 props
  - children 先允许所有当前稳定 UI block node 和 layout node
- `cluster`
  - 零 props
  - children 范围和 `stack` 类似，但允许 inline-like UI group 仍只通过 children 表达
- `split`
  - 可先只允许一个极小的结构 prop 集
- `grid`
  - v1 可以先零 props
- `switcher`
  - v1 可以先零 props 或单一结构 prop
- `frame`
  - 只允许表达 wrapper role，不允许宽度数值

这一步最关键的不是 props 数量，而是：

- 不把 gap / ratio / columns / breakpoint 数值带进 schema

### Step 3

更新 `component-schema.test.ts`：

- layout 名字进入 `STANDARD_COMPONENT_NAMES`
- `getComponentSchema("stack")` 等返回有效 schema
- schema props 不出现实现参数

停手条件：

- 如果此时开始为 layout 节点拼 renderer spec，就已经越过 `3A`

## 7. Slice 3B 的真实 patch 顺序

`3B` 的目标是：

- 只打通 `stack` / `cluster` 的 parse + validate
- 证明 UI/layout 并列 authoring 在 sanitize 结果里站得住

### Step 1

改 `parse-agent-html.ts`，但只做被动支持：

- 确认 `STANDARD_COMPONENT_NAMES` 更新后，正则已覆盖 layout tags
- 不额外添加 layout 专用语法

换句话说：

- `stack` / `cluster` 应先和现有 component tag 完全共用同一套语法路径

### Step 2

改 `validate-agent-html.ts`：

- 让 `stack` / `cluster` 可以包含：
  - 当前稳定 UI block nodes
  - 彼此
  - 未来 layout nodes 名字
- 让 `page` 在 `allowedChildren` 上开始允许最小 layout 入口

这里最重要的设计决策是：

- `page` 是否直接允许所有 layout primitive
- 还是先只允许 `stack` / `frame`

基于当前壳结构，我更建议：

- 先让 `page` 允许 `stack`、`frame`
- 再通过这两个节点包裹其他 UI/layout

这样更接近“页面骨架由 layout 显式表达”的方向。

### Step 3

决定 `sanitize-agent-html.ts` 此阶段是否加逻辑。

当前更现实的建议是：

- `3B` 先不改 sanitize
- 让它继续只做 parse + validate 的薄封装

理由：

- `stack` / `cluster` 本身不需要结构归一化
- 太早给 sanitize 加 layout 行为，容易把 `3C` 和 `Phase 4` 的问题提前揉进来

### Step 4

扩 `sanitize-agent-html.test.ts`：

- `page -> stack -> card`
- `page -> frame -> stack -> alert/table/list`
- `stack -> cluster -> badge/button-like future nodes`
- layout 嵌套 layout
- layout 零 props边界

这里要特别补两个失败样例：

- 在 `stack` 上写实现参数，如 `gap="12"`
- 在 `cluster` 上写实现参数，如 `columns="3"`

这两个样例能证明 Phase 3 没把配置层泄漏进 authoring surface。

停手条件：

- 如果此时开始新增 `render-node` layout handler，说明已经进入 `3C`

## 8. Slice 3C 的真实 patch 顺序

`3C` 的目标是：

- 接入 `split` / `grid` / `switcher` / `frame`
- 给 layout primitive 最小 runtime projection
- 但暂时不清理全部 document shell

### Step 1

先补 schema 和 validator：

- `split`
- `grid`
- `switcher`
- `frame`

要求仍然一样：

- 只能表达结构关系
- 不能开放比例、列数、gap、breakpoint 数值

### Step 2

在 `component-capabilities.mjs` 新增 layout capability definitions。

建议不要复用现有 `componentCapabilityDefinitions` 的所有 UI 含义，而是先让 layout definition 只承载：

- source
- renderKind
- uiProtocol
- renderer.kind

例如新增 render kind：

- `layout-stack`
- `layout-cluster`
- `layout-split`
- `layout-grid`
- `layout-switcher`
- `layout-frame`

这样比继续把 layout 塞进 `compound` / `collection` 更诚实。

### Step 3

在 `renderer/types.ts` 扩 `RendererSpecComponent.kind`。

当前有：

- `RendererKind | "structural"`

`3C` 之后应至少能容纳 layout projection kinds，而不是继续把 layout 当作没有自有 kind 的特例。

### Step 4

在 `render-node.tsx` 增 layout handler，但只做最小投影。

当前更合理的实现目标是：

- `stack`
  - 渲染成稳定的 block wrapper
- `cluster`
  - 渲染成可 wrap 的 inline/block group wrapper
- `split`
  - 渲染成双区或少量区域 wrapper
- `grid`
  - 渲染成规则块容器
- `switcher`
  - 渲染成语义切换容器
- `frame`
  - 渲染成宽度约束 wrapper

但这些 projection 在 `3C` 不应承担：

- 全部响应式策略
- 全部密度策略
- 全部文档 shell 清理

### Step 5

只在 `3C` 末尾判断 `sanitize-agent-html.ts` 是否需要 layout 归一化。

如果 layout runtime projection 需要这些前提，再引入最小归一化：

- 例如某些 wrapper 自动补 children 容器

否则仍然尽量保持 sanitize 薄。

### Step 6

扩测试：

- `packages/core/src/parse/sanitize-agent-html.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

先补最小 layout 投影样例，不要直接上 app-level preview。

停手条件：

- 一旦开始大量改 `app.tsx` 的 shell CSS 或 gallery 预览结构，说明已经进入 `Phase 4`

## 9. 当前最容易犯的错

### 9.1 先在 renderer 偷偷支持 layout

这会直接绕过 parser/validator 主路径，后面很难证明 layout 是正式 contract，而不是 runtime 私货。

### 9.2 把 layout primitive 做成自由 flex/grid 参数面

这会直接违背 `docs/layout.md` 里“使用层只表达关系、配置层表达实现参数”的边界。

### 9.3 在 3B 就大改 sanitize

`stack` / `cluster` 的接入不需要这一刀。

过早给 sanitize 加大量结构逻辑，只会把调试面变宽。

### 9.4 在 3C 顺手清 app shell

这是 `Phase 4` 的问题，不是 `Phase 3` 的验收条件。

## 10. 当前最诚实的验证顺序

`3A` 只看：

- `packages/core/src/component-schema.test.ts`
- `packages/core/src/public-agent-contract.test.ts`

`3B` 只看：

- `packages/core/src/parse/sanitize-agent-html.test.ts`
- `packages/ahtml/src/cli/cli.test.ts`

`3C` 再加：

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

在 `Phase 3` 里，以下都不应该是第一批 gate：

- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`

除非 layout projection 已经真正撞到了 runtime shell 或 preview 路径。

## 11. 建议立即修正的文档理解

根据当前代码，`Phase 3` 最重要的事实不是“layout 还没画出来”，而是：

- parser 入口还没承认 layout tag
- validator 还没承认 layout children contract
- sanitize 还没有 layout 归一化责任
- renderer 还没有 layout kind
- app shell 还在反向定义默认文档结构

把这几件事按顺序拆开，`Phase 3` 才是可落地的；否则就会又变回“layout 是个大概方向”的空计划。
