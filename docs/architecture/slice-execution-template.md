# Slice Execution Template

本文不是新的架构设计文档，而是一份可复用模板。

用途只有一个：

- 当某个人真的要开始做某个 `Slice` 时，可以直接复制这份模板，补成开工单、issue 草稿、PR 描述草稿，或者本地实施卡。

它和其他文档的关系是：

- `docs/roadmap.md`
  - 定义 phase 目标与阶段边界
- `docs/architecture/implementation-slices.md`
  - 告诉你该做哪一个 slice
- `docs/architecture/execution-checklist.md`
  - 告诉你这一刀先改什么、不要混什么、跑哪个最窄 gate
- 本文
  - 把这些信息压成可直接填写的执行单格式

## 使用规则

- 一次只填一个 slice，不把多个 slice 混成一张单。
- 先填“为什么现在做这一刀”，再填文件和 gate。
- 没有明确停手边界时，不要开工。
- 没有明确完成证据时，不要宣称完成。

## 空模板

复制下面整段，再按当前 slice 填：

```md
# Slice: <2A / 2B / 2C / 3A ...>

## 归属

- Phase:
- Slice:
- 目标文档:
- 实施稿:
- 当前执行人:

## 为什么现在做这一刀

- 当前上游条件:
- 当前阻塞点:
- 为什么不应该直接做下一刀:

## 这刀要证明什么

- 必须为真的结果 1:
- 必须为真的结果 2:
- 必须为真的结果 3:

## 第一批入口文件

- 
- 
- 

## 明确不碰

- 
- 
- 

## 当前现实依据

- 代码入口:
- 现有 bridge / 旧路径:
- 当前测试或 fixture:
- 对应审计文档:

## 计划改动

1. 
2. 
3. 

## 最窄验证口

- 先跑:
- 再跑:
- 不先跑:

## 停手边界

- 一旦出现以下信号就先停:
- 这说明已经混入了哪个下一阶段问题:

## 完成证据

- 代码证据:
- 测试证据:
- 文档证据:

## 当前风险

- 风险 1:
- 风险 2:
- 风险 3:

## 回退判断

- 如果这刀失败，最可能是哪个桥接点没隔离:
- 如果测试爆炸，先看哪一层:

## 交接说明

- 下一刀最自然的承接 slice:
- 当前仍显式保留的兼容点:
- 不能误判为“已经完成”的地方:
```

## 填写提示

### `为什么现在做这一刀`

这里不要写空话。

应该回答：

- 为什么这个 slice 已经具备前置条件
- 为什么现在不该跳到下一刀

### `第一批入口文件`

只写当前 slice 第一批必碰文件。

不要把：

- 未来可能新增的文件
- 只是“也许会看一眼”的文件

都堆进来。

### `明确不碰`

这一节很重要，因为它决定这张单是不是还能保持单刀可控。

典型写法：

- `2A` 不碰 `schema.mjs`
- `3B` 不碰 `render-node.tsx`
- `4A` 不碰 `app.tsx`
- `5A` 不碰 heavy tests 全量收口

### `最窄验证口`

这里必须写真实测试文件名，不能写抽象描述。

优先写：

- 当前 slice 改动面正中主链的最小 gate

不要默认写：

- heavy tests
- 全量 build
- 宽范围 parity tests

除非这个 slice 本来就在碰这些闸口。

### `停手边界`

这节是为了避免“写着做 `2B`，最后做到半个 `4A`”。

必须写明：

- 哪种代码改动一出现，就说明已经跨阶段
- 一旦跨阶段，应该先停下来重新切片

## 示例 1：`2C`

```md
# Slice: 2C

## 归属

- Phase: 2
- Slice: 2C
- 目标文档: docs/roadmap.md
- 实施稿: docs/architecture/phase-2-implementation-draft.md

## 为什么现在做这一刀

- 2A/2B 已把 schema source 和 exposure decision 拆开
- 现在需要验证第一批低耦合 raw-candidate 能否贯穿 schema / prompt / runtime
- 还不该跳到 tabs / accordion / table，因为那些是 legacy bridge 问题，不是第一批试点问题

## 这刀要证明什么

- alert.variant 已进入公开 schema
- badge.variant 已进入 prompt
- runtime mapping 已消费这两个新公开 prop

## 第一批入口文件

- packages/core/src/prop-exposure-policy.ts
- packages/ahtml/src/cli/schema.mjs
- packages/ahtml/src/config/component-capabilities.mjs
- packages/ahtml/src/config/render-capabilities.mjs

## 明确不碰

- tabs.default
- accordion.mode
- row.kind
- app.tsx

## 最窄验证口

- 先跑: packages/ahtml/src/cli/cli.test.ts
- 再跑: packages/ahtml/src/config/runtime-contract.test.ts
- 再跑: packages/ahtml/src/config/render-capabilities.test.ts
- 不先跑: packages/ahtml/src/cli/cli.build.heavy.test.ts

## 停手边界

- 如果要修改 tabs / accordion / table 的 state/structure bridge，就先停
- 这说明问题已经漂到 Phase 4
```

## 示例 2：`4A`

```md
# Slice: 4A

## 归属

- Phase: 4
- Slice: 4A
- 目标文档: docs/roadmap.md
- 实施稿: docs/architecture/phase-4-implementation-draft.md

## 为什么现在做这一刀

- 当前 tabs / accordion / table 的旧字段已经进入 renderer 主分支
- 在拆 UI/layout projection 之前，必须先隔离 legacy bridge
- 现在还不该直接改 app shell，因为 host 问题属于 4C

## 这刀要证明什么

- legacy bridge 已从主渲染分支中显式分组
- render-node.tsx 不再散落 tone/kind/mode/default 判断
- renderer spec 仍然可被当前测试解释

## 第一批入口文件

- packages/ahtml/src/cli/runtime-template/src/renderer/render-node.tsx
- packages/ahtml/src/cli/runtime-template/src/renderer/types.ts
- packages/ahtml/src/config/component-capabilities.mjs

## 明确不碰

- packages/ahtml/src/cli/runtime-template/src/app.tsx
- gallery preview shell
- layout projection 模块拆分

## 最窄验证口

- 先跑: packages/ahtml/src/cli/runtime-template/src/renderer/render-node.test.ts
- 再跑: packages/ahtml/src/config/render-capabilities.test.ts
- 不先跑: packages/ahtml/src/cli/runtime-template.test.ts

## 停手边界

- 如果开始拆 gallery/runtime shell，就先停
- 这说明已经混入 4C
```

## 推荐配套文档

使用这份模板时，建议同时开着：

- `docs/architecture/execution-checklist.md`
- `docs/architecture/phase-completion-criteria.md`
- 当前 slice 对应的 implementation draft
- 如果属于高风险 bridge：
  - `docs/details/high-risk-runtime-bridges.md`
