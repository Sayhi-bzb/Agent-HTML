# Todo

`todo.md` 负责承载当前阶段性待办与零散实施清单。它和 `roadmap.md` 的分工是：

- `roadmap.md` 负责项目级重构节奏、阶段目标和阶段验收口径
- `todo.md` 负责每个阶段内当前待做的小项、收尾项和验证补项

如果某个事项会改变架构方向，应先更新决策文档，再回到这里记录执行任务。

## 使用规则

- 每条 todo 都应归属某个 roadmap phase
- 每条 todo 都应描述一个明确动作，而不是抽象口号
- 优先记录行为级任务，不写文件流水账
- 已完成项可以打勾，但不在这里写长复盘
- 如果任务跨阶段，拆成多个阶段子项，不写成一条巨型任务

## Phase 1 Todo

- [ ] 盘点当前实现里仍然把旧 overlay / 白名单当成主公开 contract 的入口
- [ ] 盘点当前实现里仍然偏离 `blueprint` 总分层的入口
- [ ] 标出 docs、schema、prompt 之间仍有漂移的 public contract 口径
- [ ] 整理当前“新架构文档结论”和“实现现状”之间的主要差异
- [ ] 盘点 `gallery` 当前承载的配置层职责与 runtime host 的耦合点
- [ ] 盘点当前 agent-html syntax 对 layout 不友好的限制

## Phase 2 Todo

- [ ] 找出 schema 生成链路里仍然手写公开 props 的位置
- [ ] 找出 prompt 输出里仍然直接依赖历史语义字段的分支
- [ ] 列出首批稳定 `raw-candidate` 接入时需要覆盖的组件清单
- [ ] 补一组针对 `blocked` / `raw-candidate` 的 schema 与 prompt 验证场景
- [ ] 找出 prompt / skill / schema 中仍强制要求文档级配置选择入口的位置
- [ ] 标出新 syntax 需要同步到 schema / prompt 的入口

## Phase 3 Todo

- [ ] 盘点当前 layout 语义节点的真实缺口，特别是 `grid` 和 `frame`
- [ ] 标出哪些常见页面结构还无法用现有 layout primitive 诚实表达
- [ ] 标出哪些 layout 行为仍然泄露了实现层数值参数
- [ ] 补一组 layout 嵌套 UI / layout 的示例验收场景
- [ ] 标出 parser / validate / sanitize / renderer 需要共同支持的新 layout 节点

## Phase 4 Todo

- [ ] 盘点 runtime-template 中写死文档型页面假设的代码块
- [ ] 标出 UI 投影和 layout 投影仍然耦合的位置
- [ ] 标出 fallback 仍在反向决定公开 contract 的分支
- [ ] 整理 runtime host 回到执行宿主职责时的阻塞点
- [ ] 标出 `gallery` 与 runtime host 需要重接的配置入口

## Phase 5 Todo

- [ ] 盘点旧语义包装字段在 schema、renderer、runtime 中的残留依赖
- [ ] 盘点 doctor / test / preview 还未覆盖的新 contract 行为
- [ ] 清点是否仍存在双轨 public contract 或双轨 renderer 逻辑
- [ ] 收敛 docs，使目标架构与实现现状的差距描述保持最新
- [ ] 清理旧 template 结构假设和旧语义包装字段的残留分支
