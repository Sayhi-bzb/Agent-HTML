# agent-html-app Minimal Cleanup Todo

目标：把当前 app 收敛到 [`app.md`](./app.md) 定义的极简工作台风格。  
原则：统一消费 `shadcn` 与现有 shell contract，减少解释性文字，保留必要状态语义，去掉 debug / teaching 感。

## Global Rules

- [ ] 页面层不新增解释性 `description`、caption、help copy。
- [ ] pane / card header 默认只保留标题、必要 action、必要 badge。
- [ ] loading / empty / status 文案统一压缩成短标签，不使用句子式说明。
- [ ] UI 不直接暴露内部 `kind`、`role`、`mock runtime`、`placeholder` 一类实现术语。
- [ ] 所有交互继续从 `@/components/ui/*` 与现有 shell contract 出发，不回退成自制基础控件。
- [ ] 只有真正影响当前决策的信息才允许常驻上屏。
- [ ] 新增视觉收敛继续走 token 与 shell contract，不单独发明第二套风格层。

## Priority 0 — Product Language Cleanup

- [ ] TopBar 去掉完整路径的常驻展示。
- [ ] Workbench 各 panel header 去掉解释性副标题。
- [ ] Shell 区去掉 `Drafting proposal`、`Running doctor` 这类句子式 loading copy。
- [ ] `Empty`、`Loading`、`Saving`、`Building`、`Inspecting` 一类状态文案统一成极短表达。
- [ ] mock 模式中的教学式、说明式、调试式文案改成产品级短文案。
- [ ] 不再直接显示 `proposal-placeholder`、`placeholder`、`system` 这类内部术语。
- [ ] 不再把路径、时间戳、实现状态名当作主内容展示。

## Priority 1 — Top Bar

- [ ] TopBar 以当前 session 名称为主信息，而不是以路径为主信息。
- [ ] 品牌标识保留，但信息层级低于当前 session。
- [ ] 当前 workbench view 保留为短标签，不扩写解释文案。
- [ ] runtime 状态只保留 badge，不追加说明性 copy。
- [ ] session path 如果保留，只能降到次级呈现，不得占据主位。

## Priority 1 — Sessions Rail

- [ ] 左侧 rail 增加 `Current / Pinned / Needs attention / Recent` 分组骨架。
- [ ] 当前 session 在结构和视觉上单独突出。
- [ ] session item 只保留名称、状态、更新时间三类必要信息。
- [ ] session 卡片移除多余辅助文字。
- [ ] 为 `pin / unpin` 预留极简入口。
- [ ] 为 `rename` 预留极简入口。
- [ ] 搜索与新建入口维持极简，不增加解释性文字。

## Priority 1 — Workbench

- [ ] `Preview / Source / Inspect` header 收敛到标题、必要 action、必要 badge。
- [ ] preview path 不再默认显示在 `Preview` header。
- [ ] source path 不再默认显示在 `Source` header。
- [ ] inspect 生成时间不再默认显示在 `Inspect` header。
- [ ] `Inspect` 的 item count 只在确有必要时以简短 badge 呈现。
- [ ] `building / saving / validating / inspecting` 的反馈改成短标签，而不是句子说明。
- [ ] `Inspect` 区优先展示结果本身，不额外增加说明区块。
- [ ] console / log 区只在确有需要时显示 label。

## Priority 1 — Agent Shell

- [ ] 右侧 pane 的整体气质从 debug/chat 面板收敛成 review rail。
- [ ] `ShellHeader` 的命名与视觉更偏 review / proposal，不偏 terminal / doctor。
- [ ] runtime report 不再作为常驻核心卡片主导右侧信息层级。
- [ ] message card 不再直接显示内部 `kind` 与 `role` 原始值。
- [ ] proposal / context / readiness 需要以审查卡片表达，而不是原始消息 dump。
- [ ] shell 的状态反馈改成 badge 或短标签，而不是句子说明。
- [ ] composer 保持极简，只保留输入与发送主动作。

## Priority 2 — Shared Shell Components

- [ ] `ShellCardHeader` 默认模式改成极简头部，而不是默认鼓励 `title + description`。
- [ ] `ShellSupportingCopy` 的使用范围继续收缩。
- [ ] `ShellLoadingRow` 支持无句子化的短状态呈现。
- [ ] `ShellEmptyCard` 与 `ShellEmptyCanvas` 使用统一极简空态语言。
- [ ] 共享组件不再鼓励 explanatory copy 成为默认输出。

## Priority 2 — Mock Content

- [ ] mock runtime 检查项文案去 teaching / debug 化。
- [ ] mock proposal 文案去 checklist 教学口吻。
- [ ] mock system message 不再直接暴露 `local mock mode`。
- [ ] mock preview artifact 继续保持边界隔离，但不主导 app 风格判断。

## Acceptance Criteria

- [ ] 主界面不再出现大段解释性文字。
- [ ] 各 pane header 默认不再显示路径、时间戳、描述性副标题。
- [ ] 用户看到的是 session、review、result，而不是内部实现术语。
- [ ] 右侧 shell 视觉上更像审查轨道，而不是调试终端。
- [ ] 所有改动继续沿用 `shadcn` 与现有 shell contract，不回退成第二套基础控件。
- [ ] mock 模式下的体验不再因为教学文案而显得冗长。
