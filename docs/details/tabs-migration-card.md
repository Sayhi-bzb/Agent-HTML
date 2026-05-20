# Tabs Migration Card

> 历史资料。本文记录的是迁移执行期对 `tabs` 兼容桥的拆分方式，不再是当前主 docs 入口。
> 当前现实说明请优先看 `docs/details/high-risk-runtime-bridges.md`。

本文只聚焦 `tabs` 这一个高风险样本。

它不解释全局架构，也不重复组件资料。它只回答更具体的执行问题：

- 当前 `tabs` 的 legacy bridge 究竟穿过了哪些真实代码层
- 为什么 `tabs` 不适合混进 `Phase 2` 第一批试点
- `4A/4B/5A/5B/5C` 每刀应先保什么、替什么、最后删什么
- 当前哪些测试在保护旧路径，哪些地方其实保护得不够

如果只需要高层结论，请先看：

- `docs/details/high-risk-runtime-bridges.md`

如果已经准备进入 `Phase 4/5`，再同时对照：

- `docs/architecture/phase-4-implementation-draft.md`
- `docs/architecture/phase-5-implementation-draft.md`
- `docs/architecture/execution-checklist.md`

## 1. 当前真实桥接链

`tabs` 当前不是“schema 还保留一个旧字段，但 runtime 早就不依赖它了”。

它已经穿过一条完整主链：

```txt
schema-overlays.ts
  -> generated/component-schema.generated.ts
  -> public-agent-contract.ts
  -> schema.mjs
  -> component-capabilities.mjs
  -> render-capabilities.mjs
  -> renderer/types.ts
  -> render-node.tsx
  -> render-node.test.ts
  -> cli.build.heavy.test.ts
```

这条链上目前能直接看到的事实是：

- `packages/core/src/schema-overlays.ts`
  - `tabs` 仍公开 `default`
  - `tab` 仍公开 `value`、`label`
- `packages/ahtml/src/config/component-capabilities.mjs`
  - `tabs.uiProtocol.attrAliases.default = "default-value"`
  - `tabs.renderer.defaultProp = "default"`
- `packages/ahtml/src/config/render-capabilities.mjs`
  - `tabs` renderer kind 明确要求：
    - `defaultProp`
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererSpecComponent` 仍正式允许：
    - `defaultProp`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderTabsComponent()` 直接读取 `defaultProp`
  - `getStructuredDefaultValue()` 决定 tabs 的默认选中项
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - tabs 样例仍直接构造 `defaultProp: "default"` 的 spec
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - happy-path build 场景已切到 `<tabs><tab ...`，不再把 `<tabs default="summary">` 当主路径输入

## 2. 为什么 `tabs` 危险但又没有 `accordion` 那么“显眼”

`tabs` 的旧桥没有 `accordion` 那么厚，它主要是：

- `default -> defaultProp`

但这并不意味着它简单。

当前 `default` 已经同时影响：

- uiProtocol attr alias
- renderer spec
- interactive tabs root 的 `defaultValue`
- schema / prompt 的公开 authoring 入口

更麻烦的是，`tabs` 的测试保护面并不算强：

- `render-node.test.ts`
  - 确实构造了 `defaultProp`
  - 但没有显式断言 `<tabs default="...">` 的旧输入如何改变最终默认选中状态
- `cli.build.heavy.test.ts`
  - happy-path 已不再继续使用 `<tabs default="summary">`
  - 但当前主要断言仍偏向 slot 和总体输出存在，不是默认选中行为本身

这意味着：

- `tabs` 的旧桥是真实存在的
- 但它的直接行为保护比 `accordion` 更弱
- 所以迁移时既有回归风险，也有“回归了但测试没抓住”的风险

## 3. 当前行为里不能误删的东西

下面这些不是“顺手改了也无所谓”，而是当前主路径的一部分：

- `packages/core/src/schema-overlays.ts`
  - `tabs.props.default`
- `packages/ahtml/src/config/component-capabilities.mjs`
  - `tabs.uiProtocol.attrAliases.default`
  - `tabs.renderer.defaultProp`
- `packages/ahtml/src/config/render-capabilities.mjs`
  - `tabs.requiredFields` 中对 `defaultProp` 的要求
- `packages/ahtml/src/cli/runtime-template/src/renderer/types.ts`
  - `RendererSpecComponent.defaultProp`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx`
  - `renderTabsComponent()`
  - `getStructuredDefaultValue()`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
  - `uses renderer spec prop names for tabs content and labels`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - 当前更该关注的是：happy-path 已切到结构化 tabs 输入，但默认选中行为的直接断言仍偏弱

如果没有替代路径就删这些点，tabs 不一定会完全炸掉，但默认状态语义会先失真，随后又很可能因为测试保护不足而悄悄滑过去。

## 4. 当前最诚实的测试判断

`tabs` 的问题不只是旧桥还在，还包括保护面本身偏弱。

当前可以诚实地说：

- 有旧输入 fixture
  - 是
- 有 renderer 层 tabs 行为单测
  - 是
- 有明确断言“legacy default authoring 改变默认选中行为”的单测
  - 证据不足
- heavy build tests 明确断言默认选中结果
  - 证据不足

这会直接影响迁移顺序：

- 在真正动 `tabs.default` 之前，最好先补一条更聚焦的默认状态断言
- 否则 `5B/5C` 很容易变成“删桥成功了，但行为保护没有跟上”

## 5. `4A` 该做什么，不该做什么

`4A` 对 `tabs` 的目标不是删除 `defaultProp`，而是把“默认选中值来源”这件事从主渲染分支里显式隔离。

### `4A` 必须做到

- 在 `renderer/types.ts` 明确把 `defaultProp` 归到 legacy state bridge 一组
- 在 `render-node.tsx` 抽出显式 helper，例如：
  - `resolveLegacyTabsDefaultValue`
- 在 `component-capabilities.mjs` 让人一眼能区分：
  - tabs 正常 projection spec
  - tabs 的 legacy default bridge

### `4A` 不该做到

- 不删 `defaultProp`
- 不改 `app.tsx`
- 不顺手设计新的 tabs 状态语义
- 不把 tabs 的 bridge 与 accordion 强行合并成一个“统一状态桥”，除非边界已经被证明真的一致

### `4A` 的停手条件

- `renderTabsComponent()` 主分支不再直接处理 legacy default 解析
- 但 tabs 当前渲染行为仍与现有测试基线一致

### `4A` 的最窄验证口

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/render-capabilities.test.ts`

## 6. `4B` 该做什么，不该做什么

`4B` 的目标是把 tabs 继续留在 UI projection ownership 下，但不再让它和 layout/text/fallback 混在一个大主分支里。

### `4B` 必须做到

- `render-node.tsx` 退回 dispatcher
- tabs projection 进入 UI projection 模块
- tabs 的 structured child extraction 和 default state bridge 保持在 UI projection 层

### `4B` 不该做到

- 不借机改 shell CSS
- 不把 tabs 当 layout primitive 处理
- 不把 tabs 的默认状态替换路径和 gallery/document shell 问题混在一起

### `4B` 的停手条件

- tabs projection 已不再和 layout/UI/text/fallback 四类逻辑共处一个主分支
- 但 contract 同源性仍未被打断

### `4B` 的最窄验证口

- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`

## 7. `5A` 之前必须先确认什么

`5A` 的目标是下线旧公开 contract 入口。

对 `tabs` 而言，在删 `schema` 上的 `default` 之前，至少要先确认：

1. 新的默认状态语义已经存在
   - 不是文档假设
   - 而是 schema / prompt 上有正式入口
2. renderer 已能从新入口驱动相同行为
3. `defaultProp` 已退到显式 compatibility bridge

只要这三条有一条不成立，`tabs.default` 就还不能退出公开面。

## 8. `5B` 的真正危险点

`5B` 对 `tabs` 的核心动作是下线：

- `defaultProp`

它影响的面没有 `accordion` 那么宽，但也至少会波及：

- renderer spec 类型面
- render-capabilities requiredFields
- render-node default state resolution

### `5B` 的安全顺序

1. 先让 renderer 主路径完全走新状态模型
2. 再让 `defaultProp` 退到显式兼容层
3. 再删 `render-capabilities.mjs` 对 `defaultProp` 的 requiredFields
4. 再删 `renderer/types.ts` 对 `defaultProp` 的正式允许面
5. 最后删 `component-capabilities.mjs` 中 tabs 的 `defaultProp`

### `5B` 的最窄验证口

- `packages/ahtml/src/config/render-capabilities.test.ts`
- `packages/ahtml/src/config/runtime-contract.test.ts`
- `packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts`

## 9. `5C` 需要补上的不只是删除，还有保护

`5C` 对 `tabs` 来说，不应只是“把文档和 fixture 改掉”。

还应一起处理：

- `render-node.test.ts`
  - 需要增加或改成能真正断言默认状态行为的新测试
- `cli.build.heavy.test.ts`
  - happy-path fixture 已切到 `<tabs><tab ...`，但仍需要更直接地证明默认状态行为是否正确
- docs
  - 不能继续把 `default` 写成当前有效主路径

如果 `5C` 只删旧字段，不补更聚焦的保护：

- tabs 行为回归会更容易漏掉

## 10. 当前总判断

`tabs` 当前是一个典型的单状态 legacy bridge 样本。

它难在两点：

- `default` 已经跨过 schema、renderer spec、renderer 实现和 heavy fixture
- 但默认状态行为本身的直接测试保护偏弱

因此更合理的定位是：

- `Phase 4A` 的 state bridge 隔离样本
- `Phase 5C` 需要先补行为保护再收桥的样本

而不应把它当作：

- `Phase 2` 第一批低成本 prop exposure 试点
- 或“最后顺手把 default 删掉就行”的清理项
