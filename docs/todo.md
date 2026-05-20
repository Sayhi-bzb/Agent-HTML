# Todo

`todo.md` 现在只承载仍未完成的收尾项。  
已经完成的 `Phase 1-5B` 迁移任务不再在这里逐阶段回放。

如果需要追溯旧切片、旧 issue 草稿或旧实施顺序，请转到：

- `docs/history.md`

## 当前后续整理项

### Tests And Scripts

- [ ] 继续收口 CLI tests 的职责边界；当前已统一 `artifact-workflow.test.ts`、`gallery-workflow.test.ts`、`runtime-build.test.ts`、`command-contract.test.ts`、`governance-sync.test.ts` 的底层导入/读源码样板，剩余是更高层测试文件的命名和层级整理
- [ ] 复核 `scripts/shadcn-test-server.mjs` 与 `scripts/shadcn-test-fixtures/` 的真实依赖面，只保留当前 heavy/test gate 仍在使用的部分

## 不再保留在这里的事项

以下内容已经完成，不再继续出现在当前 todo 主体：

- `Phase 2` 的类型面拆分、schema 生成切换、首批 prop 试点
- `Phase 3` 的 layout 节点接入与最小 runtime projection
- `Phase 4` 的 legacy bridge 隔离、projection 分流、host/document/gallery shell 拆分
- `Phase 5A/5B` 的旧公开 contract 和 runtime spec 主路径收口
- `Phase 5` 的 completion audit、heavy gate 收官验证和主 docs 入口收口
- CLI tests 中 style-profile fixture helper 的公共化
- `artifact-workflow.test.ts`、`gallery-workflow.test.ts`、`runtime-build.test.ts`、`command-contract.test.ts`、`governance-sync.test.ts` 的低层导入/读源码样板统一

这些内容若需追溯，只从历史资料进入，不再作为当前待办。
