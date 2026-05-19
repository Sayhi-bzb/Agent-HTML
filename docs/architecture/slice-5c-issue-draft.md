# Issue Draft: Slice 5C Final Gate Convergence

## 标题

`Phase 5 / Slice 5C`: 收 doctor、heavy gates 与执行文档到最终单路径

## 为什么现在开这张单

- `5A` 收 contract，`5B` 收 runtime spec；`5C` 收的是最后的 gate。如果这一刀不做，前两刀即便逻辑上完成，doctor 和 heavy tests 仍会把旧路径重新钉回主线。
- 当前 `cli.build.heavy.test.ts` 仍直接使用：
  - `tone`
  - `kind`
  - `default`
  - `ahtml-document-shell`
- 当前 `doctor-checks.mjs`、`runtime-template.test.ts`、`runtime-surface.test.ts` 已经是 runtime 最终 gate 的真实骨架，所以这刀不是“顺手改 docs”，而是收最后的证明体系。

## 当前现实

当前涉及的主入口：

- `packages/ahtml/src/cli/doctor-checks.mjs`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`
- `docs/roadmap.md`
- `docs/todo.md`

当前真实保护面：

- `doctor-checks.mjs`
  - 当前明确检查：
    - `runtime:schema-renderer-parity`
    - `runtime:verification-data-parity`
    - `runtime:renderer-mapping-parity`
    - `runtime:renderer-registry-parity`
    - `runtime:shadcn-surface`
- `cli.build.heavy.test.ts`
  - 当前仍直接保护 legacy authoring 输入和旧 shell 断言
- `cli.preview.heavy.test.ts`
  - 当前保护面较轻
  - 主要证明 preview server 可访问、style profile 生效
  - 几乎不证明最终 authoring contract 是否已经替换 legacy 输入
- `cli.runtime.heavy.test.ts`
  - 当前更偏：
    - doctor 输出
    - runtime manifest
    - verification / renderer parity
    - runtime surface / glue proof
  - 它不是 authoring contract 迁移的替身

## 目标

这张单要证明的不是“测试还绿”，而是：

- doctor / runtime parity / runtime surface 现在验证的是最终 contract
- build / preview / runtime heavy tests 不再继续保护 legacy authoring 输入和旧 shell 默认骨架
- 执行文档也已经从迁移语气收回到最终仍有效的路径

## 范围

第一批入口文件：

- `packages/ahtml/src/cli/doctor-checks.mjs`
- `packages/ahtml/src/cli/cli.build.heavy.test.ts`
- `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`

按改动面检查：

- `packages/ahtml/src/cli/runtime-template.test.ts`
- `packages/ahtml/src/cli/runtime-surface.test.ts`

文档入口：

- `docs/roadmap.md`
- `docs/todo.md`
- 必要时：
  - `docs/schema.md`
  - `docs/layout.md`
  - `docs/syntax.md`

建议交付内容：

1. 改 heavy build fixtures 和 expectations：
   - 把 legacy authoring 输入替换成最终输入
   - 把 `ahtml-document-shell` 这类旧壳默认值从自然 contract 断言里拿掉
2. 改 preview / runtime heavy tests：
   - preview 至少能证明最终输出仍可访问且不回退到旧输入依赖
   - runtime heavy 继续证明 doctor/parity/surface，但不能默许旧桥仍是主路径
3. 改 doctor / runtime surface 相关口径：
   - 保留 parity / proof 检查
   - 让成功标准和失败信息都面向最终单路径
4. 最后回写执行型文档

## 明确不做

- 不在这张单里发明新的公开 contract
- 不发明新的 layout primitive 或新的 layout 参数面
- 不发明新的 tabs / accordion / table 替代语义
- 不回头重做 `5A` / `5B` 的主实现，除非文档或 gate 先证明它们其实没完成

## 前置条件

必须先确认下面三条，否则这张单应直接标成阻塞，不应开工：

1. `5A` 已经收紧主公开 contract
2. `5B` 已经把 runtime spec 主路径收紧到最终 contract 方向
3. `4C` 已经足够清楚地处理 runtime host / document shell / gallery 边界

如果上面任一条件不成立，这张单的正确输出不是“先改 gate 凑通过”，而是“记录前置未完成”。

## 完成标准

必须同时满足：

1. `doctor-checks.mjs` 的检查口径仍完整，但已对准最终单路径
2. `cli.build.heavy.test.ts` / `cli.preview.heavy.test.ts` / `cli.runtime.heavy.test.ts` 不再继续保护旧主路径
3. `runtime-template.test.ts` / `runtime-surface.test.ts` 仍能解释最终 gate 为什么成立
4. `roadmap.md` / `todo.md` 以及必要执行文档不再把迁移桥描述成当前长期结构事实

下面这些不足以支持“完成”：

- 只是 doctor 还绿，但 heavy fixtures 仍是旧输入
- 只是 heavy tests 改了输入，但 docs 仍在描述旧桥为当前路径
- 只是 docs 改了，但 `runtime-template.test.ts` / `runtime-surface.test.ts` 没有重新证明最终 gate

## 最窄验证口

- 先跑:
  - `packages/ahtml/src/cli/runtime-template.test.ts`
  - `packages/ahtml/src/cli/runtime-surface.test.ts`
- 再跑:
  - `packages/ahtml/src/cli/cli.runtime.heavy.test.ts`
- 再按实际改动面补:
  - `packages/ahtml/src/cli/cli.build.heavy.test.ts`
  - `packages/ahtml/src/cli/cli.preview.heavy.test.ts`
- 这张单不足以只靠下面这些宣称完成:
  - `cli.test.ts`
  - `render-capabilities.test.ts`
  - docs diff

## 停手信号

出现下面任一信号就应停手并重新切片：

- heavy build fixtures 仍只能写 legacy 输入
- preview/build 仍必须断言 `ahtml-document-shell` 才能通过
- 为了让 doctor 通过，开始重新放宽已经收紧的 runtime spec 或公开 contract
- 开始在这张单里设计新的语义节点或新的 layout 参数面

这分别说明：

- `5A/5B` 并未真的完成
- 或 `4C` 边界没有站稳
- 或范围又跳回了 `Phase 2/3`

## 风险提醒

- `cli.build.heavy.test.ts` 同时保护 authoring 输入、runtime slot、style profile、shell 结构，最容易改成一团
- `cli.preview.heavy.test.ts` 现在保护面太轻，不能误当成最终 contract 切换已经被证明
- `cli.runtime.heavy.test.ts` 更偏 parity / completeness；如果前面 contract/spec 还半迁移，失败会是链式爆炸
- 只回写 docs 而不切换 heavy gates，会留下双轨真相

## 交接

这张单完成后，更自然的承接工作是：

- `Phase 5` 总验收清单和剩余缺口审计

当前最需要额外盯住的点：

- `ahtml-document-shell` 是否仍被误当成 contract 自然组成
- preview heavy 是否需要补一条更能证明最终 contract 的断言

## 参考文档

- `docs/architecture/slice-5c-execution-card.md`
- `docs/architecture/phase-5-implementation-draft.md`
- `docs/architecture/slice-risk-card-map.md`
- `docs/details/high-risk-runtime-bridges.md`
