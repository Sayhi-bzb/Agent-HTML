# Compat Cleanup Todo

这份清单只负责 compat 专项清理顺序。  
它不重复架构背景，也不承担日常零散事项。

## 当前判断

当前工作树已经把公开主链收紧到新 contract，但旧 compat layer 还没有完全退场。  
残留主要集中在三层：

- authoring/schema 接受面
- runtime bridge / renderer 行为
- tests / conformance 对旧行为的保护

## 可以立即清理的项

- `ahtml-document-shell` 这类纯 class 命名残留
  - 前提：确认不再被样式选择器、测试断言或外部说明依赖。
- 只描述旧 compat、但已不对应现存代码行为的说明文字或注释。
- 只服务历史命名、但不再参与 schema、runtime contract、renderer 决策的内部别名。

## 必须分阶段拆除的 compat bridge

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

## 风险分级

### 低风险 compat

- `alert`
- `badge`

原因：主要是 `tone -> variant` 的 prop alias 映射。

### 高风险 compat

- `table`
- `tabs`
- `accordion`

原因：这些已经不是简单字段别名，而是结构桥或状态桥。

### 非核心技术债

- `ahtml-document-shell` 命名
- `runtime-template` 命名
- 纯文档说明残留

这些项只有在它们继续参与语义、状态或布局决策时，才升级为核心 compat 问题。

## 执行顺序

1. 先做 Phase A，收缩 schema 接受面并同步 core tests。
2. 再做 Phase B，删除 runtime bridge metadata 与 legacy helper。
3. 接着做 Phase C，把 `table` / `tabs` / `accordion` 切到新行为来源。
4. 最后做 Phase D，重写 tests / conformance / heavy gates。

## 验证口径

- Phase A 后看 schema generation、public contract、prompt schema、sanitize / validate。
- Phase B 后看 render-capabilities、runtime-contract、renderer unit tests。
- Phase C 后看 `table` / `tabs` / `accordion` 的 build / preview / runtime 行为。
- Phase D 后跑完整构建与必要 heavy gates，确认旧字段既不再被接受，也不再重新泄露到 artifact。
