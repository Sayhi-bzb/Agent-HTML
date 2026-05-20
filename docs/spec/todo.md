# Compat Cleanup Todo

这份清单只负责 compat 专项清理顺序。  
它不重复架构背景，也不承担日常零散事项。

## 当前判断

当前这轮 compat 清理已经完成主要拆除工作。  
原先残留在三层的 compat bridge 已经退出当前实现：

- authoring/schema 接受面
- runtime bridge / renderer 行为
- tests / conformance 对旧行为的保护

## 可以立即清理的项

- 只描述旧 compat、但已不对应现存代码行为的说明文字或注释。
- 只服务历史命名、但不再参与 schema、runtime contract、renderer 决策的内部别名。
- 若后续确认无额外外部依赖，可继续观察是否还有 `runtime-template` 这类仅剩命名层面的技术债。

## 已完成项

### Phase A：收缩 authoring / schema 接受面

- 从 `packages/core/src/schema-overlays.ts` 移除 legacy semantic props：
  - `alert.tone`
  - `badge.tone`
  - `row.kind`
  - `tabs.default`
  - `accordion.mode`
  - `accordion.default`
- 同步更新 generated schema、public contract 断言、sanitize / validate 测试。

### Phase B：拆 runtime bridge metadata

- 从 `packages/ahtml/src/config/component-capabilities.mjs` 移除：
  - `alert` / `badge` 的 `legacyBridges.variant`
  - `table` 的 `legacyBridges.structuralRole`
  - `tabs` 的 `legacyBridges.state`
  - `accordion` 的 `legacyBridges.state`
  - `accordion.behavior.stateBridge`
- 从 runtime renderer types 中移除 legacy bridge payload 类型。
- 删除 `packages/ahtml/src/cli/runtime-template/src/renderer/legacy-compat.ts` 中只为旧桥服务的 helper。

### Phase C：改写 renderer 行为来源

- `table`
  - 改成只认新结构，不再通过 `row.kind` 推断 header / body。
- `tabs`
  - 改成只认新默认状态来源，不再读取 legacy `default`。
- `accordion`
  - 改成只认新状态模型，不再兼容 `mode` / `default` 旧语义。

### Phase D：重写 tests / conformance 基线

- 删除或改写所有直接构造 `legacyBridges.*` 的 renderer 单测。
- 删除“旧输入字段仍被接受”的断言。
- 保留并强化“最终 artifact 不重新泄露旧字段”的 build / preview / runtime gate。

## 当前风险分级

### 低风险

- `alert`
- `badge`

原因：compat 已拆除，当前只剩 `variant` 直通行为。

### 高风险行为边界

- `table`
- `tabs`
- `accordion`

原因：这些组件当前依赖固定 renderer 规则：

- `table`
  - 多行时首行作为 header
- `tabs`
  - 默认选中第一个 tab
- `accordion`
  - 固定 `type="multiple"`

### 非核心技术债

- `runtime-template` 命名
- 纯文档说明残留

这些项当前不再参与 compat 行为决策。

## 验证口径

- `npm run schema:generate`
- `npm run build`
- `npm run test:run -- packages/core/src/component-schema.test.ts packages/core/src/types.test.ts packages/core/src/public-agent-contract.test.ts packages/core/src/parse/sanitize-agent-html.test.ts packages/ahtml/src/config/render-capabilities.test.ts packages/ahtml/src/config/runtime-contract.test.ts packages/ahtml/src/cli/runtime-renderability.test.ts packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts packages/ahtml/src/cli/prompt-schema.test.ts`
- `npm run test:run:cli-heavy:build`
- `npm run test:run:cli-heavy:preview`
- `npm run test:run:cli-heavy:runtime`
- `npm run test:run:cli-heavy:gallery`

## Gallery vs tweakcn Visual Gap

这部分只记录 gallery 下一轮视觉重构的高优先级差距。  
完整参考基线见 `docs/spec/tweakcn-design.md`。

- 顶栏语义不对。
  - 当前 gallery 顶部还是一个 card 化 header。
  - 目标应改成 app header bar，用边线分层，而不是再包一层 frame。

- 页面骨架仍是“配置页”，不是“工作台”。
  - 当前是左侧多段配置卡片，右侧一个独立预览卡片。
  - 目标应改成连续 editor shell，左控件区与右预览区属于同一工作平面。

- 左侧 controls 仍然过度卡片化。
  - 当前每个配置组都是独立 `Card`，视觉像模块清单。
  - 目标应收敛成 panel system，优先使用 tabs、collapsible sections、scroll containment 和轻量边线节奏。

- 右侧 preview 主舞台感不足。
  - 当前先出现 summary，再进入组件展柜，像文档摘要页。
  - 目标应让 preview 成为主舞台，工具条、模式切换和 showcase 直接围绕预览区组织。

- 分层方式过重。
  - 当前主要靠 card frame 和容器边界区分层级。
  - 目标应更多使用 `border-b`、pill tabs、ghost/outline actions、局部滚动边界来建立编辑器层次。

- 缺少 tweakcn 式的工作模式切换语言。
  - 当前 gallery 没有一等的 preview mode tabs，也没有“控制/预览/示例”这一类显性模式入口。
  - 目标应补足 tabbed work modes，而不是只保留纵向配置流。

- 左右区滚动语义还不够明确。
  - 当前虽然有 sticky sidebar，但整体仍像页面滚动中的两个内容块。
  - 目标应把 controls 和 preview 变成各自管理滚动的独立工作区域。

- 工具按钮还不够像编辑器工具条。
  - 当前 `Reset Draft` / `Save Current Style` 已经进入 preview 顶部，但仍偏表单提交区。
  - 目标应向 tweakcn 的 action bar 靠拢，强化轻量按钮、右对齐工具列、次序稳定的操作带。

- 视觉密度和信息节奏偏松。
  - 当前 section title、summary、hero 和 form blocks 都留了较多“展示型”空间。
  - 目标应收紧成高密度但有秩序的 editor rhythm，让操作与预览在同一屏内承担更多内容。

- 移动端降级策略还未对齐编辑器语义。
  - 当前移动端只做通用响应式堆叠。
  - 目标应参考 tweakcn，明确切为 `Controls / Preview` 两个主 tabs，而不是简单单列堆叠。
