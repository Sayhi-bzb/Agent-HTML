# Slice: 3B

## 归属

- Phase: 3
- Slice: 3B
- 目标文档: `docs/roadmap.md`
- 实施稿: `docs/architecture/phase-3-implementation-draft.md`
- 当前执行人: 待定

## 为什么现在做这一刀

- `3A` 解决的是“layout 名字是否已进入正式 contract”；`3B` 解决的是“最小 layout 集合是否已经被 parser/validator 正式接受”。这两件事不拆开，最后很容易得到“schema 里有名字，但 authoring surface 还不能稳定使用”的假进展。
- 当前 `parse-agent-html.ts` 用 `STANDARD_COMPONENT_NAMES.join("|")` 构造标准组件标签正则，所以 `stack` / `cluster` 只有在标准节点集合里站稳后，才会被 parser 当作正式 agent 组件处理。
- 当前 `validate-agent-html.ts` 的 attrs 和 children 都直接依赖 `componentSchema.props` / `allowedChildren`。这说明 `3B` 的真正闸口不是 renderer，而是 schema 驱动的 parse + validate 主路径。
- 当前 `sanitize-agent-html.ts` 仍只是 `parse -> validate` 的薄封装。对 `stack` / `cluster` 来说，这反而是好事，因为这刀不必提前引入 layout 归一化逻辑。

## 这刀要证明什么

- 必须为真的结果 1:
  `stack` / `cluster` 已经可以通过现有标准组件语法路径被 parse，不需要 layout 专用语法分支。
- 必须为真的结果 2:
  `stack` / `cluster` 已经被 validate 当作正式节点处理，而不是 parse 后落回 `unknown-component` 或宽松放行。
- 必须为真的结果 3:
  最小 UI/layout 并列 authoring 已经成立：
  - `page` 可以进入最小 layout 入口
  - `stack` 可以包裹稳定 UI 节点
  - `stack` / `cluster` 可以互相嵌套
- 必须为真的结果 4:
  `stack` / `cluster` 仍保持零 props 边界；`gap`、`columns`、`breakpoint` 这类实现参数会被拒绝，而不是被忽略。

## 第一批入口文件

- `packages/core/src/parse/parse-agent-html.ts`
- `packages/core/src/parse/validate-agent-html.ts`
- 视需要再碰：
  - `packages/core/src/parse/sanitize-agent-html.ts`
  - `packages/core/src/component-schema.ts`

## 明确不碰

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- `packages/ahtml/src/config/component-capabilities.mjs`
- `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- `split`
- `grid`
- `switcher`
- `frame`
- 任意 layout 数值型实现参数面

## 当前现实依据

- parser 入口:
  - `parse-agent-html.ts` 当前通过：
    - `AGENT_COMPONENT_NAME_PATTERN`
    - `SELF_CLOSING_AGENT_COMPONENT_PATTERN`
    - `AGENT_COMPONENT_TAG_PATTERN`
    识别标准组件标签
  - 这些正则全部依赖 `STANDARD_COMPONENT_NAMES`
- validator 入口:
  - `validate-agent-html.ts` 当前：
    - 根节点必须是单一 `<page>`
    - attrs 合法性完全来自 `componentSchema.props`
    - children 合法性完全来自 `componentSchema.allowedChildren`
    - 文本是否允许也只看 `TEXT_CHILD`
- sanitize 入口:
  - `sanitize-agent-html.ts` 当前没有 layout 专属逻辑，只负责把 parse 结果交给 validate
- 当前测试保护面:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
    - 已覆盖 page root、UI 组件、结构子节点、typed attrs、unknown-component
    - 还没有任何 layout primitive 覆盖
  - 这说明 `3B` 最适合先扩 parse/validate gate，而不是先去碰 runtime tests
- 对应设计文档:
  - `docs/layout.md`
  - `docs/architecture/phase-3-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`

## 前置条件

1. `3A` 已经让 `stack` / `cluster` 进入正式 schema / 标准节点集合；否则 parser 正则和 validator schema 都没有稳定入口。
2. 当前只打通 `stack` / `cluster`，不同时处理 `split` / `grid` / `switcher` / `frame`。
3. 当前接受“runtime 还不会投影 layout”这一事实；`3B` 不负责证明 renderer 行为。

## 计划改动

1. 先确认 `STANDARD_COMPONENT_NAMES` 已覆盖 `stack` / `cluster`，再观察 `parse-agent-html.ts` 是否已被动承认这两个标签：
   - 不新增 layout 专用解析语法
   - 不新增 layout 专用 alias 逻辑
2. 再收 `validate-agent-html.ts` 的 children contract：
   - `page` 允许最小 layout 入口
   - `stack` 允许稳定 UI block node
   - `stack` / `cluster` 允许互相嵌套
3. 对直接挂在 `page` 下的 layout 入口保持保守：
   - 推荐先把 `stack` 作为最小页面骨架入口
   - `cluster` 更适合作为 `stack` 或其他容器内部的局部布局节点
   - 如果最终决定让 `page` 直接接受 `cluster`，也必须是显式 schema 决策，不靠 runtime 默认壳结构暗中兜底
4. 尽量不改 `sanitize-agent-html.ts`：
   - `stack` / `cluster` 本身不需要 layout 归一化
   - 如果为了让 `3B` gate 通过不得不往 sanitize 加复杂逻辑，说明这刀已经切大了
5. 扩 `sanitize-agent-html.test.ts`：
   - `page -> stack -> card`
   - `page -> stack -> cluster -> badge`
   - `stack -> cluster -> stack`
   - 非法 layout props 会报 `unknown-attr`

## 最窄验证口

- 先跑:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
- 再跑:
  - `packages/ahtml/src/cli/cli.test.ts`
- 不先跑:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - 任意 heavy CLI tests

## 停手边界

- 一旦出现以下信号就先停:
  - 开始为 `stack` / `cluster` 新增 runtime projection
  - 开始修改 `app.tsx` 的 document shell / preview shell
  - 开始引入 `gap` / `columns` / `breakpoint` / `ratio` 这类实现参数
  - 开始为 `split` / `grid` / `switcher` / `frame` 一起补 schema 和 children contract
- 这说明已经混入了哪个下一阶段问题:
  - runtime projection 说明已经进入 `3C`
  - shell 清理说明已经进入 `Phase 4`
  - 数值参数扩张说明已经违反 `docs/layout.md` 的 contract 边界

## 完成证据

- 代码证据:
  - `parse-agent-html.ts` 已通过标准组件正则路径接受 `stack` / `cluster`
  - `validate-agent-html.ts` 已把 `stack` / `cluster` 作为正式 schema 节点校验
  - `sanitize-agent-html.ts` 若仍保持薄封装，也已能承载最小 layout authoring
- 测试证据:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`
- 文档证据:
  - 本卡与 `docs/layout.md`
  - `docs/architecture/phase-3-implementation-draft.md`
  - `docs/architecture/execution-checklist.md`
    的口径保持一致

## 当前风险

- 风险 1:
  `page` 的 allowedChildren 如果一次放得太宽，会让 layout 接入第一步就失去边界，后面很难再收。
- 风险 2:
  `cluster` 如果直接被当作“任意 page-level 布局入口”，会把页面骨架和局部聚类混成一层语义。
- 风险 3:
  `sanitize-agent-html.test.ts` 能证明 parse/validate 已经站稳，但不能证明 runtime 已会投影 layout；这不是失败，只是 `3B` 的边界。

## 回退判断

- 如果这刀失败，最可能是哪层还没对 layout 做正式承认:
  - `STANDARD_COMPONENT_NAMES` 里名字还没站稳
  - `page` / `stack` / `cluster` 的 `allowedChildren` 还没收清
  - 非法 layout props 仍被静默吞掉或被误放行
- 如果测试爆炸，先看哪一层:
  - 先看 `sanitize-agent-html.test.ts` 是否暴露 `unknown-component` 或 `invalid-child`
  - 再看 `cli.test.ts` 是否因为 schema/prompt 里 layout 可见性变化而报警

## 交接说明

- 下一刀最自然的承接 slice:
  - `3C`
- 当前不能误判为“已经完成”的地方:
  - 只是 `stack` / `cluster` 出现在 schema 里，但 parse/validate 还没接受
  - 只是 parse 通过了，但非法实现参数没有被拒绝
  - 只是 `page` 能放一个 layout 节点，但 layout 嵌套 UI / layout 仍不稳定
  - 只是文档说 layout 是正式节点，但 runtime / shell 问题被提前混进这刀
