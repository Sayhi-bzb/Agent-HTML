# Details Index

`details/` 里的命名规则很简单：

- `current-*`
  - 当前状态基线，回答“现在是什么”。
- `high-*`
  - 当前高风险专题，回答“现在最需要盯什么”。

- `component-details.md`
  - 组件源码事实、slots、host elements、risky props、依赖资料。
- `current-contract-audit.md`
  - 当前 public contract、schema 生成链路、runtime 消费点和兼容层的审计基线。
- `current-contract-component-matrix.md`
  - 逐组件列出当前公开 props、兼容字段和 runtime bridge。
- `high-risk-runtime-bridges.md`
  - 当前仍需重点关注的 `tabs` / `accordion` / `table` 固定 renderer 行为边界。
