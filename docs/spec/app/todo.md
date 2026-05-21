# agent-html-app Alignment Checklist

目标：作为 `docs/spec/app/` 本轮重构的完成核对记录，证明 [`app.md`](./app.md) 与当前 `apps/agent-html-app` 实现一致。  
原则：保留已经落地的收口结果，避免把已完成的壳层治理和交互同步重新写回待办。

## Landed Baseline

- [x] TopBar 已经以当前 session 名称为主信息，不再常驻完整路径。
- [x] Sessions rail 已有 `Current / Pinned / Needs attention / Recent` 分组骨架。
- [x] `Preview / Source / Inspect` header 已收敛到短标题、必要 action 与必要 badge。
- [x] `Load / Build / Save / Check / Draft / Scan / Idle / None / Blank` 一类状态已压缩成短标签。
- [x] UI 不再直接暴露 `proposal-placeholder`、`placeholder`、`system` 等内部术语。
- [x] 页面默认继续从 `@/components/ui/*` 与现有 `Shell*` contract 出发，没有回退到自制基础控件。

## Priority 0 — Sessions Rail Actions

- [x] 补上 `pin / unpin` 入口与状态流，保持当前极简 action menu 结构。
- [x] 补上 `rename` 入口与最小交互，不把重命名做成常驻表单。
- [x] 在补齐 `pin / rename` 后，`SessionCard` 仍只保留低频操作入口，不回流解释性 copy。

## Priority 1 — Review Rail Polish

- [x] 保持 proposal 卡片高于 runtime check 摘要；不要让 `RuntimeReportCard` 回到右栏主位。
- [x] 如果后续新增 `context-card` 或 readiness surface，继续用审查卡片表达，而不是直接 dump 原始消息结构。
- [x] 统一空态短词汇；当前 `None / Blank / Idle` 已进一步收敛到 `Empty`。

## Priority 1 — Shared Shell Primitives

- [x] 评估是否移除 `ShellCardHeader` 对 `description` 的默认 affordance；当前默认 API 已移除 explanatory copy 入口。
- [x] 继续收缩 `ShellSupportingCopy` 的使用范围；当前共享 helper 已移除，剩余次级文案直接走壳层 class 而不是独立 wrapper。
- [x] 保持 `ShellLoadingRow`、`ShellEmptyCard`、`ShellEmptyCanvas` 的极简语言，不新增句子式状态文案。

## Priority 1 — Spec Sync

- [x] `app.md` 只描述已落地交互；未接通的 `review focus` 跳转与全局快捷键需要明确标成建议态，而不是现状。
- [x] 本目录内引用继续保持有效，不再引用不存在的本地 `audit.md`。

## Acceptance Criteria

- [x] session rail 具备 `open / rename / pin / delete` 的最小操作闭环，且不引入新的重型 UI。
- [x] 右侧 shell 继续保持 `review rail` 定位，runtime check 只作为次级摘要 surface。
- [x] 共享 shell primitive 仍是新增 UI 的默认入口，没有回流到 feature 内自制基础控件。
- [x] `docs/spec/app/*.md` 与当前 `apps/agent-html-app/src` 行为一致，不再把建议态写成已实现状态。
