# Issue Draft: Slice 3B Stack And Cluster Parse/Validate Cutover

## 标题

`Phase 3 / Slice 3B`: 让 `stack` / `cluster` 通过正式 parse + validate 主路径

## 为什么现在开这张单

- `3A` 解决的是“layout 名字是否已进入正式 contract”；`3B` 解决的是“最小 layout 集合是否已经被 parser/validator 正式接受”。这两件事不拆开，最后很容易得到“schema 里有名字，但 authoring surface 还不能稳定使用”的假进展。
- 当前 `parse-agent-html.ts` 用 `STANDARD_COMPONENT_NAMES.join("|")` 构造标准组件标签正则，所以 `stack` / `cluster` 只有在标准节点集合里站稳后，才会被 parser 当作正式 agent 组件处理。
- 当前 `validate-agent-html.ts` 的 attrs 和 children 都直接依赖 `componentSchema.props` / `allowedChildren`。这说明这刀的真正闸口不是 renderer，而是 schema 驱动的 parse + validate 主路径。
- 当前 `sanitize-agent-html.ts` 仍只是 `parse -> validate` 的薄封装。对 `stack` / `cluster` 来说，这反而是好事，因为这刀不必提前引入 layout 归一化逻辑。

## 当前现实

- `packages/core/src/parse/parse-agent-html.ts`
  - 当前通过：
    - `AGENT_COMPONENT_NAME_PATTERN`
    - `SELF_CLOSING_AGENT_COMPONENT_PATTERN`
    - `AGENT_COMPONENT_TAG_PATTERN`
    识别标准组件标签
  - 这些正则全部依赖 `STANDARD_COMPONENT_NAMES`
- `packages/core/src/parse/validate-agent-html.ts`
  - 当前：
    - 根节点必须是单一 `<page>`
    - attrs 合法性完全来自 `componentSchema.props`
    - children 合法性完全来自 `componentSchema.allowedChildren`
    - 文本是否允许也只看 `TEXT_CHILD`
- `packages/core/src/parse/sanitize-agent-html.ts`
  - 当前没有 layout 专属逻辑，只负责把 parse 结果交给 validate
- 当前测试保护面：
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
  - `packages/ahtml/src/cli/cli.test.ts`

## 目标

这张单不是让 layout 已经会 render。它只证明一件事：

- `stack` / `cluster` 已经可以通过现有标准组件语法路径被 parse，并被 validate 当作正式节点处理，最小 UI/layout 并列 authoring 已经成立，同时零 props 边界仍被硬性保护。

## 范围

第一批入口文件：

- `packages/core/src/parse/parse-agent-html.ts`
- `packages/core/src/parse/validate-agent-html.ts`

视需要再碰：

- `packages/core/src/parse/sanitize-agent-html.ts`
- `packages/core/src/component-schema.ts`

建议交付内容：

1. 先确认 `STANDARD_COMPONENT_NAMES` 已覆盖 `stack` / `cluster`，再观察 `parse-agent-html.ts` 是否已被动承认这两个标签：
   - 不新增 layout 专用解析语法
   - 不新增 layout 专用 alias 逻辑
2. 收 `validate-agent-html.ts` 的 children contract：
   - `page` 允许最小 layout 入口
   - `stack` 允许稳定 UI block node
   - `stack` / `cluster` 允许互相嵌套
3. 对直接挂在 `page` 下的 layout 入口保持保守：
   - 推荐先把 `stack` 作为最小页面骨架入口
   - `cluster` 更适合作为 `stack` 或其他容器内部的局部布局节点
4. 尽量不改 `sanitize-agent-html.ts`：
   - `stack` / `cluster` 本身不需要 layout 归一化
   - 如果为了让 gate 通过不得不往 sanitize 加复杂逻辑，说明这刀已经切大了
5. 扩 `sanitize-agent-html.test.ts`：
   - `page -> stack -> card`
   - `page -> stack -> cluster -> badge`
   - `stack -> cluster -> stack`
   - 非法 layout props 会报 `unknown-attr`

## 明确不做

- 不改 `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
- 不改 `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
- 不改 `packages/ahtml/src/config/component-capabilities.mjs`
- 不改 `packages/ahtml/src/cli/runtime-template/src/app.tsx`
- 不处理 `split`
- 不处理 `grid`
- 不处理 `switcher`
- 不处理 `frame`
- 不引入任意 layout 数值型实现参数面

## 前置条件

必须先确认下面三条：

1. `3A` 已经让 `stack` / `cluster` 进入正式 schema / 标准节点集合
2. 当前只打通 `stack` / `cluster`，不同时处理 `split` / `grid` / `switcher` / `frame`
3. 当前接受“runtime 还不会投影 layout”这一事实；这刀不负责证明 renderer 行为

## 完成标准

必须同时满足：

1. `stack` / `cluster` 已经可以通过现有标准组件语法路径被 parse
2. `stack` / `cluster` 已经被 validate 当作正式节点处理
3. 最小 UI/layout 并列 authoring 已经成立：
   - `page` 可以进入最小 layout 入口
   - `stack` 可以包裹稳定 UI 节点
   - `stack` / `cluster` 可以互相嵌套
4. `stack` / `cluster` 仍保持零 props 边界，`gap`、`columns`、`breakpoint` 这类实现参数会被拒绝

下面这些不足以支持“完成”：

- 只是 `stack` / `cluster` 出现在 schema 里，但 parse/validate 还没接受
- 只是 parse 通过了，但非法实现参数没有被拒绝
- 只是 `page` 能放一个 layout 节点，但 layout 嵌套 UI / layout 仍不稳定
- 只是文档说 layout 是正式节点，但 runtime / shell 问题被提前混进这刀

## 最窄验证口

- 先跑:
  - `packages/core/src/parse/sanitize-agent-html.test.ts`
- 再跑:
  - `packages/ahtml/src/cli/cli.test.ts`
- 这张单默认不先跑:
  - `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
  - 任意 heavy CLI tests

## 停手信号

出现下面任一信号就应停手并重新切片：

- 开始为 `stack` / `cluster` 新增 runtime projection
- 开始修改 `app.tsx` 的 document shell / preview shell
- 开始引入 `gap` / `columns` / `breakpoint` / `ratio` 这类实现参数
- 开始为 `split` / `grid` / `switcher` / `frame` 一起补 schema 和 children contract

这分别说明：

- 已经进入 `3C`
- 已经进入 `Phase 4`
- 已经违反 `docs/layout.md` 的 contract 边界

## 风险提醒

- `page` 的 allowedChildren 如果一次放得太宽，会让 layout 接入第一步就失去边界，后面很难再收
- `cluster` 如果直接被当作任意 page-level 布局入口，会把页面骨架和局部聚类混成一层语义
- `sanitize-agent-html.test.ts` 能证明 parse/validate 已站稳，但不能证明 runtime 已会投影 layout；这不是这刀的失败，只是边界

## 交接

这张单完成后，下一张最自然的单是：

- `Phase 3 / Slice 3C`

当前仍会显式保留、但不应在这刀里收掉的东西：

- runtime projection
- host shell / document shell 的默认结构假设
- `split` / `grid` / `switcher` / `frame` 的复杂 layout 语义

## 参考文档

- `docs/architecture/slice-3b-execution-card.md`
- `docs/architecture/phase-3-implementation-draft.md`
- `docs/layout.md`
- `docs/architecture/execution-checklist.md`
